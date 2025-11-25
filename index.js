/* index.js - polished, safe, performant */

// Safe element getters
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const hamburger = $('#hamburger');
const mobileNav = $('#mobileNav');
const closeMobile = $('#closeMobile');
const bookBtn = $('#bookBtn');
const mobileBook = $('#mobileBook');
const heroVideo = $('#heroVideo');
const heroPoster = document.querySelector('.hero-poster');
const heroContent = document.querySelector('.hero-content');
const ceoVideo = $('#ceoVideo');
const soundBtn = $('#soundBtn');
const backToTop = $('#backToTop');
const form = $('#contact-form');
const formStatus = $('#form-status');
const yearEl = $('#year');
const testimonialCards = $$('.testimonial-card');

// Set year
if (yearEl) yearEl.textContent = new Date().getFullYear();

// MOBILE NAV toggle with ARIA
function openMobile() {
  if (!mobileNav) return;
  mobileNav.classList.add('open');
  mobileNav.setAttribute('aria-hidden', 'false');
  if (hamburger) hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}
function closeMobileNav() {
  if (!mobileNav) return;
  mobileNav.classList.remove('open');
  mobileNav.setAttribute('aria-hidden', 'true');
  if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

if (hamburger && mobileNav && closeMobile) {
  hamburger.addEventListener('click', openMobile);
  closeMobile.addEventListener('click', closeMobileNav);
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileNav));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMobileNav(); });
}

// Booking buttons: scroll to contact or open mail
const defaultBook = () => {
  const contact = $('#contact');
  if (contact) {
    contact.scrollIntoView({ behavior: 'smooth', block: 'start' });
    closeMobileNav();
  } else {
    window.location.href = 'mailto:info@reyiawildsafaris.com?subject=Booking%20Inquiry';
  }
};
if (bookBtn) bookBtn.addEventListener('click', defaultBook);
if (mobileBook) mobileBook.addEventListener('click', defaultBook);

// HERO video fade in (play only when available)
document.addEventListener('DOMContentLoaded', () => {
  if (heroVideo && heroPoster) {
    // Try play; keep poster visible until video can play through
    const tryPlay = async () => {
      try {
        await heroVideo.play();
        // Give a slight fade to avoid janky swap
        heroVideo.style.opacity = '0';
        requestAnimationFrame(() => {
          heroVideo.style.opacity = '1';
          heroPoster.style.opacity = '0';
        });
      } catch (err) {
        // Autoplay blocked - keep poster visible
        heroVideo.style.opacity = '0';
        heroPoster.style.opacity = '1';
      }
    };
    // small delay to let resources settle
    setTimeout(tryPlay, 600);
  }

  // small parallax with rAF and throttling
  let lastY = 0, ticking = false;
  window.addEventListener('scroll', () => {
    lastY = window.scrollY;
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (heroContent) heroContent.style.transform = `translateY(${lastY * 0.18}px)`;
        ticking = false;
      });
      ticking = true;
    }
  });
});

window.addEventListener('load', () => {
  const grid = document.querySelector('.gallery-grid');
  if (!grid) return; // no grid on this page — skip masonry sizing

  const style = window.getComputedStyle(grid);
  const rowHeight = parseInt(style.getPropertyValue('grid-auto-rows')) || 0;
  const rowGap = parseInt(style.getPropertyValue('gap')) || 0;
  if (!rowHeight) return; // defensive: avoid division by zero or invalid calculations

  grid.querySelectorAll('.gallery-item img').forEach(img => {
    const imgHeight = img.getBoundingClientRect().height;
    const rowSpan = Math.ceil((imgHeight + rowGap) / (rowHeight + rowGap));
    img.style.setProperty('--span', rowSpan);
  });
});


// CEO video: play when in view (IntersectionObserver) + sound toggle
if (ceoVideo) {
  // Play video when it comes into view
  if ('IntersectionObserver' in window) {
    const videoObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          ceoVideo.play().catch(() => { /* autoplay might be blocked, user can click */ });
        } else {
          ceoVideo.pause();
        }
      });
    }, { threshold: 0.5 });
    videoObs.observe(ceoVideo);
  } else {
    // fallback: try play on load
    ceoVideo.play().catch(() => { /* silent fail */ });
  }
}

// CEO video sound toggle
if (soundBtn && ceoVideo) {
  soundBtn.addEventListener('click', () => {
    const isMuted = ceoVideo.muted;
    ceoVideo.muted = !isMuted;
    soundBtn.textContent = ceoVideo.muted ? '🔊 Play Sound' : '🔇 Mute';
    soundBtn.setAttribute('aria-pressed', String(!ceoVideo.muted));
    // ensure video is playing after mute toggle
    if (!ceoVideo.paused === false) { ceoVideo.play().catch(() => { /* autoplay blocked */ }); }
    // small feedback
    soundBtn.classList.add('clicked');
    setTimeout(()=>soundBtn.classList.remove('clicked'), 150);
  });
}

// IntersectionObserver for testimonials
if ('IntersectionObserver' in window && testimonialCards.length) {
  const obs = new IntersectionObserver((entries, o) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        o.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  testimonialCards.forEach(c => obs.observe(c));
} else {
  // fallback: show them all
  testimonialCards.forEach(c => c.classList.add('visible'));
}

// Back-to-top
window.addEventListener('scroll', () => {
  if (!backToTop) return;
  if (window.scrollY > 400) backToTop.classList.add('show');
  else backToTop.classList.remove('show');
});
if (backToTop) backToTop.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));

// EMAILJS form handling (replace PUBLIC_KEY and template/service ids)
if (window.emailjs && form) {
  // replace with your public key
  try { emailjs.init('YOUR_EMAILJS_PUBLIC_KEY'); } catch(e){ /* already init or offline */ }

  // set time
  const timeInput = document.getElementById('time');
  if (timeInput) timeInput.value = new Date().toLocaleString();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // honeypot
    const bot = form.querySelector('input[name="botfield"]');
    if (bot && bot.value) {
      // silently fail (spam)
      formStatus.textContent = 'Message sent.';
      return;
    }

    // UX: loading
    formStatus.style.color = 'var(--muted)';
    formStatus.textContent = 'Sending...';

    emailjs.sendForm('SERVICE_ID', 'TEMPLATE_ID', form)
      .then(() => {
        formStatus.style.color = 'var(--brand)';
        formStatus.textContent = 'Thank you — your message has been sent.';
        form.reset();
      }, (err) => {
        console.error('EmailJS error', err);
        formStatus.style.color = 'red';
        formStatus.textContent = 'Oops — something went wrong. Please try again later.';
      });
  });
}

// small accessibility: focus trap for mobile nav (basic)
(function addFocusManagement(){
  if (!($('#mobileNav'))) return;
  const focusable = 'a,button,input,textarea';
  const mobile = $('#mobileNav');
  mobile.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && mobile.classList.contains('open')) {
      const nodes = Array.from(mobile.querySelectorAll(focusable)).filter(n => n.offsetParent !== null);
      if (!nodes.length) return;
      const first = nodes[0], last = nodes[nodes.length-1];
      if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
    }
  });
})();
