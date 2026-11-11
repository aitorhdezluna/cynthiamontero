const header = document.querySelector('[data-header]');
const toggle = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('is-open', !open);
    document.body.classList.toggle('menu-open', !open);
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
      document.body.classList.remove('menu-open');
    });
  });
}

let lastY = window.scrollY;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (header) {
    header.classList.toggle('is-hidden', y > lastY && y > 180);
  }
  lastY = y;
}, { passive: true });

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* ------------------------------------------------------------------
   Google Ads: conversión "clic en WhatsApp" + consentimiento de cookies
   Rellenar con los datos de la cuenta de Google Ads de Cynthia.
   Mientras sigan los valores de ejemplo (XXXX) no se carga nada
   y el aviso de cookies no aparece.
------------------------------------------------------------------ */
const ADS_ID = 'AW-17054912767';                    // ID de la Etiqueta de Google
const ADS_WHATSAPP_LABEL = 'JLaGCNWAq7YdEP-htcQ_';  // Etiqueta de la conversión "Clic en WhatsApp"
const ADS_ENABLED = !/X{4,}/.test(ADS_ID) && !/X{4,}/.test(ADS_WHATSAPP_LABEL);

if (ADS_ENABLED) {
  const CONSENT_KEY = 'cm_cookie_consent';
  const CONSENT_MS = 730 * 24 * 60 * 60 * 1000; // 24 meses
  const banner = document.querySelector('[data-cookie-banner]');
  let adsLoaded = false;

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }

  // Por defecto, todo denegado (Consent Mode v2)
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied'
  });

  const readConsent = () => {
    try {
      const d = JSON.parse(localStorage.getItem(CONSENT_KEY));
      if (d && (d.v === 'granted' || d.v === 'denied') && Date.now() - d.t < CONSENT_MS) return d.v;
    } catch (e) {}
    return null;
  };
  const saveConsent = (v) => {
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify({ v, t: Date.now() })); } catch (e) {}
  };

  const loadAds = () => {
    if (adsLoaded) return;
    adsLoaded = true;
    gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'denied', // sin publicidad personalizada (web de salud)
      analytics_storage: 'denied'
    });
    gtag('js', new Date());
    gtag('config', ADS_ID, { allow_ad_personalization_signals: false });
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ADS_ID);
    document.head.appendChild(s);
  };

  const clearAdsCookies = () => {
    const host = location.hostname;
    const labels = host.split('.');
    const domains = [host, '.' + host];
    if (labels.length > 2) domains.push('.' + labels.slice(-2).join('.'));
    document.cookie.split(';').forEach(c => {
      const name = c.split('=')[0].trim();
      if (name.indexOf('_gcl') === 0 || name.indexOf('_gac') === 0) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        domains.forEach(d => {
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=' + d;
        });
      }
    });
  };

  const revokeAds = () => {
    if (adsLoaded) {
      gtag('consent', 'update', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied'
      });
    }
    clearAdsCookies();
  };

  const showBanner = () => { if (banner) banner.hidden = false; };
  const hideBanner = () => { if (banner) banner.hidden = true; };

  document.querySelector('[data-cookie-accept]')?.addEventListener('click', () => {
    saveConsent('granted');
    loadAds();
    hideBanner();
  });
  document.querySelector('[data-cookie-reject]')?.addEventListener('click', () => {
    saveConsent('denied');
    revokeAds();
    hideBanner();
  });
  document.querySelectorAll('[data-cookie-settings]').forEach(btn => {
    btn.hidden = false;
    btn.addEventListener('click', showBanner);
  });

  const stored = readConsent();
  if (stored === 'granted') loadAds();
  else if (stored === null) showBanner();

  // Conversión: clic en cualquier botón de WhatsApp (solo con consentimiento)
  document.querySelectorAll('[data-conversion="whatsapp"]').forEach(link => {
    link.addEventListener('click', () => {
      if (adsLoaded) gtag('event', 'conversion', { send_to: ADS_ID + '/' + ADS_WHATSAPP_LABEL });
    });
  });
}
