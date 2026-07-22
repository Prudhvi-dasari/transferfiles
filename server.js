// TransferNow Clone Node.js/Express Backend Server with Native Supabase Integration
import dotenv from 'dotenv';
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as archiverModule from 'archiver';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const archiver = archiverModule.default || archiverModule;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Setup local directories ONLY for frontend production assets serving, no data/ or uploads/
const distPath = path.join(__dirname, 'dist');

// Configure Supabase Connection
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';
const BUCKET_NAME = process.env.SUPABASE_BUCKET || 'transfers';

const supabase = (SUPABASE_URL && SUPABASE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

const isSupabaseEnabled = !!supabase;

if (!isSupabaseEnabled) {
  console.warn('\n======================================================================');
  console.warn('WARNING: Supabase URL and Key are not configured!');
  console.warn('Uploads and Auth operations will fail until credentials are set in .env');
  console.warn('======================================================================\n');
} else {
  console.log('[Supabase] Initialized client successfully.');
}

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(`[HTTP] ${req.method} ${req.url}`);
  next();
});

// Server-Sent Events Clients registry
let sseClients = [];

// Helper functions for Cryptography
function getSHA256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

// Supabase Database wrapper functions
async function getUser(username) {
  if (!isSupabaseEnabled) return null;
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username.toLowerCase())
      .single();
    if (error || !data) return null;
    return data;
  } catch (err) {
    console.error('[Supabase DB] getUser error:', err);
    return null;
  }
}

async function getTransfer(hash) {
  if (!isSupabaseEnabled) return null;
  try {
    const { data, error } = await supabase
      .from('transfers')
      .select('*')
      .eq('hash', hash)
      .single();

    if (error || !data) return null;

    // Check expiration
    if (new Date() > new Date(data.expires_at)) {
      await deleteTransferData(hash);
      return null;
    }

    // Map backend snake_case database schema fields back to frontend CamelCase compatibility format
    return {
      hash: data.hash,
      activeTab: data.active_tab,
      senderEmail: data.sender_email,
      recipientEmails: data.recipient_emails,
      subject: data.subject,
      message: data.message,
      passwordHash: data.password_hash,
      expiresAt: data.expires_at,
      createdAt: data.created_at,
      totalSize: data.total_size,
      downloadsCount: data.downloads_count,
      uploader: data.uploader,
      files: data.files
    };
  } catch (err) {
    console.error('[Supabase DB] getTransfer error:', err);
    return null;
  }
}

async function saveTransfer(transfer) {
  if (!isSupabaseEnabled) return;
  try {
    const { error } = await supabase
      .from('transfers')
      .upsert({
        hash: transfer.hash,
        active_tab: transfer.activeTab,
        sender_email: transfer.senderEmail,
        recipient_emails: transfer.recipientEmails,
        subject: transfer.subject,
        message: transfer.message,
        password_hash: transfer.passwordHash,
        expires_at: transfer.expiresAt,
        created_at: transfer.createdAt,
        total_size: transfer.totalSize,
        downloads_count: transfer.downloadsCount,
        uploader: transfer.uploader,
        files: transfer.files
      });
    if (error) {
      console.error('[Supabase DB] saveTransfer error:', error);
    }
  } catch (err) {
    console.error('[Supabase DB] saveTransfer execution failed:', err);
  }
}

async function deleteTransferData(hash) {
  if (!isSupabaseEnabled) return;
  try {
    // Fetch details to find bucket files list
    const transfer = await getTransfer(hash);

    // 1. Delete logs & transfer metadata rows from DB tables
    await supabase.from('logs').delete().eq('transfer_hash', hash);
    await supabase.from('transfers').delete().eq('hash', hash);

    // 2. Clear storage folder paths in Supabase Storage Bucket
    if (transfer && transfer.files && transfer.files.length > 0) {
      const filePaths = transfer.files.map(f => `transfers/${hash}/${f.name}`);
      const { error } = await supabase.storage.from(BUCKET_NAME).remove(filePaths);
      if (error) {
        console.error(`[Supabase Storage] Deletion failed for transfers/${hash}/:`, error);
      } else {
        console.log(`[Supabase Storage] Purged directory: transfers/${hash}/`);
      }
    }
  } catch (err) {
    console.error('[Supabase] Cleanup failed for hash ' + hash, err);
  }
}

// Configure Multer RAM Memory Storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/* ==========================================================================
   User Auth Routes (Supabase Postgres backend)
   ========================================================================== */
