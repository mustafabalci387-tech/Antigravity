"""
admin_middleware.py — Admin Yetki Kontrolü (Geliştirme/Test Modu)
"""

from fastapi import Depends
# Not: get_current_user ve ApiError yollarının doğruluğundan emin ol
from app.core.dependencies import get_current_user
from app.core.exceptions import ApiError

ADMIN_ROLE = "admin"

def _check_account_status(user: dict):
    """Geliştirme aşamasında bu kontrolü yumuşatıyoruz."""
    # Eğer kullanıcı objesi varsa ve silinmiş olarak işaretlenmemişse izin ver
    if user.get("silindi_mi") is True:
        raise ApiError("Bu hesap silinmiş.", 403)
    return True


async def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """Yalnızca admin rolüne izin verir (Test Modu: Log eklendi)."""
    
    # Konsola kimin girmeye çalıştığını yazdıralım (Uvicorn terminalinde görünecek)
    print(f"--- ADMIN KONTROLÜ ---")
    print(f"Kullanıcı: {current_user.get('email')}")
    print(f"Rolü: {current_user.get('rol')}")
    print(f"----------------------")

    # Geçici olarak aktiflik kontrolünü bypass edebiliriz veya loglayabiliriz
    # _check_account_status(current_user) 

    if current_user.get("rol") != ADMIN_ROLE:
        # Hata fırlatmak yerine terminale uyarı basıp devam da edebiliriz 
        # ama yetki hatasını Swagger'da görmüştük, o yüzden kalsın.
        raise ApiError(
            f"Yetki Hatası! Mevcut rolünüz: {current_user.get('rol')}. Admin bekleniyor.",
            403
        )

    return current_user


async def require_admin_or_owner(
    resource_owner_id: str,
    current_user: dict = Depends(get_current_user)
) -> dict:
    """Admin VEYA sahibi kontrolü."""
    is_admin = current_user.get("rol") == ADMIN_ROLE
    # ID kontrolünde tip uyuşmazlığı (ObjectId vs String) olmaması için str() kullanıyoruz
    is_owner = str(current_user.get("_id")) == str(resource_owner_id) or str(current_user.get("id")) == str(resource_owner_id)

    if not is_admin and not is_owner:
        raise ApiError("Erişim yetkiniz bulunmuyor.", 403)

    return current_user