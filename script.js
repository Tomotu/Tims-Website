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
setTimeout(() => { scrollUnlocked = true; }, 1600);

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

// ── Cinematic intro ──────────────────────────────────────────────────────────
// Counter ticks 0→100 while the progress bar fills, then the two panels split
// apart to unveil the hero. The hero title's character reveal is fired the
// instant the curtain starts opening so the name animates in as it appears.
function revealHero() {
    document.body.classList.add('intro-done');
}

if (prefersReducedMotion) {
    // No counter, no curtain — just clear the cover.
    revealHero();
    preloader.classList.add('reveal');
    setTimeout(() => preloader.remove(), 600);
} else {
    const countNum = document.getElementById('pl-count-num');
    const barFill = document.querySelector('.pl-bar-fill');
    const DURATION = 1500;                 // counter run time
    const start = performance.now();

    (function tick(now) {
        const p = Math.min((now - start) / DURATION, 1);
        const eased = 1 - Math.pow(1 - p, 2);   // ease-out
        if (countNum) countNum.textContent = Math.round(eased * 100);
        if (barFill) barFill.style.transform = `scaleX(${eased})`;
        if (p < 1) {
            requestAnimationFrame(tick);
        } else {
            revealHero();                        // curtain opens → title flies in
            preloader.classList.add('reveal');
            const drop = () => preloader.remove();
            preloader.addEventListener('transitionend', e => {
                if (e.target.classList.contains('pl-bottom')) drop();
            });
            setTimeout(drop, 1400);              // safety net if transitionend misses
        }
    })(start);
}

// ── Copyright year ───────────────────────────────────────────────────────────
if (copyrightYear) copyrightYear.textContent = new Date().getFullYear();

// ── Unified scroll handler ────────────────────────────────────────────────────
// All scroll-driven effects register here; one rAF fires them all per frame.
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
    navbar.classList.toggle('scrolled', y > 60);
    backToTop.classList.toggle('visible', y > 400);
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollProgress) scrollProgress.style.width = `${(y / scrollable) * 100}%`;
});

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

