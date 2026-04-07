"""
main.py — FastAPI uygulamasının giriş noktası (entry point).

Express.js server.js + app.js'in karşılığı.

Bu dosya 4 iş yapar:
  1. .env dosyasını yükler
  2. FastAPI uygulamasını oluşturur (CORS dahil)
  3. Router'ları bağlar
  4. MongoDB bağlantısını yönetir (startup/shutdown)
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# .env dosyasını yükle (en üstte, diğer importlardan önce)
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio

from app.core.database import connect_db, close_db
from app.core.exceptions import ApiError, api_error_handler, generic_error_handler
from app.core.socket_manager import sio

# Router importları
from app.features.auth.controller import router as auth_router
from app.features.user.controller import router as user_router
from app.features.job.controller import router as job_router
from app.features.bid.controller import router as bid_router
from app.features.message.controller import router as message_router
from app.features.portfolio.controller import router as portfolio_router
from app.features.notification.controller import router as notification_router
from app.features.payment.controller import router as payment_router
from app.features.admin.controller import router as admin_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Uygulama yaşam döngüsü yönetimi.
    Startup: MongoDB'ye bağlan
    Shutdown: MongoDB bağlantısını kapat
    """
    # Startup
    await connect_db()
    yield
    # Shutdown
    await close_db()


# FastAPI uygulamasını oluştur
app = FastAPI(
    title="CollabFlow API",
    description="Freelance İş & Proje Yönetim Platformu — Backend API",
    version="1.0.0",
    lifespan=lifespan,
)

# ========================
# CORS AYARLARI
# ========================
# Express.js app.use(cors()) karşılığı
# Tüm bağlantılara izin ver (Geliştirme aşaması için)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# ========================
# EXCEPTION HANDLERS
# ========================
# Express.js errorHandler middleware karşılığı
app.add_exception_handler(ApiError, api_error_handler)
app.add_exception_handler(Exception, generic_error_handler)

# ========================
# ROUTER'LARI BAĞLA
# ========================
# Express.js app.use('/api/auth', authRoutes) karşılığı
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(job_router)
app.include_router(bid_router)
app.include_router(message_router)
app.include_router(portfolio_router)
app.include_router(notification_router)
app.include_router(payment_router)
app.include_router(admin_router)


# Kök endpoint — Sağlık kontrolü
@app.get("/")
async def root():
    return {"message": "🚀 CollabFlow API çalışıyor", "version": "1.0.0"}


# ========================
# SOCKET.IO ENTEGRASYONU
# ========================
# Socket.IO uygulamasını doğrudan FastAPI mount ile bağlıyoruz (daha güvenilir)
socket_app = socketio.ASGIApp(sio)
app.mount("/socket.io", socket_app)

# ========================
# SUNUCUYU BAŞLAT
# ========================
if __name__ == "__main__":
    import uvicorn

    PORT = int(os.getenv("PORT", 5000))
    ENV = os.getenv("NODE_ENV", "development")

    print(f"CollabFlow Server {PORT} portunda calisiyor ({ENV} modu)")

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=PORT,
        reload=(ENV == "development"),
    )
