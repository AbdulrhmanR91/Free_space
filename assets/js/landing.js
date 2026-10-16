const nav=document.querySelectorAll('nav button');
const welcomeScreen=document.getElementById('welcome-screen');
const closeWelcome=()=>{
 if(!welcomeScreen)return;
 welcomeScreen.classList.add('is-closing');
 document.body.classList.remove('welcome-open');
 try{localStorage.setItem('free-space-welcome-seen','1')}catch(e){}
 window.setTimeout(()=>{welcomeScreen.hidden=true},260);
};
let welcomeSeen='';
try{welcomeSeen=localStorage.getItem('free-space-welcome-seen')||''}catch(e){}
if(welcomeScreen&&!welcomeSeen)document.body.classList.add('welcome-open');
if(welcomeScreen&&welcomeSeen)welcomeScreen.hidden=true;
document.addEventListener('click',e=>{
 if(e.target.closest('[data-welcome-enter],[data-welcome-skip]'))closeWelcome();
});
function show(p){document.querySelectorAll('.pg').forEach(s=>s.hidden=s.id!=='p-'+p);nav.forEach(b=>b.classList.toggle('on',b.dataset.p===p));window.scrollTo(0,0);try{history.replaceState(null,'','#'+p)}catch(e){}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-p]');if(b)show(b.dataset.p)});
{let h='';try{h=location.hash.slice(1)}catch(e){}if(document.getElementById('p-'+h))show(h)}
try{
 const board=JSON.parse(localStorage.getItem('free-space-v1')||'null'),book=JSON.parse(localStorage.getItem('notebook-v1')||'null');
 const resume=document.getElementById('resume'),hasBoard=board&&Array.isArray(board.board)&&board.board.length>0,hasBook=book&&book.seen;
 if(resume&&(hasBoard||hasBook)){
  resume.hidden=false;
  resume.classList.add('resume-card');
  resume.innerHTML=`<span><b>مرحبًا بعودتك</b><small>${hasBoard?'لديك أفكار محفوظة في مساحة الأفكار':'لديك كراسة يومية جاهزة للمتابعة'}</small></span><a class="btn g" href="${hasBoard?'board.html':'notebook.html'}">${hasBoard?'تابع من مساحة الأفكار':'تابع كراسة اليوم'} ←</a>`;
 }
}catch(e){}
