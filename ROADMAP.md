# CollabFlow — Freelance İş & Proje Yönetim Platformu

## Vizyon
CollabFlow, freelance çalışanlar ve iş verenler için modern, güvenli ve ölçeklenebilir bir iş & proje yönetim platformudur. Amaç; iş ilanı açma, teklif verme, proje yönetimi, gerçek zamanlı iletişim, portfolyo ve ödeme süreçlerini tek bir çatı altında sunmaktır.

## Kullanılan Teknolojiler
- **Backend:** Python, FastAPI, Motor (async MongoDB), Pydantic, JWT, Passlib
- **Frontend:** Next.js, HeroUI, Tailwind CSS
- **Mobile:** React Native (Expo)
- **Deployment:** Vercel, Render

---

# 10 Haftalık Yol Haritası

## 1. Hafta — Temel Altyapı
- Backend: Proje dizini, package by feature, temel Express sunucusu, Mongoose bağlantısı, ortak hata yönetimi.
- Frontend: Next.js kurulumu, Tailwind CSS ve HeroUI entegrasyonu, temel layout.
- Mobile: Expo ile React Native başlangıcı, temel navigation.

## 2. Hafta — Kullanıcı Modülü & JWT & RBAC
- Backend: User model, DTO, JWT authentication, rol bazlı yetkilendirme (RBAC), repository/manager/service katmanları.
- Frontend: Kayıt/giriş sayfaları, rol seçimi, JWT ile oturum yönetimi.
- Mobile: Kayıt/giriş ekranları, JWT ile oturum.

## 3. Hafta — İş İlanları (Job/Project) Modülü & CRUD
- Backend: Job ve Project modelleri, CRUD endpointleri, rol bazlı erişim.
- Frontend: İş ilanı ve proje oluşturma/listeme/güncelleme/silme sayfaları.
- Mobile: İş ilanı ve proje ekranları, CRUD işlemleri.

## 4. Hafta — Teklif Verme (Bidding) Sistemi
- Backend: Proposal/Bid modeli, teklif verme endpointleri, freelancer/client ilişkisi.
- Frontend: Teklif verme ve teklifleri görüntüleme sayfaları.
- Mobile: Teklif verme ve teklif görüntüleme.

## 5. Hafta — Gerçek Zamanlı Mesajlaşma (Socket.io)
- Backend: Mesaj modeli, Socket.io entegrasyonu, mesaj endpointleri.
- Frontend: Gerçek zamanlı chat arayüzü, mesaj listesi.
- Mobile: Chat ekranı, Socket.io ile canlı mesajlaşma.

## 6. Hafta — Profil Detayları, Portfolyo ve Dosya Yükleme
- Backend: Profil ve portfolyo modelleri, dosya yükleme (Multer/Cloudinary), endpointler.
- Frontend: Profil düzenleme, portfolyo ekleme, dosya yükleme arayüzü.
- Mobile: Profil ve portfolyo ekranları, dosya yükleme.

## 7. Hafta — Bildirim Sistemi ve Email Entegrasyonu
- Backend: Bildirim modeli, email gönderimi (nodemailer), bildirim endpointleri.
- Frontend: Bildirim arayüzü, email bildirimleri.
- Mobile: Bildirim ekranı, push/email entegrasyonu.

## 8. Hafta — Ödeme Akışları ve İş Onay Mekanizmaları
- Backend: Ödeme modeli, iş onay endpointleri, ödeme entegrasyonu.
- Frontend: Ödeme arayüzü, iş onay butonları.
- Mobile: Ödeme ve iş onay ekranları.

## 9. Hafta — Admin Dashboard ve İstatistikler
- Backend: Admin yetkileri, istatistik endpointleri, loglama.
- Frontend: Admin dashboard, grafikler ve istatistikler.
- Mobile: Admin paneli, istatistik ekranı.

## 10. Hafta — Performans Optimizasyonu, Hata Ayıklama ve Deployment
- Backend: Kod optimizasyonu, hata ayıklama, testler, Render deployment.
- Frontend: Performans iyileştirmeleri, hata yönetimi, Vercel deployment.
- Mobile: Expo build, performans ve hata yönetimi.

---

> Tüm geliştirme saf JavaScript ile yapılacaktır. TypeScript kullanılmayacaktır.
