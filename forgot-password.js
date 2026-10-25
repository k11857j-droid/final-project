/* ==========================================================================
   CampusGo — forgot-password.html page logic
   4-step simulated flow: email -> OTP -> new password -> success
   ========================================================================== */

(() => {
  const steps = {
    email: document.getElementById('fpStepEmail'),
    otp: document.getElementById('fpStepOtp'),
    reset: document.getElementById('fpStepReset'),
    done: document.getElementById('fpStepDone'),
  };
  const backDivider = document.getElementById('fpBackDivider');
  const backLink = document.getElementById('fpBackLink');

  function goTo(step) {
    Object.values(steps).forEach((el) => el.classList.remove('is-active'));
    steps[step].classList.add('is-active');
    // Hide the "back to sign in" footer on the final success screen (it has its own CTA)
    const hideFooter = step === 'done';
    backDivider.style.display = hideFooter ? 'none' : '';
    backLink.style.display = hideFooter ? 'none' : '';
  }

  function setLoading(btn, isLoading, label) {
    btn.disabled = isLoading;
    btn.innerHTML = isLoading
      ? `<span class="spinner"></span> Please wait…`
      : label;
  }

  /* ---------------- Password visibility toggles ---------------- */
  document.querySelectorAll('[data-toggle-pw]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.togglePw);
      const showing = target.type === 'text';
      target.type = showing ? 'password' : 'text';
      btn.innerHTML = `<i class="fa-solid ${showing ? 'fa-eye' : 'fa-eye-slash'}"></i>`;
    });
  });

  /* ---------------- STEP 1: request code ---------------- */
  const emailForm = document.getElementById('fpEmailForm');
  const emailInput = document.getElementById('fpEmail');
  emailForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!CampusGo.validators.email(emailInput.value)) {
      CampusGo.setFieldError(emailInput, 'Enter a valid email address');
      return;
    }
    CampusGo.setFieldError(emailInput, '');

    const btn = document.getElementById('fpSendBtn');
    setLoading(btn, true);
    setTimeout(() => {
      setLoading(btn, false, '<span class="btn-label">Send Reset Code</span>');
      document.getElementById('fpEmailDisplay').textContent = emailInput.value.trim();
      CampusGo.toast('Reset code sent to your email', 'success');
      goTo('otp');
      document.querySelector('.otp-digit')?.focus();
    }, 900);
  });

  /* ---------------- STEP 2: OTP entry ---------------- */
  const otpForm = document.getElementById('fpOtpForm');
  const otpDigits = Array.from(document.querySelectorAll('.otp-digit'));
  const otpError = document.getElementById('otpError');

  otpDigits.forEach((input, i) => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/[^0-9]/g, '');
      if (input.value && i < otpDigits.length - 1) otpDigits[i + 1].focus();
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && i > 0) otpDigits[i - 1].focus();
    });
  });

  otpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = otpDigits.map((d) => d.value).join('');
    if (code.length !== 6) {
      otpError.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Enter all 6 digits';
      return;
    }
    otpError.innerHTML = '';

    const btn = document.getElementById('fpVerifyBtn');
    setLoading(btn, true);
    setTimeout(() => {
      setLoading(btn, false, '<span class="btn-label">Verify Code</span>');
      CampusGo.toast('Code verified', 'success');
      goTo('reset');
    }, 800);
  });

  document.getElementById('fpResendLink').addEventListener('click', (e) => {
    e.preventDefault();
    otpDigits.forEach((d) => { d.value = ''; });
    otpDigits[0].focus();
    CampusGo.toast('A new code has been sent', 'info');
  });

  /* ---------------- STEP 3: set new password ---------------- */
  const resetForm = document.getElementById('fpResetForm');
  resetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const pw = document.getElementById('fpNewPassword');
    const confirm = document.getElementById('fpConfirmPassword');
    let valid = true;

    if (!CampusGo.validators.minLen(pw.value, 8)) {
      CampusGo.setFieldError(pw, 'Use at least 8 characters');
      valid = false;
    } else CampusGo.setFieldError(pw, '');

    if (confirm.value !== pw.value || !confirm.value) {
      CampusGo.setFieldError(confirm, 'Passwords do not match');
      valid = false;
    } else CampusGo.setFieldError(confirm, '');

    if (!valid) return;

    const btn = document.getElementById('fpResetBtn');
    setLoading(btn, true);
    setTimeout(() => {
      CampusGo.toast('Password updated successfully', 'success');
      goTo('done');
    }, 900);
  });

  goTo('email');
})();