['.section-header h2', '.filters', '.about-name', '.about-image',
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
        // Order the reveal by each item's on-screen position, not DOM order.
        // The masonry is a CSS `columns` layout, where DOM order runs straight
        // down the left column before moving to the next — so a DOM-order
        // stagger makes the whole left column appear first. Sorting by visual
        // top (then left) sweeps the reveal evenly top-to-bottom across every
        // column. Rows are bucketed so items roughly side-by-side reveal
        // together left-to-right rather than by sub-pixel height differences.
        const items = [...photoItems].filter(i => !i.classList.contains('hidden'));
        const measured = items
            .map(item => ({ item, rect: item.getBoundingClientRect() }))
            .sort((a, b) => {
                const rowA = Math.round(a.rect.top / 80);
                const rowB = Math.round(b.rect.top / 80);
                return rowA - rowB || a.rect.left - b.rect.left;
            });
        measured.forEach(({ item }, i) => {
            // Start fully masked from the bottom edge, then wipe upward to reveal.
            item.style.clipPath = 'inset(100% 0 0 0)';
            item.style.opacity = '0';
            item.style.transform = 'translateY(22px)';
            const delay = Math.min(i, 18) * 60;
            setTimeout(() => {
                item.style.transition = 'clip-path 0.85s cubic-bezier(0.16,1,0.3,1), opacity 0.6s ease, transform 0.85s cubic-bezier(0.16,1,0.3,1)';
                item.style.clipPath = 'inset(0% 0 0 0)';
                item.style.opacity = '1';
                item.style.transform = '';
                setTimeout(() => {
                    item.style.cssText = '';
                    item.classList.add('entered');
                }, 900);
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

        const toHide = [], toShow = [];
        const isAll = currentCategory === 'all';
        photoItems.forEach(item => {
            const hidden = item.classList.contains('hidden');
            const match = isAll || item.dataset.category === currentCategory;
            if (!hidden && !match) toHide.push(item);
            else if (hidden && match) toShow.push(item);
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

// ── Scrolling photo collage — 4 rows, scroll-driven parallax ────────────────
{
    const collageEl = document.getElementById('collage');
    if (collageEl) {
        const srcs = [...photoItems]
            .map(i => i.querySelector('img')?.getAttribute('src'))
            .filter(Boolean);

        const mid = Math.floor(srcs.length / 2);
        const orders = [
            srcs,
            [...srcs].reverse(),
            [...srcs.slice(mid), ...srcs.slice(0, mid)],
            [...srcs].reverse().slice(mid).concat([...srcs].reverse().slice(0, mid)),
        ];

        // dir: -1=left, +1=right; initX offsets right-moving rows so they start
        // with images visible (not blank space) at scrollY=0
        const configs = [
            { dir: -1, speed: 0.12, initX: 0 },
            { dir: +1, speed: 0.16, initX: -4000 },
            { dir: -1, speed: 0.10, initX: 0 },
            { dir: +1, speed: 0.14, initX: -6000 },
        ];

        const rows = [];
        orders.forEach((imgSrcs, ri) => {
            const row = document.createElement('div');
            row.className = 'collage-row';
            [...imgSrcs, ...imgSrcs].forEach(src => {
                const img = document.createElement('img');
                img.src = src;
                img.loading = 'lazy';
                img.decoding = 'async';
                img.alt = '';
                row.appendChild(img);
            });
            collageEl.appendChild(row);
            rows.push({ el: row, cfg: configs[ri] });
        });

        if (!prefersReducedMotion) {
            function applyCollageScroll() {
                const sy = window.scrollY;
                rows.forEach(({ el, cfg }) => {
                    el.style.transform = `translateX(${cfg.initX + cfg.dir * sy * cfg.speed}px)`;
                });
            }
            scrollFns.push(applyCollageScroll);
            applyCollageScroll();
        }
    }
}

// ── Hero parallax (scroll-driven depth) ──────────────────────────────────────
if (!prefersReducedMotion) {
    const heroSlidesEl = document.querySelector('.hero-slides');
    const heroContent = document.querySelector('.hero-content');

    function applyHeroParallax() {
        const y = window.scrollY;
        const vh = window.innerHeight;
        if (y > vh) return;
        const p = y / vh;
        if (heroSlidesEl) heroSlidesEl.style.transform = `scale(${1 + p * 0.12}) translateY(${y * 0.18}px)`;
        if (heroContent) {
            heroContent.style.transform = `translateY(${y * 0.4}px)`;
            heroContent.style.opacity = String(Math.max(0, 1 - p * 1.4));
        }
    }

    scrollFns.push(applyHeroParallax);
    applyHeroParallax();
}

// ── Mobile category carousels ─────────────────────────────────────────────────
// Infinite-looping carousel per category. Uses the clone technique:
// a clone of the last real slide is prepended, and a clone of the first is
// appended. The carousel starts at position 1 (the real first slide). When
// it slides into a clone position it instantly jumps to the corresponding
// real slide — making the loop invisible. Both neighbours always peek in.
if (window.matchMedia('(max-width: 640px)').matches) {
    const mobGallery = document.getElementById('mobile-gallery');
    if (mobGallery) {
        const CATS = ['portraits', 'corporate', 'sports', 'events'];

        CATS.forEach(cat => {
            const items = [...photoItems].filter(i => i.dataset.category === cat);
            if (!items.length) return;

            const section = document.createElement('div');
            section.className = 'mob-cat-section';

            const label = document.createElement('h3');
            label.className = 'mob-cat-label';
            label.textContent = catLabel(cat);
            section.appendChild(label);

            const carousel = document.createElement('div');
            carousel.className = 'mob-carousel';

            const wrap = document.createElement('div');
            wrap.className = 'mob-track-wrap';

            const track = document.createElement('div');
            track.className = 'mob-track';

            function makeSlide(item) {
                const srcImg = item.querySelector('img');
                const slide = document.createElement('div');
                slide.className = 'mob-slide';
                const img = document.createElement('img');
                img.src = srcImg ? srcImg.src : '';
                img.alt = srcImg ? srcImg.alt : '';
                img.loading = 'lazy';
                img.decoding = 'async';
                slide.appendChild(img);
                return slide;
            }

            // Clone last + real slides + clone first → enables infinite loop
            const cloneFirst = makeSlide(items[0]);
            const cloneLast  = makeSlide(items[items.length - 1]);
            cloneLast.dataset.clone = 'last';
            cloneFirst.dataset.clone = 'first';
            track.appendChild(cloneLast);
            items.forEach((item, i) => {
                const slide = makeSlide(item);
                // Click opens lightbox for this item
                slide.addEventListener('click', () => {
                    lastFocusedItem = item;
                    openLightbox(getVisible().indexOf(item));
                });
                track.appendChild(slide);
            });
            track.appendChild(cloneFirst);

            wrap.appendChild(track);
            carousel.appendChild(wrap);

            // Arrows
            const prevBtn = document.createElement('button');
            prevBtn.className = 'mob-arrow prev';
            prevBtn.setAttribute('aria-label', 'Previous');
            prevBtn.textContent = '‹';

            const nextBtn = document.createElement('button');
            nextBtn.className = 'mob-arrow next';
            nextBtn.setAttribute('aria-label', 'Next');
            nextBtn.textContent = '›';

            carousel.appendChild(prevBtn);
            carousel.appendChild(nextBtn);

            // Dots (one per real slide)
            const dotsEl = document.createElement('div');
            dotsEl.className = 'mob-dots';
            items.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.className = 'mob-dot' + (i === 0 ? ' active' : '');
                dot.setAttribute('aria-label', `Go to photo ${i + 1}`);
                dotsEl.appendChild(dot);
            });
            carousel.appendChild(dotsEl);

            section.appendChild(carousel);
            mobGallery.appendChild(section);

            // State: current is 1-based index into the full track (0=clone-last, 1..n=real, n+1=clone-first)
            const allSlides = [...track.querySelectorAll('.mob-slide')];
            const dots = [...dotsEl.querySelectorAll('.mob-dot')];
            const realCount = items.length;
            let current = 1;   // start at real first slide
            let transitioning = false;

            function slideW() { return allSlides[0].offsetWidth + 10; }  // width + gap

            function setPos(idx, animate) {
                track.style.transition = animate
                    ? 'transform 0.42s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                    : 'none';
                track.style.transform = `translateX(${-idx * slideW()}px)`;
            }

            function syncDots(realIdx) {
                dots.forEach((d, i) => d.classList.toggle('active', i === realIdx));
            }

            function syncActive(idx) {
                allSlides.forEach((s, i) => s.classList.toggle('active', i === idx));
                // dot index is 0-based real index = current - 1
                syncDots(idx - 1);
            }

            // Initialize without animation
            setPos(current, false);
            syncActive(current);

            function goTo(idx) {
                if (transitioning) return;
                transitioning = true;
                current = idx;
                syncActive(current);
                setPos(current, true);
            }

            // After transition: if we landed on a clone, jump instantly to real counterpart
            track.addEventListener('transitionend', () => {
                transitioning = false;
                if (current === 0) {
                    // Clone-last → jump to real last
                    current = realCount;
                    setPos(current, false);
                    syncActive(current);
                } else if (current === realCount + 1) {
                    // Clone-first → jump to real first
                    current = 1;
                    setPos(current, false);
                    syncActive(current);
                }
            });

            prevBtn.addEventListener('click', () => goTo(current - 1));
            nextBtn.addEventListener('click', () => goTo(current + 1));
            dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i + 1)));

            // Touch / swipe
            let tx0 = 0;
            track.addEventListener('touchstart', e => { tx0 = e.touches[0].clientX; }, { passive: true });
            track.addEventListener('touchend', e => {
                const dx = e.changedTouches[0].clientX - tx0;
                if (Math.abs(dx) > 40) goTo(dx < 0 ? current + 1 : current - 1);
            }, { passive: true });
        });
    }
}

