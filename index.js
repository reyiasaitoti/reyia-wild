/* index.js — Samara Wild */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const hamburger        = $('#hamburger');
const mobileNav        = $('#mobileNav');
const backToTop        = $('#backToTop');
const form             = $('#contact-form');
const formStatus       = $('#form-status');
const testimonialCards = $$('.testimonial-card');
const heroHeader       = $('.site-header--hero');

if (heroHeader) {
  const updateHeroHeader = () => {
    heroHeader.classList.toggle('is-scrolled', window.scrollY > 20);
  };
  updateHeroHeader();
  window.addEventListener('scroll', updateHeroHeader, { passive: true });
}

// ── Hero Slideshow ────────────────────────────────────────
const heroSlides = $$('.hero-slide');
const heroDots   = $$('.hero-dot');
let currentSlide = 0;
let slideTimer;

function showSlide(index) {
  heroSlides.forEach(s => s.classList.remove('active'));
  heroDots.forEach(d => d.classList.remove('active'));
  heroSlides[index].classList.add('active');
  if (heroDots[index]) heroDots[index].classList.add('active');
  currentSlide = index;
}

function nextSlide() {
  showSlide((currentSlide + 1) % heroSlides.length);
}

function startSlideshow() {
  slideTimer = setInterval(nextSlide, 5000);
}

if (heroSlides.length) {
  heroDots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      showSlide(i);
      clearInterval(slideTimer);
      startSlideshow(); // reset timer so it doesn't jump right after a manual click
    });
  });
  startSlideshow();
}

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

// ── Contact Form — Google Apps Script ────────────────────
const GAS_URL = 'https://script.google.com/macros/s/AKfycbwu3dWRIcwc7h1wzzavGduaUMiWS6z2z6z6tXiOIAek3MpaXMgRXnZKNCm8E5XCqiM/exec';

if (form) {
  const timeInput = document.getElementById('time');
  if (timeInput) timeInput.value = new Date().toLocaleString();

  const arrivalDateInput = form.querySelector('[name="arrivalDate"]');
  const departureDateInput = form.querySelector('[name="departureDate"]');
  function localDateValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  arrivalDateInput.min = localDateValue(today);

  function updateDepartureDateMin() {
    const earliestDeparture = arrivalDateInput.value
      ? new Date(arrivalDateInput.value + 'T00:00:00')
      : today;
    earliestDeparture.setDate(earliestDeparture.getDate() + 1);
    departureDateInput.min = localDateValue(earliestDeparture);
    if (departureDateInput.value && departureDateInput.value < departureDateInput.min) {
      departureDateInput.value = '';
    }
  }
  arrivalDateInput.addEventListener('change', updateDepartureDateMin);
  updateDepartureDateMin();

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Honeypot bot check
    const bot = form.querySelector('input[name="botfield"]');
    if (bot && bot.value) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }
    if (formStatus) {
      formStatus.style.color = 'var(--muted)';
      formStatus.textContent = 'Sending…';
    }

    const tripDetails = [
      ['Phone / WhatsApp', form.querySelector('[name="phone"]').value.trim()],
      ['Number of guests', form.querySelector('[name="guests"]').value.trim()],
      ['Arrival date', form.querySelector('[name="arrivalDate"]').value],
      ['Departure date', form.querySelector('[name="departureDate"]').value],
      ['Destination', form.querySelector('[name="destination"]').value],
      ['Accommodation preference', form.querySelector('[name="accommodation"]').value]
    ].filter(function (detail) {
      return detail[1];
    }).map(function (detail) {
      return detail[0] + ': ' + detail[1];
    });
    const guestMessage = form.querySelector('[name="message"]').value.trim();
    const payload = {
      name:    form.querySelector('[name="name"]').value,
      email:   form.querySelector('[name="email"]').value,
      subject: form.querySelector('[name="subject"]').value || 'Safari Enquiry',
      message: guestMessage + (tripDetails.length ? '\n\nTrip details:\n' + tripDetails.join('\n') : ''),
      time:    new Date().toLocaleString()
    };

    fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
      .then(function (r) {
        if (!r.ok) throw new Error('Server error: ' + r.status);
        return r.json();
      })
      .then(function () {
        form.reset();
        if (timeInput) timeInput.value = new Date().toLocaleString();
        showPopup();
        if (formStatus) formStatus.textContent = '';
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send Message'; }
      })
      .catch(function (err) {
        console.error('Form error:', err);
        if (formStatus) {
          formStatus.style.color = 'red';
          formStatus.textContent = 'Something went wrong. Please WhatsApp or email us directly.';
        }
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send Message'; }
      });
  });
}