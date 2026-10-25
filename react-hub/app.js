/* ==========================================================================
   app.js — the PAGES (restaurants, restaurant menu, my orders, order tracking)
   and the app entry point that mounts React into <div id="root">.
   ========================================================================== */
(function () {
  const CG = (window.CG = window.CG || {});
  const html = htm.bind(React.createElement);
  const { useState, useMemo, useEffect, useRef, Fragment } = React;
  const S = CG.state;
  const { FormField, LoadingBlock, ErrorBlock, QtyControl, RestaurantCard, Navbar, CartFab, CartDrawer, OrderStepper, DeliveryMap, PartnerCard } = CG.ui;

  const CATEGORIES = [
    ['all', 'fa-border-all', 'All'], ['veg', 'fa-leaf', 'Veg'], ['nonveg', 'fa-drumstick-bite', 'Non-Veg'],
    ['cafe', 'fa-mug-saucer', 'Cafe'], ['bakery', 'fa-bread-slice', 'Bakery'],
    ['healthy', 'fa-carrot', 'Healthy'], ['fastfood', 'fa-burger', 'Fast Food'],
  ];

  function RestaurantsPage() {
    const { user } = S.useAuth();
    // LOCAL state: UI-only concerns of this page
    const [category, setCategory] = useState('all');
    const [search, setSearch] = useState('');
    const [budget, setBudget] = useState('0');
    const [simulateFailure, setSimulateFailure] = useState(false);

    // ASYNC state: data / loading / error from one hook
    const { data: restaurants, loading, error, reload } =
      S.useAsync(() => CG.api.fetchRestaurants({ simulateFailure }), [simulateFailure]);

    // DERIVED state: computed during render, never stored
    const visible = useMemo(() => {
      const q = search.trim().toLowerCase();
      const max = Number(budget);
      return (restaurants || []).filter((r) =>
        (category === 'all' || r.cat.includes(category)) &&
        (!max || r.items.some((i) => i.available && i.price <= max)) &&
        (!q || r.name.toLowerCase().includes(q) || r.tags.toLowerCase().includes(q) || r.items.some((i) => i.name.toLowerCase().includes(q))));
    }, [restaurants, category, search, budget]);

    return html`
      <${Fragment}>
        <section className="welcome-band">
          <div style=${{ position: 'relative', zIndex: 1 }}>
            <p className="eyebrow" style=${{ color: 'var(--accent)', marginBottom: 4 }}>Order from campus restaurants</p>
            <h1 style=${{ fontSize: '1.7rem' }}>Hi ${(user.name || 'Student').split(' ')[0]}, what are you craving?</h1>
          </div>
        </section>

        <label className="dev-strip">
          <input type="checkbox" checked=${simulateFailure} onChange=${(e) => setSimulateFailure(e.target.checked)} />
          Simulate network failure (demo of the error state)
        </label>

        <div className="category-scroll">
          ${CATEGORIES.map(([key, icon, label]) => html`
            <button key=${key} className=${'category-chip' + (category === key ? ' is-active' : '')} onClick=${() => setCategory(key)}>
              <i className=${'fa-solid ' + icon}></i>${label}
            </button>`)}
        </div>

        <div className="filter-row">
          <div className="search-row" style=${{ flex: 1, minWidth: 220 }}>
            <i className="fa-solid fa-magnifying-glass"></i>
            <input className="input" placeholder="Search restaurants, dishes, cuisines…" value=${search} onChange=${(e) => setSearch(e.target.value)} />
          </div>
          <${FormField} as="select" label="Budget" name="budget" value=${budget} onChange=${(e) => setBudget(e.target.value)}>
            <option value="0">Any price</option>
            <option value="60">Items under ₹60</option>
            <option value="100">Items under ₹100</option>
            <option value="150">Items under ₹150</option>
          <//>
        </div>

        ${loading && html`<${LoadingBlock} label="Loading restaurants…" />`}
        ${error && html`<${ErrorBlock} message=${error} onRetry=${reload} />`}
        ${!loading && !error && (visible.length === 0
          ? html`<div className="empty-state"><i className="fa-solid fa-utensils"></i><p>No restaurants match your filters.</p></div>`
          : html`<div className="grid-restaurants">${visible.map((r) => html`<${RestaurantCard} key=${r.id} restaurant=${r} />`)}</div>`)}
      <//>`;
  }

  function RestaurantPage({ id }) {
    const { data: r, loading, error, reload } = S.useAsync(() => CG.api.fetchRestaurant(id), [id]);
    const [maxPrice, setMaxPrice] = useState('0');
    const [hideSoldOut, setHideSoldOut] = useState(false);
    const back = html`<a href="#/restaurants" className="back-link"><i className="fa-solid fa-arrow-left"></i> All restaurants</a>`;

    if (loading) return html`<${LoadingBlock} label="Loading menu…" />`;
    if (error) return html`<${Fragment}>${back}<${ErrorBlock} message=${error} onRetry=${reload} /><//>`;

    const max = Number(maxPrice);
    const items = r.items.filter((i) => (!max || i.price <= max) && (!hideSoldOut || i.available));

    return html`
      <${Fragment}>
        ${back}
        <section className="welcome-band" style=${{ background: `linear-gradient(135deg, ${r.color}, ${r.color}cc)` }}>
          <div style=${{ position: 'relative', zIndex: 1 }}>
            <h1 style=${{ fontSize: '1.7rem' }}>${r.name}</h1>
            <p style=${{ opacity: 0.9, marginTop: 4 }}>${r.tags}</p>
            <p style=${{ marginTop: 10, fontSize: '0.88rem' }}>
              <i className="fa-solid fa-star"></i> ${r.rating} · <i className="fa-regular fa-clock"></i> ${r.time} · ${r.veg ? 'Pure veg' : 'Veg & non-veg'}
            </p>
          </div>
        </section>

        <div className="filter-row">
          <${FormField} as="select" label="Price" name="maxPrice" value=${maxPrice} onChange=${(e) => setMaxPrice(e.target.value)}>
            <option value="0">Any price</option>
            <option value="60">Under ₹60</option>
            <option value="100">Under ₹100</option>
            <option value="150">Under ₹150</option>
          <//>
          <label className="dev-strip" style=${{ marginBottom: 22 }}>
            <input type="checkbox" checked=${hideSoldOut} onChange=${(e) => setHideSoldOut(e.target.checked)} /> Hide sold-out items
          </label>
        </div>

        ${items.length === 0
          ? html`<div className="empty-state"><i className="fa-solid fa-utensils"></i><p>No items match these filters.</p></div>`
          : html`<div className="card" style=${{ padding: '6px 20px' }}>
              ${items.map((it) => html`
                <div className="menu-item-row" key=${it.id}>
                  <div className="menu-item-info">
                    <strong style=${{ opacity: it.available ? 1 : 0.55 }}>${it.name}${!it.available && html`<span className="sold-out-tag">Sold out</span>`}</strong>
                    <span>₹${it.price}</span>
                  </div>
                  <${QtyControl} item=${it} restaurant=${r.name} />
                </div>`)}
            </div>`}
      <//>`;
  }

  function OrdersPage() {
    const { user } = S.useAuth();
    const allOrders = S.useOrdersStore((s) => s.orders);
    const orders = allOrders.filter((o) => o.userEmail === user.email);   // derived, per student
    const now = S.useNow(1000);

    return html`
      <${Fragment}>
        <h1 style=${{ fontSize: '1.5rem' }}>My orders</h1>
        ${orders.length === 0
          ? html`<div className="empty-state"><i className="fa-solid fa-receipt"></i>
              <p style=${{ marginBottom: 14 }}>You haven't placed any orders yet.</p>
              <a href="#/restaurants" className="btn btn-primary btn-sm">Browse restaurants</a></div>`
          : html`<div>${orders.map((o) => {
              const p = CG.orders.getOrderProgress(o, now);
              return html`
                <a key=${o.id} href=${'#/order/' + o.id} className="card order-row">
                  <div>
                    <strong style=${{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>#${o.id}</strong>
                    <div className="muted" style=${{ fontSize: '0.82rem', marginTop: 4 }}>
                      ${o.restaurants.join(', ')} · ${o.lines.reduce((n, l) => n + l.qty, 0)} items · ₹${o.total}
                    </div>
                    <div className="muted" style=${{ fontSize: '0.74rem', marginTop: 2 }}>${new Date(o.placedAt).toLocaleString()}</div>
                  </div>
                  <span className=${'status-chip' + (p.delivered ? ' is-done' : '')}>
                    <i className=${'fa-solid ' + (p.delivered ? 'fa-check' : 'fa-clock')}></i> ${p.stage.label}
                  </span>
                </a>`;
            })}</div>`}
      <//>`;
  }

  /* LIVE TRACKING (React version of track-order.html).
     Everything on screen is derived from ONE value: how long ago the order was placed. */
  function OrderTracking({ order }) {
    const { showToast } = S.useToast();
    const fastForward = S.useOrdersStore((s) => s.fastForward);
    const now = S.useNow(1000);                               // re-render every second -> live countdown
    const p = CG.orders.getOrderProgress(order, now);
    const T = CG.orders;
    const payLabel = (CG.PAYMENT_METHODS.find(([v]) => v === order.payment) || [])[1] || order.payment;
    const distanceLeft = Math.round(T.TOTAL_DISTANCE_M * (1 - p.deliveryProgress));
    const onRoute = p.stageIndex >= 3;                        // partner has picked the order up
    const etaText = p.delivered ? 'Arrived' : (onRoute && p.minutesLeft <= 1 ? 'Arriving now' : p.minutesLeft + ' min away');

    // EFFECT: one-time notification when the order flips to "delivered" while this page is open
    const wasDelivered = useRef(p.delivered);
    useEffect(() => {
      if (p.delivered && !wasDelivered.current) showToast('Your order has arrived at ' + order.room + '!', 'success');
      wasDelivered.current = p.delivered;
    }, [p.delivered]);

    const box = { background: 'var(--bg-sunken)', borderRadius: 'var(--r-md)', padding: 14, textAlign: 'center' };
    const big = { fontFamily: 'var(--font-mono)', fontSize: '1.45rem', fontWeight: 700 };

    return html`
      <${Fragment}>
        <a href="#/orders" className="back-link"><i className="fa-solid fa-arrow-left"></i> My orders</a>
        <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h1 style=${{ fontSize: '1.5rem' }}>${p.delivered ? 'Order delivered' : 'Your order is on its way'}</h1>
            <span className="muted" style=${{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>Order #${order.id} · ${new Date(order.placedAt).toLocaleTimeString()}</span>
          </div>
          <span className=${'status-chip' + (p.delivered ? ' is-done' : '')}>${p.stage.label}</span>
        </div>

        <div className="card" style=${{ padding: '26px 20px 8px' }}><${OrderStepper} progress=${p} /></div>

        <div className="order-grid">
          <div className="card map-card">
            <div className="map-card-head">
              <strong><i className="fa-solid fa-route" style=${{ color: 'var(--primary)', marginRight: 6 }}></i>Live location</strong>
              <span className="eta-pill"><i className="fa-solid fa-clock"></i> ${etaText}</span>
            </div>
            <${DeliveryMap} progress=${p.deliveryProgress} delivered=${p.delivered} />
            <div className="map-card-foot">
              <span className="muted">
                ${!onRoute ? 'Waiting for the restaurant to finish. The partner leaves once your order is ready.'
                  : p.delivered ? 'Delivered to your door. Enjoy!' : 'A student partner is bringing your order across campus.'}
              </span>
              <button className="btn btn-accent btn-sm" onClick=${() => { fastForward(order.id, T.PREP_MINUTES); showToast('Demo: order is ready, watch the delivery!', 'info'); }}>
                <i className="fa-solid fa-forward"></i> Preview approach
              </button>
            </div>
          </div>

          <div style=${{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card" style=${{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style=${box}><div style=${{ ...big, color: 'var(--primary)' }}>${p.delivered ? 0 : p.minutesLeft} min</div><div className="muted" style=${{ fontSize: '0.7rem' }}>Time remaining</div></div>
              <div style=${box}><div style=${big}>${p.delivered ? 0 : distanceLeft} m</div><div className="muted" style=${{ fontSize: '0.7rem' }}>Distance left</div></div>
            </div>

            ${onRoute
              ? html`<${PartnerCard} />`
              : html`<div className="card" style=${{ padding: 18, fontSize: '0.85rem' }}>
                  <i className="fa-solid fa-user-clock" style=${{ color: 'var(--primary)', marginRight: 8 }}></i>
                  A student partner is assigned when your order is ready. Est. prep time: <strong>${T.PREP_MINUTES} min</strong>.
                </div>`}

            <div className="card" style=${{ padding: '18px 20px' }}>
              <h3 style=${{ fontSize: '0.95rem', marginBottom: 8 }}>Order summary</h3>
              ${order.lines.map((l) => html`<div className="cart-summary-row" key=${l.id} style=${{ padding: '4px 0' }}><span>${l.name} × ${l.qty}</span><span>₹${l.price * l.qty}</span></div>`)}
              <div className="cart-summary-row" style=${{ padding: '4px 0' }}><span>Delivery fee</span><span>₹${order.deliveryFee}</span></div>
              <div className="cart-summary-row total" style=${{ padding: '8px 0 0' }}><span>Total</span><span>₹${order.total}</span></div>
              <hr style=${{ border: 0, borderTop: '1px dashed var(--border)', margin: '12px 0' }} />
              <div style=${{ fontSize: '0.82rem', display: 'grid', gap: 4 }}>
                <span><i className="fa-solid fa-location-dot"></i> ${order.room}</span>
                <span><i className="fa-solid fa-phone"></i> ${order.phone}</span>
                <span><i className="fa-solid fa-wallet"></i> ${payLabel}</span>
                ${order.instructions && html`<span><i className="fa-solid fa-note-sticky"></i> ${order.instructions}</span>`}
              </div>
            </div>
          </div>
        </div>
      <//>`;
  }

  // Route #/order/:id
  function OrderPage({ id }) {
    const { user } = S.useAuth();
    const order = S.useOrdersStore((s) => s.orders.find((o) => o.id === id && o.userEmail === user.email));
    if (!order) {
      return html`<div className="empty-state"><i className="fa-solid fa-circle-question"></i>
        <p style=${{ marginBottom: 14 }}>We couldn't find that order.</p>
        <a href="#/orders" className="btn btn-primary btn-sm">Back to my orders</a></div>`;
    }
    return html`<${OrderTracking} order=${order} />`;
  }

  // Route #/track -> tracks your most recent order. With no orders, offers a one-click demo order.
  function TrackLatestPage() {
    const { user } = S.useAuth();
    const latest = S.useOrdersStore((s) => s.orders.find((o) => o.userEmail === user.email)); // newest first
    const addOrder = S.useOrdersStore((s) => s.addOrder);

    if (latest) return html`<${OrderTracking} order=${latest} />`;

    const createDemoOrder = () => {
      const lines = [
        { id: 'i4', name: 'Veg Manchurian Dry', price: 189.52, qty: 1, restaurant: 'Speedy Chow' },
        { id: 'i13', name: 'Latte', price: 99, qty: 1, restaurant: 'Blue Tokai' },
      ];
      const id = 'CG-' + Math.floor(10000 + Math.random() * 90000);
      addOrder({ id, placedAt: Date.now(), userEmail: user.email, lines, subtotal: 288.52, deliveryFee: 15, total: 303.52,
        room: 'Block C · Room 214', phone: '9876543210', instructions: '', payment: 'upi',
        restaurants: ['Speedy Chow', 'Blue Tokai'] });
      location.hash = '#/order/' + id;
    };
    return html`
      <div className="empty-state">
        <i className="fa-solid fa-location-crosshairs"></i>
        <p style=${{ marginBottom: 14 }}>No order to track yet. Place an order, or try a demo order.</p>
        <div style=${{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#/restaurants" className="btn btn-ghost btn-sm">Browse restaurants</a>
          <button className="btn btn-primary btn-sm" onClick=${createDemoOrder}>Start a demo order</button>
        </div>
      </div>`;
  }

  function App() {
    const { route } = S.useHashRoute();
    let page;
    if (route.name === 'restaurant') page = html`<${RestaurantPage} key=${route.id} id=${route.id} />`;
    else if (route.name === 'orders') page = html`<${OrdersPage} />`;
    else if (route.name === 'order') page = html`<${OrderPage} id=${route.id} />`;
    else if (route.name === 'track') page = html`<${TrackLatestPage} />`;
    else page = html`<${RestaurantsPage} />`;

    return html`
      <${Fragment}>
        <${Navbar} route=${route} />
        <main className="wrap page-main">${page}</main>
        <${CartFab} />
        <${CartDrawer} />
      <//>`;
  }

  // ENTRY POINT: the providers wrap the app, so any component inside can use useAuth/useTheme/useToast
  if (window.CAMPUSGO_HOME_ALLOWED !== false) {
    ReactDOM.createRoot(document.getElementById('root')).render(
      html`<${S.ThemeProvider}><${S.ToastProvider}><${S.AuthProvider}><${App} /><//><//><//>`
    );
  }
})();
