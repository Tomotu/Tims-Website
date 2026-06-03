'use strict';

// Force page to top on every load. Three layers:
// 1. <head> inline script already set scrollRestoration='manual'
// 2. replaceState removes any #hash so the browser has no anchor target
// 3. scroll listener snaps back to top for 1.3s — catches browsers that fire
//    their anchor-scroll after setTimeout(0). The preloader covers the page
//    for 1.2s so the snap is invisible to the user.
if (history.scrollRestoration) history.scrollRestoration = 'manual';
if (location.hash) history.replaceState(null, '', location.pathname + location.search);
window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
let scrollUnlocked = false;
window.addEventListener('scroll', () => {
    if (!scrollUnlocked) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
}, { passive: true });
setTimeout(() => { scrollUnlocked = true; }, 1300);

// ── Constants & state ────────────────────────────────────────────────────────
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Human-readable labels for each gallery category. Keeps display text in one
// place so the hover caption, lightbox caption and aria-labels never show the
// raw data-category value (e.g. "corporate", "events").
const CATEGORY_LABELS = {
    portraits: 'Portraits',
    corporate: 'Corporate',
    sports: 'Sports',
    events: 'Events & Nightlife',
};
const catLabel = (cat) => CATEGORY_LABELS[cat] || (cat.charAt(0).toUpperCase() + cat.slice(1));

let currentCategory = 'all';
let currentLbIndex = 0;
let lastFocusedItem = null;
let filterTimeout = null;
let touchStartX = 0;
let navigating = false;

// ── DOM refs ─────────────────────────────────────────────────────────────────
const preloader = document.getElementById('preloader');
const scrollProgress = document.getElementById('scroll-progress');
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const themeToggle = document.getElementById('theme-toggle');
const navLinks = document.querySelectorAll('.nav-links a');
const photoItems = document.querySelectorAll('.photo-item');
const filterBtns = document.querySelectorAll('.filter-btn');
const photoCountEl = document.getElementById('photo-count');
const lightboxCaption = document.getElementById('lightbox-caption');
const backToTop = document.getElementById('back-to-top');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCounter = document.getElementById('lightbox-counter');
const lightboxDownload = document.getElementById('lightbox-download');
const heroSlides = document.querySelectorAll('.hero-slide');
const tagline = document.querySelector('.hero-tagline');
const copyrightYear = document.getElementById('copyright-year');

// ── Preloader ────────────────────────────────────────────────────────────────
setTimeout(() => {
    preloader.classList.add('fade-out');
    preloader.addEventListener('transitionend', () => preloader.remove(), { once: true });
}, 1200);

// ── Copyright year ───────────────────────────────────────────────────────────
if (copyrightYear) copyrightYear.textContent = new Date().getFullYear();

// ── Scroll events ────────────────────────────────────────────────────────────
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
    backToTop.classList.toggle('visible', window.scrollY > 400);

    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollProgress) scrollProgress.style.width = `${(window.scrollY / scrollable) * 100}%`;
}, { passive: true });

// ── Back to top ──────────────────────────────────────────────────────────────
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ── Theme toggle ─────────────────────────────────────────────────────────────
function setTheme(light) {
    document.body.classList.toggle('light-mode', light);
    themeToggle.textContent = light ? '○' : '◑';
    themeToggle.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
    localStorage.setItem('theme', light ? 'light' : 'dark');
    const tcMeta = document.querySelector('meta[name="theme-color"]');
    if (tcMeta) tcMeta.content = light ? '#e6e1d6' : '#1c1c1a';
}
setTheme(localStorage.getItem('theme') === 'light');
themeToggle.addEventListener('click', () => setTheme(!document.body.classList.contains('light-mode')));

// ── Hero slideshow + dots ────────────────────────────────────────────────────
let currentSlide = 0;
const heroDotsEl = document.getElementById('hero-dots');

function goToSlide(index) {
    if (heroDotsEl) heroDotsEl.children[currentSlide]?.classList.remove('active');
    heroSlides[currentSlide].classList.remove('active');
    currentSlide = index;
    heroSlides[currentSlide].classList.add('active');
    if (heroDotsEl) heroDotsEl.children[currentSlide]?.classList.add('active');
}

