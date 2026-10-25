/* ==========================================================================
   CampusGo — Live order tracking (dummy data simulation)
   Moves the partner marker along the route SVG path, counts the ETA down,
   shrinks the remaining distance, and plays an arrival sequence once the
   partner reaches Hostel Block C.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const routePath = document.getElementById('routePath');
  const routeProgress = document.getElementById('routeProgressPath');
  const partnerMarker = document.getElementById('partnerMarker');
  const dropMarker = document.getElementById('dropMarker');
  const arrivedBanner = document.getElementById('arrivedBanner');

  const etaMinutesEl = document.getElementById('etaMinutes');
  const distanceLeftEl = document.getElementById('distanceLeft');
  const etaPillText = document.getElementById('etaPillText');
  const stat = document.querySelector('.stat-mini.is-ticking');
  const previewBtn = document.getElementById('previewArrivalBtn');

  if (!routePath || !partnerMarker) return;

  const pathLength = routePath.getTotalLength();
  routeProgress.style.strokeDasharray = String(pathLength);
  routeProgress.style.setProperty('--route-offset', String(pathLength));

  /* ---------------------------------------- */
  /* Dummy trip parameters                     */
  /* ---------------------------------------- */
  const TOTAL_SECONDS = 7 * 60;      // 7 minute dummy ETA
  const TOTAL_DISTANCE_M = 640;      // 640 m dummy distance
  let elapsed = 0;
  let arrived = false;

  function formatClock(totalSecs) {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  function updateStatusStep(progressRatio) {
    // Steps: 0 placed, 1 preparing (done already), 2 on the way, 3 arrived
    const rail = document.getElementById('statusRail');
    const steps = rail.querySelectorAll('.route-step');
    const line2 = document.getElementById('line2');

    // fill the "on the way" connector proportionally to progress
    line2.style.setProperty('--fill', `${Math.min(progressRatio * 100, 100)}%`);

    if (progressRatio >= 1 && !arrived) {
      arrived = true;
      steps[2].classList.remove('is-active');
      steps[2].classList.add('is-done');
      steps[2].querySelector('.route-node').innerHTML = '<i class="fa-solid fa-check" style="font-size:0.7rem;"></i>';
      steps[3].classList.add('is-active');
      setTimeout(() => {
        steps[3].classList.remove('is-active');
        steps[3].classList.add('is-done');
        steps[3].querySelector('.route-node').innerHTML = '<i class="fa-solid fa-check" style="font-size:0.7rem;"></i>';
        arrivedBanner.classList.add('is-shown');
        dropMarker.classList.remove('is-lit');
        partnerMarker.classList.remove('is-arriving');
        stat && stat.classList.remove('is-ticking');
        etaMinutesEl.textContent = '0:00';
        etaPillText.textContent = 'Arrived';
        distanceLeftEl.textContent = '0 m';
        if (window.CampusGo) CampusGo.toast('Your order has arrived at Hostel Block C', 'success');
        if (window.CampusGo) CampusGo.fireConfetti(50);
      }, 900);
    }
  }

  function tick() {
    if (arrived) return;
    elapsed += 1;
    const ratio = Math.min(elapsed / TOTAL_SECONDS, 1);

    // Move marker along the path
    const point = routePath.getPointAtLength(ratio * pathLength);
    partnerMarker.setAttribute('transform', `translate(${point.x},${point.y})`);

    // Draw the traveled portion of the route in primary color
    routeProgress.style.setProperty('--route-offset', String(pathLength - ratio * pathLength));

    // Update countdown + distance
    const remainingSecs = Math.max(TOTAL_SECONDS - elapsed, 0);
    const remainingDist = Math.max(Math.round(TOTAL_DISTANCE_M * (1 - ratio)), 0);
    etaMinutesEl.textContent = formatClock(remainingSecs);
    distanceLeftEl.textContent = `${remainingDist} m`;
    etaPillText.textContent = remainingSecs <= 60 ? 'Arriving now' : `${Math.ceil(remainingSecs / 60)} min away`;

    // Last stretch: switch to "arriving" state (faster pulse + bob)
    if (ratio > 0.85 && !partnerMarker.classList.contains('is-arriving')) {
      partnerMarker.classList.add('is-arriving');
      dropMarker.classList.add('is-lit');
    }

    updateStatusStep(ratio);

    if (ratio >= 1) return; // stop ticking once arrived
    requestAnimationFrame(() => {}); // no-op, keeps rAF warm on some browsers
  }

  const interval = setInterval(() => {
    tick();
    if (arrived) clearInterval(interval);
  }, 1000);

  // Kick off an initial frame immediately so the marker isn't stuck at 7:00
  tick();

  /* ---------------------------------------- */
  /* "Preview approach" — fast-forwards to the */
  /* final stretch and replays it on demand     */
  /* ---------------------------------------- */
  let fastInterval = null;

  function resetForReplay() {
    arrived = false;
    elapsed = 0; // start from the pickup point so the whole trip replays

    const rail = document.getElementById('statusRail');
    const steps = rail.querySelectorAll('.route-step');
    const line2 = document.getElementById('line2');

    steps[2].classList.add('is-active');
    steps[2].classList.remove('is-done');
    steps[2].querySelector('.route-node').innerHTML = '3';
    steps[3].classList.remove('is-active', 'is-done');
    steps[3].querySelector('.route-node').innerHTML = '4';
    line2.style.setProperty('--fill', '0%');

    arrivedBanner.classList.remove('is-shown');
    partnerMarker.classList.remove('is-arriving');
    dropMarker.classList.remove('is-lit');
    stat && stat.classList.add('is-ticking');
  }

  function playApproachPreview() {
    if (fastInterval) return; // already playing
    previewBtn.disabled = true;
    previewBtn.innerHTML = '<i class="fa-solid fa-motorcycle"></i> Approaching…';

    resetForReplay();
    tick(); // draw the fast-forwarded starting position immediately

    fastInterval = setInterval(() => {
      elapsed += 1; // advance one simulated second every 120ms — sped up
      const ratio = Math.min(elapsed / TOTAL_SECONDS, 1);

      const point = routePath.getPointAtLength(ratio * pathLength);
      partnerMarker.setAttribute('transform', `translate(${point.x},${point.y})`);
      routeProgress.style.setProperty('--route-offset', String(pathLength - ratio * pathLength));

      const remainingSecs = Math.max(TOTAL_SECONDS - elapsed, 0);
      const remainingDist = Math.max(Math.round(TOTAL_DISTANCE_M * (1 - ratio)), 0);
      etaMinutesEl.textContent = formatClock(remainingSecs);
      distanceLeftEl.textContent = `${remainingDist} m`;
      etaPillText.textContent = remainingSecs <= 60 ? 'Arriving now' : `${Math.ceil(remainingSecs / 60)} min away`;

      if (ratio > 0.85 && !partnerMarker.classList.contains('is-arriving')) {
        partnerMarker.classList.add('is-arriving');
        dropMarker.classList.add('is-lit');
      }

      updateStatusStep(ratio);

      if (ratio >= 1) {
        clearInterval(fastInterval);
        fastInterval = null;
        setTimeout(() => {
          previewBtn.disabled = false;
          previewBtn.innerHTML = '<i class="fa-solid fa-forward"></i> Replay approach';
        }, 1000);
      }
    }, 120);
  }

  previewBtn && previewBtn.addEventListener('click', playApproachPreview);
});
