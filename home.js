/* ==========================================================================
   CampusGo — home.html page logic
   ========================================================================== */

(() => {
  if (!CampusGo.requireStep('home')) return;

  const session = CampusGo.getSession();
  const onboarding = CampusGo.getOnboarding();

  /* ---------------- Personalize header ---------------- */
  document.getElementById('welcomeName').textContent =
    `Welcome back, ${(session?.name || 'Student').split(' ')[0]}!`;
  document.getElementById('navAvatar').textContent = (session?.name || 'S').trim()[0].toUpperCase();

  /* ---------------- Privacy gate: Women's Essentials ---------------- */
  if (!CampusGo.canAccessWomensEssentials()) {
    document.querySelectorAll('a[href="womens-essentials.html"]').forEach((link) => {
      link.classList.add('is-locked');
      link.setAttribute('aria-disabled', 'true');
      link.insertAdjacentHTML('beforeend', ' <i class="fa-solid fa-lock" style="font-size:0.7rem;"></i>');
      link.addEventListener('click', (e) => {
        e.preventDefault();
        CampusGo.toast('This is a private, women-only section', 'info');
      });
    });
  }

  const locationChip = document.getElementById('locationChip');
  if (onboarding.lane === 'hostel' && onboarding.hostel) {
    locationChip.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${onboarding.hostel.name} · Room ${onboarding.hostel.room}`;
  } else if (onboarding.lane === 'dayscholar' && onboarding.dayscholar) {
    locationChip.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${onboarding.dayscholar.block} · ${onboarding.dayscholar.room}`;
  }

  /* ---------------- Demo restaurant data ---------------- */
  const RESTAURANTS = [
    {
      id: 'r1', name: 'Hostel Tadka', tags: 'North Indian · Thali · Veg', cat: ['veg', 'healthy'],
      rating: 4.5, time: '18-22 min', veg: true, color: '#0F6E52',
      items: [
        { id: 'i1', name: 'Dal Makhani Thali', price: 110 },
        { id: 'i2', name: 'Paneer Butter Masala', price: 140 },
        { id: 'i3', name: 'Jeera Rice', price: 60 },
      ],
    },
    {
      id: 'r2', name: 'Grill & Chill', tags: 'Fast Food · Non-Veg · Rolls', cat: ['nonveg', 'fastfood'],
      rating: 4.3, time: '20-25 min', veg: false, color: '#D6483B',
      items: [
        { id: 'i4', name: 'Chicken Roll', price: 90 },
        { id: 'i5', name: 'Egg Burger', price: 80 },
        { id: 'i6', name: 'Peri Peri Fries', price: 70 },
      ],
    },
    {
      id: 'r3', name: 'The Daily Grind Cafe', tags: 'Cafe · Coffee · Sandwiches', cat: ['cafe', 'veg'],
      rating: 4.6, time: '12-16 min', veg: true, color: '#8A5A0F',
      items: [
        { id: 'i7', name: 'Cold Coffee', price: 90 },
        { id: 'i8', name: 'Veg Grilled Sandwich', price: 100 },
        { id: 'i9', name: 'Blueberry Muffin', price: 65 },
      ],
    },
    {
      id: 'r4', name: 'Campus Bakes', tags: 'Bakery · Desserts · Snacks', cat: ['bakery', 'veg'],
      rating: 4.4, time: '15-20 min', veg: true, color: '#C7841F',
      items: [
        { id: 'i10', name: 'Chocolate Brownie', price: 55 },
        { id: 'i11', name: 'Cheese Puff', price: 40 },
        { id: 'i12', name: 'Red Velvet Slice', price: 85 },
      ],
    },
    {
      id: 'r5', name: 'Green Bowl Co.', tags: 'Healthy · Salads · Bowls', cat: ['healthy', 'veg'],
      rating: 4.7, time: '18-22 min', veg: true, color: '#1E8E5A',
      items: [
        { id: 'i13', name: 'Quinoa Buddha Bowl', price: 160 },
        { id: 'i14', name: 'Greek Salad', price: 130 },
        { id: 'i15', name: 'Fresh Fruit Bowl', price: 90 },
      ],
    },
    {
      id: 'r6', name: 'Spice Route Express', tags: 'North Indian · Non-Veg · Biryani', cat: ['nonveg'],
      rating: 4.2, time: '25-30 min', veg: false, color: '#9C2F26',
      items: [
        { id: 'i16', name: 'Chicken Biryani', price: 170 },
        { id: 'i17', name: 'Mutton Curry', price: 210 },
        { id: 'i18', name: 'Raita', price: 30 },
      ],
    },
    {
      id: 'r7', name: 'Frappe Fix', tags: 'Cafe · Milkshakes · Waffles', cat: ['cafe'],
      rating: 4.5, time: '10-14 min', veg: true, color: '#2E6FBB',
      items: [
        { id: 'i19', name: 'Nutella Waffle', price: 120 },
        { id: 'i20', name: 'Oreo Milkshake', price: 100 },
        { id: 'i21', name: 'Iced Americano', price: 80 },
      ],
    },
    {
      id: 'r8', name: 'Zing Wok', tags: 'Fast Food · Chinese', cat: ['fastfood', 'nonveg'],
      rating: 4.1, time: '20-24 min', veg: false, color: '#0B5340',
      items: [
        { id: 'i22', name: 'Chicken Fried Rice', price: 130 },
        { id: 'i23', name: 'Veg Manchurian', price: 110 },
        { id: 'i24', name: 'Spring Rolls', price: 90 },
      ],
    },
  ];

  const grid = document.getElementById('restaurantGrid');
  let activeCategory = 'all';
  let searchTerm = '';
  const openMenus = new Set();

  function renderGrid() {
    const filtered = RESTAURANTS.filter((r) => {
      const matchesCat = activeCategory === 'all' || r.cat.includes(activeCategory);
      const matchesSearch = !searchTerm ||
        r.name.toLowerCase().includes(searchTerm) ||
        r.tags.toLowerCase().includes(searchTerm);
      return matchesCat && matchesSearch;
    });

    document.getElementById('resultCount').textContent = `${filtered.length} places`;

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;">
          <i class="fa-solid fa-utensils"></i>
          <p>No restaurants match that search — try a different category.</p>
        </div>`;
      return;
    }

    grid.innerHTML = filtered.map((r) => `
      <div class="r-card">
        <div class="r-cover" style="background:linear-gradient(135deg, ${r.color}, ${r.color}cc);">
          <span class="r-badge ${r.veg ? 'veg' : 'non-veg'}"><i class="fa-solid ${r.veg ? 'fa-leaf' : 'fa-drumstick-bite'}"></i> ${r.veg ? 'Veg' : 'Non-Veg'}</span>
          <button class="r-fav-btn" data-fav="${r.id}" aria-label="Add to favorites"><i class="fa-solid fa-heart"></i></button>
        </div>
        <div class="r-body">
          <div class="r-name">${r.name}</div>
          <div class="r-tags">${r.tags}</div>
          <div class="r-meta-row">
            <span class="r-rating"><i class="fa-solid fa-star"></i> ${r.rating}</span>
            <span class="r-time"><i class="fa-regular fa-clock"></i> ${r.time}</span>
          </div>
          <button class="btn btn-ghost btn-sm btn-block" data-toggle-menu="${r.id}" style="margin-top:6px;">
            View Menu <i class="fa-solid fa-chevron-down"></i>
          </button>
        </div>
        <div class="r-menu" id="menu-${r.id}">
          ${r.items.map((it) => `
            <div class="menu-item-row" data-item-row="${it.id}">
              <div class="menu-item-info">
                <strong>${it.name}</strong>
                <span>₹${it.price}</span>
              </div>
              <div class="qty-controls" data-qty-controls="${it.id}"></div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');

    // Restore open menu state after re-render
    openMenus.forEach((id) => {
      const menu = document.getElementById(`menu-${id}`);
      if (menu) menu.classList.add('is-open');
    });

    renderAllQtyControls();
  }

  /* ---------------- Category filter ---------------- */
  document.getElementById('categoryScroll').addEventListener('click', (e) => {
    const chip = e.target.closest('.category-chip');
    if (!chip) return;
    document.querySelectorAll('.category-chip').forEach((c) => c.classList.remove('is-active'));
    chip.classList.add('is-active');
    activeCategory = chip.dataset.cat;
    renderGrid();
  });

  /* ---------------- Search ---------------- */
  document.getElementById('searchInput').addEventListener('input', (e) => {
    searchTerm = e.target.value.trim().toLowerCase();
    renderGrid();
  });

  /* ---------------- Menu expand/collapse + add-to-cart (delegated) ---------------- */
  grid.addEventListener('click', (e) => {
    const toggleBtn = e.target.closest('[data-toggle-menu]');
    if (toggleBtn) {
      const id = toggleBtn.dataset.toggleMenu;
      const menu = document.getElementById(`menu-${id}`);
      const isOpen = menu.classList.toggle('is-open');
      if (isOpen) openMenus.add(id); else openMenus.delete(id);
      toggleBtn.innerHTML = isOpen
        ? 'Hide Menu <i class="fa-solid fa-chevron-up"></i>'
        : 'View Menu <i class="fa-solid fa-chevron-down"></i>';
      return;
    }
    const favBtn = e.target.closest('[data-fav]');
    if (favBtn) {
      favBtn.classList.toggle('is-active');
      CampusGo.toast(
        favBtn.classList.contains('is-active') ? 'Added to favorites' : 'Removed from favorites',
        'success', 1600
      );
    }
  });

  /* ---------------- Cart state ---------------- */
  function findItem(id) {
    for (const r of RESTAURANTS) {
      const item = r.items.find((it) => it.id === id);
      if (item) return { ...item, restaurant: r.name };
    }
    return null;
  }

  function getCart() { return CampusGo.getJSON(CampusGo.KEYS.CART, {}); }
  function setCart(cart) { CampusGo.setJSON(CampusGo.KEYS.CART, cart); }

  function changeQty(itemId, delta) {
    const cart = getCart();
    const current = cart[itemId] || 0;
    const next = Math.max(0, current + delta);
    if (next === 0) delete cart[itemId]; else cart[itemId] = next;
    setCart(cart);
    renderAllQtyControls();
    renderCartDrawer();
    updateCartFab();
  }

  function renderAllQtyControls() {
    const cart = getCart();
    document.querySelectorAll('[data-qty-controls]').forEach((el) => {
      const id = el.dataset.qtyControls;
      const qty = cart[id] || 0;
      el.innerHTML = qty === 0
        ? `<button class="add-btn" data-add="${id}">Add</button>`
        : `<div class="qty-stepper">
             <button data-dec="${id}">−</button>
             <span>${qty}</span>
             <button data-inc="${id}">+</button>
           </div>`;
    });
  }

  grid.addEventListener('click', (e) => {
    const add = e.target.closest('[data-add]');
    const inc = e.target.closest('[data-inc]');
    const dec = e.target.closest('[data-dec]');
    if (add) changeQty(add.dataset.add, 1);
    if (inc) changeQty(inc.dataset.inc, 1);
    if (dec) changeQty(dec.dataset.dec, -1);
  });

  function cartTotals() {
    const cart = getCart();
    let count = 0, subtotal = 0;
    Object.entries(cart).forEach(([id, qty]) => {
      const item = findItem(id);
      if (!item) return;
      count += qty;
      subtotal += item.price * qty;
    });
    const deliveryFee = count > 0 ? 15 : 0;
    return { count, subtotal, deliveryFee, total: subtotal + deliveryFee };
  }

  function updateCartFab() {
    const { count, total } = cartTotals();
    const fab = document.getElementById('cartFab');
    document.getElementById('cartFabCount').textContent = `${count} item${count === 1 ? '' : 's'}`;
    document.getElementById('cartFabTotal').textContent = `₹${total}`;
    fab.classList.toggle('is-visible', count > 0);
  }

  function renderCartDrawer() {
    const cart = getCart();
    const body = document.getElementById('cartBody');
    const entries = Object.entries(cart);

    if (entries.length === 0) {
      body.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-bag-shopping"></i>
          <p>Your cart is empty. Add something tasty from the menu!</p>
        </div>`;
    } else {
      body.innerHTML = entries.map(([id, qty]) => {
        const item = findItem(id);
        if (!item) return '';
        return `
          <div class="cart-line">
            <div class="cart-line-info">
              <strong>${item.name}</strong>
              <span>${item.restaurant} · ₹${item.price} each</span>
            </div>
            <div class="qty-stepper">
              <button data-dec="${id}">−</button>
              <span>${qty}</span>
              <button data-inc="${id}">+</button>
            </div>
          </div>`;
      }).join('');
    }

    const { subtotal, deliveryFee, total } = cartTotals();
    document.getElementById('cartSubtotal').textContent = `₹${subtotal}`;
    document.getElementById('cartDeliveryFee').textContent = deliveryFee > 0 ? `₹${deliveryFee}` : '₹0';
    document.getElementById('cartTotal').textContent = `₹${total}`;
  }

  document.getElementById('cartBody').addEventListener('click', (e) => {
    const inc = e.target.closest('[data-inc]');
    const dec = e.target.closest('[data-dec]');
    if (inc) changeQty(inc.dataset.inc, 1);
    if (dec) changeQty(dec.dataset.dec, -1);
  });

  /* ---------------- Cart drawer open/close ---------------- */
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');

  function openCart() {
    renderCartDrawer();
    cartDrawer.classList.add('is-open');
    cartOverlay.classList.add('is-open');
  }
  function closeCart() {
    cartDrawer.classList.remove('is-open');
    cartOverlay.classList.remove('is-open');
  }

  document.getElementById('cartFab').addEventListener('click', openCart);
  document.getElementById('closeCart').addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  document.getElementById('checkoutBtn').addEventListener('click', () => {
    const { count } = cartTotals();
    if (count === 0) {
      CampusGo.toast('Your cart is empty', 'error');
      return;
    }
    CampusGo.toast('Checkout page coming in the next build \u2014 cart is saved!', 'info');
  });

  /* ---------------- Init ---------------- */
  renderGrid();
  updateCartFab();
})();
