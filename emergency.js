/* ==========================================================================
   CampusGo — emergency.html page logic
   ========================================================================== */

(() => {
  if (!CampusGo.requireStep('home')) return;

  const session = CampusGo.getSession();
  document.getElementById('navAvatar').textContent = (session?.name || 'S').trim()[0].toUpperCase();

  const PRODUCTS = [
    { id: 'e1', name: 'First Aid Kit (Compact)', cat: 'firstaid', price: 249,
      tags: 'First Aid · Bandages, gauze, tape', img: 'https://picsum.photos/seed/em-kit/400/260' },
    { id: 'e2', name: 'Antiseptic Spray', cat: 'firstaid', price: 85,
      tags: 'First Aid · 60ml', img: 'https://picsum.photos/seed/em-antiseptic/400/260' },
    { id: 'e3', name: 'Paracetamol Strip (500mg)', cat: 'fever', price: 25,
      tags: 'Fever & Pain · 10 tablets', img: 'https://picsum.photos/seed/em-para/400/260' },
    { id: 'e4', name: 'Digital Thermometer', cat: 'fever', price: 149,
      tags: 'Fever & Pain · 30-sec read', img: 'https://picsum.photos/seed/em-thermo/400/260' },
    { id: 'e5', name: 'ORS Rehydration Sachets (Pack of 5)', cat: 'hydration', price: 60,
      tags: 'Hydration · WHO formula', img: 'https://picsum.photos/seed/em-ors/400/260' },
    { id: 'e6', name: 'Electrolyte Drink Mix', cat: 'hydration', price: 45,
      tags: 'Hydration · Single serve', img: 'https://picsum.photos/seed/em-electro/400/260' },
    { id: 'e7', name: 'Cough Syrup', cat: 'respiratory', price: 95,
      tags: 'Cold & Respiratory · 100ml', img: 'https://picsum.photos/seed/em-cough/400/260' },
    { id: 'e8', name: 'Inhaler (Bronchodilator)', cat: 'respiratory', price: 210,
      tags: 'Cold & Respiratory · Rx recommended', img: 'https://picsum.photos/seed/em-inhaler/400/260' },
    { id: 'e9', name: 'Sterile Eye Drops', cat: 'eyecare', price: 70,
      tags: 'Eye & Wound Care · 10ml', img: 'https://picsum.photos/seed/em-eyedrops/400/260' },
    { id: 'e10', name: 'Adhesive Wound Dressing Pack', cat: 'eyecare', price: 55,
      tags: 'Eye & Wound Care · Assorted sizes', img: 'https://picsum.photos/seed/em-dressing/400/260' },
  ];

  const grid = document.getElementById('emGrid');
  const resultCount = document.getElementById('emResultCount');
  let activeCat = 'all';

  function render() {
    if (activeCat === 'womens') {
      grid.innerHTML = `
        <div class="card" style="padding:22px; grid-column:1/-1; display:flex; align-items:center; gap:16px; flex-wrap:wrap;">
          <i class="fa-solid fa-heart" style="font-size:1.4rem; color:var(--danger);"></i>
          <div style="flex:1; min-width:220px;">
            <strong style="display:block; margin-bottom:4px;">Women's Emergency Kit</strong>
            <span class="muted" style="font-size:0.85rem;">Discreetly packaged period care and safety essentials live in the private Women's Essentials section.</span>
          </div>
          <a href="womens-essentials.html" class="btn btn-primary">Open Women's Essentials</a>
        </div>`;
      resultCount.textContent = '';
      return;
    }
    const list = activeCat === 'all' ? PRODUCTS : PRODUCTS.filter((p) => p.cat === activeCat);
    resultCount.textContent = `${list.length} item${list.length === 1 ? '' : 's'}`;
    grid.innerHTML = list.map((p) => `
      <div class="r-card">
        <div class="em-cover" style="background-image:url('${p.img}');"></div>
        <div class="em-body">
          <div class="em-name">${p.name}</div>
          <div class="em-tags">${p.tags}</div>
          <div class="em-foot">
            <span class="em-price">₹${p.price}</span>
            <button class="em-add-btn" data-add="${p.id}">Add</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  document.getElementById('emCatGrid').addEventListener('click', (e) => {
    const card = e.target.closest('.em-cat-card');
    if (!card) return;
    document.querySelectorAll('.em-cat-card').forEach((c) => c.classList.remove('is-active'));
    if (card.dataset.cat === activeCat) {
      activeCat = 'all';
    } else {
      card.classList.add('is-active');
      activeCat = card.dataset.cat;
    }
    render();
  });

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add]');
    if (!btn) return;
    CampusGo.toast('Added — routed for fastest emergency delivery', 'success');
  });

  render();
})();
