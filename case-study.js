(() => {
  const menu=document.querySelector('.menu');
  const nav=document.querySelector('nav');
  menu?.addEventListener('click',()=>{
    const open=nav.classList.toggle('open');
    menu.setAttribute('aria-expanded',String(open));
  });

  const dialog=document.querySelector('.case-dialog');
  const full=dialog?.querySelector('img');
  const caption=dialog?.querySelector('p');
  document.querySelectorAll('.case-gallery button').forEach(button=>{
    button.addEventListener('click',()=>{
      const image=button.querySelector('img');
      full.src=image.src;
      full.alt=image.alt;
      caption.textContent=image.alt;
      dialog.showModal();
      document.body.classList.add('photo-open');
    });
  });
  const close=()=>{dialog?.close();document.body.classList.remove('photo-open');};
  dialog?.querySelector('.case-dialog-close')?.addEventListener('click',close);
  dialog?.addEventListener('click',event=>{if(event.target===dialog)close();});
})();
