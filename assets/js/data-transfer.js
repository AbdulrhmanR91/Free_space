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
  const date=new Date().toISOString().slice(0,10),url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'})),a=document.createElement('a');
  a.href=url;a.download=`free-space-backup-${date}.json`;a.hidden=true;document.body.appendChild(a);a.click();
  setTimeout(()=>{URL.revokeObjectURL(url);a.remove()},1000);
 }
 function valid(payload){
  return payload&&payload.app==='free-space'&&payload.version===1&&payload.board&&typeof payload.board==='object'&&payload.book&&typeof payload.book==='object'&&(!payload.theme||payload.theme==='light'||payload.theme==='dark')&&JSON.stringify(payload).length<=5*1024*1024;
 }
 function mergeBoard(incoming){
  const current=read(boardKey,{}),byId=new Map([...(current.board||[]),...(incoming.board||[])].map(x=>[x.id,x])),archived=new Map([...(current.archivedBoard||[]),...(incoming.archivedBoard||[])].map(x=>[x.id,x]));
  localStorage.setItem(boardKey,JSON.stringify({...current,...incoming,board:[...byId.values()],archivedBoard:[...archived.values()]}));
 }
 function importData(file){
  const reader=new FileReader();
  reader.onload=()=>{
   try{
    const payload=JSON.parse(reader.result);if(!valid(payload))throw new Error('invalid');
    const [boards,days]=count(payload),mode=confirm(`المعاينة: ${boards} ورقة، ${days} يوم كراسة.\nاضغط «موافق» للدمج، أو «إلغاء» للاستبدال.`);
    const stamp=Date.now();localStorage.setItem(`backup-before-import-${stamp}`,JSON.stringify({board:read(boardKey,{}),book:read(bookKey,{}),theme:localStorage.getItem(themeKey)}));
    if(mode)mergeBoard(payload.board);else localStorage.setItem(boardKey,JSON.stringify(payload.board));
    const current=read(bookKey,{});localStorage.setItem(bookKey,JSON.stringify(mode?{...current,...payload.book}:payload.book));
    if(payload.theme)localStorage.setItem(themeKey,payload.theme);
    alert('تم الاستيراد. النسخة السابقة محفوظة في backup-before-import-'+stamp+' ويمكن استخدامها للتراجع.');location.reload();
   }catch(e){alert('ملف الاستيراد غير صالح أو أكبر من الحد المسموح.');console.error('فشل الاستيراد',e)}
  };
  reader.readAsText(file);
 }
 document.addEventListener('click',e=>{
  const button=e.target.closest('[data-export],[data-import]');if(!button)return;
  if(button.dataset.export){exportData();return}
  const input=document.createElement('input');input.type='file';input.accept='application/json,.json';input.onchange=()=>{if(input.files[0])importData(input.files[0])};input.click();
 });
})();
