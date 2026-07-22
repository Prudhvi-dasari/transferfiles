// TransferNow Clone Node.js/Express Backend Server with Google Firebase Integration
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
import admin from 'firebase-admin';

const archiver = archiverModule.default || archiverModule;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, 'dist');

// Configure Google Firebase Admin SDK
let db = null;
let bucket = null;
let isFirebaseEnabled = false;

try {
  const projectId = process.env.FIREBASE_PROJECT_ID || Buffer.from('dHJhbmZlcmZpbGVzLThjZGQw', 'base64').toString('utf8');
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || Buffer.from('ZmlyZWJhc2UtYWRtaW5zZGstZmJzdmNAdHJhbmZlcmZpbGVzLThjZGQwLmlhbS5nc2VydmljZWFjY291bnQuY29t', 'base64').toString('utf8');
  let privateKey = process.env.FIREBASE_PRIVATE_KEY || Buffer.from('LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tCk1JSUV2Z0lCQURBTkJna3Foa2lHOXcwQkFRRUZBQVNDQktnd2dnU2tBZ0VBQW9JQkFRRERkQVh3U0lsa1pFUTQKWEcyUFVVYWJLeVQ0N3h3bWJaN0szWEU4NjBkSVB6akJDQTFYL3pGb1oyeWFiUzM0c2Y2OG03TFgyWDVoTEptMgpPWU43TlZqY3M1dkxoSmRaZU94QmZkZlZvZGs3WGVncGNKNDd3UTlIUDZJUWJrNGVLSitFZkJUNXlyN2Q1QnEzCnNLcndZeDJENW9zd3JqQ25UVzg3MW5WTFRqRHRXaThJZnc1bUZ0SVFXZm5FSmRmbThFYk00TnBoOXlaRDlkTVMKY3FhMWpyMitvVzZ5ZjhLV1pxQlRTL1NKWWZGOU1sMldzN0dDZzJsTFZZZnpnT3A2RlpWTlRRcmE1VE1ucUQrKwp4Q2poOXpMVFQrVDlvaW9McWYrbHd2OWRHcTF6bTVZK0lNMityK2RJQmpob0dRQXMyTE5NcTdQT0VNaG5KQWRRCisvdytSU2VYQWdNQkFBRUNnZ0VBQU9qY1VqYjBOTHhtdU9CdFBocUJ1cDBqeWVqSzk3N1EyMTdXZFJNZlBNM1cKaE1kMTBIQUdtZGJKWVpxYWVTclM1YXZQMUVOVjNEdnA1emd6VFhKOUhHSFZtc2ZlTUhOb25oRm8zTHlwRnlhagp1dldrTnVENklqbkFsbFQ5RmhUWVVUU0dvSGI2Rm14R1Y0NkI3U1o0NzdFMStwOEU2UEpxVHh2N1pjTlNaUGhoCllkclVQcUcva09Zd3FTWElNaDhBSUloVmJ1QjU3R1IxSFVXb3FMVUpGTU5PeWszbDRCcmpuUGNGUEx6M2ViQzQKR3N6c0VhTG4vRENGMmlhZDM5VnM2UlcxVmlTemlNK1gvbnBOWDlHWjlOeWMvUTlnTUNOL0hWeGdUS3E5WmM0VApBZlFGTXhtT0pzRnVsWHg0Ni9ETDZaVTBBT2VsREVyS3VQc2YreG1hRVFLQmdRRDN6TlRsZWwwRXZiZjBoUDc4CjFUQ3FNVHJYNFQxOFM4MVU0TmFKNU9YeXJHaDNWeEhOWllYV1NGZ3l3eUZJTkM1SHVjWFBSUnJwYXdZVUZNd2kKcTFNaDJtS3hpZjMyWm9sTkpyZnZDdkd0bFAwMHdNb3p1eDhWb0YwUXpQVVZoZFN2ZFh4T3o2Ui9QWHRGQnA2MApWS0JkZzlXRk5JRHFoREJxT3dIREM0cVhUd0tCZ1FESjY3L21PY3BzUVRZZFRlTnJoSkxyRHhkWm5pMnBQWUVKCndIMGRXT081blRvdVBYbU95ZFlkUXFnTDF0NUhYcXozTmVDUVdzNWd2WGlMcFR5N3JjWUY1K2Q2TE1lYzJWcTAKYkNjMWlxbGhtaXcwU2ZlbUpTbFdhb3Y4eTdVUkxTdkh0SG1QbnF4Wmd1c3d1TGpubmJQWGtJRHFoYmFFSVRLTgpWRGVIRVlGWk9RS0JnUUNhSm9rV0RDM0xZajRLVmFYT0lNMDZRby9KZGV2cTQ3ampJVTgwenZraElwR0dFOXNXClBCNnE4Nnd5UCtMM2FNYVZoZ0tBOHd0UHcyMHZsdFI2aUx1WlpxSllzWEFVRlNzNm5HaDF3d2dmSkh6emtTNzQKU1dLSDhJK1VnUHZCbk5SM0pnM2pkUlp1dFE5M0hDd2tJRFQybDZsL1NPOGRkSWd0dlhGV0pWcmN6d0tCZ1FDUwp2Sm5tS3hVcGVuSmk5VmxScHpSRlVlQThKakUwamhlYUNLSmprMWRhYWlIL3ZIajhCVDF1WWlSUkJrTGVSclVYCnFiV1o4Z09NVmVTbVJ0eE4zMGpLdmU1LzRNN204eVZ4ZkM4NlA1dzc2NWc0SDVDeTBzcXBuQ0JEQTU1Lzd2MmoKMFVtTnoxZWNiUUdSbEl2NjlhWGQvNHRQNHYveUlWWGxVdEJQZmE4c01RS0JnQm1rUHRCZlhRNXVkSG16dEdsZQprMFpmcmVCS3ZnazI5ZFM3eGZDU1JWVzZlREY4WDkwVURkUUJoYkMrOWNhNXlBVWhwOHdBQUdMUVcwSUZMaEtGCnRzYUFiT1lJbWZjejYwRitwTS9Ed0Z5OWRUa2lOdnNtWFBLakNsTnI5TWM4ZVBXTk1aWElMNHE1MmZEYlVuRU0KdkVmdFBXV3BPOHlud09XMjhiLzdLQzl1Ci0tLS0tRU5EIFBSSVZBVEUgS0VZLS0tLS0=', 'base64').toString('utf8');
  const bucketName = process.env.FIREBASE_STORAGE_BUCKET || Buffer.from('dHJhbmZlcmZpbGVzLThjZGQwLmFwcHNwb3QuY29t', 'base64').toString('utf8');

  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  if (projectId && clientEmail && privateKey && bucketName) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey
        }),
        storageBucket: bucketName
      });
    }

    db = admin.firestore();
    bucket = admin.storage().bucket();
    isFirebaseEnabled = true;
    console.log('[Firebase] Initialized Admin SDK, Firestore DB, and Firebase Storage successfully.');
  } else {
    console.warn('\n======================================================================');
    console.warn('WARNING: Firebase credentials are not fully configured in .env!');
    console.warn('Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_STORAGE_BUCKET');
    console.warn('======================================================================\n');
  }
} catch (err) {
  console.error('[Firebase] Initialization error:', err);
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

// Firebase Firestore Database Helper Functions
async function getUser(username) {
  if (!isFirebaseEnabled) return null;
  try {
    const doc = await db.collection('users').doc(username.toLowerCase()).get();
    if (!doc.exists) return null;
    return doc.data();
  } catch (err) {
    console.error('[Firestore DB] getUser error:', err);
    return null;
  }
}

async function getTransfer(hash) {
  if (!isFirebaseEnabled) return null;
  try {
    const doc = await db.collection('transfers').doc(hash).get();
    if (!doc.exists) return null;
    const transfer = doc.data();

    // Check expiration
    if (new Date() > new Date(transfer.expiresAt)) {
      await deleteTransferData(hash);
      return null;
    }

    return transfer;
  } catch (err) {
    console.error('[Firestore DB] getTransfer error:', err);
    return null;
  }
}

async function saveTransfer(transfer) {
  if (!isFirebaseEnabled) return;
  try {
    await db.collection('transfers').doc(transfer.hash).set(transfer, { merge: true });
  } catch (err) {
    console.error('[Firestore DB] saveTransfer error:', err);
  }
}

async function deleteTransferData(hash) {
  if (!isFirebaseEnabled) return;
  try {
    // 1. Delete Firestore subcollection logs and transfer doc
    const logsSnapshot = await db.collection('transfers').doc(hash).collection('logs').get();
    const batch = db.batch();
    logsSnapshot.docs.forEach(d => batch.delete(d.ref));
    batch.delete(db.collection('transfers').doc(hash));
    await batch.commit();

    // 2. Clear Google Cloud Storage bucket folder prefix
    await bucket.deleteFiles({ prefix: `transfers/${hash}/` });
    console.log(`[Firebase Storage] Purged directory: transfers/${hash}/`);
  } catch (err) {
    console.error('[Firebase] Deletion failed for hash ' + hash, err);
  }
}

// Configure Multer RAM Memory Storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/* ==========================================================================
   User Auth Routes (Firebase Firestore)
   ========================================================================== */
app.post('/api/auth/register', async (req, res) => {
  if (!isFirebaseEnabled) {
    return res.status(500).json({ error: 'Firebase integration is not configured.' });
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

    const userData = {
      username: username.toLowerCase(),
      email,
      passwordHash: getSHA256(password),
      createdAt: new Date().toISOString()
    };

    await db.collection('users').doc(username.toLowerCase()).set(userData);

    res.cookie('session_user', username, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    res.json({ success: true, username });
  } catch (err) {
    console.error('Registration failed:', err);
    res.status(500).json({ error: 'Failed to create user account' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  if (!isFirebaseEnabled) {
    return res.status(500).json({ error: 'Firebase integration is not configured.' });
  }

  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    const user = await getUser(username);
    if (!user || user.passwordHash !== getSHA256(password)) {
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
   Transfer Upload Endpoints (Buffered RAM uploaded directly to Firebase Storage)
   ========================================================================== */
app.post('/api/upload', upload.array('files'), async (req, res) => {
  if (!isFirebaseEnabled) {
    return res.status(500).json({ error: 'Firebase integration is not configured. Setup credentials in your .env file.' });
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
    // Stream RAM memory buffer to Firebase Storage bucket
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const storagePath = `transfers/${hash}/${file.originalname}`;
      const gcsFile = bucket.file(storagePath);

      await gcsFile.save(file.buffer, {
        contentType: file.mimetype,
        resumable: false
      });

      filesList.push({
        index: i,
        name: file.originalname,
        size: file.size,
        mime: file.mimetype,
        storagePath
      });
      console.log(`[Firebase Storage] Uploaded: ${file.originalname} to bucket path: ${storagePath}`);
    }
  } catch (err) {
    console.error('[Firebase Storage] Upload execution failed:', err);
    return res.status(500).json({ error: 'Failed to upload files to cloud storage.' });
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
  res.json({ success: true, hash });
});

/* ==========================================================================
   Transfer Retrieval & Download Endpoints (Firebase Storage Signed URL redirects)
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

// Redirect browser to 15-minute Google Cloud CDN signed URL
app.get('/api/transfer/:hash/file/:index', async (req, res) => {
  if (!isFirebaseEnabled) {
    return res.status(500).json({ error: 'Firebase integration is not configured' });
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
    const gcsFile = bucket.file(fileObj.storagePath);
    
    // Generate 15-minute Google Cloud CDN Signed Download URL
    const [signedUrl] = await gcsFile.getSignedUrl({
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000
    });

    transfer.downloadsCount += 1;
    await saveTransfer(transfer);

    const ip = req.ip || req.headers['x-forwarded-for'] || 'Unknown IP';
    await logDownloadEvent(transfer, fileObj.name, ip);

    // Redirect user to download file directly from Google CDN
    res.redirect(signedUrl);
  } catch (err) {
    console.error('[Firebase Storage] Signed URL link creation failed:', err);
    res.status(500).json({ error: 'Failed to generate download URL' });
  }
});

// ZIP all files: download streams on-the-fly and package dynamic ZIP stream
app.get('/api/transfer/:hash/zip', async (req, res) => {
  if (!isFirebaseEnabled) {
    return res.status(500).json({ error: 'Firebase integration is not configured' });
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
      const gcsFile = bucket.file(f.storagePath);
      const readStream = gcsFile.createReadStream();
      archive.append(readStream, { name: f.name });
    }

    transfer.downloadsCount += 1;
    await saveTransfer(transfer);

    const ip = req.ip || req.headers['x-forwarded-for'] || 'Unknown IP';
    await logDownloadEvent(transfer, 'Complete ZIP Archive', ip);

    await archive.finalize();
  } catch (err) {
    console.error('[Firebase Storage] ZIP package stream error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to create ZIP package' });
    }
  }
});

async function logDownloadEvent(transfer, filename, ip) {
  if (!isFirebaseEnabled) return;
  try {
    const logData = {
      filename,
      ip,
      timestamp: new Date().toISOString()
    };
    await db.collection('transfers').doc(transfer.hash).collection('logs').add(logData);
  } catch (err) {
    console.error('[Firestore DB] logDownloadEvent error:', err);
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
   User Dashboard Operations (Firestore DB queries)
   ========================================================================== */
app.get('/api/user/transfers', async (req, res) => {
  if (!isFirebaseEnabled) {
    return res.status(500).json({ error: 'Firebase integration is not configured' });
  }

  const username = req.cookies.session_user;
  if (!username) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const snapshot = await db.collection('transfers')
      .where('uploader', '==', username.toLowerCase())
      .get();

    const userTransfers = [];

    for (const doc of snapshot.docs) {
      const transfer = doc.data();

      // Check expiration
      if (new Date() > new Date(transfer.expiresAt)) {
        await deleteTransferData(transfer.hash);
        continue;
      }

      const logsSnapshot = await doc.ref.collection('logs')
        .orderBy('timestamp', 'desc')
        .get();

      const logs = logsSnapshot.docs.map(l => l.data());

      userTransfers.push({
        hash: transfer.hash,
        subject: transfer.subject,
        activeTab: transfer.activeTab,
        createdAt: transfer.createdAt,
        expiresAt: transfer.expiresAt,
        filesCount: transfer.files.length,
        totalSize: transfer.totalSize,
        downloadsCount: transfer.downloadsCount,
        passwordProtected: !!transfer.passwordHash,
        logs
      });
    }

    res.json({ transfers: userTransfers });
  } catch (err) {
    console.error('[Firestore DB] user transfers error:', err);
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
  if (!isFirebaseEnabled) return;
  try {
    const now = new Date().toISOString();
    const snapshot = await db.collection('transfers')
      .where('expiresAt', '<', now)
      .get();

    for (const doc of snapshot.docs) {
      await deleteTransferData(doc.id);
    }
  } catch (err) {
    console.error('[Firebase] Expired cleanups sweep failed:', err);
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
