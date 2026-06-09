'use strict';

// ── Photo data ────────────────────────────────────────────────────────────────
const PHOTOS = [
  { src: 'images/portraits/Alicia-20thMay2026-67.jpg',                    cat: 'portraits' },
  { src: 'images/corporate/Hyatt-21stFeb2026-31.jpg',                     cat: 'corporate' },
  { src: 'images/sports/DarylPadelTournament-23rdMay2026-53.jpg',         cat: 'sports'    },
  { src: 'images/corporate/Wasco-OTCMarch2026-220.jpg',                   cat: 'corporate' },
  { src: 'images/portraits/AmandaChen-Birthday-8thNov2025-21.jpg',        cat: 'portraits' },
  { src: 'images/corporate/Hyatt-21stFeb2026-42.jpg',                     cat: 'corporate' },
  { src: 'images/events/Lane23-EliBrown-26thApril2025-22.jpg',            cat: 'events'    },
  { src: 'images/sports/DarylPadelTournament-23rdMay2026-50.jpg',         cat: 'sports'    },
  { src: 'images/portraits/Anastasya-Bachelorettes-5thNov2025-36.jpg',    cat: 'portraits' },
  { src: 'images/corporate/WascoGreenergy-Agm-15thMay2026-9.jpg',         cat: 'corporate' },
  { src: 'images/portraits/AmandaChen-Birthday-8thNov2025-38.jpg',        cat: 'portraits' },
  { src: 'images/corporate/Hyatt-21stFeb2026-59.jpg',                     cat: 'corporate' },
  { src: 'images/sports/SBD-18May2023-70.jpg',                            cat: 'sports'    },
  { src: 'images/portraits/Anastasya-Bachelorettes-5thNov2025-40.jpg',    cat: 'portraits' },
  { src: 'images/corporate/Wasco-OTCMarch2026-256.jpg',                   cat: 'corporate' },
  { src: 'images/portraits/AmandaChen-Birthday-8thNov2025-48.jpg',        cat: 'portraits' },
  { src: 'images/corporate/WascoGreenergy-Townhall-31stOct2025-57.jpg',   cat: 'corporate' },
  { src: 'images/events/Kyo-28thDec2025-35.jpg',                          cat: 'events'    },
  { src: 'images/corporate/Hyatt-21stFeb2026-67.jpg',                     cat: 'corporate' },
  { src: 'images/portraits/Anastasya-Bachelorettes-5thNov2025-70.jpg',    cat: 'portraits' },
  { src: 'images/corporate/WascoRaya-24thApril2026-40.jpg',               cat: 'corporate' },
  { src: 'images/sports/Wasco-BlueRibbonRun-17thMay2026-8.jpg',          cat: 'sports'    },
  { src: 'images/portraits/Anastasya-Bachelorettes-5thNov2025-99.jpg',    cat: 'portraits' },
  { src: 'images/corporate/Hyatt-21stFeb2026-70.jpg',                     cat: 'corporate' },
  { src: 'images/portraits/Arif%26Jaja-Prewed-25thSept2025-3.jpg',        cat: 'portraits' },
  { src: 'images/corporate/WascoGreenergy-Townhall-31stOct2025-73.jpg',   cat: 'corporate' },
  { src: 'images/sports/Wasco-BlueRibbonRun-17thMay2026-12.jpg',         cat: 'sports'    },
  { src: 'images/portraits/Arif%26Jaja-Prewed-25thSept2025-20.jpg',       cat: 'portraits' },
  { src: 'images/corporate/Wasco-OTCMarch2026-299.jpg',                   cat: 'corporate' },
  { src: 'images/portraits/Arif%26Jaja-Prewed-25thSept2025-35.jpg',       cat: 'portraits' },
  { src: 'images/corporate/Hyatt-21stFeb2026-85.jpg',                     cat: 'corporate' },
  { src: 'images/sports/Wasco-BlueRibbonRun-17thMay2026-15.jpg',         cat: 'sports'    },
  { src: 'images/portraits/Arif%26Jaja-Prewed-25thSept2025-102.jpg',      cat: 'portraits' },
  { src: 'images/corporate/WascoGreenergy-Townhall-31stOct2025-94.jpg',   cat: 'corporate' },
  { src: 'images/corporate/WascoRaya-24thApril2026-45.jpg',               cat: 'corporate' },
  { src: 'images/sports/Wasco-BlueRibbonRun-17thMay2026-30.jpg',         cat: 'sports'    },
  { src: 'images/corporate/WascoRaya-24thApril2026-73.jpg',               cat: 'corporate' },
  { src: 'images/corporate/WascoRaya-24thApril2026-120.jpg',              cat: 'corporate' },
  { src: 'images/corporate/WascoRaya-24thApril2026-140.jpg',              cat: 'corporate' },
  { src: 'images/events/TeeraMSkybar-30April2024-16.jpg',                 cat: 'events'    },
  { src: 'images/events/Kyo-28thDec2025-124.jpg',                         cat: 'events'    },
  { src: 'images/events/Kyo-24thDec2025-Export-32.jpg',                   cat: 'events'    },
  { src: 'images/events/Kyo-24thDec2025-Export-50.jpg',                   cat: 'events'    },
  { src: 'images/events/Kyo-24thDec2025-Export-51.jpg',                   cat: 'events'    },
  { src: 'images/events/Kyo-24thDec2025-Export-56.jpg',                   cat: 'events'    },
  { src: 'images/events/Kyo-24thDec2025-Export-79.jpg',                   cat: 'events'    },
  { src: 'images/events/Kyo-25thDec2025-Export-40.jpg',                   cat: 'events'    },
  { src: 'images/events/Kyo-31stDec2025-36.jpg',                          cat: 'events'    },
  { src: 'images/events/Kyo-31stDec2025-39.jpg',                          cat: 'events'    },
  { src: 'images/events/Kyo-31stDec2025-41.jpg',                          cat: 'events'    },
  { src: 'images/events/Kyo-18thDec2025-17.jpg',                          cat: 'events'    },
  { src: 'images/events/Kyo-18thDec2025-21.jpg',                          cat: 'events'    },
  { src: 'images/events/Kyo-18thDec2025-25.jpg',                          cat: 'events'    },
  { src: 'images/events/Kyo-1stFeb2026-43.jpg',                           cat: 'events'    },
  { src: 'images/events/Kyo-1stFeb2026-81.jpg',                           cat: 'events'    },
  { src: 'images/events/Kyo-13thFeb2026-7.jpg',                           cat: 'events'    },
  { src: 'images/events/Kyo-13thFeb2026-36.jpg',                          cat: 'events'    },
  { src: 'images/events/Kyo21stJan2026-Export-74.jpg',                    cat: 'events'    },
  { src: 'images/events/Kyo21stJan2026-Export-107.jpg',                   cat: 'events'    },
  { src: 'images/events/Kyo21stJan2026-Export-109.jpg',                   cat: 'events'    },
  { src: 'images/events/Kyo21stJan2026-Export-113.jpg',                   cat: 'events'    },
  { src: 'images/events/Kyo21stJan2026-Export-118.jpg',                   cat: 'events'    },
  { src: 'images/events/Kyo21stJan2026-Export-157.jpg',                   cat: 'events'    },
  { src: 'images/events/EvenIf-Residance-1stFeb2026-42.jpg',              cat: 'events'    },
  { src: 'images/sports/SBD-Cup2025-7.jpg',                               cat: 'sports'    },
];

