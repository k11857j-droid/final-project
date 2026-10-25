/* ==========================================================================
   CampusGo — verify-id.html page logic
   ========================================================================== */

(() => {
  if (!CampusGo.requireStep('verify-id')) return;

  const session = CampusGo.getSession();
  let uploadedFileName = null;
  let generatedOtp = '1234'; // simulated — in v2 this is emailed by the backend

  const panelEnterId = document.getElementById('panelEnterId');
  const panelOtp = document.getElementById('panelOtp');
  const panelSuccess = document.getElementById('panelSuccess');
  const rail = document.querySelector('.route-rail');
  const pin = document.querySelector('.route-pin');

  function showPanel(panel) {
    [panelEnterId, panelOtp, panelSuccess].forEach((p) => p.classList.remove('is-active'));
    panel.classList.add('is-active');
  }

  /* --- Upload box --- */
  const uploadBox = document.getElementById('uploadBox');
  const uploadInput = document.getElementById('uploadInput');
  const uploadLabel = document.getElementById('uploadLabel');

  uploadBox.addEventListener('click', () => uploadInput.click());
  uploadInput.addEventListener('change', () => {
    const file = uploadInput.files[0];
    if (file) {
      uploadedFileName = file.name;
      uploadBox.classList.add('has-file');
      uploadLabel.textContent = `✓ ${file.name}`;
    }
  });
  ['dragover', 'dragleave', 'drop'].forEach((evt) => {
    uploadBox.addEventListener(evt, (e) => e.preventDefault());
  });
  uploadBox.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files[0];
    if (file) {
      uploadedFileName = file.name;
      uploadBox.classList.add('has-file');
      uploadLabel.textContent = `✓ ${file.name}`;
    }
  });

  /* --- Send OTP --- */
  const collegeIdInput = document.getElementById('collegeId');
  const genderSelect = document.getElementById('genderSelect');
  const sendOtpBtn = document.getElementById('sendOtpBtn');

  sendOtpBtn.addEventListener('click', () => {
    let valid = true;
    if (!CampusGo.validators.collegeId(collegeIdInput.value)) {
      CampusGo.setFieldError(collegeIdInput, 'Enter a valid roll number (5\u201320 characters)');
      valid = false;
    } else CampusGo.setFieldError(collegeIdInput, '');

    if (!genderSelect.value) {
      CampusGo.setFieldError(genderSelect, 'Please select an option');
      valid = false;
    } else CampusGo.setFieldError(genderSelect, '');

    if (!uploadedFileName) {
      const uploadWrap = uploadBox.closest('.field');
      uploadWrap.querySelector('.field-error').innerHTML =
        '<i class="fa-solid fa-triangle-exclamation"></i> Please upload a photo of your ID';
      valid = false;
    } else {
      uploadBox.closest('.field').querySelector('.field-error').innerHTML = '';
    }

    if (!valid) return;

    sendOtpBtn.disabled = true;
    sendOtpBtn.innerHTML = '<span class="spinner"></span> Sending…';

    setTimeout(() => {
      sendOtpBtn.disabled = false;
      sendOtpBtn.innerHTML = '<span class="btn-label">Send OTP to my campus email</span>';
      document.getElementById('otpSentTo').textContent =
        `We've sent a 4-digit code to ${session?.email || 'your campus email'}.`;
      showPanel(panelOtp);
      document.querySelector('[data-otp="0"]').focus();
      CampusGo.toast('OTP sent — check your inbox (demo code: 1234)', 'info');
    }, 1000);
  });

  /* --- OTP boxes: auto-advance + verify --- */
  const otpBoxes = Array.from(document.querySelectorAll('.otp-box'));
  otpBoxes.forEach((box, i) => {
    box.addEventListener('input', () => {
      box.value = box.value.replace(/\D/g, '').slice(0, 1);
      if (box.value && otpBoxes[i + 1]) otpBoxes[i + 1].focus();
    });
    box.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !box.value && otpBoxes[i - 1]) otpBoxes[i - 1].focus();
    });
  });

  document.getElementById('resendOtp').addEventListener('click', () => {
    CampusGo.toast('New OTP sent (demo code: 1234)', 'info');
  });

  document.getElementById('verifyOtpBtn').addEventListener('click', () => {
    const entered = otpBoxes.map((b) => b.value).join('');
    const otpErr = document.getElementById('otpError');

    if (entered.length < 4) {
      otpErr.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Enter all 4 digits';
      return;
    }
    if (entered !== generatedOtp) {
      otpErr.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Incorrect code — try 1234 for this demo';
      otpBoxes.forEach((b) => { b.value = ''; });
      otpBoxes[0].focus();
      return;
    }
    otpErr.innerHTML = '';

    // Advance the route pin from step 2 to step 3
    rail.style.setProperty('--fill', '100%');
    pin.style.setProperty('--pin', '100%');
    document.querySelectorAll('.route-step')[1].classList.add('is-done');
    document.querySelectorAll('.route-step')[1].classList.remove('is-active');
    document.querySelectorAll('.route-step')[2].classList.add('is-active');

    CampusGo.patchOnboarding({
      idVerified: true,
      collegeId: collegeIdInput.value.trim(),
      gender: genderSelect.value,
    });

    document.getElementById('previewName').textContent = session?.name || 'Student';
    document.getElementById('previewId').textContent = `ID: ${collegeIdInput.value.trim()}`;

    setTimeout(() => showPanel(panelSuccess), 250);
  });

  document.getElementById('continueBtn').addEventListener('click', () => {
    window.location.href = 'setup-location.html';
  });
})();
