'use strict';

// Always start at top of page — instant scroll bypasses CSS smooth-scroll,
// replaceState strips any #hash so the browser doesn't auto-scroll to an anchor
if (history.scrollRestoration) history.scrollRestoration = 'manual';
if (location.hash) history.replaceState(null, '', location.pathname + location.search);
window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

// ── Constants & state ────────────────────────────────────────────────────────
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
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
    if (tcMeta) tcMeta.content = light ? '#f7f6f3' : '#0d0d0d';
}
setTheme(localStorage.getItem('theme') === 'light');
themeToggle.addEventListener('click', () => setTheme(!document.body.classList.contains('light-mode')));

// ── Hero slideshow ───────────────────────────────────────────────────────────
let currentSlide = 0;
setInterval(() => {
    heroSlides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % heroSlides.length;
    heroSlides[currentSlide].classList.add('active');
}, 5000);

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
 '.about-text p', '#contact h2', '#contact > p', '.social-links',
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
    cap.textContent = item.dataset.category;
    item.appendChild(cap);

    // Keyboard accessibility
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `View ${item.dataset.category} photo`);

    item.addEventListener('click', () => { lastFocusedItem = item; openLightbox(getVisible().indexOf(item)); });
    item.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            lastFocusedItem = item;
            openLightbox(getVisible().indexOf(item));
        }
    });
});

// ── Gallery photo count ──────────────────────────────────────────────────────
function updatePhotoCount() {
    if (!photoCountEl) return;
    const n = [...photoItems].filter(item => !item.classList.contains('hidden')).length;
    photoCountEl.textContent = `${n} photo${n !== 1 ? 's' : ''}`;
}
updatePhotoCount();

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

function setCaption(item) {
    if (!lightboxCaption) return;
    const cat = item.dataset.category || '';
    lightboxCaption.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
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

// ── Contact form ─────────────────────────────────────────────────────────────
contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = contactForm.querySelector('.form-submit');
    btn.disabled = true;
    btn.textContent = 'Sending…';
    formStatus.className = 'form-status';
    formStatus.textContent = '';
    try {
        const res = await fetch(contactForm.action, {
            method: 'POST', body: new FormData(contactForm), headers: { Accept: 'application/json' },
        });
        if (res.ok) {
            formStatus.className = 'form-status success';
            formStatus.textContent = "Message sent — I'll be in touch soon.";
            contactForm.reset();
        } else { throw new Error(); }
    } catch {
        formStatus.className = 'form-status error';
        formStatus.textContent = 'Something went wrong. Please try emailing directly.';
    } finally {
        btn.disabled = false;
        btn.textContent = 'Send Message';
    }
});
