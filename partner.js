/* ==========================================================================
   CampusGo — partner-apply.html page logic
   ========================================================================== */

(() => {
  const session = CampusGo.getSession();
  if (!session) { window.location.href = 'index.html'; return; }

  // Prefill from session if available
  const nameInput = document.getElementById('apName');
  if (session.name) nameInput.value = session.name;

  let uploadedFileName = null;

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

  document.querySelectorAll('.slot-chip').forEach((chip) => {
    const box = chip.querySelector('input');
    box.addEventListener('change', () => chip.classList.toggle('is-checked', box.checked));
  });

  document.getElementById('submitApplyBtn').addEventListener('click', () => {
    let valid = true;

    const name = document.getElementById('apName');
    const collegeId = document.getElementById('apCollegeId');
    const phone = document.getElementById('apPhone');
    const declare = document.getElementById('apDeclare');
    const slots = Array.from(document.querySelectorAll('.slot-chip input:checked')).map((i) => i.value);

    if (!CampusGo.validators.notEmpty(name.value)) { CampusGo.setFieldError(name, 'Enter your full name'); valid = false; }
    else CampusGo.setFieldError(name, '');

    if (!CampusGo.validators.collegeId(collegeId.value)) { CampusGo.setFieldError(collegeId, 'Enter a valid college ID'); valid = false; }
    else CampusGo.setFieldError(collegeId, '');

    if (!CampusGo.validators.phone(phone.value)) { CampusGo.setFieldError(phone, 'Enter a valid 10-digit mobile number'); valid = false; }
    else CampusGo.setFieldError(phone, '');

    const slotError = document.getElementById('slotError');
    if (slots.length === 0) {
      slotError.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Select at least one available slot';
      valid = false;
    } else slotError.innerHTML = '';

    const uploadFieldError = uploadBox.closest('.field').querySelector('.field-error');
    if (!uploadedFileName) {
      uploadFieldError.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Please upload your ID photo';
      valid = false;
    } else uploadFieldError.innerHTML = '';

    const declareError = document.getElementById('declareError');
    if (!declare.checked) {
      declareError.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Please confirm this declaration to continue';
      valid = false;
    } else declareError.innerHTML = '';

    if (!valid) return;

    const btn = document.getElementById('submitApplyBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Submitting…';

    setTimeout(() => {
      CampusGo.setJSON(CampusGo.KEYS.PARTNER_APP, {
        name: name.value.trim(),
        collegeId: collegeId.value.trim(),
        phone: phone.value.trim(),
        slots,
        status: 'pending',
        submittedAt: Date.now(),
      });
      document.getElementById('panelForm').classList.remove('is-active');
      document.getElementById('panelSuccess').classList.add('is-active');
      CampusGo.toast('Application submitted successfully', 'success');
    }, 1000);
  });
})();
