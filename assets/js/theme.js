(function(){
  const root=document.documentElement;
  const setToggle=(b,theme)=>{const icon=theme==='dark'?'☀️':'🌙';b.textContent=b.dataset.themeText?`${icon} ${b.dataset.themeText}`:icon;b.title=theme==='dark'?'الوضع الفاتح':'الوضع الداكن';b.setAttribute('aria-label',b.title)};
  let saved='';
  try{saved=localStorage.getItem('free-space-theme')||''}catch(e){}
  root.dataset.theme=saved==='dark'||saved==='light'?saved:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
  const update=()=>{
    const next=root.dataset.theme==='dark'?'light':'dark';
    root.dataset.theme=next;
    try{localStorage.setItem('free-space-theme',next)}catch(e){}
    document.querySelectorAll('[data-theme-toggle]').forEach(b=>setToggle(b,next));
  };
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-theme-toggle]'))update();
  });
  document.addEventListener('DOMContentLoaded',()=>{
    document.querySelectorAll('[data-theme-toggle]').forEach(b=>setToggle(b,root.dataset.theme));
  });
})();
