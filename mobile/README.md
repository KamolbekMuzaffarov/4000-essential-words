# Essential Words — Android ilovasi

Ilova GitHub Pages’dagi saytni ochadi: https://kamolbekmuzaffarov.github.io/4000-essential-words/

Shuning uchun saytga yangi so‘z yoki rasm qo‘shib GitHub’ga push qilsangiz, ilovada ham darhol ko‘rinadi:
ilova har ochilganda (va fondan qaytganda) yangi versiyani tekshiradi. APK’ni qayta qurish faqat
ilovaning o‘zi (ikonka, nom, sozlamalar) o‘zgarganda kerak.

## APK qayerdan olinadi

`mobile/` papkasi o‘zgarsa, GitHub Actions APK’ni avtomatik quradi va **Releases → android-app** ga
`EssentialWords.apk` qilib joylaydi:
https://github.com/KamolbekMuzaffarov/4000-essential-words/releases/latest/download/EssentialWords.apk

Qo‘lda qurish: GitHub → Actions → “Android APK” → Run workflow.

## Imzo kaliti

Hozir APK repodagi `android/app/debug.keystore` bilan imzolanadi (har safar bir xil kalit, shuning uchun
yangilanish eski ilova ustiga o‘rnatiladi). Play Market uchun shaxsiy kalit kerak bo‘lsa, repo
Settings → Secrets ga quyidagilarni qo‘shing, workflow avtomatik shuni ishlatadi:
`ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.

## Mahalliy qurish

```
cd mobile
npm ci
npx cap sync android
cd android && ./gradlew assembleRelease
```
