/* ============================================================
   MAISON LUMIÈRE — MAIN SCRIPT
   ============================================================ */

'use strict';

/* ── 1. STICKY HEADER ─────────────────────────────────────── */
const header = document.getElementById('site-header');
const onScroll = () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ── 2. MOBILE NAV TOGGLE ─────────────────────────────────── */
const navToggle = document.getElementById('nav-toggle');
const navLinks  = document.getElementById('nav-links');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
  // Animate hamburger → X
  const spans = navToggle.querySelectorAll('span');
  if (isOpen) {
    spans[0].style.cssText = 'transform: translateY(7px) rotate(45deg)';
    spans[1].style.cssText = 'opacity: 0; transform: scaleX(0)';
    spans[2].style.cssText = 'transform: translateY(-7px) rotate(-45deg)';
  } else {
    spans.forEach(s => (s.style.cssText = ''));
  }
});

// Close nav on link click
navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.querySelectorAll('span').forEach(s => (s.style.cssText = ''));
  });
});

/* ── 3. SMOOTH ACTIVE NAV HIGHLIGHT ──────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-link:not(.nav-cta)');

const sectionObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navItems.forEach(a => {
          a.classList.toggle(
            'active',
            a.getAttribute('href') === '#' + entry.target.id
          );
        });
      }
    });
  },
  { rootMargin: '-40% 0px -55% 0px' }
);

sections.forEach(s => sectionObserver.observe(s));

/* ── 4. SERVICES TABS ─────────────────────────────────────── */
const tabBtns     = document.querySelectorAll('.tab-btn');
const serviceCards = document.querySelectorAll('.service-card');

function filterServices(category) {
  serviceCards.forEach(card => {
    const match = category === 'all' || card.dataset.category === category;
    card.classList.toggle('hidden', !match);
    if (match) {
      // Stagger reveal
      card.style.animation = 'none';
      requestAnimationFrame(() => {
        card.style.animation = '';
        card.style.animationName = 'fadeUp';
        card.style.animationDuration = '0.4s';
        card.style.animationFillMode = 'both';
      });
    }
  });
}

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filterServices(btn.dataset.tab);
  });
});

// Show only 'hair' cards on load
filterServices('hair');

/* ── 5. GALLERY LIGHTBOX ─────────────────────────────────── */
const galleryItems   = document.querySelectorAll('.gallery-item');
const lightbox       = document.getElementById('lightbox');
const lightboxContent = document.getElementById('lightbox-content');
const lightboxClose  = document.getElementById('lightbox-close');
const lightboxPrev   = document.getElementById('lightbox-prev');
const lightboxNext   = document.getElementById('lightbox-next');

let currentLightboxIndex = 0;

// Collect gallery image info
const galleryData = Array.from(galleryItems).map(item => {
  const img = item.querySelector('.gallery-img');
  const caption = item.querySelector('.gallery-caption').textContent.trim();
  return { style: img.className, caption };
});

function openLightbox(index) {
  currentLightboxIndex = index;
  renderLightbox();
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

function renderLightbox() {
  const data = galleryData[currentLightboxIndex];
  lightboxContent.innerHTML = `
    <div class="${data.style}" style="width:100%;height:100%;border-radius:4px;"></div>
  `;
}

galleryItems.forEach((item, i) => {
  item.addEventListener('click', () => openLightbox(i));
  item.setAttribute('tabindex', '0');
  item.setAttribute('role', 'button');
  item.setAttribute('aria-label', `View ${item.querySelector('.gallery-caption').textContent}`);
  item.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') openLightbox(i);
  });
});

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

lightboxPrev.addEventListener('click', () => {
  currentLightboxIndex = (currentLightboxIndex - 1 + galleryData.length) % galleryData.length;
  renderLightbox();
});
lightboxNext.addEventListener('click', () => {
  currentLightboxIndex = (currentLightboxIndex + 1) % galleryData.length;
  renderLightbox();
});

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')  { currentLightboxIndex = (currentLightboxIndex - 1 + galleryData.length) % galleryData.length; renderLightbox(); }
  if (e.key === 'ArrowRight') { currentLightboxIndex = (currentLightboxIndex + 1) % galleryData.length; renderLightbox(); }
});

/* ── 6. TESTIMONIALS CAROUSEL ─────────────────────────────── */
const track      = document.getElementById('testimonials-track');
const dotsContainer = document.getElementById('carousel-dots');
const prevBtn    = document.getElementById('carousel-prev');
const nextBtn    = document.getElementById('carousel-next');
const cards      = document.querySelectorAll('.testimonial-card');

let currentSlide = 0;
let slidesPerView = getSlidesPerView();
let autoplayTimer;

function getSlidesPerView() {
  if (window.innerWidth <= 768) return 1;
  if (window.innerWidth <= 1024) return 2;
  return 3;
}

function totalSlides() {
  return Math.ceil(cards.length / slidesPerView);
}

function buildDots() {
  dotsContainer.innerHTML = '';
  for (let i = 0; i < totalSlides(); i++) {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  }
}

function updateDots() {
  document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentSlide);
  });
}

