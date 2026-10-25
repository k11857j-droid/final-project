/* ==========================================================================
   data.js — fake backend (async API) + order-status logic
   Every API function returns a Promise and takes time, like a real fetch(),
   so the React UI has to handle loading and error states properly.
   ========================================================================== */
(function () {
  const CG = (window.CG = window.CG || {});
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  const RAW = [
    { id: 'r1', name: 'Bev Cafe', tags: 'Cafe · Snacks · Drinks', cat: ['cafe'], rating: 4.5, time: '18-22 min', veg: true, color: '#0F6E52', image: 'assets/outlets/bev-cafe.jpg',
      items: [{ id: 'i1', name: 'Haldiram Takatak', price: 25 }, { id: 'i2', name: 'Fun Flip Puff', price: 30 }, { id: 'i3', name: 'Mazza', price: 40 }] },
    { id: 'r2', name: 'Speedy Chow', tags: 'Chinese · Fast Food · Veg', cat: ['veg', 'fastfood'], rating: 4.5, time: '20-25 min', veg: true, color: '#D6483B', image: 'assets/outlets/speedy-chow.jpg',
      items: [{ id: 'i4', name: 'Veg Manchurian Dry', price: 189.52 }, { id: 'i5', name: 'Shanghai Veg Spring Roll', price: 133.33 }, { id: 'i6', name: 'Veg Manchurian Fried Rice', price: 284 }] },
    { id: 'r3', name: 'House of Kulcha', tags: 'North Indian · Kulcha', cat: ['veg'], rating: 4.6, time: '12-16 min', veg: true, color: '#8A5A0F', image: 'assets/outlets/house-of-kulcha.jpg',
      items: [{ id: 'i7', name: 'Aloo Kulcha', price: 130 }, { id: 'i8', name: 'Gobhi Matar Kulcha', price: 170 }, { id: 'i9', name: 'Aloo Chur Chur Kulcha', price: 160 }] },
    { id: 'r4', name: 'Golzza', tags: 'Indian Snacks · Chaat', cat: ['veg', 'fastfood'], rating: 4.6, time: '15-20 min', veg: true, color: '#C7841F', image: 'assets/outlets/golzza.jpg',
      items: [{ id: 'i10', name: 'Chaat Platter', price: 149 }, { id: 'i11', name: 'Tikki Chaat', price: 89 }, { id: 'i12', name: 'Palak Patta Chaat', price: 99 }] },
    { id: 'r5', name: 'Blue Tokai', tags: 'Coffee · Sandwiches', cat: ['cafe'], rating: 4.7, time: '18-22 min', veg: true, color: '#1E8E5A', image: 'assets/outlets/blue-tokai.jpg',
      items: [{ id: 'i13', name: 'Latte', price: 99 }, { id: 'i14', name: 'Cascara & Hibiscus', price: 122 }, { id: 'i15', name: 'Tomato Stracciatella Sandwich', price: 370 }] },
    { id: 'r6', name: 'South Circle', tags: 'South Indian · Vegetarian', cat: ['veg'], rating: 4.2, time: '25-30 min', veg: true, color: '#9C2F26', image: 'assets/outlets/south-circle.jpg',
      items: [{ id: 'i16', name: 'Idly with Chutney', price: 75.24 }, { id: 'i17', name: 'Masala Dosa', price: 103.81 }, { id: 'i18', name: 'Mix Veg Uttapam', price: 151.43 }] },
    { id: 'r7', name: 'Basil', tags: 'Cafe · Waffles · Drinks', cat: ['cafe'], rating: 4.5, time: '10-14 min', veg: true, color: '#2E6FBB', image: 'assets/outlets/basil.jpg',
      items: [{ id: 'i19', name: 'Nutella Waffle', price: 120 }, { id: 'i20', name: 'Oreo Milkshake', price: 100 }, { id: 'i21', name: 'Iced Americano', price: 80 }] },
    { id: 'r8', name: 'The Cakerie', tags: 'Cakes · Desserts', cat: ['bakery', 'veg'], rating: 4.1, time: '20-24 min', veg: true, color: '#0B5340', image: 'assets/outlets/the-cakerie.jpg',
      items: [{ id: 'i22', name: 'Biscoff Cake Half Kg', price: 560 }, { id: 'i23', name: 'Chocolate Praline One Kg', price: 1046.67 }, { id: 'i24', name: 'Red Velvet Half Kg', price: 503.81 }] },
    { id: 'r9', name: 'Panjaab 13', tags: 'North Indian · Punjabi', cat: ['veg'], rating: 4.1, time: '20-24 min', veg: true, color: '#0B5340', image: 'assets/outlets/panjaab-13.jpg',
      items: [{ id: 'i25', name: 'Gravy with 2 Butter Naan', price: 132.38 }, { id: 'i26', name: 'Paneer Tikka Makhani', price: 122.86 }, { id: 'i27', name: 'Rajma Masala (200 g)', price: 79 }] },
    { id: 'r10', name: 'Dohful', tags: 'Cookies · Cafe', cat: ['bakery', 'cafe', 'veg'], rating: 4.1, time: '20-24 min', veg: true, color: '#0B5340', image: 'assets/outlets/dohful.jpg',
      items: [{ id: 'i28', name: 'Choco Brownie Cookie', price: 75 }, { id: 'i29', name: 'Cappuccino', price: 100 }, { id: 'i30', name: 'Hot Chocolate', price: 180 }] },
    { id: 'r11', name: 'The Healthy Wave', tags: 'Healthy Food · Salads · Bowls', cat: ['healthy', 'veg'], rating: 4.1, time: '20-24 min', veg: true, color: '#0B5340', image: 'assets/outlets/healthy-wave.jpg',
      items: [{ id: 'i31', name: 'Toasted Paneer Salad', price: 144 }, { id: 'i32', name: 'Rice Bowl', price: 144 }, { id: 'i33', name: 'Aloo Tikki Wrap', price: 99 }] },
    { id: 'r12', name: 'China Box', tags: 'Chinese · Fast Food', cat: ['fastfood'], rating: 4.1, time: '20-24 min', veg: false, color: '#0B5340', image: 'assets/outlets/china-box.jpg',
      items: [{ id: 'i34', name: 'Chicken Fried Rice', price: 130 }, { id: 'i35', name: 'White Sauce Pasta', price: 150 }, { id: 'i36', name: 'Spring Rolls', price: 90 }] },
  ];

  // Items the kitchen has run out of -> drives the "Sold out" state
  const SOLD_OUT = new Set(['i6', 'i12', 'i17', 'i21']);
  const RESTAURANTS = RAW.map((r) => ({ ...r, items: r.items.map((it) => ({ ...it, available: !SOLD_OUT.has(it.id) })) }));

  async function fetchRestaurants({ simulateFailure = false } = {}) {
    await delay(900);
    if (simulateFailure) throw new Error('Network error: could not load restaurants.');
    return RESTAURANTS;
  }
  async function fetchRestaurant(id) {
    await delay(600);
    const found = RESTAURANTS.find((r) => r.id === id);
    if (!found) throw new Error('Restaurant not found.');
    return found;
  }
  async function placeOrderRequest() {
    await delay(1100);
    return { orderId: 'CG-' + Math.floor(10000 + Math.random() * 90000) };
  }

  /* Order status is DERIVED from time since the order was placed (not stored),
     so it keeps progressing after a refresh. DEMO_SPEED: 1 real minute = 12 simulated minutes. */
  const DEMO_SPEED = 12;
  const PREP_MINUTES = 12;
  const TOTAL_MINUTES = 20;
  const STAGES = [
    { key: 'placed',    short: 'Placed',    label: 'Order placed',               at: 0 },
    { key: 'accepted',  short: 'Accepted',  label: 'Accepted by the restaurant', at: 1 },
    { key: 'preparing', short: 'Preparing', label: 'Being prepared',             at: 3 },
    { key: 'ready',     short: 'Ready',     label: 'Ready for pickup',           at: 12 },
    { key: 'delivered', short: 'Delivered', label: 'Delivered',                  at: 20 },
  ];
  function getOrderProgress(order, now) {
    const simMin = Math.max(0, ((now - order.placedAt) / 60000) * DEMO_SPEED);
    let stageIndex = 0;
    STAGES.forEach((s, i) => { if (simMin >= s.at) stageIndex = i; });
    // delivery leg: partner picks up at minute 12 (Ready) and arrives at minute 20 -> 0..1
    const deliveryProgress = Math.min(1, Math.max(0, (simMin - PREP_MINUTES) / (TOTAL_MINUTES - PREP_MINUTES)));
    return {
      stageIndex, stage: STAGES[stageIndex], delivered: stageIndex === STAGES.length - 1,
      deliveryProgress, minutesLeft: Math.max(0, Math.ceil(TOTAL_MINUTES - simMin)),
    };
  }

  const PAYMENT_METHODS = [['upi', 'UPI'], ['cod', 'Cash on delivery'], ['wallet', 'CampusGo wallet']];

  CG.api = { fetchRestaurants, fetchRestaurant, placeOrderRequest };
  const TOTAL_DISTANCE_M = 640;   // dummy food-court -> hostel distance
  const PARTNER = { name: 'Rohit Mehta', initials: 'RM', rating: 4.8, vehicle: 'Splendor+', plate: 'PB65 CG 4471' };
  CG.orders = { STAGES, PREP_MINUTES, DEMO_SPEED, TOTAL_DISTANCE_M, PARTNER, getOrderProgress };
  CG.PAYMENT_METHODS = PAYMENT_METHODS;
})();
