/* index.js — SaitotiMaraSafaris */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const hamburger        = $('#hamburger');
const mobileNav        = $('#mobileNav');
const backToTop        = $('#backToTop');
const form             = $('#contact-form');
const formStatus       = $('#form-status');
const yearEl           = $('#year');
const testimonialCards = $$('.testimonial-card');

// ── Year ──────────────────────────────────────────────────
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ── Mobile Nav ────────────────────────────────────────────
function openMobileNav() {
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
    mobileNav.classList.contains('open') ? closeMobileNav() : openMobileNav();
  });
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileNav));
  document.addEventListener('click', (e) => {
    if (mobileNav.classList.contains('open') && !mobileNav.contains(e.target) && !hamburger.contains(e.target)) {
      closeMobileNav();
    }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMobileNav(); });
}

// ── Testimonials fade-in ──────────────────────────────────
if ('IntersectionObserver' in window && testimonialCards.length) {
  const obs = new IntersectionObserver((entries, o) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); o.unobserve(e.target); }
    });
  }, { threshold: 0.2 });
  testimonialCards.forEach(c => obs.observe(c));
} else {
  testimonialCards.forEach(c => c.classList.add('visible'));
}

// ── Back to Top ───────────────────────────────────────────
window.addEventListener('scroll', () => {
  if (!backToTop) return;
  window.scrollY > 400 ? backToTop.classList.add('show') : backToTop.classList.remove('show');
});
if (backToTop) backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ── Success Popup ─────────────────────────────────────────
const successPopup = document.getElementById('successPopup');
const successClose = document.getElementById('successClose');

function showPopup() {
  if (!successPopup) return;
  successPopup.setAttribute('aria-hidden', 'false');
  successPopup.classList.add('show');
  if (successClose) successClose.focus();
}
function closePopup() {
  if (!successPopup) return;
  successPopup.classList.remove('show');
  successPopup.setAttribute('aria-hidden', 'true');
}
if (successClose) successClose.addEventListener('click', closePopup);
if (successPopup) successPopup.addEventListener('click', (e) => { if (e.target === successPopup) closePopup(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePopup(); });

// ── EmailJS Contact Form ──────────────────────────────────
window.addEventListener('load', function () {

  if (typeof emailjs === 'undefined') {
    console.warn('EmailJS did not load.');
    return;
  }

  emailjs.init('ofP57XknSVvsvoCf2');

  if (!form) return;

  const timeInput = document.getElementById('time');
  if (timeInput) timeInput.value = new Date().toLocaleString();

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Honeypot bot check
    const bot = form.querySelector('input[name="botfield"]');
    if (bot && bot.value) return;

    // Disable button while sending
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }
    if (formStatus) {
      formStatus.style.color = 'var(--muted)';
      formStatus.textContent = 'Sending…';
    }

    // Collect form data
    const templateParams = {
      name:    form.querySelector('[name="name"]').value,
      email:   form.querySelector('[name="email"]').value,
      subject: form.querySelector('[name="subject"]').value || 'Safari Enquiry',
      message: form.querySelector('[name="message"]').value,
      time:    new Date().toLocaleString()
    };

    // Send both templates simultaneously
    Promise.all([
      // Template 1 — notification to you
      emailjs.send('service_h3qbmx9', 'template_s4l5gle', templateParams),
      // Template 2 — branded auto-reply to guest
      emailjs.send('service_h3qbmx9', 'template_zott6n7', templateParams)
    ])
      .then(function () {
        form.reset();
        if (timeInput) timeInput.value = new Date().toLocaleString();
        showPopup();
        if (formStatus) formStatus.textContent = '';
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send Message'; }
      })
      .catch(function (err) {
        console.error('EmailJS error:', err);
        if (formStatus) {
          formStatus.style.color = 'red';
          formStatus.textContent = 'Something went wrong. Please WhatsApp or email us directly.';
        }
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send Message'; }
      });
  });
});