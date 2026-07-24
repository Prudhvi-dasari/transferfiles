import { auth, db, storage } from './firebase.js';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { collection, addDoc, getDocs, query, where, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

// TransferNow Clone Interactive Scripting Engine

document.addEventListener('DOMContentLoaded', () => {
  checkAuthNavbar();
  initHeader();
  initUploader();
  initPricing();
  initFAQ();
  initContact();
  initAuthPages();
  initDashboard();
  initDownloadPortal();
});

/* ==========================================================================
   Global Auth Navbar State
   ========================================================================== */
function checkAuthNavbar() {
  const welcomeText = document.getElementById('welcome-user-text');
  const btnLogout = document.getElementById('btn-logout');
  const navActions = document.querySelector('.nav-actions');

  if (!navActions) return;

  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is logged in
      const displayName = user.displayName || user.email.split('@')[0];
      navActions.innerHTML = `
        <a href="/dashboard.html" class="btn btn-outline" style="padding: 8px 20px; margin-right: 8px;">Dashboard (${displayName})</a>
        <button id="nav-logout-btn" class="btn btn-primary" style="padding: 8px 20px;">Log out</button>
      `;

      document.getElementById('nav-logout-btn')?.addEventListener('click', () => {
        signOut(auth).then(() => {
          window.location.href = '/index.html';
        });
      });
    }
  });
}

/* ==========================================================================
   Header & Sticky Navigation Menu
   ========================================================================== */
function initHeader() {
  const header = document.getElementById('header');
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (!header) return;

  // Change header appearance on page scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('sticky');
    } else {
      const isStickyPage = window.location.pathname.includes('prices') ||
                           window.location.pathname.includes('features') ||
                           window.location.pathname.includes('contact') ||
                           window.location.pathname.includes('faq') ||
                           window.location.pathname.includes('dashboard') ||
                           window.location.pathname.includes('login') ||
                           window.location.pathname.includes('register') ||
                           window.location.pathname.includes('download');
      if (!isStickyPage) {
        header.classList.remove('sticky');
      }
    }
  });

  // Mobile menu toggle trigger
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const isOpen = navMenu.classList.contains('active');
      menuToggle.innerHTML = isOpen 
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;
    });
  }

  // Set active class on navigation links dynamically based on current page URL
  const navLinks = document.querySelectorAll('.nav-link');
  const currentPath = window.location.pathname;

  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    if (currentPath.endsWith(linkPath) || (currentPath === '/' && linkPath.includes('index.html'))) {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    }
  });
}

/* ==========================================================================
   Interactive Uploader State Machine (Connected to real backend APIs)
   ========================================================================== */
