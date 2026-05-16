import os
from pathlib import Path
from dotenv import load_dotenv

# 1. ÖNCE ENV YÜKLENİR
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
from app.features.project.router import router as project_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()

# 2. KRİTİK NOKTA: ÖNCE APP OLUŞTURULUR (Bu satır yukarıda olmalıydı)
app = FastAPI(
    title="CollabFlow API",
    version="1.0.0",
    lifespan=lifespan,
)

# 3. SONRA MIDDLEWARE EKLENİR (Çünkü artık 'app' tanımlı)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Hata yöneticileri
app.add_exception_handler(ApiError, api_error_handler)
app.add_exception_handler(Exception, generic_error_handler)

# 4. ROUTER'LAR BAĞLANIR
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(job_router)
app.include_router(bid_router)
app.include_router(message_router)
app.include_router(portfolio_router)
app.include_router(notification_router)
app.include_router(payment_router, prefix="/api")
app.include_router(admin_router)
app.include_router(project_router)

@app.get("/")
async def root():
    return {"message": "🚀 CollabFlow API çalışıyor"}

socket_app = socketio.ASGIApp(sio)
app.mount("/socket.io", socket_app)

if __name__ == "__main__":
    import uvicorn
    # Port 5000: mobil uygulama (BlueStacks) 10.0.2.2:5000 adresine bağlanır
    # Host 0.0.0.0: dışarıdan (emülatör/telefon) gelen bağlantıları kabul eder
    PORT = int(os.getenv("PORT", 5000)) 
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)