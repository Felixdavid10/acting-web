(() => {
 const id=window.ACTING_ANALYTICS?.measurementId || '';
 if(!/^G-[A-Z0-9]+$/.test(id))return;
 const en=document.documentElement.lang==='en';const text=(es,eng)=>en?eng:es;
 const key='acting-analytics-consent';let allowed=false,loaded=false;
 const get=()=>{try{return localStorage.getItem(key);}catch{return null;}};
 const save=v=>{try{localStorage.setItem(key,v);}catch{}};
 function enable(){
  allowed=true;if(loaded){window.gtag('consent','update',{analytics_storage:'granted'});return;}
  loaded=true;window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments);};
  gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  gtag('js',new Date());gtag('config',id,{allow_google_signals:false,allow_ad_personalization_signals:false,page_location:location.origin+location.pathname,page_referrer:document.referrer?new URL(document.referrer).origin:''});
  const script=document.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(id);document.head.append(script);
 }
 const panel=document.createElement('section');panel.className='analytics-consent';panel.setAttribute('aria-label',text('Preferencias de medición','Analytics preferences'));
 const p=document.createElement('p');p.textContent=text('Con tu permiso, usamos Google Analytics y cookies para medir visitas y clics en el portafolio y los enlaces de contacto. Puedes rechazarlo o cambiar tu decisión en el pie de página.','With your permission, we use Google Analytics and cookies to measure visits and clicks on the portfolio and contact links. You can decline or change your choice in the footer.');panel.append(p);
 const choose=value=>{save(value);panel.hidden=true;if(value==='granted')enable();else {allowed=false;if(loaded){gtag('consent','update',{analytics_storage:'denied'});window['ga-disable-'+id]=true;location.reload();}}};
 for(const [value,label] of [['granted',text('Aceptar','Accept')],['denied',text('Rechazar','Decline')]]){const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',()=>choose(value));panel.append(b);}
 document.body.append(panel);
 const preferences=document.createElement('button');preferences.type='button';preferences.className='analytics-preferences';preferences.textContent=text('Preferencias de medición','Analytics preferences');preferences.addEventListener('click',()=>{panel.hidden=false;panel.querySelector('button').focus();});document.querySelector('footer').append(preferences);
 const choice=get();panel.hidden=choice==='granted'||choice==='denied';if(choice==='granted')enable();
 document.addEventListener('click',e=>{
  if(!allowed)return;const a=e.target.closest('a[href]');if(!a)return;
  const url=new URL(a.href,location.href);const placement=a.closest('section')?.id||'other';
  if(/\/assets\/(?:portafolio|portfolio)-acting.*\.pdf$/.test(url.pathname)){
   gtag('event','portfolio_open',{portfolio_language:url.pathname.endsWith('-en.pdf')?'en':'es',site_language:en?'en':'es',placement});
  }else if(url.protocol==='mailto:'||url.protocol==='tel:'){
   gtag('event','contact_click',{contact_method:url.protocol==='mailto:'?'email':'phone',site_language:en?'en':'es',placement});
  }else if(['www.linkedin.com','www.instagram.com'].includes(url.hostname)){
   gtag('event','social_click',{platform:url.hostname.includes('linkedin')?'linkedin':'instagram',site_language:en?'en':'es'});
  }
 });
})();
