const mainImages = document.querySelectorAll('.main-gallery img');
const thumbs = document.querySelectorAll('.thumbnail-gallery img');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');

let current = 0;

function showSlide(index) {
  mainImages.forEach(img => img.classList.remove('active'));
  thumbs.forEach(thumb => thumb.classList.remove('active'));
  mainImages[index].classList.add('active');
  thumbs[index].classList.add('active');
  current = index;
}

// Arrow navigation
prevBtn.addEventListener('click', () => {
  let index = (current - 1 + mainImages.length) % mainImages.length;
  showSlide(index);
});

nextBtn.addEventListener('click', () => {
  let index = (current + 1) % mainImages.length;
  showSlide(index);
});

// Thumbnail click
thumbs.forEach((thumb, i) => {
  thumb.addEventListener('click', () => showSlide(i));
});

// Auto slide every 5s
setInterval(() => {
  let index = (current + 1) % mainImages.length;
  showSlide(index);
}, 5000);

// Initialize first slide
showSlide(0);