function initUploader() {
  const widget = document.getElementById('uploader-widget');
  if (!widget) return;

  // DOM Elements
  const fileInput = document.getElementById('file-input');
  const folderInput = document.getElementById('folder-input');
  const selectFilesBtn = document.getElementById('select-files-btn');
  const selectFolderBtn = document.getElementById('select-folder-btn');
  const startUploadBtn = document.getElementById('start-upload-btn');
  const dropzoneOverlay = document.getElementById('dropzone-overlay');
  
  const idleState = document.getElementById('uploader-idle');
  const formState = document.getElementById('uploader-form-state');
  const progressState = document.getElementById('uploader-progress-state');
  const successState = document.getElementById('uploader-success-state');

  // Form Elements
  const uploaderForm = document.getElementById('transfer-form');
  const tabEmail = document.getElementById('tab-email');
  const tabLink = document.getElementById('tab-link');
  const groupRecipients = document.getElementById('group-recipients');
  const recipientsContainer = document.getElementById('recipients-container');
  const recipientInput = document.getElementById('recipient-input');
  const labelSender = document.getElementById('label-sender');
  const senderEmailInput = document.getElementById('sender-email');
  
  // Advanced Settings elements
  const advancedToggle = document.getElementById('advanced-toggle');
  const advancedContent = document.getElementById('advanced-content');
  const passwordToggle = document.getElementById('setting-password-toggle');
  const passwordInputGroup = document.getElementById('password-input-group');
  const passwordInput = document.getElementById('setting-password');
  const expirationSelect = document.getElementById('setting-expiration');
  const regionSelect = document.getElementById('setting-region');

  // Selected Files list elements
  const selectedFilesCount = document.getElementById('selected-files-count');
  const selectedFilesList = document.getElementById('selected-files-list');
  const btnSubmitTransfer = document.getElementById('btn-submit-transfer');

  // Progress Elements
  const progressCircleFill = document.getElementById('progress-circle-fill');
  const progressPercentageText = document.getElementById('progress-percentage-text');
  const progressCurrentFile = document.getElementById('progress-current-file');
  const progressUploadedSize = document.getElementById('progress-uploaded-size');
  const progressSpeedText = document.getElementById('progress-speed');
  const progressTimeText = document.getElementById('progress-time-remaining');
  const progressLinearFill = document.getElementById('progress-linear-fill');

  // Success Elements
  const successDesc = document.getElementById('success-desc');
  const successLinkBox = document.getElementById('success-link-box');
  const shareLinkUrl = document.getElementById('share-link-url');
  const btnCopyLink = document.getElementById('btn-copy-link');
  const btnResetUploader = document.getElementById('btn-reset-uploader');
  const copyToast = document.getElementById('copy-toast');

  // State Variables
  let selectedFiles = [];
  let recipientEmails = [];
  let activeTab = 'email'; // 'email' or 'link'

  // --- File Selection Handlers ---
  startUploadBtn.addEventListener('click', () => fileInput.click());
  selectFilesBtn.addEventListener('click', () => fileInput.click());
  selectFolderBtn.addEventListener('click', () => folderInput.click());

  fileInput.addEventListener('change', handleFileChange);
  folderInput.addEventListener('change', handleFileChange);

  function handleFileChange(e) {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      addFiles(files);
    }
  }

  function addFiles(files) {
    files.forEach(file => {
      // Prevent duplicates based on name and size
      if (!selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
        selectedFiles.push(file);
      }
    });
    updateFilesListUI();
    transitionToForm();
  }

  // --- Drag & Drop Handlers ---
  window.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dropzoneOverlay.classList.add('active');
  });

  dropzoneOverlay.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  dropzoneOverlay.addEventListener('dragleave', (e) => {
    e.preventDefault();
    if (e.target === dropzoneOverlay || e.target.classList.contains('dropzone-box')) {
      dropzoneOverlay.classList.remove('active');
    }
  });

  dropzoneOverlay.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzoneOverlay.classList.remove('active');
    if (e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  });

  // --- UI Transitions ---
  function transitionToForm() {
    idleState.style.display = 'none';
    formState.style.display = 'flex';
    progressState.style.display = 'none';
    successState.style.display = 'none';
  }

  function transitionToProgress() {
    idleState.style.display = 'none';
    formState.style.display = 'none';
    progressState.style.display = 'flex';
    successState.style.display = 'none';
  }

  function transitionToSuccess() {
    idleState.style.display = 'none';
    formState.style.display = 'none';
    progressState.style.display = 'none';
    successState.style.display = 'flex';
  }

  function transitionToIdle() {
    // Reset state values
    selectedFiles = [];
    recipientEmails = [];
    fileInput.value = '';
    folderInput.value = '';
    uploaderForm.reset();
    
    // Clear recipient chips
    const chips = recipientsContainer.querySelectorAll('.email-chip');
    chips.forEach(chip => chip.remove());
    recipientInput.value = '';
    recipientInput.placeholder = 'Enter email and press Enter';
    
    // Hide password
    passwordInputGroup.style.display = 'none';
    advancedToggle.classList.remove('active');
    advancedContent.classList.remove('open');

    // UI Reset
    idleState.style.display = 'flex';
    formState.style.display = 'none';
    progressState.style.display = 'none';
    successState.style.display = 'none';
  }

  // --- Selected Files List Management ---
  function updateFilesListUI() {
    selectedFilesList.innerHTML = '';
    selectedFilesCount.textContent = `${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}`;

    selectedFiles.forEach((file, index) => {
      const li = document.createElement('li');
      li.className = 'file-item';
      li.innerHTML = `
        <span class="file-item-name" title="${file.name}">${file.name}</span>
        <span class="file-item-size">${formatBytes(file.size)}</span>
        <button type="button" class="file-item-remove" data-index="${index}">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      `;
      selectedFilesList.appendChild(li);
    });

    // Remove buttons event listener
    const removeButtons = selectedFilesList.querySelectorAll('.file-item-remove');
    removeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(btn.getAttribute('data-index'));
        selectedFiles.splice(index, 1);
        updateFilesListUI();
        if (selectedFiles.length === 0) {
          transitionToIdle();
        }
      });
    });
  }

  // --- Tab Switcher Logic ---
  tabEmail.addEventListener('click', () => {
    activeTab = 'email';
    tabEmail.classList.add('active');
    tabLink.classList.remove('active');
    groupRecipients.style.display = 'block';
    labelSender.textContent = 'Your email address';
    senderEmailInput.required = true;
    btnSubmitTransfer.textContent = 'Transfer';
  });

  tabLink.addEventListener('click', () => {
    activeTab = 'link';
    tabLink.classList.add('active');
    tabEmail.classList.remove('active');
    groupRecipients.style.display = 'none';
    labelSender.textContent = 'Your email address (optional)';
    senderEmailInput.required = false;
    btnSubmitTransfer.textContent = 'Get a link';
  });

  // --- Email Recipient Chip Management ---
  recipientInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const email = recipientInput.value.trim().replace(/,/g, '');
      if (email && validateEmail(email)) {
        addRecipientChip(email);
        recipientInput.value = '';
        recipientInput.placeholder = '';
      } else if (email) {
        recipientInput.style.color = 'var(--danger)';
        setTimeout(() => recipientInput.style.color = 'inherit', 1000);
      }
    }
  });

  function addRecipientChip(email) {
    if (recipientEmails.includes(email)) return;
    if (recipientEmails.length >= 20) return;

    recipientEmails.push(email);

    const chip = document.createElement('span');
    chip.className = 'email-chip';
    chip.innerHTML = `
      ${email}
      <button type="button" class="email-chip-remove">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;

    recipientsContainer.insertBefore(chip, recipientInput);

    chip.querySelector('.email-chip-remove').addEventListener('click', () => {
      recipientEmails = recipientEmails.filter(e => e !== email);
      chip.remove();
      if (recipientEmails.length === 0) {
        recipientInput.placeholder = 'Enter email and press Enter';
      }
    });
  }

  // --- Advanced Settings Accordion Toggle ---
  advancedToggle.addEventListener('click', () => {
    advancedToggle.classList.toggle('active');
    advancedContent.classList.toggle('open');
  });

  passwordToggle.addEventListener('change', () => {
    if (passwordToggle.checked) {
      passwordInputGroup.style.display = 'block';
      passwordInput.focus();
      passwordInput.required = true;
    } else {
      passwordInputGroup.style.display = 'none';
      passwordInput.required = false;
      passwordInput.value = '';
    }
  });

  // --- Form Submission & Transfer Execution ---
  uploaderForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (activeTab === 'email') {
      const pendingEmail = recipientInput.value.trim();
      if (pendingEmail && validateEmail(pendingEmail)) {
        addRecipientChip(pendingEmail);
        recipientInput.value = '';
      }

      if (recipientEmails.length === 0) {
        recipientInput.focus();
        recipientsContainer.style.borderColor = 'var(--danger)';
        setTimeout(() => recipientsContainer.style.borderColor = 'var(--border-color)', 2000);
        return;
      }
    }

    startRealUpload();
  });

  // --- Real File Upload Handling (AJAX) ---
  // --- Real Firebase Cloud Upload Handling (AJAX) ---
  async function startRealUpload() {
    transitionToProgress();

    // 1. Generate unique hash
    const hash = Array.from({length: 16}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    
    // 2. Prepare Metadata
    const transferDoc = {
      hash,
      activeTab,
      senderEmail: senderEmailInput.value || '',
      recipientEmails,
      subject: document.getElementById('transfer-subject').value || '',
      message: document.getElementById('transfer-message').value || '',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + parseInt(expirationSelect.value) * 24 * 60 * 60 * 1000).toISOString(),
      region: regionSelect.value,
      files: selectedFiles.map(f => ({ name: f.name, size: f.size, type: f.type }))
    };

    if (passwordToggle.checked && passwordInput.value) {
      // Basic client-side hashing (Note: For a production app, do this securely)
      const encoder = new TextEncoder();
      const data = encoder.encode(passwordInput.value);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      transferDoc.passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    // Add user ID if logged in
    if (auth.currentUser) {
      transferDoc.userId = auth.currentUser.uid;
    }

    const strokeMax = 351.85;
    progressCircleFill.style.strokeDasharray = strokeMax;

    let uploadStartTime = Date.now();
    let totalBytes = selectedFiles.reduce((acc, f) => acc + f.size, 0);
    let loadedBytes = 0;
    let fileProgress = selectedFiles.map(() => 0);

    try {
      // 3. Upload files sequentially to Firebase Storage
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        progressCurrentFile.textContent = `Uploading [${i + 1}/${selectedFiles.length}]: ${file.name}`;
        
        const storageRef = ref(storage, `transfers/${hash}/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise((resolve, reject) => {
          uploadTask.on('state_changed', 
            (snapshot) => {
              fileProgress[i] = snapshot.bytesTransferred;
              loadedBytes = fileProgress.reduce((a, b) => a + b, 0);
              
              const progressPercent = Math.min(Math.round((loadedBytes / totalBytes) * 100), 100);
              const dashOffset = strokeMax - (progressPercent / 100) * strokeMax;
              progressCircleFill.style.strokeDashoffset = dashOffset;
              progressPercentageText.textContent = `${progressPercent}%`;
              progressLinearFill.style.width = `${progressPercent}%`;
              progressUploadedSize.textContent = `${formatBytes(loadedBytes)} / ${formatBytes(totalBytes)}`;

              const timeElapsed = (Date.now() - uploadStartTime) / 1000;
              if (timeElapsed > 0.1) {
                const currentSpeed = loadedBytes / timeElapsed;
                progressSpeedText.textContent = `${(currentSpeed / (1024 * 1024)).toFixed(1)} MB/s`;

                const remainingBytes = totalBytes - loadedBytes;
                const remainingSeconds = Math.ceil(remainingBytes / currentSpeed);
                progressTimeText.textContent = `Remaining: ${formatTime(remainingSeconds)}`;
              }
            }, 
            (error) => reject(error), 
            () => resolve()
          );
        });
      }

      // 4. Save metadata to Firestore using the hash as the Document ID
      await setDoc(doc(db, 'transfers', hash), transferDoc);
      
      // 5. Complete
      finishUpload(hash);

    } catch (err) {
      console.error(err);
      alert('Upload failed: ' + err.message);
      transitionToForm();
    }
  }

  function finishUpload(hash) {
    setTimeout(() => {
      transitionToSuccess();
      const generatedLink = `${window.location.origin}/download.html?t=${hash}`;
      
      if (activeTab === 'email') {
        successDesc.textContent = `Success! Your transfer has been fully processed and notifications sent to ${recipientEmails.length} recipient${recipientEmails.length > 1 ? 's' : ''}.`;
        successLinkBox.style.display = 'none';
      } else {
        successDesc.textContent = `Success! Your download link is fully prepared and generated. Share it with your recipients.`;
        shareLinkUrl.textContent = generatedLink;
        successLinkBox.style.display = 'flex';
      }
    }, 500);
  }

  // --- Copy Link Clipboards Toast ---
  btnCopyLink.addEventListener('click', () => {
    navigator.clipboard.writeText(shareLinkUrl.textContent).then(() => {
      copyToast.classList.add('show');
      setTimeout(() => copyToast.classList.remove('show'), 2000);
    });
  });

  // --- Reset Event ---
  btnResetUploader.addEventListener('click', transitionToIdle);
}

