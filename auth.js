/* ==========================================================================
   CampusGo — index.html (Sign in / Sign up) page logic
   ========================================================================== */

(() => {
  const tabSignin = document.getElementById('tabSignin');
  const tabSignup = document.getElementById('tabSignup');
  const signinPanel = document.getElementById('signinPanel');
  const signupPanel = document.getElementById('signupPanel');
  const glider = document.getElementById('tabGlider');

  function activateTab(which) {
    const isSignin = which === 'signin';
    tabSignin.classList.toggle('is-active', isSignin);
    tabSignup.classList.toggle('is-active', !isSignin);
    tabSignin.setAttribute('aria-selected', String(isSignin));
    tabSignup.setAttribute('aria-selected', String(!isSignin));
    signinPanel.classList.toggle('is-active', isSignin);
    signupPanel.classList.toggle('is-active', !isSignin);
    glider.style.transform = isSignin ? 'translateX(0)' : 'translateX(100%)';
  }

  tabSignin.addEventListener('click', () => activateTab('signin'));
  tabSignup.addEventListener('click', () => activateTab('signup'));

  /* Password visibility toggles */
  document.querySelectorAll('[data-toggle-pw]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.togglePw);
      const showing = target.type === 'text';
      target.type = showing ? 'password' : 'text';
      btn.innerHTML = `<i class="fa-solid ${showing ? 'fa-eye' : 'fa-eye-slash'}"></i>`;
    });
  });

  /* If a session already exists, skip straight to the right onboarding step */
  if (CampusGo.getSession()) {
    const onboarding = CampusGo.getOnboarding();
    if (!onboarding.idVerified) window.location.href = 'verify-id.html';
    else if (!onboarding.lane) window.location.href = 'setup-location.html';
    else window.location.href = 'home.html';
  }

  function setLoading(btn, isLoading, label) {
    btn.disabled = isLoading;
    btn.innerHTML = isLoading
      ? `<span class="spinner"></span> Please wait…`
      : label;
  }

  /* ---------------- SIGN IN ---------------- */
  signinPanel.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('siEmail');
    const password = document.getElementById('siPassword');
    let valid = true;

    if (!CampusGo.validators.email(email.value)) {
      CampusGo.setFieldError(email, 'Enter a valid email address');
      valid = false;
    } else CampusGo.setFieldError(email, '');

    if (!CampusGo.validators.minLen(password.value, 6)) {
      CampusGo.setFieldError(password, 'Password must be at least 6 characters');
      valid = false;
    } else CampusGo.setFieldError(password, '');

    if (!valid) return;

    const btn = document.getElementById('signinBtn');
    setLoading(btn, true);

    // Simulated auth call — in v2 this hits a real backend
    setTimeout(() => {
      CampusGo.setSession({
        name: email.value.split('@')[0].replace(/[._]/g, ' '),
        email: email.value.trim(),
        role: 'student',
        signedInAt: Date.now(),
      });
      CampusGo.toast('Signed in successfully', 'success');
      setTimeout(() => { window.location.href = 'verify-id.html'; }, 500);
    }, 900);
  });

  /* ---------------- SIGN UP ---------------- */
  signupPanel.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('suName');
    const role = document.getElementById('suRole');
    const email = document.getElementById('suEmail');
    const password = document.getElementById('suPassword');
    let valid = true;

    if (!CampusGo.validators.notEmpty(name.value)) {
      CampusGo.setFieldError(name, 'Enter your full name');
      valid = false;
    } else CampusGo.setFieldError(name, '');

    if (!CampusGo.validators.email(email.value)) {
      CampusGo.setFieldError(email, 'Enter a valid email address');
      valid = false;
    } else CampusGo.setFieldError(email, '');

    if (!CampusGo.validators.minLen(password.value, 8)) {
      CampusGo.setFieldError(password, 'Use at least 8 characters');
      valid = false;
    } else CampusGo.setFieldError(password, '');

    if (!valid) return;

    const btn = document.getElementById('signupBtn');
    setLoading(btn, true);

    setTimeout(() => {
      CampusGo.setSession({
        name: name.value.trim(),
        email: email.value.trim(),
        role: role.value,
        signedInAt: Date.now(),
      });
      CampusGo.toast('Account created — let\u2019s verify your college ID', 'success');

      // Delivery-partner and teacher signups skip the food-ordering onboarding
      setTimeout(() => {
        if (role.value === 'delivery') window.location.href = 'partner-apply.html';
        else window.location.href = 'verify-id.html';
      }, 500);
    }, 900);
  });
})();
