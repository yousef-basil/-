# منصة النشر الذكي

مشروع React + Vite لكتابة وتجهيز محتوى مخصص لمنصات التواصل.

## التشغيل محليًا

```powershell
npm install
npm run dev
```

ثم افتح الرابط الذي يظهر في الطرفية.

## مهم قبل النشر

- لا تضع أي `API key` داخل الكود.
- هذا المشروع يعمل من المتصفح مباشرة، لذلك أي مفتاح تدخله داخل الواجهة يبقى على جهازك في `localStorage` ولا يجب حفظه في GitHub.
- إذا أردت استخدام مفاتيح API بشكل آمن مع مستخدمين آخرين، الأفضل نقل الطلبات إلى Backend بدل استدعائها مباشرة من المتصفح.

## رفع المشروع إلى GitHub

إذا لم يكن المشروع مربوطًا بـ GitHub بعد:

```powershell
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<USERNAME>/<REPO>.git
git push -u origin main
```

## النشر على GitHub Pages

هذا المشروع مجهز بملف workflow داخل:

`.github/workflows/deploy.yml`

بعد رفع المشروع:

1. افتح المستودع على GitHub.
2. اذهب إلى `Settings` ثم `Pages`.
3. في `Build and deployment` اختر `Source: GitHub Actions`.
4. ادفع أي تعديل إلى فرع `main`.
5. انتظر حتى ينجح Workflow في تبويب `Actions`.

بعدها سيكون رابط الموقع غالبًا:

- `https://<USERNAME>.github.io/<REPO>/`
- أو `https://<USERNAME>.github.io/` إذا كان اسم المستودع هو `<USERNAME>.github.io`

## مشاركة المشروع مع صديقك

أرسل له أحد الرابطين:

- رابط المستودع على GitHub
- رابط الموقع المنشور على GitHub Pages

## أوامر مفيدة

```powershell
npm run build
npm run preview
```