const HERO_IMGS = [
  'images/hero/SBD-Cup2025-7.jpg',
  'images/hero/Alicia-20thMay2026-67.jpg',
  'images/hero/DarylPadelTournament-23rdMay2026-53.jpg',
  'images/hero/Kyo-28thDec2025-35.jpg',
];

const CAT_LABELS = {
  portraits: 'Portraits',
  corporate: 'Corporate',
  sports:    'Sports',
  events:    'Events & Nightlife',
};

// ── DOM refs ──────────────────────────────────────────────────────────────────
const loader      = document.getElementById('loader');
const loaderBar   = document.getElementById('loaderBar');
const loaderPct   = document.getElementById('loaderPct');
const nav         = document.getElementById('nav');
const burger      = document.getElementById('burger');
const mobileMenu  = document.getElementById('mobileMenu');
const themeToggle = document.getElementById('themeToggle');
const heroSlides  = document.getElementById('heroSlides');
const heroDots    = document.getElementById('heroDots');
const filters     = document.querySelectorAll('.filter');
const gallery     = document.getElementById('gallery');
const lightbox    = document.getElementById('lightbox');
const lbImg       = document.getElementById('lbImg');
const lbCat       = document.getElementById('lbCat');
const lbCount     = document.getElementById('lbCount');
const lbClose     = document.getElementById('lbClose');
const lbPrev      = document.getElementById('lbPrev');
const lbNext      = document.getElementById('lbNext');
const toTop       = document.getElementById('toTop');
const contactBg   = document.getElementById('contactBg');