app.post('/api/auth/register', async (req, res) => {
  if (!isSupabaseEnabled) {
    return res.status(500).json({ error: 'Supabase integration is not configured.' });
  }

  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const existingUser = await getUser(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const { error } = await supabase
      .from('users')
      .insert([{
        username: username.toLowerCase(),
        email,
        password_hash: getSHA256(password)
      }]);

    if (error) {
      throw error;
    }

    res.cookie('session_user', username, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    res.json({ success: true, username });
  } catch (err) {
    console.error('Registration failed:', err);
    res.status(500).json({ error: 'Failed to create user account' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  if (!isSupabaseEnabled) {
    return res.status(500).json({ error: 'Supabase integration is not configured.' });
  }

  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    const user = await getUser(username);
    if (!user || user.password_hash !== getSHA256(password)) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    res.cookie('session_user', user.username, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    res.json({ success: true, username: user.username });
  } catch (err) {
    console.error('Login failed:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('session_user');
  res.json({ success: true });
});

app.get('/api/auth/me', async (req, res) => {
  const username = req.cookies.session_user;
  if (!username) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const user = await getUser(username);
  if (!user) {
    return res.status(401).json({ error: 'User session invalid' });
  }
  res.json({ username: user.username, email: user.email });
});

/* ==========================================================================
   Real-Time Server-Sent Events (SSE) Stream
   ========================================================================== */
app.get('/api/realtime/stream', (req, res) => {
  const username = req.cookies.session_user;
  if (!username) {
    return res.status(401).json({ error: 'Auth required for SSE streams' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = Date.now();
  const newClient = {
    id: clientId,
    username: username.toLowerCase(),
    res
  };
  sseClients.push(newClient);

  req.on('close', () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
});

function pushRealtimeEvent(uploader, eventData) {
  const target = uploader.toLowerCase();
  sseClients.forEach(client => {
    if (client.username === target) {
      client.res.write(`data: ${JSON.stringify(eventData)}\n\n`);
    }
  });
}

/* ==========================================================================
   Transfer Upload Endpoints (Buffered to RAM and pushed to Supabase Storage)
   ========================================================================== */
/* Direct signed upload initialization (Zero Vercel serverless payload overhead!) */
app.post('/api/upload/init', async (req, res) => {
  if (!isSupabaseEnabled) {
    return res.status(500).json({ error: 'Supabase integration is not configured.' });
  }

  const {
    filesMeta = [],
    senderEmail,
    recipientEmails,
    subject,
    message,
    password,
    expiration = '24',
    activeTab = 'link'
  } = req.body;

  if (!filesMeta || filesMeta.length === 0) {
    return res.status(400).json({ error: 'No file metadata provided' });
  }

  const hash = crypto.randomBytes(3).toString('hex');
  const expiryHours = parseInt(expiration);
  const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString();

  const filesList = [];
  const uploadItems = [];

  try {
    for (let i = 0; i < filesMeta.length; i++) {
      const fileMeta = filesMeta[i];
      const storagePath = `transfers/${hash}/${fileMeta.name}`;

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUploadUrl(storagePath);

      if (error || !data || !data.signedUrl) {
        throw error || new Error(`Could not generate signed upload URL for ${fileMeta.name}`);
      }

      filesList.push({
        index: i,
        name: fileMeta.name,
        size: fileMeta.size,
        mime: fileMeta.mime || 'application/octet-stream',
        storagePath
      });

      uploadItems.push({
        index: i,
        name: fileMeta.name,
        signedUrl: data.signedUrl,
        token: data.token,
        storagePath
      });
    }

    const totalSize = filesList.reduce((acc, f) => acc + f.size, 0);
    const uploader = req.cookies.session_user || null;

    const transfer = {
      hash,
      activeTab,
      senderEmail: senderEmail || 'Anonymous',
      recipientEmails: Array.isArray(recipientEmails) ? recipientEmails : (recipientEmails ? recipientEmails.split(',').map(e => e.trim()) : []),
      subject: subject || 'Shared files',
      message: message || '',
      passwordHash: password ? getSHA256(password) : null,
      expiresAt,
      createdAt: new Date().toISOString(),
      files: filesList,
      totalSize,
      downloadsCount: 0,
      uploader
    };

    await saveTransfer(transfer);
    res.json({ success: true, hash, uploadItems });
  } catch (err) {
    console.error('[Supabase Storage] Init signed upload failed:', err);
    res.status(500).json({ error: 'Failed to initialize direct cloud upload' });
  }
});

app.post('/api/upload', upload.array('files'), async (req, res) => {
  if (!isSupabaseEnabled) {
    return res.status(500).json({ error: 'Supabase integration is not configured. Setup credentials in your .env file.' });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const {
    senderEmail,
    recipientEmails,
    subject,
    message,
    password,
    expiration = '24',
    activeTab = 'link'
  } = req.body;

  const hash = crypto.randomBytes(3).toString('hex');
  const expiryHours = parseInt(expiration);
  const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString();

  const filesList = [];

  try {
    // Upload files directly from RAM memory buffer to Supabase Storage
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const storagePath = `transfers/${hash}/${file.originalname}`;

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true
        });

      if (error) {
        throw error;
      }

      filesList.push({
        index: i,
        name: file.originalname,
        size: file.size,
        mime: file.mimetype,
        storagePath
      });
      console.log(`[Supabase Storage] Uploaded: ${file.originalname} to bucket path: ${storagePath}`);
    }
  } catch (err) {
    console.error('[Supabase Storage] Upload execution failed:', err);
    return res.status(500).json({ error: 'Failed to upload files to cloud storage.' });
  }

  const totalSize = filesList.reduce((acc, f) => acc + f.size, 0);
  const uploader = req.cookies.session_user || null;

  const transfer = {
    hash,
    activeTab,
    senderEmail: senderEmail || 'Anonymous',
    recipientEmails: recipientEmails ? recipientEmails.split(',').map(e => e.trim()) : [],
    subject: subject || 'Shared files',
    message: message || '',
    passwordHash: password ? getSHA256(password) : null,
    expiresAt,
    createdAt: new Date().toISOString(),
    files: filesList,
    totalSize,
    downloadsCount: 0,
    uploader
  };

  await saveTransfer(transfer);
  res.json({ success: true, hash });
});

/* ==========================================================================
   Transfer Retrieval & Download Endpoints (Supabase Storage Signed URL redirects)
   ========================================================================== */
app.get('/api/transfer/:hash', async (req, res) => {
  const transfer = await getTransfer(req.params.hash);
  if (!transfer) {
    return res.status(404).json({ error: 'Transfer not found or expired' });
  }

  const passwordRequired = !!transfer.passwordHash;
  
  res.json({
    hash: transfer.hash,
    senderEmail: transfer.senderEmail,
    recipientEmails: transfer.recipientEmails,
    subject: transfer.subject,
    message: transfer.message,
    expiresAt: transfer.expiresAt,
    totalSize: transfer.totalSize,
    passwordRequired,
    files: passwordRequired ? [] : transfer.files
  });
});

app.post('/api/transfer/:hash/unlock', async (req, res) => {
  const { password } = req.body;
  const transfer = await getTransfer(req.params.hash);
  if (!transfer) {
    return res.status(404).json({ error: 'Transfer not found' });
  }

  if (transfer.passwordHash !== getSHA256(password)) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  res.json({
    success: true,
    files: transfer.files
  });
});

// Redirect browser to secure signed Supabase URL (valid for 15 minutes)
app.get('/api/transfer/:hash/file/:index', async (req, res) => {
  if (!isSupabaseEnabled) {
    return res.status(500).json({ error: 'Supabase integration is not configured' });
  }

  const transfer = await getTransfer(req.params.hash);
  if (!transfer) {
    return res.status(404).json({ error: 'Transfer not found' });
  }

  const fileIndex = parseInt(req.params.index);
  const fileObj = transfer.files.find(f => f.index === fileIndex);
  if (!fileObj) {
    return res.status(404).json({ error: 'File index not found' });
  }

  try {
    // Generate secure Signed URL valid for 15 minutes (900 seconds)
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(fileObj.storagePath, 900);

    if (error || !data || !data.signedUrl) {
      throw error || new Error('Signed URL creation failed');
    }

    // Increment downloads count
    transfer.downloadsCount += 1;
    await saveTransfer(transfer);

    const ip = req.ip || req.headers['x-forwarded-for'] || 'Unknown IP';
    await logDownloadEvent(transfer, fileObj.name, ip);

    // Redirect user to download file directly from CDN
    res.redirect(data.signedUrl);
  } catch (err) {
    console.error('[Supabase Storage] Signed link creation failed:', err);
    res.status(500).json({ error: 'Failed to generate download URL' });
  }
});

// ZIP all files: download streams on-the-fly and package dynamic ZIP stream
app.get('/api/transfer/:hash/zip', async (req, res) => {
  if (!isSupabaseEnabled) {
    return res.status(500).json({ error: 'Supabase integration is not configured' });
  }

  const transfer = await getTransfer(req.params.hash);
  if (!transfer) {
    return res.status(404).json({ error: 'Transfer not found' });
  }

  try {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="transfer-${transfer.hash}.zip"`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    for (const f of transfer.files) {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .download(f.storagePath);

      if (error) throw error;

      // Map downloaded ArrayBuffer to Node Buffer
      const arrayBuffer = await data.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      archive.append(buffer, { name: f.name });
    }

    // Increment downloads count & log event
    transfer.downloadsCount += 1;
    await saveTransfer(transfer);

    const ip = req.ip || req.headers['x-forwarded-for'] || 'Unknown IP';
    await logDownloadEvent(transfer, 'Complete ZIP Archive', ip);

    await archive.finalize();
  } catch (err) {
    console.error('[Supabase Storage] ZIP package stream error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to create ZIP package' });
    }
  }
});

async function logDownloadEvent(transfer, filename, ip) {
  if (!isSupabaseEnabled) return;
  try {
    const { error } = await supabase
      .from('logs')
      .insert([{
        transfer_hash: transfer.hash,
        filename,
        ip
      }]);

    if (error) {
      console.error('[Supabase DB] logDownloadEvent error:', error);
    }
  } catch (err) {
    console.error('[Supabase] Log event insert failed:', err);
  }

  if (transfer.uploader) {
    pushRealtimeEvent(transfer.uploader, {
      type: 'download',
      transferHash: transfer.hash,
      subject: transfer.subject,
      filename,
      ip,
      timestamp: new Date().toISOString()
    });
  }
}

/* ==========================================================================
   User Dashboard Operations (Supabase Postgres lists)
   ========================================================================== */
app.get('/api/user/transfers', async (req, res) => {
  if (!isSupabaseEnabled) {
    return res.status(500).json({ error: 'Supabase integration is not configured' });
  }

  const username = req.cookies.session_user;
  if (!username) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    // 1. Fetch active user transfers
    const { data: transfersData, error: transfersError } = await supabase
      .from('transfers')
      .select('*')
      .eq('uploader', username.toLowerCase());

    if (transfersError) {
      throw transfersError;
    }

    const userTransfers = [];

    // 2. Fetch logs for each transfer
    for (const transfer of transfersData) {
      // Check expiration on load
      if (new Date() > new Date(transfer.expires_at)) {
        await deleteTransferData(transfer.hash);
        continue;
      }

      const { data: logsData } = await supabase
        .from('logs')
        .select('*')
        .eq('transfer_hash', transfer.hash)
        .order('timestamp', { ascending: false });

      userTransfers.push({
        hash: transfer.hash,
        subject: transfer.subject,
        activeTab: transfer.active_tab,
        createdAt: transfer.created_at,
        expiresAt: transfer.expires_at,
        filesCount: transfer.files.length,
        totalSize: transfer.total_size,
        downloadsCount: transfer.downloads_count,
        passwordProtected: !!transfer.password_hash,
        logs: (logsData || []).map(l => ({
          filename: l.filename,
          ip: l.ip,
          timestamp: l.timestamp
        }))
      });
    }

    res.json({ transfers: userTransfers });
  } catch (err) {
    console.error('[Supabase DB] user transfers query failed:', err);
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
});

app.delete('/api/transfer/:hash', async (req, res) => {
  const username = req.cookies.session_user;
  if (!username) {
    return res.status(401).json({ error: 'Auth required' });
  }

  try {
    const transfer = await getTransfer(req.params.hash);
    if (!transfer) {
      return res.status(404).json({ error: 'Transfer not found' });
    }

    if (!transfer.uploader || transfer.uploader.toLowerCase() !== username.toLowerCase()) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    await deleteTransferData(transfer.hash);
    res.json({ success: true });
  } catch (err) {
    console.error('Revocation deletion failed:', err);
    res.status(500).json({ error: 'Failed to revoke transfer' });
  }
});

/* ==========================================================================
   Expired Transfers Cleanup Task (Runs every 10 minutes)
   ========================================================================== */
setInterval(async () => {
  if (!isSupabaseEnabled) return;
  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('transfers')
      .select('hash')
      .lt('expires_at', now);

    if (error) throw error;

    if (data && data.length > 0) {
      for (const row of data) {
        await deleteTransferData(row.hash);
      }
    }
  } catch (err) {
    console.error('[Supabase] Expired cleanups sweep failed:', err);
  }
}, 10 * 60 * 1000);

// Fallback to serve static Vite built files if in production mode
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('/*splat', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start Server explicitly on host 0.0.0.0 (IPv4) if not running on Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend Express server is running on http://127.0.0.1:${PORT}`);
  });
}

export default app;
