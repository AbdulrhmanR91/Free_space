const KEY='free-space-v1';
let S={board:[],archivedBoard:[]},tab='free',drag=null;
const uid=()=>Math.random().toString(36).slice(2,9);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fix=u=>{u=String(u).trim();return /^https?:\/\//i.test(u)?u:'https://'+u};
function load(){
 try{const old=JSON.parse(localStorage.getItem(KEY));S={board:Array.isArray(old?.board)?old.board:[],archivedBoard:Array.isArray(old?.archivedBoard)?old.archivedBoard:[]}}catch(e){S={board:[],archivedBoard:[]}}
 save();
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){console.error('تعذر حفظ اللوحة',e)}}
function boardItem(x){
 const value=x.value||'', input=x.type==='link'
  ?`<input class="board-edit link-edit" data-edit-board="${x.id}" value="${esc(value)}" placeholder="https://..." dir="ltr" aria-label="عنوان الرابط">`
  :`<textarea data-edit-board="${x.id}" rows="${x.type==='sticky'?3:5}" placeholder="${x.type==='sticky'?'اكتب ملاحظة قصيرة':'اكتب فكرتك هنا'}">${esc(value)}</textarea>`;
 const preview=x.type==='link'&&value.trim()?`<a class="link-open" href="${esc(fix(value))}" target="_blank" rel="noopener">فتح الرابط ↗</a>`:'';
 return `<article class="board-item ${x.type}" data-id="${x.id}" style="--x:${x.x}px;--y:${x.y}px"><div class="board-grip" data-drag-handle title="اسحب الورقة">⠿ اسحب</div><button class="x" data-db="${x.id}" title="نقل للأرشيف">×</button>${input}${preview}</article>`;
}
function free(){return `<div class="section-head"><div><h2>مساحة الأفكار</h2><p>مكتبك المفتوح: اكتب، اجمع، وحرك أفكارك بحرية.</p></div><div class="free-add"><button class="btn" data-add-board="sticky">+ ورقة لاصقة</button><button class="btn g" data-add-board="text">+ نص</button><button class="btn g" data-add-board="link">+ رابط</button></div></div><div id="canvas" class="canvas">${S.board.map(boardItem).join('')||'<div class="canvas-empty">المكتب فاضي. ابدأ بورقة لاصقة أو رابط.</div>'}</div>`}
 const archivedAt=x=>x.archivedAt?new Date(x.archivedAt).toLocaleString('ar-EG',{dateStyle:'medium',timeStyle:'short'}):'وقت الأرشفة غير متاح';
function archive(){return `<div class="section-head"><div><h2>الأرشيف</h2><p>الأفكار التي انتهيت منها، محفوظة بعيدًا عن سطح المكتب.</p></div></div><section class="card archive-board">${S.archivedBoard.map(x=>`<div class="archive-item"><span>${x.type==='sticky'?'🟨':x.type==='link'?'🔗':'📝'} <b>${esc(x.value)}</b><small>أُرشفت في ${archivedAt(x)}</small></span><div class="archive-actions"><button class="btn g" data-restore-board="${x.id}">استرجاع</button><button class="btn delete" data-delete-board="${x.id}">مسح</button></div></div>`).join('')||'<div class="empty">الأرشيف فاضي حاليًا.</div>'}</section>`}
function render(){document.getElementById('app').innerHTML=tab==='archive'?archive():free();document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('on',b.dataset.t===tab))}
document.addEventListener('click',e=>{
 const t=e.target.closest('button'),d=(t&&t.dataset)||{};
 if(d.t){tab=d.t;render();return}
 if(d.addBoard){const labels={sticky:'',text:'',link:''};S.board.push({id:uid(),type:d.addBoard,value:labels[d.addBoard],x:24+S.board.length%4*180,y:24+Math.floor(S.board.length/4)*140});save();render();const el=document.querySelector(`[data-edit-board="${S.board[S.board.length-1].id}"]`);if(el)el.focus();return}
 if(d.db){const i=S.board.findIndex(v=>v.id===d.db);if(i>=0){const [x]=S.board.splice(i,1);S.archivedBoard.unshift({...x,archivedAt:Date.now()});save();render()}return}
 if(d.restoreBoard){const i=S.archivedBoard.findIndex(v=>v.id===d.restoreBoard);if(i>=0){const [x]=S.archivedBoard.splice(i,1);const {archivedAt,...rest}=x;S.board.push(rest);save();render()}return}
 if(d.deleteBoard&&confirm('تمسح العنصر من الأرشيف نهائيًا؟')){S.archivedBoard=S.archivedBoard.filter(v=>v.id!==d.deleteBoard);save();render()}
});
document.addEventListener('input',e=>{const id=e.target.dataset.editBoard;if(!id)return;const x=S.board.find(v=>v.id===id);if(x){x.value=e.target.value;save()}});
document.addEventListener('pointerdown',e=>{
 const handle=e.target.closest('[data-drag-handle]');if(!handle)return;
 const item=handle.closest('.board-item'),canvas=document.getElementById('canvas');if(!item||!canvas)return;
 e.preventDefault();const r=canvas.getBoundingClientRect();drag={item,x:e.clientX,y:e.clientY,ox:parseFloat(item.style.getPropertyValue('--x'))||0,oy:parseFloat(item.style.getPropertyValue('--y'))||0,rect:r};item.setPointerCapture?.(e.pointerId);item.classList.add('dragging');
});
document.addEventListener('pointermove',e=>{if(!drag)return;drag.item.style.setProperty('--x',`${drag.ox+e.clientX-drag.x}px`);drag.item.style.setProperty('--y',`${drag.oy+e.clientY-drag.y}px`)});
document.addEventListener('pointerup',()=>{if(!drag)return;const x=S.board.find(v=>v.id===drag.item.dataset.id);if(x){x.x=parseFloat(drag.item.style.getPropertyValue('--x'));x.y=parseFloat(drag.item.style.getPropertyValue('--y'));save()}drag.item.classList.remove('dragging');drag=null});
load();render();