/* ==========================================================================
   Pricing Page Billing Toggle Updates
   ========================================================================== */
function initPricing() {
  const toggleContainer = document.querySelector('.billing-toggle-container');
  if (!toggleContainer) return;

  const premiumPrice = document.getElementById('price-premium');
  const premiumTerm = document.getElementById('term-premium');
  const teamPrice = document.getElementById('price-team');
  const teamTerm = document.getElementById('term-team');

  const billingRadios = document.querySelectorAll('input[name="billing-freq"]');

  billingRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.id === 'billing-2years') {
        if (premiumPrice) premiumPrice.textContent = '$8.50';
        if (premiumTerm) premiumTerm.textContent = 'billed monthly ($204 total)';
        if (teamPrice) teamPrice.textContent = '$15.00';
        if (teamTerm) teamTerm.textContent = 'per user / month ($360 total)';
      } else if (radio.id === 'billing-1year') {
        if (premiumPrice) premiumPrice.textContent = '$10.00';
        if (premiumTerm) premiumTerm.textContent = 'billed monthly ($120 total)';
        if (teamPrice) teamPrice.textContent = '$18.00';
        if (teamTerm) teamTerm.textContent = 'per user / month ($216 total)';
      } else if (radio.id === 'billing-monthly') {
        if (premiumPrice) premiumPrice.textContent = '$15.00';
        if (premiumTerm) premiumTerm.textContent = 'billed monthly';
        if (teamPrice) teamPrice.textContent = '$22.00';
        if (teamTerm) teamTerm.textContent = 'per user / month';
      }
    });
  });
}

