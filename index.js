/* index.js - fixed for slideshow hero */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const hamburger    = $('#hamburger');
const mobileNav    = $('#mobileNav');
const backToTop    = $('#backToTop');
const form         = $('#contact-form');
const formStatus   = $('#form-status');
const yearEl       = $('#year');
const testimonialCards = $$('.testimonial-card');

// Set year
if (yearEl) yearEl.textContent = new Date().getFullYear();

// MOBILE NAV
function openMobile() {
  if (!mobileNav) return;
  mobileNav.classList.add('open');
  mobileNav.removeAttribute('inert');
  if (hamburger) hamburger.setAttribute('aria-expanded', 'true');
}
function closeMobileNav() {
  if (!mobileNav) return;
  mobileNav.classList.remove('open');
  mobileNav.setAttribute('inert', '');
  if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
}

if (hamburger && mobileNav) {
  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    mobileNav.classList.contains('open') ? closeMobileNav() : openMobile();
  });
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileNav));
  document.addEventListener('click', (e) => {
    if (mobileNav.classList.contains('open') && !mobileNav.contains(e.target) && !hamburger.contains(e.target)) {
      closeMobileNav();
    }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMobileNav(); });
}

// TESTIMONIALS fade in
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
  testimonialCards.forEach(c => c.classList.add('visible'));
}

// BACK TO TOP
window.addEventListener('scroll', () => {
  if (!backToTop) return;
  if (window.scrollY > 400) backToTop.classList.add('show');
  else backToTop.classList.remove('show');
});
if (backToTop) backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Success popup close
const successPopup  = document.getElementById('successPopup');
const successClose  = document.getElementById('successClose');
function closePopup() {
  if (!successPopup) return;
  successPopup.classList.remove('show');
  successPopup.setAttribute('aria-hidden', 'true');
}
if (successClose) successClose.addEventListener('click', closePopup);
if (successPopup) successPopup.addEventListener('click', (e) => {
  if (e.target === successPopup) closePopup();
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePopup(); });

// EMAILJS form
if (window.emailjs && form) {
  try { emailjs.init('ofP57XknSVvsvoCf2'); } catch(e) {}

  const timeInput = document.getElementById('time');
  if (timeInput) timeInput.value = new Date().toLocaleString();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const bot = form.querySelector('input[name="botfield"]');
    if (bot && bot.value) { formStatus.textContent = 'Message sent.'; return; }

    formStatus.style.color = 'var(--muted)';
    formStatus.textContent = 'Sending...';

    emailjs.sendForm('service_h3qbmx9', 'template_s4l5gle', form)
      .then(() => {
        form.reset();
        // Show success popup
        const popup = document.getElementById('successPopup');
        if (popup) {
          popup.setAttribute('aria-hidden', 'false');
          popup.classList.add('show');
          document.getElementById('successClose').focus();
        }
        if (formStatus) formStatus.textContent = '';
      }, (err) => {
        console.error('EmailJS error', err);
        if (formStatus) {
          formStatus.style.color = 'red';
          formStatus.textContent = 'Oops — something went wrong. Please try again later.';
        }
      });
  });
}