// ── Preloader ────────────────────────────────────────────────────────────────
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function runLoader(onDone) {
  if (prefersReduced) { loader.classList.add('done'); onDone(); return; }
  const dur = 1200;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const pct = Math.round(eased * 100);
    loaderPct.textContent = pct;
    loaderBar.style.right = `${100 - pct}%`;
    if (p < 1) { requestAnimationFrame(tick); }
    else {
      setTimeout(() => {
        loader.classList.add('done');
        onDone();
      }, 220);
    }
  }
  requestAnimationFrame(tick);
}

// ── Theme ─────────────────────────────────────────────────────────────────────
function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem('tc-theme', t); } catch (_) {}
}
const savedTheme = (() => { try { return localStorage.getItem('tc-theme'); } catch (_) { return null; } })();
applyTheme(savedTheme || 'dark');
themeToggle.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
});

// ── Nav ───────────────────────────────────────────────────────────────────────
const scrollFns = [];
let scrollTicking = false;
window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    requestAnimationFrame(() => { scrollFns.forEach(fn => fn()); scrollTicking = false; });
    scrollTicking = true;
  }
}, { passive: true });

scrollFns.push(() => {
  const y = window.scrollY;
  nav.classList.toggle('scrolled', y > 60);
  // active nav link
  const sections = ['work', 'about', 'contact'];
  let active = '';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top <= 120) active = id;
  });
  document.querySelectorAll('.nav-link').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `#${active}`);
  });
});

burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    burger.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});

// ── Hero ──────────────────────────────────────────────────────────────────────
let currentSlide = 0;
const slideEls = [];

HERO_IMGS.forEach((src, i) => {
  const div = document.createElement('div');
  div.className = 'hero-slide' + (i === 0 ? ' active' : '');
  div.style.backgroundImage = `url('${src}')`;
  heroSlides.appendChild(div);
  slideEls.push(div);

  const dot = document.createElement('button');
  dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
  dot.setAttribute('aria-label', `Slide ${i + 1}`);
  dot.addEventListener('click', () => goSlide(i));
  heroDots.appendChild(dot);
});

// preload hero images
HERO_IMGS.forEach(src => { const img = new Image(); img.src = src; });

function goSlide(idx) {
  slideEls[currentSlide].classList.remove('active');
  heroDots.children[currentSlide].classList.remove('active');
  currentSlide = idx;
  slideEls[currentSlide].classList.add('active');
  heroDots.children[currentSlide].classList.add('active');
}