if (heroDotsEl && heroSlides.length > 1) {
    heroSlides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => goToSlide(i));
        heroDotsEl.appendChild(dot);
    });
}

setInterval(() => goToSlide((currentSlide + 1) % heroSlides.length), 5000);

// ── Hero tagline typewriter ──────────────────────────────────────────────────
const taglineText = tagline.textContent;
tagline.textContent = '';
if (prefersReducedMotion) {
    tagline.textContent = taglineText;
} else {
    let charIndex = 0;
    setTimeout(() => {
        const type = () => {
            if (charIndex < taglineText.length) {
                tagline.textContent += taglineText[charIndex++];
                setTimeout(type, 90);
            }
        };
        type();
    }, 800);
}

// ── Hero h1 character reveal ─────────────────────────────────────────────────
const heroH1 = document.querySelector('#hero h1');
if (heroH1 && !prefersReducedMotion) {
    const txt = heroH1.textContent;
    heroH1.innerHTML = [...txt].map((c, i) =>
        `<span class="char" style="--ci:${i}" aria-hidden="true">${c === ' ' ? '&nbsp;' : c}</span>`
    ).join('');
    heroH1.setAttribute('aria-label', txt); // keep accessible label on the parent
}

// ── Mobile menu ──────────────────────────────────────────────────────────────
function toggleMenu(open) {
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
    mobileMenu.classList.toggle('open', open);
    mobileMenu.setAttribute('aria-hidden', !open);
    document.body.style.overflow = open ? 'hidden' : '';
}
hamburger.addEventListener('click', () => toggleMenu(!hamburger.classList.contains('open')));
document.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', () => toggleMenu(false)));

// ── Anchor navigation — no URL hash ─────────────────────────────────────────
// Intercept every #anchor click and use scrollIntoView instead. This prevents
// the browser from ever storing a hash in the URL, which it would then try to
// scroll to on the next page load — bypassing all our scroll-to-top fixes.
document.querySelectorAll('a[href^="#"]').forEach(link => {
    const id = link.getAttribute('href');
    if (id === '#') return;
    link.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(id);
        if (target) target.scrollIntoView({ behavior: prefersReducedMotion ? 'instant' : 'smooth' });
    });
});

// ── Active nav section ───────────────────────────────────────────────────────
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
        }
    });
}, { threshold: 0.3 });
document.querySelectorAll('#gallery, #about, #contact').forEach(s => sectionObserver.observe(s));

// ── Scroll reveal ───────────────────────────────────���────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

['.section-header h2', '.filters', '.about-image', '.about-text h2',
 '.about-text p', '#contact h2', '#contact > p', '.contact-email', '.social-links',
].forEach(sel => {
    document.querySelectorAll(sel).forEach(el => { el.classList.add('reveal'); revealObserver.observe(el); });
});

// ── Lazy-load fade-in + shimmer removal ─────────────────────────────────────
photoItems.forEach(item => {
    const img = item.querySelector('img');
    if (img) {
        img.decoding = 'async';
        const markLoaded = () => { img.classList.add('loaded'); item.classList.add('img-loaded'); };
        if (img.complete) {
            markLoaded();
        } else {
            img.addEventListener('load', markLoaded);
            img.addEventListener('error', markLoaded);
        }
    }
});

