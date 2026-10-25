/* ==========================================================================
   CampusGo — setup-location.html page logic
   ========================================================================== */

(() => {
  if (!CampusGo.requireStep('setup-location')) return;

  const laneHostel = document.getElementById('laneHostel');
  const laneDay = document.getElementById('laneDay');
  const detailsHostel = document.getElementById('detailsHostel');
  const detailsDay = document.getElementById('detailsDay');
  const mapHint = document.getElementById('mapHint');
  const finishBtn = document.getElementById('finishSetupBtn');

  let currentLane = null;

  function selectLane(lane) {
    currentLane = lane;
    laneHostel.classList.toggle('is-selected', lane === 'hostel');
    laneDay.classList.toggle('is-selected', lane === 'day');
    detailsHostel.classList.toggle('is-active', lane === 'hostel');
    detailsDay.classList.toggle('is-active', lane === 'day');
    mapHint.style.display = 'flex';
    finishBtn.disabled = false;
  }

  laneHostel.addEventListener('click', () => selectLane('hostel'));
  laneDay.addEventListener('click', () => selectLane('day'));

  finishBtn.addEventListener('click', () => {
    let valid = true;

    if (currentLane === 'hostel') {
      const name = document.getElementById('hostelName');
      const floor = document.getElementById('hostelFloor');
      const room = document.getElementById('hostelRoom');

      if (!name.value) { CampusGo.setFieldError(name, 'Select your hostel'); valid = false; }
      else CampusGo.setFieldError(name, '');

      if (!CampusGo.validators.notEmpty(floor.value)) { CampusGo.setFieldError(floor, 'Enter your floor'); valid = false; }
      else CampusGo.setFieldError(floor, '');

      if (!CampusGo.validators.notEmpty(room.value)) { CampusGo.setFieldError(room, 'Enter your room number'); valid = false; }
      else CampusGo.setFieldError(room, '');

      if (!valid) return;

      CampusGo.patchOnboarding({
        lane: 'hostel',
        hostel: {
          name: name.value,
          floor: floor.value.trim(),
          room: room.value.trim(),
          notes: document.getElementById('hostelNotes').value.trim(),
        },
      });
    } else if (currentLane === 'day') {
      const block = document.getElementById('dayBlock');
      const floor = document.getElementById('dayFloor');
      const room = document.getElementById('dayRoom');

      if (!block.value) { CampusGo.setFieldError(block, 'Select your building'); valid = false; }
      else CampusGo.setFieldError(block, '');

      if (!CampusGo.validators.notEmpty(floor.value)) { CampusGo.setFieldError(floor, 'Enter your floor'); valid = false; }
      else CampusGo.setFieldError(floor, '');

      if (!CampusGo.validators.notEmpty(room.value)) { CampusGo.setFieldError(room, 'Enter your classroom/lab number'); valid = false; }
      else CampusGo.setFieldError(room, '');

      if (!valid) return;

      CampusGo.patchOnboarding({
        lane: 'dayscholar',
        dayscholar: {
          block: block.value,
          floor: floor.value.trim(),
          room: room.value.trim(),
          freePeriod: document.getElementById('dayFreePeriod').value,
        },
      });
    } else {
      return;
    }

    finishBtn.disabled = true;
    finishBtn.innerHTML = '<span class="spinner"></span> Setting things up…';

    setTimeout(() => {
      CampusGo.toast('You\u2019re all set — welcome to CampusGo!', 'success');
      setTimeout(() => { window.location.href = 'home.html'; }, 500);
    }, 900);
  });
})();
