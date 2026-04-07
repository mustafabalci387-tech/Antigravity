import os
from datetime import datetime, timedelta
from jose import jwt
from app.core.exceptions import ApiError
from app.features.user.service import UserService

class AuthManager:
    """
    AuthManager: Kimlik doğrulama süreçlerini yöneten orkestratör.
    (Hoca Rehberi'nde Auth için ayrı bir Service/Manager ayrımı istenebilir ama burada 
    süreç yönetimi yoğun olduğu için AuthManager orkestratör görevi görür.)
    """
    def __init__(self):
        self.user_service = UserService()

    async def register(self, data: dict) -> dict:
        user = await self.user_service.register_user(data)
        user_id_str = str(user.get("id", user.get("_id")))
        token = self.generate_token(user_id_str, user.get("rol", "freelancer"))
        return {"user": user, "token": token}

    async def login(self, data: dict) -> dict:
        email = data.get("email")
        sifre = data.get("sifre")

        if not email or not sifre:
            raise ApiError("E-posta ve şifre zorunludur", 400)

        user_db = await self.user_service.repository.get_by_email(email)
        
        if not user_db or not self.user_service.manager.verify_password(sifre, user_db["sifre"]):
            raise ApiError("E-posta veya şifre hatalı", 401)
        
        user_id_str = str(user_db.get("id", user_db.get("_id")))
        token = self.generate_token(user_id_str, user_db.get("rol", "freelancer"))
        # DB modelini DTO'ya çevir (manuel orkestrasyon)
        user_response = {
            "id": user_id_str,
            "ad": user_db.get("ad"),
            "soyad": user_db.get("soyad"),
            "email": user_db.get("email"),
            "rol": user_db.get("rol")
        }
        return {"user": user_response, "token": token}

    async def get_me(self, user_id: str) -> dict:
        return await self.user_service.get_user_by_id(user_id)

    @staticmethod
    def generate_token(user_id: str, rol: str) -> str:
        expires_in = os.getenv("JWT_EXPIRES_IN", "7d")
        delta = timedelta(days=7) # Default
        if expires_in.endswith("d"): delta = timedelta(days=int(expires_in[:-1]))

        payload = {
            "id": user_id,
            "rol": rol,
            "exp": datetime.utcnow() + delta,
            "iat": datetime.utcnow(),
        }

        return jwt.encode(
            payload,
            os.getenv("JWT_SECRET", "collabflow_super_secret_key_2026"),
            algorithm="HS256"
        )
