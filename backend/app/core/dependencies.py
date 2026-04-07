from fastapi import Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError, ExpiredSignatureError
import os

from app.core.database import get_db
from app.core.exceptions import ApiError
from bson import ObjectId

# Bearer token şeması
security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Kullanıcıyı doğrular ve yeni Türkçe alan isimleriyle döndürür.
    """
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            os.getenv("JWT_SECRET", "collabflow_super_secret_key_2026"),
            algorithms=["HS256"]
        )
        user_id = payload.get("id")
        if user_id is None:
            raise ApiError("Geçersiz token", 401)
    except ExpiredSignatureError:
        raise ApiError("Token süresi dolmuş", 401)
    except JWTError:
        raise ApiError("Geçersiz token", 401)

    db = get_db()
    user = await db.users.find_one({"_id": ObjectId(user_id)})

    if not user:
        raise ApiError("Bu token'a ait kullanıcı artık mevcut değil", 401)

    # Rehberdeki Türkçe standartlara dönüştür
    user["id"] = str(user["_id"])
    user["rol"] = user.get("rol", "freelancer")

    return user

def authorize(*roles):
    """
    Belirli rollere (rol) sahip kullanıcıların erişimine izin verir.
    """
    async def role_checker(
        current_user: dict = Depends(get_current_user)
    ) -> dict:
        user_role = current_user.get("rol")
        if user_role not in roles:
            raise ApiError(
                f"'{user_role}' rolü bu işlem için yetkilendirilmemiş",
                403
            )
        return current_user

    return role_checker
