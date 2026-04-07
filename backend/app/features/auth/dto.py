from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class RegisterRequest(BaseModel):
    """Kayıt isteği (Hoca Standartları)."""
    ad: str = Field(..., min_length=1, max_length=50)
    soyad: str = Field(..., min_length=1, max_length=50)
    email: EmailStr
    sifre: str = Field(..., min_length=6)
    rol: Optional[str] = Field(default="freelancer", pattern="^(freelancer|client|admin)$")

class LoginRequest(BaseModel):
    """Giriş isteği."""
    email: EmailStr
    sifre: str = Field(..., min_length=1)
