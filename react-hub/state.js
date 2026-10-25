/* ==========================================================================
   state.js — all STATE LOGIC of the React section
     1. Validators          (form validation rules)
     2. Zustand stores      (GLOBAL state: cart + order history)
     3. Context API         (GLOBAL state: auth, theme, toasts)
     4. Custom hooks        (useAsync, useForm, useNow, useHashRoute)
   ========================================================================== */
(function () {
  const CG = (window.CG = window.CG || {});
  const html = htm.bind(React.createElement);
  const { createContext, useContext, useState, useEffect, useCallback, useMemo } = React;

  /* ---------- 1. Validators: a rule returns an error string, or '' if valid ---------- */
  const rules = {
    required: (msg = 'This field is required') => (v) => (String(v ?? '').trim() ? '' : msg),
    minLen: (n) => (v) => (String(v).trim().length >= n ? '' : `Use at least ${n} characters`),
    maxLen: (n) => (v) => (String(v).length <= n ? '' : `Keep it under ${n} characters`),
    pattern: (re, msg) => (v) => (re.test(String(v).trim()) ? '' : msg),
  };
  // Runs the rules in order and returns the FIRST error message
  const validateField = (value, ruleList = []) => {
    for (const rule of ruleList) { const msg = rule(value); if (msg) return msg; }
    return '';
  };

  /* ---------- 2. Zustand stores (global state) ----------
     The cart changes often and is read by many components. A store lets each component
     subscribe to ONLY the slice it needs, with no provider wrapper. `persist` saves to localStorage. */
  const DELIVERY_FEE = 15;
  const { create, persist } = zustand;

  const useCartStore = create(persist((set) => ({
    items: {},      // { [itemId]: { id, name, price, restaurant, qty } }
    isOpen: false,  // is the cart drawer open?
    add: (item) => set((s) => {
      const cur = s.items[item.id];
      return { items: { ...s.items, [item.id]: { ...item, qty: (cur ? cur.qty : 0) + 1 } } };
    }),
    decrement: (id) => set((s) => {
      const cur = s.items[id];
      if (!cur) return s;
      const items = { ...s.items };
      if (cur.qty <= 1) delete items[id]; else items[id] = { ...cur, qty: cur.qty - 1 };
      return { items };
    }),
    clear: () => set({ items: {} }),
    openCart: () => set({ isOpen: true }),
    closeCart: () => set({ isOpen: false }),
  }), { name: 'cg_cart_react', partialize: (s) => ({ items: s.items }) }));

  // DERIVED state: totals are computed from items, never stored (single source of truth)
  function useCartTotals() {
    const items = useCartStore((s) => s.items);
    return useMemo(() => {
      const lines = Object.values(items);
      const count = lines.reduce((n, l) => n + l.qty, 0);
      const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
      const deliveryFee = count > 0 ? DELIVERY_FEE : 0;
      return { lines, count, subtotal, deliveryFee, total: subtotal + deliveryFee };
    }, [items]);
  }

  const useOrdersStore = create(persist((set) => ({
    orders: [],
    addOrder: (order) => set((s) => ({ orders: [order, ...s.orders] })),
    // Demo helper: move an order's clock so it is `simMinutes` into its journey
    fastForward: (id, simMinutes) => set((s) => ({
      orders: s.orders.map((o) => (o.id === id
        ? { ...o, placedAt: Date.now() - (simMinutes / CG.orders.DEMO_SPEED) * 60000 } : o)),
    })),
  }), { name: 'cg_orders_react' }));

  /* ---------- 3. Context API (global state shared without prop drilling) ---------- */
  const AuthContext = createContext(null);
  const ThemeContext = createContext(null);
  const ToastContext = createContext(null);

  // Reads the SAME session the vanilla sign-in page writes ('cg_session')
  function readSession() { try { return JSON.parse(localStorage.getItem('cg_session')); } catch (e) { return null; } }

  function AuthProvider({ children }) {
    const [user] = useState(readSession);   // lazy initial state: reads storage once
    useEffect(() => { if (!user) window.location.href = 'index.html'; }, [user]); // route guard
    const signOut = useCallback(() => { localStorage.removeItem('cg_session'); window.location.href = 'index.html'; }, []);
    const value = useMemo(() => ({ user, signOut }), [user, signOut]);
    if (!user) return null;
    return html`<${AuthContext.Provider} value=${value}>${children}<//>`;
  }

  function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => localStorage.getItem('cg_theme') || 'light');
    useEffect(() => {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('cg_theme', theme);
    }, [theme]);
    const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);
    const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
    return html`<${ThemeContext.Provider} value=${value}>${children}<//>`;
  }

  const TOAST_ICONS = { success: 'fa-circle-check', error: 'fa-circle-exclamation', info: 'fa-circle-info' };
  function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const showToast = useCallback((message, type = 'info', duration = 3000) => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, message, type }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), duration);
    }, []);
    const value = useMemo(() => ({ showToast }), [showToast]);
    return html`
      <${ToastContext.Provider} value=${value}>
        ${children}
        <div className="toast-stack">
          ${toasts.map((t) => html`
            <div key=${t.id} className=${'toast toast-' + t.type}>
              <i className=${'fa-solid ' + TOAST_ICONS[t.type]}></i><span>${t.message}</span>
            </div>`)}
        </div>
      <//>`;
  }

  const useAuth = () => useContext(AuthContext);
  const useTheme = () => useContext(ThemeContext);
  const useToast = () => useContext(ToastContext);

  /* ---------- 4. Custom hooks ---------- */

  // Generic async state: { data, loading, error, reload }.
  // `cancelled` stops a stale response from overwriting newer state after unmount / dependency change.
  function useAsync(asyncFn, deps) {
    const [state, setState] = useState({ data: null, loading: true, error: null });
    const [tick, setTick] = useState(0);
    useEffect(() => {
      let cancelled = false;
      setState((s) => ({ ...s, loading: true, error: null }));
      asyncFn()
        .then((data) => { if (!cancelled) setState({ data, loading: false, error: null }); })
        .catch((err) => { if (!cancelled) setState({ data: null, loading: false, error: err.message }); });
      return () => { cancelled = true; };
    }, [...deps, tick]);
    const reload = useCallback(() => setTick((t) => t + 1), []);
    return { ...state, reload };
  }

  // Controlled-form hook. Strategy: validate on BLUR, re-validate on change once touched,
  // validate everything on SUBMIT.   schema = { field: [rule, rule, ...] }
  function useForm(initialValues, schema) {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const check = (name, value) => setErrors((e) => ({ ...e, [name]: validateField(value, schema[name]) }));

    const handleChange = (e) => {
      const { name, value } = e.target;
      setValues((v) => ({ ...v, [name]: value }));
      if (touched[name]) check(name, value);
    };
    const handleBlur = (e) => {
      const { name, value } = e.target;
      setTouched((t) => ({ ...t, [name]: true }));
      check(name, value);
    };
    const validateAll = () => {
      const next = {};
      Object.keys(schema).forEach((name) => { next[name] = validateField(values[name], schema[name]); });
      setErrors(next);
      setTouched(Object.fromEntries(Object.keys(schema).map((k) => [k, true])));
      return Object.values(next).every((m) => !m);
    };
    const handleSubmit = (onValid) => (e) => { e.preventDefault(); if (validateAll()) onValid(values); };
    const getFieldProps = (name) => ({
      name, value: values[name], onChange: handleChange, onBlur: handleBlur,
      error: touched[name] ? errors[name] : '',
    });
    const reset = () => { setValues(initialValues); setErrors({}); setTouched({}); };
    return { values, handleSubmit, getFieldProps, reset };
  }

  // Re-renders every `ms` with the current time (drives live countdowns). Cleans up its interval.
  function useNow(ms = 1000) {
    const [now, setNow] = useState(Date.now());
    useEffect(() => { const id = setInterval(() => setNow(Date.now()), ms); return () => clearInterval(id); }, [ms]);
    return now;
  }

  // Tiny hash router: #/restaurant/r1  ->  { name: 'restaurant', id: 'r1' }
  const parseHash = () => {
    const [name, id] = location.hash.replace(/^#\/?/, '').split('/');
    return { name: name || 'restaurants', id };
  };
  function useHashRoute() {
    const [route, setRoute] = useState(parseHash);
    useEffect(() => {
      const onChange = () => setRoute(parseHash());
      window.addEventListener('hashchange', onChange);
      return () => window.removeEventListener('hashchange', onChange);
    }, []);
    const go = useCallback((path) => { location.hash = '#/' + path; }, []);
    return { route, go };
  }

  CG.state = {
    rules, validateField, DELIVERY_FEE,
    useCartStore, useCartTotals, useOrdersStore,
    AuthProvider, ThemeProvider, ToastProvider, useAuth, useTheme, useToast,
    useAsync, useForm, useNow, useHashRoute,
  };
})();
