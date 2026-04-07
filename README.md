# CollabFlow — Freelance İş ve Proje Yönetim Platformu

## Proje Hakkında
CollabFlow, freelancer'lar ve işverenler arasındaki iş süreçlerini yöneten kapsamlı bir web ve mobil platformudur.

## Teknoloji Yığını

### Backend
- **Dil:** Python
- **Framework:** FastAPI
- **Veritabanı:** MongoDB (Motor async driver)
- **Kimlik Doğrulama:** JWT (python-jose)
- **Şifreleme:** bcrypt
- **Veri Doğrulama:** Pydantic

### Frontend (Web)
- **Framework:** Next.js
- **UI Kütüphanesi:** HeroUI
- **Stil:** Tailwind CSS
- **Durum Yönetimi:** React Context API

### Mobile
- **Framework:** React Native (Expo)
- **Navigasyon:** React Navigation (Bottom Tabs + Native Stack)
- **HTTP İstemci:** Axios
- **Güvenli Depolama:** Expo SecureStore

## Mimari Yapı
- **Package by Feature** klasör organizasyonu
- FastAPI Router → Service → MongoDB (Motor) katmanlı mimari
- Pydantic modelleri ile DTO doğrulama
- `Depends()` mekanizması ile auth middleware

## Kurulum

```bash
# Backend
cd backend
pip install -r requirements.txt
py main.py

# Frontend (Web)
cd frontend
npm install
npm run dev

# Mobile
cd mobile
npm install
npx expo start
```

## Klasör Yapısı
```
collabflow/
├── backend/
│   ├── app/
│   │   ├── config/        # Veritabanı bağlantısı (Motor)
│   │   ├── core/          # Auth dependency, exceptions, response
│   │   └── features/      # Feature bazlı modüller (auth, user, job)
│   ├── main.py            # FastAPI uygulaması (entry point)
│   ├── requirements.txt   # Python bağımlılıkları
│   └── .env
├── frontend/
│   └── app/               # Next.js sayfaları
│       ├── components/    # UI bileşenleri
│       └── services/      # API servisleri
├── mobile/
│   ├── App.js             # Ana giriş noktası
│   └── src/
│       ├── config/        # API yapılandırması
│       ├── core/          # Navigation, components, theme
│       └── features/      # Feature bazlı modüller (auth, job, project, vb.)
└── README.md
```