// ── Hover caption & reveal setup ─────────────────────────────────────────────
photoItems.forEach((item, i) => {
    // Caption
    const cap = document.createElement('span');
    cap.className = 'photo-cat';
    cap.textContent = catLabel(item.dataset.category);
    item.appendChild(cap);

    // Keyboard accessibility
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `View ${catLabel(item.dataset.category)} photo`);

    item.addEventListener('click', () => { lastFocusedItem = item; openLightbox(getVisible().indexOf(item)); });
    item.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            lastFocusedItem = item;
            openLightbox(getVisible().indexOf(item));
        }
    });

    // 3D tilt on hover (desktop only)
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !prefersReducedMotion) {
        item.addEventListener('mousemove', e => {
            if (!item.classList.contains('entered')) return;
            const r = item.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            item.style.transition = 'transform 0.08s ease-out';
            item.style.transform = `perspective(700px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
        });
        item.addEventListener('mouseleave', () => {
            if (!item.classList.contains('entered')) return;
            item.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
            item.style.transform = '';
            setTimeout(() => { item.style.transition = ''; }, 520);
        });
    }
});

// ── Gallery photo count ──────────────────────────────────────────────────────
function updatePhotoCount() {
    if (!photoCountEl) return;
    const n = [...photoItems].filter(item => !item.classList.contains('hidden')).length;
    photoCountEl.textContent = `${n} photo${n !== 1 ? 's' : ''}`;
}
updatePhotoCount();

// ── Gallery staggered entrance ───────────────────────────────────────────────
{
    let galleryEntered = false;
    const entranceObserver = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting || galleryEntered) return;
        galleryEntered = true;
        entranceObserver.disconnect();
        const items = [...photoItems].filter(i => !i.classList.contains('hidden'));
        items.forEach((item, i) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(36px) scale(0.97)';
            const delay = Math.min(i, 18) * 55;
            setTimeout(() => {
                item.style.transition = 'opacity 0.65s cubic-bezier(0.16,1,0.3,1), transform 0.65s cubic-bezier(0.16,1,0.3,1)';
                item.style.opacity = '1';
                item.style.transform = '';
                setTimeout(() => {
                    item.style.cssText = '';
                    item.classList.add('entered');
                }, 700);
            }, delay);
        });
    }, { threshold: 0.05 });
    if (!prefersReducedMotion) {
        const grid = document.getElementById('masonry-grid');
        if (grid) entranceObserver.observe(grid);
    } else {
        photoItems.forEach(item => item.classList.add('entered'));
    }
}

// ── Photo count badges on filter buttons ─────────────────────────────────────
filterBtns.forEach(btn => {
    const cat = btn.dataset.category;
    const n = cat === 'all' ? photoItems.length : [...photoItems].filter(i => i.dataset.category === cat).length;
    btn.innerHTML = `${btn.textContent} <span class="filter-count">${n}</span>`;
});

// ── Category filtering ───────────────────────────────────────────────────────
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        currentCategory = btn.dataset.category;
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (filterTimeout) clearTimeout(filterTimeout);

        const toHide = [...photoItems].filter(item =>
            !item.classList.contains('hidden') &&
            currentCategory !== 'all' && item.dataset.category !== currentCategory
        );
        const toShow = [...photoItems].filter(item => {
            if (!item.classList.contains('hidden')) return false;
            return currentCategory === 'all' || item.dataset.category === currentCategory;
        });

        toHide.forEach(item => {
            item.style.cssText = 'opacity:0;transform:scale(0.96);transition:opacity 0.18s ease,transform 0.18s ease;pointer-events:none;';
        });

        filterTimeout = setTimeout(() => {
            toHide.forEach(item => { item.classList.add('hidden'); item.style.cssText = ''; });
            toShow.forEach(item => {
                item.classList.remove('hidden');
                item.style.cssText = 'opacity:0;transform:scale(0.96);transition:opacity 0.28s ease,transform 0.28s ease;';
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    item.style.opacity = '1';
                    item.style.transform = '';
                    setTimeout(() => { item.style.cssText = ''; }, 300);
                }));
            });
            updatePhotoCount();
        }, 200);
    });
});

// ── Lightbox ─────────────────────────────────────────────────────────────────
function getVisible() {
    return [...photoItems].filter(item => !item.classList.contains('hidden'));
}

function preloadAdjacent(index) {
    const visible = getVisible();
    [-1, 1].forEach(d => {
        const src = visible[(index + d + visible.length) % visible.length]?.querySelector('img')?.src;
        if (src) { const img = new Image(); img.src = src; }
    });
}

function updateCounter() {
    const visible = getVisible();
    lightboxCounter.textContent = `${currentLbIndex + 1} / ${visible.length}`;
}

// Parse a human-readable shoot name from an image filename.
// "AmandaChen-Birthday-8thNov2025-21.jpg" → "Amanda Chen · Birthday"
// "Wasco-BlueRibbonRun-17thMay2026-8.jpg" → "Wasco · Blue Ribbon Run"
function captionFromSrc(src) {
    const MONTHS = /jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i;
    const file = decodeURIComponent((src || '').split('/').pop().replace(/\.[^.]+$/, ''));
    const labels = file.split('-')
        .filter(seg => seg && !/^\d+$/.test(seg) && !(/\d/.test(seg) && MONTHS.test(seg)))
        .map(p => p.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([A-Z]{2,})([A-Z][a-z])/g, '$1 $2').trim())
        .filter(Boolean);
    return labels.length ? labels.join(' · ') : null;
}

function setCaption(item) {
    if (!lightboxCaption) return;
    const src = item.querySelector('img')?.getAttribute('src') || '';
    const name = captionFromSrc(src);
    lightboxCaption.textContent = name || catLabel(item.dataset.category || '');
}

function openLightbox(index) {
    const visible = getVisible();
    currentLbIndex = index;
    const item = visible[currentLbIndex];
    lightboxImg.style.opacity = '';
    navigating = false;
    lightboxImg.src = item.querySelector('img').src;
    lightboxImg.classList.remove('zoomed');
    if (lightboxDownload) lightboxDownload.href = lightboxImg.src;
    setCaption(item);
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    updateCounter();
    preloadAdjacent(currentLbIndex);
}

function closeLightbox() {
    lightbox.classList.remove('active');
    lightboxImg.classList.remove('zoomed');
    document.body.style.overflow = '';
    if (lastFocusedItem) { lastFocusedItem.focus(); lastFocusedItem = null; }
}

function navigate(dir) {
    if (navigating) return;
    navigating = true;
    lightboxImg.style.opacity = '0';
    setTimeout(() => {
        const visible = getVisible();
        currentLbIndex = (currentLbIndex + dir + visible.length) % visible.length;
        lightboxImg.classList.remove('zoomed');
        const item = visible[currentLbIndex];
        lightboxImg.src = item.querySelector('img').src;
        if (lightboxDownload) lightboxDownload.href = lightboxImg.src;
        setCaption(item);
        updateCounter();
        preloadAdjacent(currentLbIndex);
        requestAnimationFrame(() => { lightboxImg.style.opacity = ''; navigating = false; });
    }, 200);
}

lightboxImg.addEventListener('click', () => lightboxImg.classList.toggle('zoomed'));
document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
document.querySelector('.lightbox-prev').addEventListener('click', () => navigate(-1));
document.querySelector('.lightbox-next').addEventListener('click', () => navigate(1));
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

lightbox.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend', e => {
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 40) navigate(delta < 0 ? 1 : -1);
}, { passive: true });

document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') navigate(1);
    if (e.key === 'ArrowLeft') navigate(-1);
});

// ── Hero parallax (scroll-driven depth) ──────────────────────────────────────
if (!prefersReducedMotion) {
    const heroSlides = document.querySelector('.hero-slides');
    const heroContent = document.querySelector('.hero-content');
    let heroTicking = false;

    function applyHeroParallax() {
        const y = window.scrollY;
        const vh = window.innerHeight;
        if (y > vh) { heroTicking = false; return; }   // skip once hero is off-screen
        const p = y / vh;                              // 0 → 1 across the first viewport
        if (heroSlides) heroSlides.style.transform = `scale(${1 + p * 0.12}) translateY(${y * 0.18}px)`;
        if (heroContent) {
            heroContent.style.transform = `translateY(${y * 0.4}px)`;
            heroContent.style.opacity = String(Math.max(0, 1 - p * 1.4));
        }
        heroTicking = false;
    }

    window.addEventListener('scroll', () => {
        if (!heroTicking) {
            heroTicking = true;
            requestAnimationFrame(applyHeroParallax);
        }
    }, { passive: true });
    applyHeroParallax();
}

