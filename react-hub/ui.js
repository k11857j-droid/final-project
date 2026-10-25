/* ==========================================================================
   ui.js — reusable React COMPONENTS (written with htm: JSX-like template strings,
   so no build step / Babel is needed)
   ========================================================================== */
(function () {
  const CG = (window.CG = window.CG || {});
  const html = htm.bind(React.createElement);
  const { useState, Fragment } = React;
  const S = CG.state;

  /* REUSABLE input: label + control + icon + password toggle + error message.
     Used for every text field, <select> and <textarea>; extra props (value, onChange, ...) are forwarded. */
  function FormField({ label, name, type = 'text', icon, error, as = 'input', children, ...rest }) {
    const [showPw, setShowPw] = useState(false);
    const isPassword = type === 'password';
    const id = 'field-' + name;
    const cls = (as === 'select' ? 'select' : 'input') + (error ? ' has-error' : '');
    const control =
      as === 'select'   ? html`<select id=${id} name=${name} className=${cls} aria-invalid=${Boolean(error)} ...${rest}>${children}</select>`
      : as === 'textarea' ? html`<textarea id=${id} name=${name} className=${cls} rows="2" aria-invalid=${Boolean(error)} style=${{ resize: 'vertical' }} ...${rest}></textarea>`
      : html`<input id=${id} name=${name} className=${cls} aria-invalid=${Boolean(error)} type=${isPassword && showPw ? 'text' : type} ...${rest} />`;
    return html`
      <div className="field">
        <label htmlFor=${id}>${label}</label>
        ${icon || isPassword
          ? html`<div className="input-icon-wrap">
              ${icon && html`<i className=${'fa-solid ' + icon}></i>`}
              ${control}
              ${isPassword && html`<button type="button" className="toggle-visibility" onClick=${() => setShowPw((s) => !s)}>
                <i className=${'fa-solid ' + (showPw ? 'fa-eye-slash' : 'fa-eye')}></i></button>`}
            </div>`
          : control}
        <div className="field-error">${error && html`<${Fragment}><i className="fa-solid fa-triangle-exclamation"></i> ${error}<//>`}</div>
      </div>`;
  }

  /* The 2 non-happy states of any async request */
  function LoadingBlock({ label = 'Loading…' }) {
    return html`<div className="empty-state" role="status"><div className="spinner spinner-dark"></div><p>${label}</p></div>`;
  }
  function ErrorBlock({ message, onRetry }) {
    return html`
      <div className="empty-state" role="alert">
        <i className="fa-solid fa-triangle-exclamation" style=${{ color: 'var(--danger)' }}></i>
        <p style=${{ marginBottom: 14 }}>${message}</p>
        ${onRetry && html`<button className="btn btn-primary btn-sm" onClick=${onRetry}><i className="fa-solid fa-rotate-right"></i> Try again</button>`}
      </div>`;
  }

  /* Add button / quantity stepper. Subscribes ONLY to this item's quantity (store selector),
     so changing one row doesn't re-render the others. */
  function QtyControl({ item, restaurant }) {
    const qty = S.useCartStore((s) => (s.items[item.id] ? s.items[item.id].qty : 0));
    const add = S.useCartStore((s) => s.add);
    const decrement = S.useCartStore((s) => s.decrement);
    if (!item.available && qty === 0) return html`<button className="btn btn-ghost btn-sm" disabled>Sold out</button>`;
    if (qty === 0) return html`<button className="btn btn-primary btn-sm" onClick=${() => add({ ...item, restaurant })}>Add</button>`;
    return html`
      <div className="qty-stepper">
        <button aria-label=${'Remove one ' + item.name} onClick=${() => decrement(item.id)}>−</button>
        <span>${qty}</span>
        <button aria-label=${'Add one ' + item.name} disabled=${!item.available} onClick=${() => add({ ...item, restaurant })}>+</button>
      </div>`;
  }

  function RestaurantCard({ restaurant: r }) {
    const [fav, setFav] = useState(false);   // LOCAL state: only this card cares
    return html`
      <div className="r-card">
        <div className="r-cover" style=${{ background: `linear-gradient(135deg, ${r.color}, ${r.color}cc)` }}>
          ${r.image && html`<img src=${r.image} alt=${r.name + ' logo'} loading="lazy" style=${{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', padding: 14 }} />`}
          <span className=${'r-badge ' + (r.veg ? 'veg' : 'non-veg')} style=${{ position: 'relative', zIndex: 1 }}>
            <i className=${'fa-solid ' + (r.veg ? 'fa-leaf' : 'fa-drumstick-bite')}></i> ${r.veg ? 'Veg' : 'Non-Veg'}
          </span>
          <button className=${'r-fav-btn' + (fav ? ' is-active' : '')} style=${{ position: 'relative', zIndex: 1 }} aria-label="Toggle favourite" onClick=${() => setFav((f) => !f)}>
            <i className="fa-solid fa-heart"></i>
          </button>
        </div>
        <div className="r-body">
          <div className="r-name">${r.name}</div>
          <div className="r-tags">${r.tags}</div>
          <div className="r-meta-row">
            <span className="r-rating"><i className="fa-solid fa-star"></i> ${r.rating}</span>
            <span className="r-time"><i className="fa-regular fa-clock"></i> ${r.time}</span>
          </div>
          <a href=${'#/restaurant/' + r.id} className="btn btn-ghost btn-sm btn-block" style=${{ marginTop: 6 }}>
            View menu <i className="fa-solid fa-arrow-right"></i>
          </a>
        </div>
      </div>`;
  }

  function Navbar({ route }) {
    if (window.CAMPUSGO_EMBEDDED_HOME) return null;
    const { user, signOut } = S.useAuth();
    const { theme, toggleTheme } = S.useTheme();
    const link = (to, active, icon, text) =>
      html`<a href=${to} className=${'nav-link' + (active ? ' is-active' : '')}><i className=${'fa-solid ' + icon}></i> ${text}</a>`;
    return html`
      <nav className="app-nav">
        <div className="wrap">
          <a href="home.html" className="brand"><span className="brand-badge">CG</span>CampusGo</a>
          <div className="app-nav-links">
            ${link('#/restaurants', route.name === 'restaurants' || route.name === 'restaurant', 'fa-utensils', 'Restaurants')}
            ${link('#/orders', route.name === 'orders' || route.name === 'order', 'fa-receipt', 'My Orders')}
            ${link('#/track', route.name === 'track', 'fa-location-crosshairs', 'Track Order')}
          </div>
          <div className="nav-right">
            <button className="nav-icon-btn" aria-label="Toggle dark mode" onClick=${toggleTheme}>
              <i className=${'fa-solid ' + (theme === 'dark' ? 'fa-sun' : 'fa-moon')}></i>
            </button>
            <div className="avatar" title=${user.email}>${(user.name || 'S').trim()[0].toUpperCase()}</div>
            <button className="nav-icon-btn" aria-label="Sign out" onClick=${signOut}><i className="fa-solid fa-right-from-bracket"></i></button>
          </div>
        </div>
      </nav>`;
  }

  /* Floating cart button + slide-out drawer with the CHECKOUT FORM */
  function CartFab() {
    const openCart = S.useCartStore((s) => s.openCart);
    const { count, total } = S.useCartTotals();
    return html`
      <button className=${'cart-fab' + (count > 0 ? ' is-visible' : '')} onClick=${openCart}>
        <i className="fa-solid fa-bag-shopping"></i>
        <span>${count} ${count === 1 ? 'item' : 'items'}</span><span>·</span><span>₹${total}</span>
      </button>`;
  }

  function CartDrawer() {
    const isOpen = S.useCartStore((s) => s.isOpen);
    const closeCart = S.useCartStore((s) => s.closeCart);
    const add = S.useCartStore((s) => s.add);
    const decrement = S.useCartStore((s) => s.decrement);
    const clear = S.useCartStore((s) => s.clear);
    const addOrder = S.useOrdersStore((s) => s.addOrder);
    const { lines, subtotal, deliveryFee, total } = S.useCartTotals();
    const { user } = S.useAuth();
    const { showToast } = S.useToast();

    // Async state for "Place order": idle -> loading -> success | error
    const [placing, setPlacing] = useState(false);
    const [orderError, setOrderError] = useState('');

    const { rules } = S;
    const { handleSubmit, getFieldProps, reset } = S.useForm(
      { room: '', phone: '', instructions: '', payment: 'upi' },
      {
        room: [rules.required('Enter your room / block'), rules.minLen(2)],
        phone: [rules.required('Enter your phone number'), rules.pattern(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number')],
        instructions: [rules.maxLen(120)],
        payment: [rules.required('Choose a payment method')],
      }
    );

    const placeOrder = async (values) => {
      setPlacing(true); setOrderError('');
      try {
        const res = await CG.api.placeOrderRequest(values);
        addOrder({
          id: res.orderId, placedAt: Date.now(), userEmail: user.email,
          lines, subtotal, deliveryFee, total,
          room: values.room, phone: values.phone, instructions: values.instructions, payment: values.payment,
          restaurants: [...new Set(lines.map((l) => l.restaurant))],
        });
        clear(); reset(); closeCart();
        showToast('Order ' + res.orderId + ' placed!', 'success');
        location.hash = '#/order/' + res.orderId;
      } catch (err) {
        setOrderError(err.message || 'Could not place order. Try again.');
      } finally {
        setPlacing(false);
      }
    };

    return html`
      <${Fragment}>
        <div className=${'cart-drawer-overlay' + (isOpen ? ' is-open' : '')} onClick=${closeCart}></div>
        <aside className=${'cart-drawer' + (isOpen ? ' is-open' : '')} aria-label="Your cart">
          <div className="cart-drawer-head">
            <h3>Your cart</h3>
            <button className="nav-icon-btn" aria-label="Close cart" onClick=${closeCart}><i className="fa-solid fa-xmark"></i></button>
          </div>
          <div className="cart-drawer-body">
            ${lines.length === 0
              ? html`<div className="empty-state"><i className="fa-solid fa-bag-shopping"></i><p>Your cart is empty.</p></div>`
              : lines.map((l) => html`
                  <div className="cart-line" key=${l.id}>
                    <div className="cart-line-info"><strong>${l.name}</strong><span>${l.restaurant} · ₹${l.price}</span></div>
                    <div className="qty-stepper">
                      <button onClick=${() => decrement(l.id)}>−</button><span>${l.qty}</span><button onClick=${() => add(l)}>+</button>
                    </div>
                  </div>`)}
          </div>
          ${lines.length > 0 && html`
            <form className="cart-drawer-foot" onSubmit=${handleSubmit(placeOrder)} noValidate>
              <${FormField} label="Deliver to (room / block)" name="room" icon="fa-location-dot" placeholder="e.g. Block C · Room 214" ...${getFieldProps('room')} />
              <${FormField} label="Mobile number" name="phone" icon="fa-phone" type="tel" placeholder="10-digit number" ...${getFieldProps('phone')} />
              <${FormField} as="textarea" label="Delivery instructions (optional)" name="instructions" placeholder="e.g. Call on arrival" ...${getFieldProps('instructions')} />
              <${FormField} as="select" label="Payment method" name="payment" ...${getFieldProps('payment')}>
                ${CG.PAYMENT_METHODS.map(([value, text]) => html`<option key=${value} value=${value}>${text}</option>`)}
              <//>
              <div className="cart-summary-row"><span>Subtotal</span><span>₹${subtotal}</span></div>
              <div className="cart-summary-row"><span>Delivery fee</span><span>₹${deliveryFee}</span></div>
              <div className="cart-summary-row total"><span>Total</span><span>₹${total}</span></div>
              ${orderError && html`<div className="form-error-banner"><i className="fa-solid fa-circle-exclamation"></i> ${orderError}</div>`}
              <button type="submit" className="btn btn-primary btn-block" disabled=${placing}>
                ${placing ? html`<${Fragment}><span className="spinner"></span> Placing order…<//>` : 'Place order'}
              </button>
            </form>`}
        </aside>
      <//>`;
  }

  /* Status stepper — built on the shared .route-rail CSS used by the vanilla onboarding pages */
  function OrderStepper({ progress }) {
    const { STAGES } = CG.orders;
    return html`
      <div className="route-rail order-rail">
        ${STAGES.map((s, i) => {
          const done = i < progress.stageIndex || (progress.delivered && i === progress.stageIndex);
          const active = i === progress.stageIndex && !progress.delivered;
          return html`
            <${Fragment} key=${s.key}>
              <div className=${'route-step' + (done ? ' is-done' : '') + (active ? ' is-active' : '')}>
                <div className="route-node">${done ? html`<i className="fa-solid fa-check" style=${{ fontSize: '0.7rem' }}></i>` : i + 1}</div>
                <span className="route-label">${s.short}</span>
              </div>
              ${i < STAGES.length - 1 && html`<div className="route-line" style=${{ '--fill': i < progress.stageIndex ? '100%' : '0%' }}></div>`}
            <//>`;
        })}
      </div>`;
  }


  /* ---------- Live tracking: campus map (SVG) ----------
     The marker is placed on the route with path.getPointAtLength(progress * totalLength):
     progress 0 = food court, 1 = your hostel block. useEffect re-measures whenever progress changes. */
  const ROUTE = 'M 195 300 L 195 200 L 300 200 Q 350 200 350 165 L 350 130 L 470 130 L 470 260 L 505 260';
  function DeliveryMap({ progress = 0, delivered = false }) {
    const pathRef = React.useRef(null);
    const [len, setLen] = useState(0);
    const [pos, setPos] = useState({ x: 195, y: 300 });
    React.useEffect(() => {
      const path = pathRef.current;
      const L = path.getTotalLength();
      const pt = path.getPointAtLength(progress * L);
      setLen(L); setPos({ x: pt.x, y: pt.y });
    }, [progress]);

    const arriving = progress > 0.85 && !delivered;
    const T = { fontFamily: 'Inter, sans-serif', fontWeight: 700, textAnchor: 'middle' };
    return html`
      <div className="map-box">
        <svg viewBox="0 0 700 500" aria-label="Campus delivery map">
          <defs>
            <linearGradient id="ground" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#EAF2EC" /><stop offset="100%" stopColor="#DCEAE1" />
            </linearGradient>
          </defs>
          <rect width="700" height="500" fill="url(#ground)" />
          <ellipse cx="350" cy="250" rx="120" ry="90" fill="#BFE3C6" opacity="0.7" />
          <rect x="40" y="360" width="150" height="100" rx="10" fill="#CDEAD1" />
          <rect x="500" y="60" width="150" height="90" rx="10" fill="#CDEAD1" />
          <rect width="26" height="500" fill="#B9C0BC" />
          <line x1="13" y1="0" x2="13" y2="500" stroke="#fff" strokeWidth="2" strokeDasharray="10 8" />
          <path d="M26,120 H660" stroke="#B9C0BC" strokeWidth="14" fill="none" />
          <path d="M120,20 V480" stroke="#B9C0BC" strokeWidth="14" fill="none" />
          <path d="M26,380 H660" stroke="#B9C0BC" strokeWidth="14" fill="none" />
          ${[[150, 45, 80], [260, 45, 70], [420, 45, 90], [150, 150, 70]].map(([x, y, w]) =>
            html`<rect key=${x + '-' + y} x=${x} y=${y} width=${w} height="55" rx="6" fill="#F2A93B" />`)}
          <rect x="300" y="150" width="55" height="45" rx="6" fill="#5B5FA6" />
          <rect x="365" y="150" width="55" height="45" rx="6" fill="#5B5FA6" />
          <rect x="300" y="215" width="100" height="70" rx="8" fill="#F2A93B" />
          <text x="350" y="255" fontSize="11" fill="#fff" ...${T}>LIBRARY</text>
          <rect x="150" y="300" width="90" height="55" rx="8" fill="#E85D75" />
          <text x="195" y="332" fontSize="10" fill="#fff" ...${T}>FOOD</text>
          <text x="195" y="344" fontSize="10" fill="#fff" ...${T}>COURT</text>
          <rect x="470" y="200" width="70" height="150" rx="8" fill="#F2C14E" />
          <rect x="555" y="220" width="60" height="110" rx="8" fill="#F2C14E" />
          <text x="505" y="278" fontSize="10" fill="#5c4400" ...${T}>HOSTEL</text>
          <text x="505" y="292" fontSize="10" fill="#5c4400" ...${T}>BLOCK C</text>
          <rect x="40" y="200" width="55" height="50" rx="6" fill="#9AA39D" />
          <rect y="230" width="26" height="40" fill="#101917" />

          <path ref=${pathRef} d=${ROUTE} fill="none" stroke="var(--border-strong)" strokeWidth="4" className="route-dash" />
          <path className="route-progress-line" d=${ROUTE} fill="none" stroke="var(--primary)" strokeWidth="4"
                strokeDasharray=${len || 1000} strokeDashoffset=${(len || 1000) * (1 - progress)} />

          <g transform="translate(195,300)"><circle r="9" fill="#E85D75" /><circle r="3.5" fill="#fff" /></g>

          <g className=${'drop-marker' + (arriving ? ' is-lit' : '')} transform="translate(505,260)">
            <circle className="drop-ring" r="9" fill="none" stroke="var(--primary)" strokeWidth="3" />
            <path d="M0,-16 C8,-16 14,-10 14,-2 C14,10 0,20 0,20 C0,20 -14,10 -14,-2 C-14,-10 -8,-16 0,-16 Z" fill="var(--primary)" />
            <circle cy="-3" r="4.5" fill="#fff" />
          </g>

          ${!delivered && html`
            <g className=${'partner-marker' + (arriving ? ' is-arriving' : '')} transform=${'translate(' + pos.x + ',' + pos.y + ')'}>
              <circle className="pm-pulse" r="10" fill="var(--primary)" />
              <g className="pm-body">
                <circle r="12" fill="var(--primary)" />
                <path d="M-5,3 L-2,-4 L2,-4 L1,0 L5,0 L-1,7 L0,3 Z" fill="#fff" transform="scale(0.85)" />
              </g>
            </g>`}
        </svg>
        <div className="map-legend">
          <span><i className="dot" style=${{ background: '#F2A93B' }}></i>Academic</span>
          <span><i className="dot" style=${{ background: '#F2C14E' }}></i>Hostel</span>
          <span><i className="dot" style=${{ background: '#5B5FA6' }}></i>Seminar Hall</span>
          <span><i className="dot" style=${{ background: '#E85D75' }}></i>Food Court</span>
        </div>
      </div>`;
  }

  function PartnerCard() {
    const { showToast } = S.useToast();
    const P = CG.orders.PARTNER;
    return html`
      <div className="card partner-card">
        <div className="partner-avatar">${P.initials}</div>
        <div className="partner-info">
          <h3>${P.name}</h3>
          <div className="p-meta"><i className="fa-solid fa-star"></i> ${P.rating} · ${P.vehicle} · ${P.plate}</div>
        </div>
        <div className="partner-actions">
          <button className="nav-icon-btn" aria-label="Call partner" onClick=${() => showToast('Calling ' + P.name + '… (demo)', 'info')}><i className="fa-solid fa-phone"></i></button>
          <button className="nav-icon-btn" aria-label="Message partner" onClick=${() => showToast('Message sent to ' + P.name + ' (demo)', 'success')}><i className="fa-solid fa-comment-dots"></i></button>
        </div>
      </div>`;
  }

  CG.ui = { FormField, LoadingBlock, ErrorBlock, QtyControl, RestaurantCard, Navbar, CartFab, CartDrawer, OrderStepper, DeliveryMap, PartnerCard };
})();
