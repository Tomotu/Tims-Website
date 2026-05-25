// Scroll-triggered reveal
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

// Reveal section elements
[
    '.section-header h2',
    '.filters',
    '.about-image',
    '.about-text h2',
    '.about-text p',
    '#contact h2',
    '#contact > p',
    '.contact-email',
    '.social-links',
].forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
        el.classList.add('reveal');
        revealObserver.observe(el);
    });
});

// Stagger photo items by column (3-col layout)
document.querySelectorAll('.photo-item').forEach((item, i) => {
    item.classList.add('reveal');
    item.style.transitionDelay = `${(i % 3) * 80}ms`;
    revealObserver.observe(item);
});

// Mobile menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

function toggleMenu(open) {
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
    mobileMenu.classList.toggle('open', open);
    mobileMenu.setAttribute('aria-hidden', !open);
    document.body.style.overflow = open ? 'hidden' : '';
}

hamburger.addEventListener('click', () => {
    toggleMenu(!hamburger.classList.contains('open'));
});

document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
});

// Active nav link on scroll
const navLinks = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach(a => {
                a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
            });
        }
    });
}, { threshold: 0.3 });

document.querySelectorAll('#gallery, #about, #contact').forEach(s => sectionObserver.observe(s));

// Back to top
const backToTop = document.getElementById('back-to-top');
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Navbar scroll state
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
    backToTop.classList.toggle('visible', window.scrollY > 400);
}, { passive: true });

// Lazy-load fade-in
document.querySelectorAll('.photo-item img').forEach(img => {
    if (img.complete) {
        img.classList.add('loaded');
    } else {
        img.addEventListener('load', () => img.classList.add('loaded'));
    }
});

// Photo count badges on filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
    const category = btn.dataset.category;
    const count = category === 'all'
        ? photoItems.length
        : [...photoItems].filter(item => item.dataset.category === category).length;
    btn.innerHTML = `${btn.textContent} <span class="filter-count">${count}</span>`;
});

// Category filtering
const filterBtns = document.querySelectorAll('.filter-btn');
const photoItems = document.querySelectorAll('.photo-item');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const category = btn.dataset.category;

        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        photoItems.forEach(item => {
            const matches = category === 'all' || item.dataset.category === category;
            item.classList.toggle('hidden', !matches);
        });
    });
});

// Lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCounter = document.getElementById('lightbox-counter');

let currentIndex = 0;

function getVisible() {
    return [...photoItems].filter(item => !item.classList.contains('hidden'));
}

function updateCounter() {
    const visible = getVisible();
    lightboxCounter.textContent = `${currentIndex + 1} / ${visible.length}`;
}

function openLightbox(index) {
    const visible = getVisible();
    currentIndex = index;
    lightboxImg.src = visible[currentIndex].querySelector('img').src;
    lightboxImg.alt = visible[currentIndex].querySelector('img').alt;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    updateCounter();
}

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

function navigate(dir) {
    const visible = getVisible();
    currentIndex = (currentIndex + dir + visible.length) % visible.length;
    lightboxImg.src = visible[currentIndex].querySelector('img').src;
    updateCounter();
}

photoItems.forEach(item => {
    item.addEventListener('click', () => {
        const visible = getVisible();
        openLightbox(visible.indexOf(item));
    });
});

document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
document.querySelector('.lightbox-prev').addEventListener('click', () => navigate(-1));
document.querySelector('.lightbox-next').addEventListener('click', () => navigate(1));

lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
});

// Lightbox swipe gestures
let touchStartX = 0;

lightbox.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].clientX;
}, { passive: true });

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
