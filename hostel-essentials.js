/* ==========================================================================
   CampusGo — hostel-essentials.html page logic
   ========================================================================== */

(() => {
  if (!CampusGo.requireStep('home')) return; // must be signed in + onboarded

  const session = CampusGo.getSession();
  document.getElementById('navAvatar').textContent = (session?.name || 'S').trim()[0].toUpperCase();

  /* ---------------- Demo product data ---------------- */
  const PRODUCTS = [
    { id: 'h1', name: 'Toothpaste + Toothbrush Combo', cat: 'toiletries', price: 89,
      tags: 'Toiletries · Travel size', img: 'assets/hostel-essentials/toothpaste-toothbrush.jpg' },
    { id: 'h2', name: 'Shampoo Sachet Pack (6x)', cat: 'toiletries', price: 60,
      tags: 'Toiletries · Anti-dandruff', img: 'assets/hostel-essentials/shampoo-sachets.jpg' },
    { id: 'h3', name: 'Detergent Bar (2-pack)', cat: 'toiletries', price: 45,
      tags: 'Toiletries · Laundry', img: 'assets/hostel-essentials/detergent-bar.jpg' },
    { id: 'h4', name: 'A4 Ruled Notebook (200 pages)', cat: 'stationery', price: 65,
      tags: 'Stationery · Single-line', img: 'assets/hostel-essentials/notebook.jpg' },
    { id: 'h5', name: 'Gel Pen Set (5 pcs)', cat: 'stationery', price: 55,
      tags: 'Stationery · Blue & black', img: 'assets/hostel-essentials/gel-pens.jpg' },
    { id: 'h6', name: 'Bedsheet + Pillow Cover Set', cat: 'bedding', price: 349,
      tags: 'Bedding · Single bed', img: 'assets/hostel-essentials/bedsheet-pillow.jpg' },
    { id: 'h7', name: 'Warm Blanket (Single)', cat: 'bedding', price: 599,
      tags: 'Bedding · Fleece', img: 'assets/hostel-essentials/blanket.jpg' },
    { id: 'h8', name: 'Instant Noodles (Pack of 6)', cat: 'snacks', price: 84,
      tags: 'Snacks · Masala', img: 'assets/hostel-essentials/instant-noodles.jpg' },
    { id: 'h9', name: 'Assorted Biscuits Combo', cat: 'snacks', price: 110,
      tags: 'Snacks · 6 packs', img: 'assets/hostel-essentials/biscuits.jpg' },
    { id: 'h10', name: 'Extension Board (4-socket)', cat: 'electronics', price: 249,
      tags: 'Electronics · Surge protected', img: 'assets/hostel-essentials/extension-board.jpg' },
    { id: 'h11', name: 'USB Study Lamp', cat: 'electronics', price: 299,
      tags: 'Electronics · 3 brightness levels', img: 'assets/hostel-essentials/study-lamp.jpg' },
    { id: 'h12', name: 'Bucket + Mug Set', cat: 'toiletries', price: 199,
      tags: 'Toiletries · 16L bucket', img: 'assets/hostel-essentials/bucket-mug.jpg' },
  ];

  const grid = document.getElementById('heGrid');
  const resultCount = document.getElementById('heResultCount');
  let activeCat = 'all';

  function render() {
    const list = activeCat === 'all' ? PRODUCTS : PRODUCTS.filter((p) => p.cat === activeCat);
    resultCount.textContent = `${list.length} item${list.length === 1 ? '' : 's'}`;
    grid.innerHTML = list.map((p) => `
      <div class="r-card">
        <div class="he-cover">
          <img src="${p.img}" alt="${p.name}" loading="lazy">
        </div>
        <div class="he-body">
          <div class="he-name">${p.name}</div>
          <div class="he-tags">${p.tags}</div>
          <div class="he-foot">
            <span class="he-price">₹${p.price}</span>
            <button class="he-add-btn" data-add="${p.id}">Add</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  document.getElementById('heCategoryScroll').addEventListener('click', (e) => {
    const chip = e.target.closest('.category-chip');
    if (!chip) return;
    document.querySelectorAll('#heCategoryScroll .category-chip').forEach((c) => c.classList.remove('is-active'));
    chip.classList.add('is-active');
    activeCat = chip.dataset.cat;
    render();
  });

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add]');
    if (!btn) return;
    const product = PRODUCTS.find((p) => p.id === btn.dataset.add);
    CampusGo.toast(`${product.name} added to cart`, 'success');
  });

  render();
})();
