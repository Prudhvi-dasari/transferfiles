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

  fetch('/api/auth/me')
    .then(res => {
      if (res.ok) return res.json();
      throw new Error('Not logged in');
    })
    .then(user => {
      // User is logged in
      navActions.innerHTML = `
        <a href="/dashboard.html" class="btn btn-outline" style="padding: 8px 20px; margin-right: 8px;">Dashboard (${user.username})</a>
        <button id="nav-logout-btn" class="btn btn-primary" style="padding: 8px 20px;">Log out</button>
      `;

      document.getElementById('nav-logout-btn')?.addEventListener('click', () => {
        fetch('/api/auth/logout', { method: 'POST' })
          .then(() => window.location.href = '/index.html');
      });
    })
    .catch(() => {
      // Not logged in, keep default login/signup buttons
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
  function startRealUpload() {
    transitionToProgress();

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });

    formData.append('activeTab', activeTab);
    formData.append('senderEmail', senderEmailInput.value || '');
    formData.append('recipientEmails', recipientEmails.join(','));
    formData.append('subject', document.getElementById('transfer-subject').value || '');
    formData.append('message', document.getElementById('transfer-message').value || '');
    formData.append('expiration', expirationSelect.value);
    formData.append('region', regionSelect.value);

    if (passwordToggle.checked && passwordInput.value) {
      formData.append('password', passwordInput.value);
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload', true);

    const strokeMax = 351.85;
    progressCircleFill.style.strokeDasharray = strokeMax;

    let uploadStartTime = Date.now();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const progressPercent = Math.min(Math.round((e.loaded / e.total) * 100), 100);
        
        const dashOffset = strokeMax - (progressPercent / 100) * strokeMax;
        progressCircleFill.style.strokeDashoffset = dashOffset;
        progressPercentageText.textContent = `${progressPercent}%`;
        progressLinearFill.style.width = `${progressPercent}%`;

        let fileAcc = 0;
        let currentFileIndex = 0;
        for (let i = 0; i < selectedFiles.length; i++) {
          fileAcc += selectedFiles[i].size;
          if (e.loaded <= fileAcc || i === selectedFiles.length - 1) {
            currentFileIndex = i;
            break;
          }
        }
        progressCurrentFile.textContent = `Uploading [${currentFileIndex + 1}/${selectedFiles.length}]: ${selectedFiles[currentFileIndex].name}`;

        progressUploadedSize.textContent = `${formatBytes(e.loaded)} / ${formatBytes(e.total)}`;

        const timeElapsed = (Date.now() - uploadStartTime) / 1000;
        if (timeElapsed > 0.1) {
          const currentSpeed = e.loaded / timeElapsed;
          progressSpeedText.textContent = `${(currentSpeed / (1024 * 1024)).toFixed(1)} MB/s`;

          const remainingBytes = e.total - e.loaded;
          const remainingSeconds = Math.ceil(remainingBytes / currentSpeed);
          progressTimeText.textContent = `Remaining: ${formatTime(remainingSeconds)}`;
        }
      }
    });

    xhr.onload = function() {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        finishUpload(response.hash);
      } else {
        try {
          const errRes = JSON.parse(xhr.responseText);
          alert(`Upload failed: ${errRes.error || 'Please check backend connection'}`);
        } catch (e) {
          alert('Upload failed. Please check backend connection.');
        }
        transitionToForm();
      }
    };

    xhr.onerror = function() {
      alert('Network error occurred during upload.');
      transitionToForm();
    };

    xhr.send(formData);
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
      const username = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value;
      const errorMsg = document.getElementById('login-error-msg');

      errorMsg.style.display = 'none';

      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Login failed');
      })
      .then(() => {
        window.location.href = '/dashboard.html';
      })
      .catch(() => {
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

      fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      })
      .then(res => {
        if (res.ok) return res.json();
        return res.json().then(data => { throw new Error(data.error || 'Register failed') });
      })
      .then(() => {
        window.location.href = '/dashboard.html';
      })
      .catch((err) => {
        errorMsg.textContent = err.message;
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

  // 1. Verify Auth and fetch info
  fetch('/api/auth/me')
    .then(res => {
      if (res.ok) return res.json();
      throw new Error('Unauthorized');
    })
    .then(user => {
      titleHeader.textContent = `Welcome back, ${user.username}!`;
      loadTransfersList();
      initSSEListener();
    })
    .catch(() => {
      window.location.href = '/login.html';
    });

  // Logout listener
  btnLogout?.addEventListener('click', () => {
    fetch('/api/auth/logout', { method: 'POST' })
      .then(() => window.location.href = '/index.html');
  });

  function loadTransfersList() {
    fetch('/api/user/transfers')
      .then(res => res.json())
      .then(data => {
        transfersData = data.transfers || [];
        renderTransfersTable(transfersData);
        calculateDashboardMetrics(transfersData);
      })
      .catch(err => {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 40px; color:var(--danger);">Error fetching transfers.</td></tr>`;
      });
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
        <td style="font-weight: 600;">${t.subject}</td>
        <td>${t.filesCount} file${t.filesCount > 1 ? 's' : ''}</td>
        <td>${formatBytes(t.totalSize)}</td>
        <td>${t.downloadsCount} times</td>
        <td>
          <span class="status-badge ${isExpired ? 'status-expired' : 'status-active'}">
            ${isExpired ? 'Expired' : formatRemainingDays(t.expiresAt)}
          </span>
        </td>
        <td>
          ${t.passwordProtected 
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

    // Wire buttons
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
      btn.addEventListener('click', () => {
        const hash = btn.getAttribute('data-hash');
        if (confirm('Are you sure you want to permanently delete this file transfer and purge all files from disk?')) {
          fetch(`/api/transfer/${hash}`, { method: 'DELETE' })
            .then(res => {
              if (res.ok) {
                loadTransfersList();
                showLiveToast('Transfer deleted and files purged.');
              } else {
                alert('Revocation failed.');
              }
            });
        }
      });
    });
  }

  // Search filter
  searchInput?.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase().trim();
    const filtered = transfersData.filter(t => 
      t.subject.toLowerCase().includes(query) || 
      t.hash.toLowerCase().includes(query)
    );
    renderTransfersTable(filtered);
  });

  // 2. Server-Sent Events Realtime streaming alerts
  function initSSEListener() {
    const logList = document.getElementById('realtime-log-list');
    const placeholder = document.getElementById('realtime-log-placeholder');

    const eventSource = new EventSource('/api/realtime/stream');

    eventSource.onmessage = function(event) {
      const data = JSON.parse(event.data);
      if (data.type === 'download') {
        if (placeholder) placeholder.style.display = 'none';

        // Add to live log feeds
        const li = document.createElement('li');
        li.className = 'realtime-log-item';
        li.innerHTML = `
          <span>Recipient downloaded <strong>${data.filename}</strong> (IP: ${data.ip}) from transfer <strong>"${data.subject}"</strong></span>
          <span class="realtime-log-time">${new Date(data.timestamp).toLocaleTimeString()}</span>
        `;
        logList.insertBefore(li, logList.firstChild);

        // Display a slide-in bottom toast alert
        showLiveToast(`Recipient downloaded "${data.filename}" just now!`);
        
        // Refresh the transfers dashboard metrics to increment downloads count dynamically
        loadTransfersList();
      }
    };

    eventSource.onerror = function() {
      console.log('SSE connection closed or re-connecting...');
    };
  }

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

  // Load Transfer Metadata
  fetch(`/api/transfer/${hash}`)
    .then(res => {
      if (res.ok) return res.json();
      if (res.status === 404) throw new Error('This transfer does not exist, has expired, or was deleted.');
      throw new Error('Connection error fetching transfer details.');
    })
    .then(transfer => {
      // Check if password lock active
      if (transfer.passwordRequired) {
        passGateway.style.display = 'block';
        initPasswordUnlock(transfer);
      } else {
        renderTransferDetails(transfer);
      }
    })
    .catch(err => {
      showErrorCard(err.message);
    });

  function showErrorCard(msg) {
    passGateway.style.display = 'none';
    mainBox.style.display = 'none';
    errorBox.style.display = 'block';
    errorMsgText.textContent = msg;
  }

  function initPasswordUnlock(transfer) {
    unlockForm.addEventListener('submit', (e) => {
      e.preventDefault();
      unlockError.style.display = 'none';

      fetch(`/api/transfer/${hash}/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: unlockPassInput.value })
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Incorrect password');
      })
      .then(data => {
        passGateway.style.display = 'none';
        // Merge verification payload into metadata
        transfer.files = data.files;
        renderTransferDetails(transfer);
      })
      .catch(() => {
        unlockError.style.display = 'block';
      });
    });
  }

  function renderTransferDetails(transfer) {
    mainBox.style.display = 'block';
    subjectEl.textContent = transfer.subject;
    senderEl.textContent = transfer.senderEmail;
    expiryEl.textContent = new Date(transfer.expiresAt).toLocaleDateString() + ' ' + new Date(transfer.expiresAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    const count = transfer.files.length;
    countEl.textContent = `${count} file${count > 1 ? 's' : ''}`;
    sizeEl.textContent = formatBytes(transfer.totalSize);

    if (transfer.message) {
      messageWrap.style.display = 'block';
      messageEl.textContent = transfer.message;
    }

    filesCountBadge.textContent = `${count} file${count > 1 ? 's' : ''}`;

    // Populate files rows
    filesListEl.innerHTML = '';
    transfer.files.forEach(f => {
      const li = document.createElement('li');
      li.className = 'download-file-row';
      li.innerHTML = `
        <span class="download-file-name" title="${f.name}">${f.name}</span>
        <span style="color:var(--dark-light);">${formatBytes(f.size)}</span>
        <a href="/api/transfer/${hash}/file/${f.index}" class="action-btn-circle" title="Download File">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </a>
      `;
      filesListEl.appendChild(li);
    });

    // Bulk ZIP link
    btnDownloadZip.addEventListener('click', () => {
      window.location.href = `/api/transfer/${hash}/zip`;
    });
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