if (!prefersReduced) {
  setInterval(() => goSlide((currentSlide + 1) % HERO_IMGS.length), 5000);

  // hero parallax
  const heroCenter = document.querySelector('.hero-center');
  scrollFns.push(() => {
    const y = window.scrollY;
    const vh = window.innerHeight;
    if (y > vh) return;
    const p = y / vh;
    heroSlides.style.transform = `scale(${1 + p * 0.1}) translateY(${y * 0.15}px)`;
    if (heroCenter) {
      heroCenter.style.transform = `translateY(${y * 0.38}px)`;
      heroCenter.style.opacity = String(Math.max(0, 1 - p * 1.5));
    }
  });
}

// ── Contact background ────────────────────────────────────────────────────────
if (contactBg) {
  const randomSrc = PHOTOS[Math.floor(Math.random() * PHOTOS.length)].src;
  contactBg.style.backgroundImage = `url('${randomSrc}')`;
  const img = new Image();
  img.onload = () => contactBg.classList.add('loaded');
  img.src = randomSrc;
}

// ── Gallery ───────────────────────────────────────────────────────────────────
const items = [];
PHOTOS.forEach((p, i) => {
  const div = document.createElement('div');
  div.className = 'item';
  div.dataset.cat = p.cat;

  const img = document.createElement('img');
  img.loading = 'lazy';
  img.decoding = 'async';
  img.alt = CAT_LABELS[p.cat] || p.cat;
  img.src = p.src;
  img.addEventListener('load', () => img.classList.add('loaded'));
  if (img.complete) img.classList.add('loaded');

  div.appendChild(img);
  div.addEventListener('click', () => openLightbox(i));
  gallery.appendChild(div);
  items.push(div);
});

// ── Filtering ─────────────────────────────────────────────────────────────────
let currentFilter = 'all';
filters.forEach(btn => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;
    filters.forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
    items.forEach(item => {
      const match = currentFilter === 'all' || item.dataset.cat === currentFilter;
      item.classList.toggle('hidden', !match);
    });
  });
});

// ── Lightbox ──────────────────────────────────────────────────────────────────
let lbIndex = 0;

function visibleItems() {
  return items.filter(it => !it.classList.contains('hidden'));
}

function openLightbox(globalIdx) {
  const visible = visibleItems();
  lbIndex = visible.findIndex(it => it === items[globalIdx]);
  if (lbIndex === -1) return;
  showLb(lbIndex);
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function showLb(idx) {
  const visible = visibleItems();
  const item = visible[idx];
  if (!item) return;
  const src = item.querySelector('img').src;
  lbImg.src = src;
  lbCat.textContent = CAT_LABELS[item.dataset.cat] || item.dataset.cat;
  lbCount.textContent = `${idx + 1} / ${visible.length}`;
  // preload neighbours
  [-1, 1].forEach(d => {
    const n = visible[(idx + d + visible.length) % visible.length];
    if (n) { const pre = new Image(); pre.src = n.querySelector('img').src; }
  });
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  lbImg.src = '';
}

function navigateLb(dir) {
  const visible = visibleItems();
  lbIndex = (lbIndex + dir + visible.length) % visible.length;
  showLb(lbIndex);
}

lbClose.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click', () => navigateLb(-1));
lbNext.addEventListener('click', () => navigateLb(1));
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowRight')  navigateLb(1);
  if (e.key === 'ArrowLeft')   navigateLb(-1);
});

// swipe on lightbox
let lbTouchX = 0;
lightbox.addEventListener('touchstart', e => { lbTouchX = e.touches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend', e => {
  const dx = lbTouchX - e.changedTouches[0].clientX;
  if (Math.abs(dx) > 40) navigateLb(dx > 0 ? 1 : -1);
}, { passive: true });

// ── Reveal on scroll ──────────────────────────────────────────────────────────
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// ── Back to top ───────────────────────────────────────────────────────────────
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ── Boot ──────────────────────────────────────────────────────────────────────
runLoader(() => {
  // trigger reveal for anything already in view
  document.querySelectorAll('.reveal:not(.in)').forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight) {
      el.classList.add('in');
    }
  });
});
