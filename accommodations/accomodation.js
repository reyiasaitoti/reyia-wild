/* accomodation.js
   Robust gallery script to support two patterns used across pages:
   - Pattern A: multiple <img> in .main-gallery with .thumbnail-gallery img thumbnails
   - Pattern B: single #mainImage or single .gallery-main img with thumbnail buttons (.thumb) using data-src
   Adds prev/next, thumbnail click, keyboard nav and graceful fallbacks.
*/

(function(){
  const mainContainer = document.querySelector('.main-gallery') || document.querySelector('.gallery-main');
  if(!mainContainer) return;

  const prevBtn = mainContainer.querySelector('.gallery-btn.prev') || document.querySelector('.prev');
  const nextBtn = mainContainer.querySelector('.gallery-btn.next') || document.querySelector('.next');

  // detect pattern
  const multipleImgs = Array.from(mainContainer.querySelectorAll('img'));
  const thumbImgs = Array.from(document.querySelectorAll('.thumbnail-gallery img'));
  const thumbButtons = Array.from(document.querySelectorAll('.thumb'));

  let current = 0;
  let autoSlideTimer = null;
  let pauseUntil = 0;

  // create an off-screen live region for screen readers
  let liveEl = document.querySelector('#gallery-live-region');
  if(!liveEl){
    liveEl = document.createElement('div');
    liveEl.id = 'gallery-live-region';
    liveEl.className = 'sr-only';
    liveEl.setAttribute('aria-live','polite');
    liveEl.setAttribute('aria-atomic','true');
    document.body.appendChild(liveEl);
  }

  function announce(text){
    if(!liveEl) return;
    liveEl.textContent = '';
    // small timeout to ensure assistive tech notices change
    setTimeout(()=> liveEl.textContent = text, 50);
  }

  function startAuto(){
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    stopAuto();
    autoSlideTimer = setInterval(()=>{
      if(Date.now() < pauseUntil) return; // paused after manual interaction
      goTo(current + 1);
    }, 5000);
  }
  function stopAuto(){ if(autoSlideTimer) { clearInterval(autoSlideTimer); autoSlideTimer = null; } }

  function pauseAfterInteraction(ms = 3500){
    pauseUntil = Date.now() + ms;
    stopAuto();
    setTimeout(()=>{ if(Date.now() >= pauseUntil) startAuto(); }, ms + 100);
  }

  // small helper to temporarily disable controls to avoid double clicks
  function flashDisableControls(duration = 300){
    [prevBtn, nextBtn].forEach(b=>{ if(!b) return; b.disabled = true; setTimeout(()=> b.disabled = false, duration); });
  }

  // swipe support for touch devices
  (function attachSwipe(){
    let startX = 0, startY = 0, touching = false;
    mainContainer.addEventListener('touchstart', e=>{
      const t = e.touches[0]; startX = t.clientX; startY = t.clientY; touching = true; stopAuto();
    }, {passive:true});
    mainContainer.addEventListener('touchmove', e=>{ if(!touching) return; }, {passive:true});
    mainContainer.addEventListener('touchend', e=>{
      if(!touching) return; touching = false; const t = e.changedTouches[0]; const dx = t.clientX - startX; const dy = t.clientY - startY;
      if(Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)){
        if(dx > 0) { prevBtn && prevBtn.click(); } else { nextBtn && nextBtn.click(); }
        pauseAfterInteraction();
      }
      startAuto();
    }, {passive:true});
  })();

  // keyboard nav
  window.addEventListener('keydown', e=>{ if(e.key === 'ArrowLeft') prevBtn && prevBtn.click(); if(e.key === 'ArrowRight') nextBtn && nextBtn.click(); });

  // Pause on hover/focus around the main container
  mainContainer.addEventListener('mouseenter', stopAuto);
  mainContainer.addEventListener('mouseleave', startAuto);
  mainContainer.addEventListener('focusin', stopAuto);
  mainContainer.addEventListener('focusout', startAuto);

  // helper placeholders for goTo used by startAuto
  function goTo(idx){ /* replaced per-pattern */ }

  // Pattern A: multiple images in DOM
  if(multipleImgs.length > 1 && thumbImgs.length >= multipleImgs.length){
    function showSlide(idx){
      current = (idx + multipleImgs.length) % multipleImgs.length;
      multipleImgs.forEach((img,i)=> img.classList.toggle('active', i === current));
      thumbImgs.forEach((t,i)=> t.classList.toggle('active', i === current));
      // announce
      const alt = multipleImgs[current].alt || `Image ${current+1}`;
      announce(`Slide ${current+1} of ${multipleImgs.length}: ${alt}`);
    }
    function _goTo(idx){ showSlide(idx); }
    goTo = _goTo;

    // arrows
    if(prevBtn) prevBtn.addEventListener('click', (e)=>{ flashDisableControls(); _goTo(current - 1); pauseAfterInteraction(); });
    if(nextBtn) nextBtn.addEventListener('click', (e)=>{ flashDisableControls(); _goTo(current + 1); pauseAfterInteraction(); });

    // thumbs
    thumbImgs.forEach((t,i)=> t.addEventListener('click', ()=>{ _goTo(i); pauseAfterInteraction(); }));

    showSlide(0);
    startAuto();
    // finished initialization for this gallery
    return;
  }

  // Pattern B: single main image element + thumb buttons with data-src or small thumbnail images
  const mainImg = mainContainer.querySelector('img') || document.getElementById('mainImage');
  if(!mainImg) return;

  const sources = [];
  // prefer thumbButtons with data-src
  if(thumbButtons.length){
    thumbButtons.forEach(b=> sources.push(b.getAttribute('data-src') || (b.querySelector('img') && b.querySelector('img').src)));
  } else if(thumbImgs.length){
    thumbImgs.forEach(t=> sources.push(t.src));
  } else {
    // fallback: if multiple images are present in container use those
    const imgsIn = Array.from(mainContainer.querySelectorAll('img'));
    imgsIn.forEach(i=> sources.push(i.src));
  }

  // if there is one or zero sources there is nothing to navigate — hide/disable arrows
  if(sources.length <= 1){
    if(prevBtn){ prevBtn.style.display = 'none'; prevBtn.setAttribute('aria-hidden','true'); prevBtn.disabled = true; }
    if(nextBtn){ nextBtn.style.display = 'none'; nextBtn.setAttribute('aria-hidden','true'); nextBtn.disabled = true; }
    return;
  }

  function update(idx){
    current = (idx + sources.length) % sources.length;
    mainImg.src = sources[current];
    // update active states on thumbButtons / thumbImgs
    if(thumbButtons.length) thumbButtons.forEach((b,i)=> b.classList.toggle('active', i === current));
    if(thumbImgs.length) thumbImgs.forEach((t,i)=> t.classList.toggle('active', i === current));
    // announce
    const alt = mainImg.alt || `Image ${current+1}`;
    announce(`Slide ${current+1} of ${sources.length}: ${alt}`);
  }

  goTo = update;

  if(prevBtn) prevBtn.addEventListener('click', (e)=>{ flashDisableControls(); update(current - 1); pauseAfterInteraction(); });
  if(nextBtn) nextBtn.addEventListener('click', (e)=>{ flashDisableControls(); update(current + 1); pauseAfterInteraction(); });

  thumbButtons.forEach((b,i)=> b.addEventListener('click', ()=>{ update(i); pauseAfterInteraction(); }));
  thumbImgs.forEach((t,i)=> t.addEventListener('click', ()=>{ update(i); pauseAfterInteraction(); }));

  update(0);
  startAuto();
  // finished initialization for this gallery
})();
