const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');
const closeMobile = document.getElementById('closeMobile');
const bookBtn = document.getElementById('bookBtn');
const mobileBook = document.getElementById('mobileBook');

function openMobile() {
  mobileNav.style.display = 'block';
  hamburger.setAttribute('aria-expanded', 'true');
  mobileNav.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeMobileNav() {
  mobileNav.style.display = 'none';
  hamburger.setAttribute('aria-expanded', 'false');
  mobileNav.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', openMobile);
closeMobile.addEventListener('click', closeMobileNav);
mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileNav));

const defaultBook = () => {
  const contact = document.querySelector('#contact');
  if (contact) {
    contact.scrollIntoView({ behavior: 'smooth', block: 'start' });
    closeMobileNav();
  } else {
    window.location.href = 'mailto:info@reyiawildsafaris.com?subject=Booking%20Inquiry';
  }
};
bookBtn.addEventListener('click', defaultBook);
mobileBook.addEventListener('click', defaultBook);

document.addEventListener('keydown', e => { 
  if (e.key === 'Escape') closeMobileNav(); 
});

// Auto-update footer year
document.getElementById('year').textContent = new Date().getFullYear();


// Fade-in effect for testimonials
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
});

document.querySelectorAll('.testimonial-card').forEach(card => {
  observer.observe(card);
});

// Back-to-top button
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  if (window.scrollY > 400) {
    backToTop.style.display = 'flex';
  } else {
    backToTop.style.display = 'none';
  }
});

backToTop.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

 // Initialize EmailJS with your public key
  emailjs.init("ofP57XknSVvsvoCf2"); // Replace with your EmailJS public key

  const form = document.getElementById("contact-form");
  document.getElementById("time").value = new Date().toLocaleString();
  const statusMsg = document.getElementById("form-status");

  form.addEventListener("submit", function(e) {
    e.preventDefault(); // Prevent default form submission

    emailjs.sendForm('service_h3qbmx9', 'template_s4l5gle', this) // Replace with your IDs
      .then(function() {
        statusMsg.textContent = "Thank you! Your message has been sent.";
        form.reset();
      }, function(error) {
        console.error("FAILED...", error);
        statusMsg.style.color = "red";
        statusMsg.textContent = "Oops! Something went wrong. Please try again.";
      });
  });
