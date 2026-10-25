
(() => {
  const form = document.getElementById('adminLoginForm');
  const roleRow = document.getElementById('roleSelectRow');
  let selectedRole = 'admin';

  roleRow.addEventListener('click', (e) => {
    const pill = e.target.closest('.role-pill');
    if (!pill) return;
    document.querySelectorAll('.role-pill').forEach((p) => p.classList.remove('is-selected'));
    pill.classList.add('is-selected');
    selectedRole = pill.dataset.role;
  });

  /* Password visibility toggle */
  document.querySelectorAll('[data-toggle-pw]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.togglePw);
      const showing = target.type === 'text';
      target.type = showing ? 'password' : 'text';
      btn.innerHTML = `<i class="fa-solid ${showing ? 'fa-eye' : 'fa-eye-slash'}"></i>`;
    });
  });

  function setLoading(btn, isLoading, label) {
    btn.disabled = isLoading;
    btn.innerHTML = isLoading
      ? `<span class="spinner"></span> Please wait…`
      : label;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('alEmail');
    const password = document.getElementById('alPassword');
    const staffId = document.getElementById('alStaffId');
    let valid = true;

    if (!CampusGo.validators.email(email.value)) {
      CampusGo.setFieldError(email, 'Enter a valid staff email address');
      valid = false;
    } else CampusGo.setFieldError(email, '');

    if (!CampusGo.validators.minLen(password.value, 6)) {
      CampusGo.setFieldError(password, 'Password must be at least 6 characters');
      valid = false;
    } else CampusGo.setFieldError(password, '');

    if (!CampusGo.validators.notEmpty(staffId.value)) {
      CampusGo.setFieldError(staffId, 'Enter your staff / employee ID');
      valid = false;
    } else CampusGo.setFieldError(staffId, '');

    if (!valid) return;

    const btn = document.getElementById('adminLoginBtn');
    setLoading(btn, true);

    // Simulated auth call — in v2 this hits a real backend
    setTimeout(() => {
      CampusGo.setSession({
        name: email.value.split('@')[0].replace(/[._]/g, ' '),
        email: email.value.trim(),
        role: selectedRole,
        staffId: staffId.value.trim(),
        signedInAt: Date.now(),
      });
      CampusGo.toast(`Signed in as ${selectedRole}`, 'success');
      setTimeout(() => { window.location.href = 'home.html'; }, 500);
    }, 900);
  });
})();
