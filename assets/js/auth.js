(function(){
 const config=window.FREE_SPACE_SUPABASE;
 const area=document.getElementById('auth-area');
 if(!area)return;
 const banner=document.createElement('div');
 banner.className='local-banner';
 banner.textContent='بياناتك على هذا الجهاز فقط، سجّل دخولك لحفظها.';
 area.after(banner);
 if(!config||!window.supabase){area.textContent='تسجيل الدخول غير متاح حاليًا';return}
 const client=window.supabase.createClient(config.url,config.publishableKey);
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const dialog=document.createElement('dialog');
 dialog.className='auth-dialog';
 dialog.innerHTML='<h2>تسجيل الدخول</h2><p>اكتب بريدك، وسنرسل لك رابط دخول آمن. بياناتك الحالية ستظل على هذا الجهاز حتى تبدأ المزامنة.</p><form id="auth-form"><input type="email" name="email" required autocomplete="email" placeholder="البريد الإلكتروني" dir="ltr"><div class="auth-actions"><button class="auth-button" type="submit">إرسال رابط الدخول</button><button class="auth-button outline" type="button" data-auth-google>الدخول بحساب Google</button><button class="auth-button outline" type="button" data-auth-close>إلغاء</button></div><div class="auth-message" role="status" aria-live="polite"></div></form>';
 document.body.appendChild(dialog);
 const message=dialog.querySelector('.auth-message'),form=dialog.querySelector('#auth-form');
 const showError=e=>{message.textContent=e?.message||'تعذّر تسجيل الدخول. حاول مرة أخرى.';message.style.color='var(--dn)'};
 const render=session=>{
  area.innerHTML=session?.user?`<span class="auth-status">مسجّل: ${esc(session.user.email||'')}</span><button class="auth-button outline" data-auth-signout type="button">خروج</button>`:'<button class="auth-button" data-auth-open type="button">تسجيل الدخول</button>';
  banner.hidden=!!session?.user;
 };
 area.addEventListener('click',async e=>{
  const t=e.target.closest('[data-auth-open],[data-auth-signout]');if(!t)return;
  if(t.hasAttribute('data-auth-open')){message.textContent='';message.style.color='';dialog.showModal();return}
  const {error}=await client.auth.signOut();if(error)showError(error);
 });
 dialog.addEventListener('click',e=>{if(e.target.hasAttribute('data-auth-close'))dialog.close()});
 form.addEventListener('submit',async e=>{
  e.preventDefault();message.textContent='جارٍ إرسال الرابط…';
  const email=new FormData(form).get('email');
  const {error}=await client.auth.signInWithOtp({email,options:{emailRedirectTo:location.href}});
  if(error)showError(error);else message.textContent='تم إرسال رابط الدخول إلى بريدك.';
 });
 dialog.querySelector('[data-auth-google]').addEventListener('click',async()=>{
  const {error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.href}});
  if(error)showError(error);
 });
 client.auth.getSession().then(({data,error})=>{if(error)showError(error);render(data.session)});
 client.auth.onAuthStateChange((_event,session)=>render(session));
})();