function goToSlide(index) {
  currentSlide = Math.max(0, Math.min(index, totalSlides() - 1));
  const cardWidth = cards[0].offsetWidth + 28; // gap = 28px
  const offset = currentSlide * slidesPerView * cardWidth;
  track.style.transform = `translateX(-${offset}px)`;
  updateDots();
}

prevBtn.addEventListener('click', () => { goToSlide(currentSlide - 1); resetAutoplay(); });
nextBtn.addEventListener('click', () => { goToSlide(currentSlide + 1); resetAutoplay(); });

function startAutoplay() {
  autoplayTimer = setInterval(() => {
    const next = (currentSlide + 1) % totalSlides();
    goToSlide(next);
  }, 5000);
}

function resetAutoplay() {
  clearInterval(autoplayTimer);
  startAutoplay();
}

// Init carousel
buildDots();
startAutoplay();

// Recalculate on resize
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    slidesPerView = getSlidesPerView();
    currentSlide = 0;
    buildDots();
    goToSlide(0);
  }, 250);
});

// Touch/swipe support for carousel
let touchStartX = 0;
track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
track.addEventListener('touchend', e => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 40) {
    if (diff > 0) goToSlide(currentSlide + 1);
    else goToSlide(currentSlide - 1);
    resetAutoplay();
  }
});

/* ── 7. BOOKING FORM + SLOT PICKER ────────────────────────── */
/* ── 8. SCROLL REVEAL ANIMATIONS ─────────────────────────── */
const revealEls = document.querySelectorAll(
  '.service-card, .team-card, .testimonial-card, .gallery-item, .booking-wrapper, .section-header'
);

revealEls.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger children of a grid
        const delay = entry.target.dataset.delay || 0;
        entry.target.style.transitionDelay = delay + 'ms';
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

// Add staggered delays to grid children
document.querySelectorAll('.services-grid, .team-grid, .gallery-grid').forEach(grid => {
  Array.from(grid.children).forEach((child, i) => {
    child.dataset.delay = (i % 4) * 80;
  });
});

revealEls.forEach(el => revealObserver.observe(el));

/* ── 9. HERO PARALLAX (subtle) ────────────────────────────── */
const hero = document.querySelector('.hero');
window.addEventListener('scroll', () => {
  if (window.scrollY < window.innerHeight) {
    hero.style.setProperty('--parallax', `${window.scrollY * 0.25}px`);
  }
}, { passive: true });


/* ── 10. PROMO BANNER ─────────────────────────────────────── */
const promoBanner = document.getElementById('promo-banner');
const promoClose  = document.getElementById('promo-close');

promoClose.addEventListener('click', () => {
  promoBanner.classList.add('hidden');
  header.classList.add('banner-gone');
  sessionStorage.setItem('promo-closed', '1');
});

// Restore closed state within session
if (sessionStorage.getItem('promo-closed')) {
  promoBanner.classList.add('hidden');
  header.classList.add('banner-gone');
}

/* ── 11. STATS COUNTER ────────────────────────────────────── */
const statItems = document.querySelectorAll('.stat-item');

function animateCounter(el, target, duration = 1800) {
  let start = 0;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString();
  };
  requestAnimationFrame(step);
}

const statsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const item = entry.target;
      const target = parseInt(item.dataset.target, 10);
      const idx = Array.from(statItems).indexOf(item);
      const numEl = document.getElementById('stat-' + idx);
      if (numEl) animateCounter(numEl, target);
      statsObserver.unobserve(item);
    }
  });
}, { threshold: 0.4 });

statItems.forEach(item => statsObserver.observe(item));

/* ── 12. BEFORE / AFTER SLIDER ────────────────────────────── */
document.querySelectorAll('.ba-slider-wrap').forEach(wrap => {
  const before  = wrap.querySelector('.ba-before');
  const handle  = wrap.querySelector('.ba-handle');
  const range   = wrap.querySelector('.ba-range');

  function update(val) {
    const pct = 100 - val; // clip right side of "before"
    before.style.clipPath = `inset(0 ${pct}% 0 0)`;
    handle.style.left = val + '%';
  }

  range.addEventListener('input', () => update(range.value));
  // Touch drag fallback for better mobile feel
  update(50);
});

/* ── 13. FAQ ACCORDION ────────────────────────────────────── */
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const answer   = btn.nextElementSibling;
    const isOpen   = btn.getAttribute('aria-expanded') === 'true';

    // Close all others
    document.querySelectorAll('.faq-question').forEach(other => {
      other.setAttribute('aria-expanded', 'false');
      other.nextElementSibling.classList.remove('open');
    });

    // Toggle current
    if (!isOpen) {
      btn.setAttribute('aria-expanded', 'true');
      answer.classList.add('open');
    }
  });
});

/* ── 14. FLOATING BOOK CTA ─────────────────────────────────── */
const floatCta = document.getElementById('float-cta');
const heroSection = document.querySelector('.hero');

window.addEventListener('scroll', () => {
  const heroBottom = heroSection.getBoundingClientRect().bottom;
  floatCta.classList.toggle('visible', heroBottom < 0);
}, { passive: true });


/* ── 15 & 16 removed ─────────────────────────────────────── */
