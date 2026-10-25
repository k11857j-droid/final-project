/* ==========================================================================
   CampusGo — womens-essentials.html page logic
   Access to this page is gated by verified gender (set during college-ID
   verification), NOT guessed from the roll number itself — roll number
   formats vary too much between colleges to be a reliable signal.
   ========================================================================== */

(() => {
  if (!CampusGo.requireStep('home')) return; // must be signed in + onboarded

  const session = CampusGo.getSession();
  document.getElementById('navAvatar').textContent = (session?.name || 'S').trim()[0].toUpperCase();

  const weLocked = document.getElementById('weLocked');
  const weContent = document.getElementById('weContent');
  const onboarding = CampusGo.getOnboarding();

  if (!CampusGo.canAccessWomensEssentials()) {
    // Tailor the message: unverified vs. verified-but-not-eligible
    if (!onboarding.idVerified) {
      document.getElementById('lockedTitle').textContent = 'Verify your college ID first';
      document.getElementById('lockedMsg').textContent =
        'Women\u2019s Essentials unlocks once your college ID is verified.';
    } else {
      document.getElementById('lockedTitle').textContent = 'This is a private space';
      document.getElementById('lockedMsg').textContent =
        'Women\u2019s Essentials is a private ordering space reserved for verified women students.';
    }
    weLocked.style.display = 'flex';
    weContent.style.display = 'none';
    return;
  }

  weLocked.style.display = 'none';
  weContent.style.display = 'flex';

  /* ---------------- Demo product data ---------------- */
  const PRODUCTS = [
    { id: 'w1', name: 'Ultra-Thin Sanitary Pads (Pack of 20)', cat: 'period', price: 145,
      tags: 'Period Care · Regular flow', img: 'https://picsum.photos/seed/we-pads/400/260' },
    { id: 'w2', name: 'Organic Cotton Tampons (Pack of 16)', cat: 'period', price: 190,
      tags: 'Period Care · Applicator-free', img: 'https://picsum.photos/seed/we-tampons/400/260' },
    { id: 'w3', name: 'Reusable Menstrual Cup', cat: 'period', price: 399,
      tags: 'Period Care · Eco-friendly', img: 'https://picsum.photos/seed/we-cup/400/260' },
    { id: 'w4', name: 'Menstrual Cramp Relief Patches', cat: 'wellness', price: 120,
      tags: 'Wellness · Heat patch, 4-pack', img: 'https://picsum.photos/seed/we-patch/400/260' },
    { id: 'w5', name: 'pH-Balanced Intimate Wash', cat: 'hygiene', price: 175,
      tags: 'Hygiene · 150ml', img: 'https://picsum.photos/seed/we-wash/400/260' },
    { id: 'w6', name: 'Flushable Intimate Wipes', cat: 'hygiene', price: 99,
      tags: 'Hygiene · Pack of 30', img: 'https://picsum.photos/seed/we-wipes/400/260' },
    { id: 'w7', name: 'Personal Safety Alarm Keychain', cat: 'safety', price: 249,
      tags: 'Safety · 130dB siren', img: 'https://picsum.photos/seed/we-alarm/400/260' },
    { id: 'w8', name: 'Calming Herbal Tea (Cramp Relief)', cat: 'wellness', price: 160,
      tags: 'Wellness · 20 sachets', img: 'https://picsum.photos/seed/we-tea/400/260' },
  ];

  const grid = document.getElementById('weGrid');
  const resultCount = document.getElementById('weResultCount');
  let activeCat = 'all';

  function render() {
    const list = activeCat === 'all' ? PRODUCTS : PRODUCTS.filter((p) => p.cat === activeCat);
    resultCount.textContent = `${list.length} item${list.length === 1 ? '' : 's'}`;
    grid.innerHTML = list.map((p) => `
      <div class="r-card">
        <div class="we-cover" style="background-image:url('${p.img}');">
        </div>
        <div class="we-body">
          <div class="we-name">${p.name}</div>
          <div class="we-tags">${p.tags}</div>
          <div class="we-foot">
            <span class="we-price">₹${p.price}</span>
            <button class="we-add-btn" data-add="${p.id}">Add</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  document.getElementById('weCategoryScroll').addEventListener('click', (e) => {
    const chip = e.target.closest('.category-chip');
    if (!chip) return;
    document.querySelectorAll('#weCategoryScroll .category-chip').forEach((c) => c.classList.remove('is-active'));
    chip.classList.add('is-active');
    activeCat = chip.dataset.cat;
    render();
  });

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add]');
    if (!btn) return;
    const product = PRODUCTS.find((p) => p.id === btn.dataset.add);
    CampusGo.toast(`Added to cart — will ship as "Personal Care Order"`, 'success');
  });

  render();

  /* ---------------- Privacy toggles (persisted per-device) ---------------- */
  const TOGGLE_KEY = 'cg_we_privacy_prefs';
  const defaults = { discreet: true, hideHistory: true, silent: false, trustedContact: false };
  const prefs = CampusGo.getJSON(TOGGLE_KEY, defaults);

  const map = {
    toggleDiscreet: 'discreet',
    toggleHideHistory: 'hideHistory',
    toggleSilent: 'silent',
    toggleTrustedContact: 'trustedContact',
  };

  Object.entries(map).forEach(([elId, key]) => {
    const el = document.getElementById(elId);
    el.checked = Boolean(prefs[key]);
    el.addEventListener('change', () => {
      prefs[key] = el.checked;
      CampusGo.setJSON(TOGGLE_KEY, prefs);
      CampusGo.toast(el.checked ? 'Preference enabled' : 'Preference disabled', 'info', 1600);
    });
  });
})();
