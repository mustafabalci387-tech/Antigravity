from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    """Kullanıcı kayıt DTO (Hoca Standardı)."""
    ad: str = Field(..., min_length=1, max_length=50)
    soyad: str = Field(..., min_length=1, max_length=50)
    email: EmailStr
    sifre: str = Field(..., min_length=6)
    rol: str = Field(default="freelancer", pattern="^(freelancer|client|admin)$")

class UserUpdate(BaseModel):
    """Kullanıcı güncelleme DTO."""
    ad: Optional[str] = Field(None, max_length=50)
    soyad: Optional[str] = Field(None, max_length=50)
    telefon: Optional[str] = None
    avatar: Optional[str] = None
    aciklama: Optional[str] = Field(None, max_length=500)
    unvan: Optional[str] = Field(None, max_length=100)
    deneyim: Optional[str] = Field(None, max_length=50)
    etiketler: Optional[List[str]] = None
    sosyal_medya: Optional[dict] = None
    
    model_config = ConfigDict(extra="allow", populate_by_name=True)

class UserResponse(BaseModel):
    """Kullanıcı yanıt DTO (Güvenli)."""
    id: str
    ad: str
    soyad: str
    email: str
    rol: str
    telefon: Optional[str] = None
    avatar: Optional[str] = None
    aciklama: Optional[str] = None
    unvan: Optional[str] = None
    deneyim: Optional[str] = None
    etiketler: List[str] = []
    sosyal_medya: Optional[dict] = None
    aktif_mi: bool = True
    olusturulma_tarihi: Optional[datetime] = None
    degistirilme_tarihi: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class UserListResponse(BaseModel):
    """Kullanıcı liste DTO."""
    id: str
    ad: str
    soyad: str
    email: str
    rol: str
    avatar: Optional[str] = None
