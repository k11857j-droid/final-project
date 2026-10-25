/* ==========================================================================
   CampusGo — Core utilities shared across every page.
   Keep this file framework-agnostic and dependency-free (vanilla ES6 only).
   ========================================================================== */

const CampusGo = (() => {

  /* ---------------------------------------- */
  /* Storage keys — single source of truth     */
  /* ---------------------------------------- */
  const KEYS = {
    THEME: 'cg_theme',
    SESSION: 'cg_session',      // { name, email, collegeId, signedInAt }
    ONBOARDING: 'cg_onboarding', // { idVerified, collegeId, gender, lane, hostel:{}, dayscholar:{} }
    PARTNER_APP: 'cg_partner_application',
    CART: 'cg_cart',
  };

  /* ---------------------------------------- */
  /* Theme (Dark / Light)                      */
  /* ---------------------------------------- */
  function initTheme() {
    const saved = localStorage.getItem(KEYS.THEME);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(KEYS.THEME, next);
    updateThemeIcon(next);
  }

  function updateThemeIcon(theme) {
    document.querySelectorAll('[data-theme-icon]').forEach((icon) => {
      icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    });
  }

  /* ---------------------------------------- */
  /* Toasts                                    */
  /* ---------------------------------------- */
  function ensureToastStack() {
    let stack = document.querySelector('.toast-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'toast-stack';
      document.body.appendChild(stack);
    }
    return stack;
  }

  const TOAST_ICONS = {
    success: 'fa-solid fa-circle-check',
    error: 'fa-solid fa-circle-exclamation',
    info: 'fa-solid fa-circle-info',
  };

  function toast(message, type = 'info', duration = 3200) {
    const stack = ensureToastStack();
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `<i class="${TOAST_ICONS[type] || TOAST_ICONS.info}"></i><span>${message}</span>`;
    stack.appendChild(el);
    setTimeout(() => {
      el.classList.add('is-leaving');
      setTimeout(() => el.remove(), 200);
    }, duration);
  }

  /* ---------------------------------------- */
  /* Ripple effect for .btn elements           */
  /* ---------------------------------------- */
  function bindRipples() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn');
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  }

  /* ---------------------------------------- */
  /* Page loader fade-out                      */
  /* ---------------------------------------- */
  function hidePageLoader() {
    const loader = document.querySelector('.page-loader');
    if (!loader) return;
    setTimeout(() => loader.classList.add('is-hidden'), 350);
  }

  /* ---------------------------------------- */
  /* Session / Onboarding state                */
  /* ---------------------------------------- */
  function getJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }
  function setJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getSession() { return getJSON(KEYS.SESSION, null); }
  function setSession(data) { setJSON(KEYS.SESSION, data); }

  function getOnboarding() {
    return getJSON(KEYS.ONBOARDING, { idVerified: false, lane: null, hostel: null, dayscholar: null });
  }
  function setOnboarding(data) { setJSON(KEYS.ONBOARDING, data); }

  function patchOnboarding(patch) {
    const current = getOnboarding();
    const merged = { ...current, ...patch };
    setOnboarding(merged);
    return merged;
  }

  /* ---------------------------------------- */
  /* Women's Essentials access gate            */
  /* Access is based on the gender declared    */
  /* + verified during the college-ID check —  */
  /* NOT guessed from the roll number pattern, */
  /* which isn't a reliable or fair signal.    */
  /* ---------------------------------------- */
  function canAccessWomensEssentials() {
    const onboarding = getOnboarding();
    return Boolean(onboarding.idVerified && onboarding.gender === 'female');
  }

  /* Route guard: redirect to the correct step if a page's prerequisite isn't met */
  function requireStep(step) {
    const session = getSession();
    const onboarding = getOnboarding();

    if (!session && step !== 'auth') {
      window.location.href = 'index.html';
      return false;
    }
    if (step === 'verify-id' && !session) {
      window.location.href = 'index.html';
      return false;
    }
    if (step === 'setup-location' && !onboarding.idVerified) {
      window.location.href = 'verify-id.html';
      return false;
    }
    if (step === 'home' && !onboarding.lane) {
      window.location.href = 'setup-location.html';
      return false;
    }
    return true;
  }

  /* ---------------------------------------- */
  /* Simple client-side validators              */
  /* ---------------------------------------- */
  const validators = {
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    notEmpty: (v) => v.trim().length > 0,
    minLen: (v, n) => v.trim().length >= n,
    phone: (v) => /^[6-9]\d{9}$/.test(v.trim()),
    collegeId: (v) => /^[A-Za-z0-9\/-]{5,20}$/.test(v.trim()),
  };

  function setFieldError(inputEl, message) {
    const wrap = inputEl.closest('.field');
    if (!wrap) return;
    const errEl = wrap.querySelector('.field-error');
    inputEl.classList.toggle('has-error', Boolean(message));
    if (errEl) errEl.innerHTML = message ? `<i class="fa-solid fa-triangle-exclamation"></i> ${message}` : '';
  }

  /* ---------------------------------------- */
  /* Confetti — used after first completed order (wired up later in dashboard) */
  /* ---------------------------------------- */
  function fireConfetti(count = 60) {
    const colors = ['#0F6E52', '#F2A93B', '#2E6FBB', '#D6483B', '#22A67D'];
    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = `${Math.random() * 100}vw`;
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDuration = `${1.8 + Math.random() * 1.4}s`;
      piece.style.opacity = String(0.7 + Math.random() * 0.3);
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 3400);
    }
  }

  /* ---------------------------------------- */
  /* Init hooks common to every page           */
  /* ---------------------------------------- */
  function init() {
    initTheme();
    bindRipples();
    document.querySelectorAll('[data-action="toggle-theme"]').forEach((btn) => {
      btn.addEventListener('click', toggleTheme);
    });
    window.addEventListener('load', hidePageLoader);
    // Fallback in case 'load' already fired before this script ran
    if (document.readyState === 'complete') hidePageLoader();
  }

  return {
    KEYS, init, toggleTheme, toast, fireConfetti,
    getSession, setSession, getOnboarding, setOnboarding, patchOnboarding,
    requireStep, validators, setFieldError, getJSON, setJSON,
    canAccessWomensEssentials,
  };
})();

document.addEventListener('DOMContentLoaded', CampusGo.init);
