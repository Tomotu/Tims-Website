// Navbar scroll state
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// Lazy-load fade-in
document.querySelectorAll('.photo-item img').forEach(img => {
    if (img.complete) {
        img.classList.add('loaded');
    } else {
        img.addEventListener('load', () => img.classList.add('loaded'));
    }
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

let currentIndex = 0;

function getVisible() {
    return [...photoItems].filter(item => !item.classList.contains('hidden'));
}

function openLightbox(index) {
    const visible = getVisible();
    currentIndex = index;
    lightboxImg.src = visible[currentIndex].querySelector('img').src;
    lightboxImg.alt = visible[currentIndex].querySelector('img').alt;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

function navigate(dir) {
    const visible = getVisible();
    currentIndex = (currentIndex + dir + visible.length) % visible.length;
    lightboxImg.src = visible[currentIndex].querySelector('img').src;
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

document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') navigate(1);
    if (e.key === 'ArrowLeft') navigate(-1);
});
