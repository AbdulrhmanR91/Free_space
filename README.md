# مساحة حرة

## إعداد Supabase

1. أنشئ مشروع Supabase.
2. شغّل [supabase/migrations/0001_init.sql](./supabase/migrations/0001_init.sql) من SQL Editor.
3. في Authentication > URL Configuration أضف:
   - عنوان الإنتاج، مثل `https://example.com`
   - عنوان التطوير، مثل `http://localhost:3000`
4. فعّل Email provider لاستخدام رابط الدخول السحري.
5. تسجيل الدخول في الواجهة يعتمد على رابط البريد السحري.
6. راجع اختبارات العزل في [supabase/tests/rls.sql](./supabase/tests/rls.sql). استبدل UUIDs بمستخدمين تجريبيين فقط قبل تشغيلها عبر عميل PostgreSQL يدعم متغيرات `psql`.

العميل يستخدم الإصدار المثبت صراحة `@supabase/supabase-js@2.45.4` من CDN. المفتاح الموجود في [assets/js/config.js](./assets/js/config.js) publishable فقط، ولا تضع `service_role` في المشروع.

## الحالة الحالية

المرحلة ٢ تضيف الجداول وRLS وتسجيل الدخول فقط. التطبيق يظل محليًا بعد تسجيل الخروج. المزامنة المحلية-السحابية والـoutbox تأتي في المرحلة ٣.
