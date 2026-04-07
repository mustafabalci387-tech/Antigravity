import bcrypt
from typing import Dict, Any
from app.base.BaseManager import BaseManager
from app.core.exceptions import ApiError

class UserManager(BaseManager):
    """
    UserManager: İş Mantığı (Business Logic).
    Hoca Kuralı: Çekirdek algoritmalar, hesaplamalar, kurallar buradadır.
    """
    def __init__(self):
        super().__init__()

    def hash_password(self, password: str) -> str:
        return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("utf-8")

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

    def validate_user_role(self, role: str):
        if role not in ["admin", "client", "freelancer"]:
            raise ApiError("Geçersiz rol tanımlandı", 400)