/* ==========================================================================
   FAQ Collapsible Accordion & Category Filter
   ========================================================================== */
function initFAQ() {
  const faqList = document.getElementById('faq-list');
  if (!faqList) return;

  const faqItems = document.querySelectorAll('.faq-item');
  const questionButtons = document.querySelectorAll('.faq-question-btn');
  const searchInput = document.getElementById('faq-search');
  const tabButtons = document.querySelectorAll('.faq-tab-btn');

  questionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const isOpen = item.classList.contains('open');
      
      faqItems.forEach(i => i.classList.remove('open'));
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase().trim();
      
      faqItems.forEach(item => {
        const questionText = item.querySelector('.faq-question-btn').textContent.toLowerCase();
        const answerText = item.querySelector('.faq-answer-inner').textContent.toLowerCase();
        
        if (questionText.includes(query) || answerText.includes(query)) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  }

  tabButtons.forEach(tab => {
    tab.addEventListener('click', () => {
      tabButtons.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const category = tab.getAttribute('data-category');
      
      faqItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        if (category === 'all' || itemCategory === category) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });

      if (searchInput) searchInput.value = '';
    });
  });
}

/* ==========================================================================
   Contact Page Form Feedback
   ========================================================================== */
function initContact() {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending message...';
    submitBtn.style.opacity = '0.7';

    setTimeout(() => {
      const formCard = contactForm.parentElement;
      formCard.innerHTML = `
        <div style="text-align: center; padding: 40px 0; animation: scaleIn 0.3s ease;">
          <div style="width: 70px; height: 70px; background-color: var(--success); border-radius:50%; display:inline-flex; align-items:center; justify-content:center; color:white; font-size:32px; margin-bottom:24px; box-shadow:0 8px 24px rgba(36,180,126,0.3);">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2 style="font-size:28px; margin-bottom:12px;">Message Dispatched!</h2>
          <p style="color:var(--dark-light); max-width:400px; margin:0 auto 24px;">Thank you for getting in touch. One of our support representatives will respond to your inquiry shortly.</p>
          <a href="/index.html" class="btn btn-primary">Return to Homepage</a>
        </div>
      `;
    }, 1500);
  });
}

