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
 dialog.innerHTML='<h2>تسجيل الدخول</h2><p>استخدم بريدك وكلمة مرورك. بياناتك الحالية ستظل على هذا الجهاز حتى تبدأ المزامنة.</p><form id="auth-form"><input type="email" name="email" required autocomplete="email" placeholder="البريد الإلكتروني" dir="ltr"><input type="password" name="password" required minlength="8" autocomplete="current-password" placeholder="كلمة المرور" dir="ltr"><div class="auth-actions"><button class="auth-button" type="submit" data-auth-login>تسجيل الدخول</button><button class="auth-button outline" type="button" data-auth-signup>إنشاء حساب</button><button class="auth-button outline" type="button" data-auth-reset>نسيت كلمة المرور؟</button><button class="auth-button outline" type="button" data-auth-close>إلغاء</button></div><div class="auth-message" role="status" aria-live="polite"></div></form>';
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
 const credentials=()=>{const data=new FormData(form);return {email:String(data.get('email')||'').trim(),password:String(data.get('password')||'')}};
 form.addEventListener('submit',async e=>{
  e.preventDefault();message.textContent='جارٍ تسجيل الدخول…';
  const {email,password}=credentials(),{error}=await client.auth.signInWithPassword({email,password});
  if(error)showError(error);else dialog.close();
 });
 dialog.querySelector('[data-auth-signup]').addEventListener('click',async()=>{
  const {email,password}=credentials();if(password.length<8){showError({message:'كلمة المرور يجب أن تكون ٨ أحرف على الأقل.'});return}
  message.textContent='جارٍ إنشاء الحساب…';
  const {error}=await client.auth.signUp({email,password});
  if(error)showError(error);else message.textContent='تم إنشاء الحساب. إذا طلبت Supabase تأكيد البريد، راجع بريدك الإلكتروني.';
 });
 dialog.querySelector('[data-auth-reset]').addEventListener('click',async()=>{
  const {email}=credentials();if(!email){showError({message:'اكتب بريدك الإلكتروني أولًا.'});return}
  message.textContent='جارٍ إرسال رابط استعادة كلمة المرور…';
  const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:location.href});
  if(error)showError(error);else message.textContent='تم إرسال رابط الاستعادة إلى بريدك الإلكتروني.';
 });
 client.auth.getSession().then(({data,error})=>{if(error)showError(error);render(data.session)});
 client.auth.onAuthStateChange((_event,session)=>render(session));
})();
