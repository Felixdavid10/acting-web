const siteEnglish = document.documentElement.lang === 'en';
const ui = (es, en) => siteEnglish ? en : es;
const button=document.querySelector('.menu');const nav=document.querySelector('#navegacion');
function closeMenu(){button.setAttribute('aria-expanded','false');nav.classList.remove('open');}
button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});
nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&button.getAttribute('aria-expanded')==='true'){closeMenu();button.focus();}});

(() => {
  const section = document.querySelector('#clientes');
  const track = section?.querySelector('.client-grid');
  if (!track) return;
  const logos = [...track.children];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduced.matches, hovered = false, visible = false, frame = 0, last = 0, distance = 0;
  const controls = document.createElement('div');
  controls.className = 'client-controls';
  controls.innerHTML = `<button type="button" class="client-toggle">${ui('Pausar','Pause')}</button><span class="client-counter"></span><div class="client-arrows"><button type="button" class="client-prev" aria-label="${ui('Ver clientes anteriores','Previous clients')}">←</button><button type="button" class="client-next" aria-label="${ui('Ver clientes siguientes','Next clients')}">→</button></div>`;
  const viewport = document.createElement('div');
  viewport.className = 'client-viewport';
  viewport.id = 'client-slides';
  viewport.tabIndex = 0;
  viewport.setAttribute('role', 'region');
  viewport.setAttribute('aria-label', ui('Clientes: franja de logos desplazable', 'Clients: scrolling logo strip'));
  track.before(controls, viewport);
  viewport.append(track);
  track.classList.add('client-marquee');
  const clones = logos.map(logo => {
    const clone = logo.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.inert = true;
    track.append(clone);
    return clone;
  });
  const toggle = controls.querySelector('.client-toggle');
  controls.querySelector('.client-counter').textContent = `${logos.length} ${ui('clientes', 'clients')}`;
  controls.querySelectorAll('button').forEach(b => b.setAttribute('aria-controls', viewport.id));
  function measure() { distance = clones[0].offsetLeft - logos[0].offsetLeft; if (distance > 0 && viewport.scrollLeft >= distance) viewport.scrollLeft %= distance; }
  function tick(time) {
    if (last && distance > 0) {
      viewport.scrollLeft += Math.min(time - last, 64) * .04;
      if (viewport.scrollLeft >= distance) viewport.scrollLeft -= distance;
    }
    last = time;
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame); frame = 0; last = 0;
    toggle.textContent = paused ? ui('Reproducir', 'Play') : ui('Pausar', 'Pause');
    toggle.setAttribute('aria-label', paused ? ui('Reanudar movimiento de logos', 'Resume logo movement') : ui('Pausar movimiento de logos', 'Pause logo movement'));
    if (!paused && !hovered && visible && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function step(direction) {
    paused = true; sync();
    if (!distance) return;
    const width = logos[0].getBoundingClientRect().width + 16;
    viewport.scrollLeft = ((viewport.scrollLeft + direction * width) % distance + distance) % distance;
  }
  toggle.addEventListener('click', () => { paused = !paused; sync(); });
  controls.querySelector('.client-prev').addEventListener('click', () => step(-1));
  controls.querySelector('.client-next').addEventListener('click', () => step(1));
  viewport.addEventListener('mouseenter', () => { hovered = true; sync(); });
  viewport.addEventListener('mouseleave', () => { hovered = false; sync(); });
  viewport.addEventListener('touchstart', () => { paused = true; sync(); }, { passive: true });
  section.addEventListener('focusin', event => { if (!section.contains(event.relatedTarget)) { paused = true; sync(); } });
  viewport.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); step(event.key === 'ArrowRight' ? 1 : -1); }
  });
  reduced.addEventListener('change', () => { if (reduced.matches) paused = true; sync(); });
  document.addEventListener('visibilitychange', sync);
  new ResizeObserver(measure).observe(viewport);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { threshold: .15 }).observe(viewport);
  measure(); sync();
})();

// Keep the current section when changing language; links also work without JavaScript.
document.querySelectorAll('.language-switch a').forEach(link => {
  link.addEventListener('click', () => {
    const target = new URL(link.href);
    target.hash = location.hash;
    link.href = target.href;
  });
});

// Photo galleries inside project cards.
document.querySelectorAll('[data-gallery]').forEach(gallery => {
  const images = [...gallery.querySelectorAll('.gallery-track img')];
  const counter = gallery.querySelector('.gallery-counter');
  let current = 0;
  const show = index => {
    current = (index + images.length) % images.length;
    images.forEach((img, position) => { img.hidden = position !== current; });
    counter.textContent = `${current + 1} / ${images.length}`;
  };
  gallery.querySelector('.gallery-prev').addEventListener('click', () => show(current - 1));
  gallery.querySelector('.gallery-next').addEventListener('click', () => show(current + 1));
  gallery.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      show(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  show(0);
});