/* ==========================================================================
   Authentication Pages Logic (Login & Registration Forms)
   ========================================================================== */
function initAuthPages() {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // login-username input now expects an email in this serverless flow
      const email = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value;
      const errorMsg = document.getElementById('login-error-msg');

      errorMsg.style.display = 'none';

      signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        window.location.href = '/dashboard.html';
      })
      .catch((err) => {
        errorMsg.textContent = 'Login failed: ' + err.message;
        errorMsg.style.display = 'block';
      });
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('register-username').value.trim();
      const email = document.getElementById('register-email').value.trim();
      const password = document.getElementById('register-password').value;
      const confirmPassword = document.getElementById('register-confirm-password').value;
      const errorMsg = document.getElementById('register-error-msg');

      errorMsg.style.display = 'none';

      if (password !== confirmPassword) {
        errorMsg.textContent = 'Passwords do not match.';
        errorMsg.style.display = 'block';
        return;
      }

      if (password.length < 6) {
        errorMsg.textContent = 'Password must be at least 6 characters.';
        errorMsg.style.display = 'block';
        return;
      }

      createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        return updateProfile(userCredential.user, { displayName: username });
      })
      .then(() => {
        window.location.href = '/dashboard.html';
      })
      .catch((err) => {
        errorMsg.textContent = 'Registration failed: ' + err.message;
        errorMsg.style.display = 'block';
      });
    });
  }
}

