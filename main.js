const siteEnglish = document.documentElement.lang === 'en';
const ui = (es, en) => siteEnglish ? en : es;
// Persistent proposal call-to-action, accessible modal and prefilled email request.
(() => {
  const cta = document.querySelector('.proposal-cta');
  const hero = document.querySelector('.hero');
  const contact = document.querySelector('#contacto');
  const footer = document.querySelector('footer');
  const dialog = document.querySelector('.request-dialog');
  const form = document.querySelector('.request-form');
  if (cta && hero && contact) {
    let pastHero = false, atContact = false, atFooter = false;
    const sync = () => {
      const atPageEnd = atContact || atFooter;
      cta.classList.toggle('is-visible', pastHero && !atPageEnd);
      cta.classList.toggle('is-hidden', atPageEnd);
    };
    new IntersectionObserver(([entry]) => { pastHero = !entry.isIntersecting; sync(); }, { threshold: .08 }).observe(hero);
    new IntersectionObserver(([entry]) => { atContact = entry.isIntersecting; sync(); }, { threshold: .12 }).observe(contact);
    if (footer) new IntersectionObserver(([entry]) => { atFooter = entry.isIntersecting; sync(); }, { threshold: .08 }).observe(footer);
  }
  document.querySelectorAll('.proposal-open').forEach(button => button.addEventListener('click', () => dialog?.showModal()));
  dialog?.querySelector('.request-close')?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  form?.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const subject = ui(`Solicitud de propuesta · ${data.get('empresa')}`, `Proposal request · ${data.get('empresa')}`);
    const body = [
      ui('Nombre', 'Name') + `: ${data.get('nombre')}`,
      ui('Empresa', 'Company') + `: ${data.get('empresa')}`,
      ui('Correo', 'Email') + `: ${data.get('correo')}`,
      ui('Teléfono', 'Telephone') + `: ${data.get('telefono') || '-'}`,
      ui('Servicio requerido', 'Service required') + `: ${data.get('servicio')}`,
      '',
      ui('Descripción y ubicación del proyecto', 'Project description and location') + ':',
      data.get('proyecto')
    ].join('\n');
    location.href = `mailto:licitaciones@actinginfraestructura.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
})();
// Rotating homepage photographs, with manual selection and motion preference support.
(() => {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const slides = [...hero.querySelectorAll('.hero-slide')];
  const dots = [...hero.querySelectorAll('.hero-slide-dot')];
  const label = hero.querySelector('.hero-photo-label');
  const toggle = hero.querySelector('.hero-slide-toggle');
  const captions = [ui('PUENTE PUMAREJO','PUMAREJO BRIDGE'), ui('CORREDOR FÉRREO DEL PACÍFICO','PACIFIC RAIL CORRIDOR'), ui('VÍAS DE CALI','CALI ROADS'), ui('VÍAS DEL VALLE','VALLE ROADS')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let active = 0, paused = false, timer;
  const show = index => {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === active);
      if (i === active) slide.removeAttribute('aria-hidden');
      else slide.setAttribute('aria-hidden', 'true');
    });
    dots.forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === active)));
    label.textContent = captions[active];
  };
  const schedule = () => {
    clearInterval(timer);
    if (!paused && !reduced.matches && !document.hidden) timer = setInterval(() => show(active + 1), 7000);
  };
  dots.forEach((dot, i) => dot.addEventListener('click', () => { show(i); schedule(); }));
  toggle.addEventListener('click', () => {
    paused = !paused;
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.setAttribute('aria-label', paused ? ui('Reanudar fotos','Resume photographs') : ui('Pausar fotos','Pause photographs'));
    toggle.textContent = paused ? '▶' : 'Ⅱ';
    schedule();
  });
  reduced.addEventListener('change', schedule);
  document.addEventListener('visibilitychange', schedule);
  schedule();
})();
const button=document.querySelector('.menu');const nav=document.querySelector('#navegacion');const navDropdowns=[...nav.querySelectorAll('.nav-dropdown')];
function closeDropdowns(except=null){navDropdowns.forEach(item=>{if(item!==except)item.removeAttribute('open');});}
function closeMenu(){button.setAttribute('aria-expanded','false');nav.classList.remove('open');closeDropdowns();}
button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});
nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
navDropdowns.forEach(item=>{
  item.addEventListener('toggle',()=>{if(item.open)closeDropdowns(item);});
});
document.addEventListener('click',event=>{if(!nav.contains(event.target))closeDropdowns();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){
  const activeDropdown=navDropdowns.find(item=>item.open);
  if(button.getAttribute('aria-expanded')==='true'){closeMenu();button.focus();}
  else if(activeDropdown){closeDropdowns();activeDropdown.querySelector('summary').focus();}
}});

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

// Sector filters progressively enhance the complete project list.
(() => {
 const bar=document.querySelector('.project-filters');
 const cards=[...document.querySelectorAll('.project-grid > .project')];
 const refs=[...document.querySelectorAll('.reference-list > details')];
 const refCategories=['roads','urban','roads','urban','roads'];
 const toggle=document.querySelector('.project-toggle');
 const more=document.querySelector('.more-projects');
 const mobile=window.matchMedia('(max-width:720px)');
 let current='all';
 let expanded=false;
 const visibleLimit=()=>mobile.matches?4:8;
 const update=()=>{
  let visibleCards=[];
  if(current==='all'){
   visibleCards=expanded?cards:cards.filter(c=>c.dataset.showcase==='true').slice(0,visibleLimit());
  }else{
   visibleCards=cards.filter(c=>c.dataset.sector===current||c.dataset.type===current);
  }
  cards.forEach(c=>c.hidden=!visibleCards.includes(c));
  refs.forEach((r,i)=>r.hidden=current==='all'?!expanded:refCategories[i]!==current);
  more.hidden=refs.every(r=>r.hidden);
  toggle.hidden=current!=='all';
  toggle.setAttribute('aria-expanded',String(expanded));
  toggle.firstChild.textContent=expanded?ui('Ver proyectos destacados ','Show featured projects '):ui('Ver toda la experiencia ','View all experience ');
  toggle.querySelector('span').textContent=expanded?'↑':'↓';
  const filterButton=bar.querySelector(`[data-filter="${current}"]`);
  const total=visibleCards.length+refs.filter(r=>!r.hidden).length;
  const label=current==='all'&&!expanded
   ?ui(`${visibleCards.length} proyectos destacados`,`${visibleCards.length} featured projects`)
   :`${total} ${ui('proyectos','projects')} · ${filterButton?.textContent||''}`;
  document.querySelector('.project-results').textContent=label;
 };
 bar.hidden=false;
 bar.addEventListener('click',e=>{
  const b=e.target.closest('[data-filter]');if(!b)return;
  bar.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  current=b.dataset.filter;
  update();
 });
 toggle.addEventListener('click',()=>{expanded=!expanded;update();});
 mobile.addEventListener('change',()=>{if(current==='all'&&!expanded)update();});
 document.querySelectorAll('[data-project-filter]').forEach(link=>link.addEventListener('click',()=>{
  if(link.dataset.projectFilter==='all')expanded=true;
  bar.querySelector(`[data-filter="${link.dataset.projectFilter}"]`)?.click();
 }));
 update();
})();

// Full-size project photographs in a keyboard-accessible native modal.
(() => {
 const modal=document.createElement('dialog');modal.className='photo-modal';
 modal.setAttribute('aria-label',ui('Fotografías del proyecto','Project photographs'));
 modal.innerHTML=`<button type="button" class="photo-close" aria-label="${ui('Cerrar galería','Close gallery')}">×</button><figure><img class="photo-full" alt=""><figcaption id="photo-caption"></figcaption></figure><div class="photo-controls"><button class="photo-prev" type="button" aria-label="${ui('Fotografía anterior','Previous photo')}">←</button><span class="photo-count" aria-live="polite"></span><button class="photo-next" type="button" aria-label="${ui('Fotografía siguiente','Next photo')}">→</button></div>`;
 document.body.append(modal);
 let photos=[],current=0,trigger=null;
 const show=i=>{current=(i+photos.length)%photos.length;const im=photos[current];const full=modal.querySelector('.photo-full');full.src=im.src;full.alt=im.alt;modal.querySelector('figcaption').textContent=im.alt;modal.querySelector('.photo-count').textContent=`${current+1} / ${photos.length}`;modal.querySelectorAll('.photo-prev,.photo-next').forEach(b=>b.hidden=photos.length===1);};
 const open=(card,img,button)=>{photos=[...card.querySelectorAll('img')];trigger=button;show(Math.max(0,photos.indexOf(img)));modal.showModal();document.body.classList.add('photo-open');};
 document.querySelectorAll('.project').forEach(card=>{
  const gallery=card.querySelector('.project-gallery');const img=card.querySelector('img');if(!img)return;
  const b=document.createElement('button');b.type='button';b.className='photo-expand';b.textContent=ui('Ampliar fotos','Enlarge photos');b.setAttribute('aria-label',`${ui('Ampliar fotos de','Enlarge photographs of')} ${card.querySelector('h3').textContent}`);
  if(gallery)gallery.append(b);else {const wrap=document.createElement('div');wrap.className='project-photo';img.before(wrap);wrap.append(img,b);}
  b.addEventListener('click',()=>open(card,card.querySelector('img:not([hidden])'),b));
  card.querySelectorAll('img').forEach(im=>im.addEventListener('click',()=>open(card,im,b)));
 });
 modal.querySelector('.photo-close').addEventListener('click',()=>modal.close());
 modal.querySelector('.photo-prev').addEventListener('click',()=>show(current-1));
 modal.querySelector('.photo-next').addEventListener('click',()=>show(current+1));
 modal.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();show(current+(e.key==='ArrowRight'?1:-1));}});
 modal.addEventListener('click',e=>{if(e.target===modal)modal.close();});
 modal.addEventListener('close',()=>{document.body.classList.remove('photo-open');trigger?.focus();});
})();
