(function(){
 const boardKey='free-space-v1',bookKey='notebook-v1',themeKey='free-space-theme';
 const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))||fallback}catch(e){return fallback}};
 const cleanBook=source=>{
  const out={};
  Object.keys(source||{}).forEach(key=>{
   if(/^\d{4}-\d{2}-\d{2}$/.test(key)){
    const day={...source[key]};delete day.active;delete day.dur;delete day.k;delete day.s;out[key]=day;
   }else out[key]=source[key];
  });
  return out;
 };
 const count=payload=>[Array.isArray(payload.board?.board)?payload.board.board.length:0,Object.keys(payload.book||{}).filter(k=>/^\d{4}-\d{2}-\d{2}$/.test(k)).length];
 function exportData(){
  const payload={app:'free-space',version:1,exportedAt:new Date().toISOString(),board:read(boardKey,{}),book:cleanBook(read(bookKey,{})),theme:localStorage.getItem(themeKey)||'light'};
  const date=new Date().toISOString().slice(0,10),blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json;charset=utf-8'});
  try{localStorage.setItem('free-space-last-export',payload.exportedAt)}catch(e){}
  document.querySelectorAll('[data-transfer-status]').forEach(el=>el.textContent='آخر تصدير: الآن');
  if(navigator.msSaveOrOpenBlob){navigator.msSaveOrOpenBlob(blob,`free-space-backup-${date}.json`);return}
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=`free-space-backup-${date}.json`;a.rel='noopener';a.style.cssText='position:fixed;left:-10000px;top:-10000px;width:1px;height:1px;opacity:0';
  document.body.appendChild(a);
  a.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));
  setTimeout(()=>{URL.revokeObjectURL(url);a.remove()},10000);
 }
 function valid(payload){
  if(!payload||payload.app!=='free-space'||payload.version!==1||!payload.board||typeof payload.board!=='object'||!payload.book||typeof payload.book!=='object'||(!payload.theme||payload.theme==='light'||payload.theme==='dark'))return false;
  if(!Array.isArray(payload.board.board)||!Array.isArray(payload.board.archivedBoard))return false;
  const validItem=x=>x&&typeof x==='object'&&typeof x.id==='string'&&x.id.length<=200&&['sticky','text','link'].includes(x.type)&&typeof x.value==='string'&&x.value.length<=10000&&Number.isFinite(Number(x.x))&&Number.isFinite(Number(x.y));
  if(!payload.board.board.every(validItem)||!payload.board.archivedBoard.every(validItem))return false;
  const validDay=(key,value)=>/^\d{4}-\d{2}-\d{2}$/.test(key)&&value&&typeof value==='object'&&(!('intent' in value)||typeof value.intent==='string')&&(!('note' in value)||typeof value.note==='string')&&(!('close' in value)||typeof value.close==='string');
  if(!Object.entries(payload.book).every(([key,value])=>key==='cfg'||key==='snd'||key==='goals'||key==='seen'||key==='fg'||validDay(key,value)))return false;
  return JSON.stringify(payload).length<=5*1024*1024;
 }
 function mergeBoard(incoming){
  const current=read(boardKey,{}),byId=new Map([...(current.board||[]),...(incoming.board||[])].map(x=>[x.id,x])),archived=new Map([...(current.archivedBoard||[]),...(incoming.archivedBoard||[])].map(x=>[x.id,x]));
  localStorage.setItem(boardKey,JSON.stringify({...current,...incoming,board:[...byId.values()],archivedBoard:[...archived.values()]}));
 }
 function importData(file){
  if(file.size>5*1024*1024){alert('ملف الاستيراد أكبر من الحد المسموح.');return}
  const reader=new FileReader();
  reader.onload=()=>{
   try{
    const payload=JSON.parse(reader.result);if(!valid(payload))throw new Error('invalid');
    const [boards,days]=count(payload),mode=confirm(`المعاينة: ${boards} ورقة، ${days} يوم كراسة.\nاضغط «موافق» للدمج، أو «إلغاء» للاستبدال.`);
    const stamp=Date.now(),backupKey=`backup-before-import-${stamp}`,backup=JSON.stringify({board:read(boardKey,{}),book:read(bookKey,{}),theme:localStorage.getItem(themeKey)});
    try{localStorage.setItem(backupKey,backup)}catch(error){throw new Error('backup-failed')}
    const backups=Object.keys(localStorage).filter(key=>key.indexOf('backup-before-import-')===0).sort().reverse();backups.slice(3).forEach(key=>localStorage.removeItem(key));
    if(mode)mergeBoard(payload.board);else localStorage.setItem(boardKey,JSON.stringify(payload.board));
    const current=read(bookKey,{});localStorage.setItem(bookKey,JSON.stringify(mode?{...current,...payload.book}:payload.book));
    if(payload.theme)localStorage.setItem(themeKey,payload.theme);
    alert('تم الاستيراد. النسخة السابقة محفوظة في backup-before-import-'+stamp+' ويمكن استخدامها للتراجع.');location.reload();
   }catch(e){alert(e.message==='backup-failed'?'تعذر إنشاء نسخة التراجع، لذلك لم تتغير بياناتك.':'ملف الاستيراد غير صالح أو أكبر من الحد المسموح.');console.error('فشل الاستيراد',e)}
  };
  reader.readAsText(file);
 }
 document.addEventListener('click',e=>{
  const button=e.target.closest('[data-export],[data-import]');if(!button)return;
  if(button.hasAttribute('data-export')){exportData();return}
  const input=document.createElement('input');input.type='file';input.accept='application/json,.json';input.onchange=()=>{if(input.files[0])importData(input.files[0])};input.click();
 });
 const last=localStorage.getItem('free-space-last-export');document.querySelectorAll('[data-transfer-status]').forEach(el=>{el.textContent=last?`آخر تصدير: ${new Date(last).toLocaleDateString('ar-EG')}`:'لم تُصدّر نسخة بعد'});
})();