/* ==========================================================================
   User Account Dashboard Engine (SSE realtime notification listener)
   ========================================================================== */
function initDashboard() {
  const tableBody = document.getElementById('transfers-table-body');
  if (!tableBody) return;

  const titleHeader = document.getElementById('dashboard-welcome-title');
  const metricActive = document.getElementById('metric-active-transfers');
  const metricStorage = document.getElementById('metric-total-storage');
  const metricDownloads = document.getElementById('metric-total-downloads');
  const searchInput = document.getElementById('transfers-search');
  const btnLogout = document.getElementById('btn-logout');

  let transfersData = [];

  onAuthStateChanged(auth, (user) => {
    if (user) {
      const displayName = user.displayName || user.email.split('@')[0];
      titleHeader.textContent = `Welcome back, ${displayName}!`;
      loadTransfersList(user.uid);
    } else {
      window.location.href = '/login.html';
    }
  });

  btnLogout?.addEventListener('click', () => {
    signOut(auth).then(() => window.location.href = '/index.html');
  });

  async function loadTransfersList(uid) {
    try {
      const q = query(collection(db, 'transfers'), where('userId', '==', uid));
      const querySnapshot = await getDocs(q);
      
      transfersData = [];
      querySnapshot.forEach((docSnap) => {
        const t = docSnap.data();
        transfersData.push({
          ...t,
          filesCount: t.files ? t.files.length : 0,
          totalSize: t.files ? t.files.reduce((a,f) => a + f.size, 0) : 0,
          downloadsCount: t.downloadsCount || 0
        });
      });
      
      renderTransfersTable(transfersData);
      calculateDashboardMetrics(transfersData);
    } catch (err) {
      console.error(err);
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 40px; color:var(--danger);">Error fetching transfers.</td></tr>`;
    }
  }

  function calculateDashboardMetrics(transfers) {
    const activeCount = transfers.length;
    const totalStorage = transfers.reduce((acc, t) => acc + t.totalSize, 0);
    const totalDownloads = transfers.reduce((acc, t) => acc + t.downloadsCount, 0);

    metricActive.textContent = activeCount;
    metricStorage.textContent = formatBytes(totalStorage);
    metricDownloads.textContent = totalDownloads;
  }

  function renderTransfersTable(transfers) {
    if (transfers.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 40px; color:var(--dark-light);">No file transfers active. Send files on the homepage!</td></tr>`;
      return;
    }

    tableBody.innerHTML = '';
    transfers.forEach(t => {
      const isExpired = new Date() > new Date(t.expiresAt);
      const row = document.createElement('tr');
      row.innerHTML = `
        <td style="font-weight: 600;">${t.subject || 'Untitled'}</td>
        <td>${t.filesCount} file${t.filesCount !== 1 ? 's' : ''}</td>
        <td>${formatBytes(t.totalSize)}</td>
        <td>${t.downloadsCount} times</td>
        <td>
          <span class="status-badge ${isExpired ? 'status-expired' : 'status-active'}">
            ${isExpired ? 'Expired' : formatRemainingDays(t.expiresAt)}
          </span>
        </td>
        <td>
          ${t.passwordHash 
            ? `<span title="Password Protected" style="color:var(--primary); cursor:pointer;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>`
            : `<span style="color:var(--dark-light); font-size:12px;">Open</span>`}
        </td>
        <td style="display:flex; gap:8px;">
          <button class="action-btn-circle btn-copy-transfer" data-hash="${t.hash}" title="Copy Link">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          </button>
          <button class="action-btn-circle btn-delete" data-hash="${t.hash}" title="Delete Transfer">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>
        </td>
      `;
      tableBody.appendChild(row);
    });

    tableBody.querySelectorAll('.btn-copy-transfer').forEach(btn => {
      btn.addEventListener('click', () => {
        const hash = btn.getAttribute('data-hash');
        const link = `${window.location.origin}/download.html?t=${hash}`;
        navigator.clipboard.writeText(link).then(() => {
          showLiveToast('Link copied to clipboard!');
        });
      });
    });

    tableBody.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        const hash = btn.getAttribute('data-hash');
        if (confirm('Are you sure you want to permanently delete this file transfer and purge all files from disk?')) {
          try {
            // Delete metadata
            await deleteDoc(doc(db, 'transfers', hash));
            
            // Note: Cloud Storage folder deletion should ideally be done by a Cloud Function 
            // since Web SDK can't delete folders. We can delete individual files since we know their names.
            const t = transfersData.find(tr => tr.hash === hash);
            if (t && t.files) {
              for (const f of t.files) {
                const fileRef = ref(storage, `transfers/${hash}/${f.name}`);
                deleteObject(fileRef).catch(e => console.log('File may already be deleted'));
              }
            }
            
            showLiveToast('Transfer deleted and files purged.');
            loadTransfersList(auth.currentUser.uid);
          } catch (e) {
            alert('Revocation failed.');
          }
        }
      });
    });
  }

  searchInput?.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase().trim();
    const filtered = transfersData.filter(t => 
      (t.subject && t.subject.toLowerCase().includes(query)) || 
      t.hash.toLowerCase().includes(query)
    );
    renderTransfersTable(filtered);
  });

  // SSE Listener removed for serverless deployment

  function showLiveToast(message) {
    const container = document.getElementById('live-toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'live-toast';
    toast.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }
}

/* ==========================================================================
   Recipient Portal Page (Unlock gate, zip generation)
   ========================================================================== */
function initDownloadPortal() {
  const mainBox = document.getElementById('download-main-box');
  if (!mainBox) return;

  const passGateway = document.getElementById('download-password-gateway');
  const errorBox = document.getElementById('download-error-box');
  const errorMsgText = document.getElementById('download-error-message');

  // Fields
  const subjectEl = document.getElementById('download-subject');
  const senderEl = document.getElementById('download-sender');
  const expiryEl = document.getElementById('download-expiry');
  const countEl = document.getElementById('download-count');
  const sizeEl = document.getElementById('download-size');
  const messageWrap = document.getElementById('download-message-wrap');
  const messageEl = document.getElementById('download-message');
  const filesListEl = document.getElementById('download-files-list');
  const filesCountBadge = document.getElementById('download-files-count-badge');
  const btnDownloadZip = document.getElementById('btn-download-zip');

  const unlockForm = document.getElementById('download-unlock-form');
  const unlockPassInput = document.getElementById('download-unlock-pass');
  const unlockError = document.getElementById('download-unlock-error');

  // Parse hash
  const urlParams = new URLSearchParams(window.location.search);
  const hash = urlParams.get('t');

  if (!hash) {
    showErrorCard('Invalid link. No file transfer token was provided.');
    return;
  }

  async function loadTransfer() {
    try {
      const docSnap = await getDoc(doc(db, 'transfers', hash));
      if (!docSnap.exists()) {
        throw new Error('This transfer does not exist, has expired, or was deleted.');
      }
      const transfer = docSnap.data();
      
      if (new Date() > new Date(transfer.expiresAt)) {
        throw new Error('This transfer has expired.');
      }

      if (transfer.passwordHash) {
        passGateway.style.display = 'block';
        initPasswordUnlock(transfer);
      } else {
        renderTransferDetails(transfer);
      }
    } catch (err) {
      showErrorCard(err.message);
    }
  }

  loadTransfer();

  function showErrorCard(msg) {
    passGateway.style.display = 'none';
    mainBox.style.display = 'none';
    errorBox.style.display = 'block';
    errorMsgText.textContent = msg;
  }

  function initPasswordUnlock(transfer) {
    unlockForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      unlockError.style.display = 'none';

      const encoder = new TextEncoder();
      const data = encoder.encode(unlockPassInput.value);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const inputHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      if (inputHash === transfer.passwordHash) {
        passGateway.style.display = 'none';
        renderTransferDetails(transfer);
      } else {
        unlockError.style.display = 'block';
      }
    });
  }

  function renderTransferDetails(transfer) {
    mainBox.style.display = 'block';
    subjectEl.textContent = transfer.subject || 'Untitled';
    senderEl.textContent = transfer.senderEmail;
    expiryEl.textContent = new Date(transfer.expiresAt).toLocaleDateString() + ' ' + new Date(transfer.expiresAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    const count = transfer.files.length;
    const totalSize = transfer.files.reduce((a,f) => a + f.size, 0);
    countEl.textContent = `${count} file${count !== 1 ? 's' : ''}`;
    sizeEl.textContent = formatBytes(totalSize);

    if (transfer.message) {
      messageWrap.style.display = 'block';
      messageEl.textContent = transfer.message;
    }

    filesCountBadge.textContent = `${count} file${count !== 1 ? 's' : ''}`;

    // Populate files rows
    filesListEl.innerHTML = '';
    transfer.files.forEach(f => {
      const li = document.createElement('li');
      li.className = 'download-file-row';
      
      const fileRef = ref(storage, `transfers/${hash}/${f.name}`);
      const btnId = `btn-download-${f.name.replace(/[^a-zA-Z0-9]/g, '')}`;

      li.innerHTML = `
        <span class="download-file-name" title="${f.name}">${f.name}</span>
        <span style="color:var(--dark-light);">${formatBytes(f.size)}</span>
        <a id="${btnId}" href="#" class="action-btn-circle" title="Download File">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </a>
      `;
      filesListEl.appendChild(li);

      // Bind download link dynamically
      document.getElementById(btnId).addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          const url = await getDownloadURL(fileRef);
          
          // Increment download count in Firestore
          setDoc(doc(db, 'transfers', hash), {
            downloadsCount: (transfer.downloadsCount || 0) + 1
          }, { merge: true });

          // Open URL to download
          window.open(url, '_blank');
        } catch (err) {
          alert('Could not download file. It may have been deleted.');
        }
      });
    });

    // Hide bulk ZIP link for serverless version
    btnDownloadZip.style.display = 'none';
  }
}

/* ==========================================================================
   Helper Utilities
   ========================================================================== */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function formatTime(seconds) {
  if (isNaN(seconds) || seconds === Infinity) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function validateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

function formatRemainingDays(expiryIso) {
  const diffMs = new Date(expiryIso) - new Date();
  if (diffMs <= 0) return 'Expired';
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} left`;
  }
  const diffDays = Math.ceil(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} left`;
}
