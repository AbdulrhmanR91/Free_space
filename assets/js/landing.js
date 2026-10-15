const nav=document.querySelectorAll('nav button');
function show(p){document.querySelectorAll('.pg').forEach(s=>s.hidden=s.id!=='p-'+p);nav.forEach(b=>b.classList.toggle('on',b.dataset.p===p));window.scrollTo(0,0);try{history.replaceState(null,'','#'+p)}catch(e){}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-p]');if(b)show(b.dataset.p)});
{let h='';try{h=location.hash.slice(1)}catch(e){}if(document.getElementById('p-'+h))show(h)}
try{
 const board=JSON.parse(localStorage.getItem('free-space-v1')||'null'),book=JSON.parse(localStorage.getItem('notebook-v1')||'null');
 const resume=document.getElementById('resume'),hasBoard=board&&Array.isArray(board.board)&&board.board.length>0,hasBook=book&&book.seen;
 if(resume&&(hasBoard||hasBook)){
  resume.hidden=false;
  resume.innerHTML=`<span>رجعت تاني؟</span><a href="${hasBoard?'board.html':'notebook.html'}">${hasBoard?'كمّل من اللوحة':'كمّل كراسة اليوم'} ←</a>`;
 }
}catch(e){}
