"""
logger.py — Admin İşlem Loglama Servisi
"""

from datetime import datetime
from typing import Any, Dict, Optional
import logging
from enum import Enum

from app.core.database import get_db

# Sistemin ana loglayıcısını al
logger = logging.getLogger(__name__)

# ─── Admin Eylem Sabitleri (StrEnum) ───────────────────────────────────────────
class AdminEylem(str, Enum):
    """Admin tarafından gerçekleştirilebilecek eylem türleri."""
    
    # Kullanıcı İşlemleri
    KULLANICI_SILME = "KULLANICI_SILME"
    KULLANICI_GUNCELLEME = "KULLANICI_GUNCELLEME"
    KULLANICI_DEAKTIF = "KULLANICI_DEAKTIF"
    KULLANICI_AKTIF = "KULLANICI_AKTIF"
    ROL_DEGISTIRME = "ROL_DEGISTIRME"

    # İlan İşlemleri
    ILAN_SILME = "ILAN_SILME"
    ILAN_GUNCELLEME = "ILAN_GUNCELLEME"
    ILAN_DURUM_DEGISTIRME = "ILAN_DURUM_DEGISTIRME"

    # Teklif İşlemleri
    TEKLIF_SILME = "TEKLIF_SILME"
    TEKLIF_GUNCELLEME = "TEKLIF_GUNCELLEME"

    # Ödeme İşlemleri
    ODEME_SILME = "ODEME_SILME"
    ODEME_ONAYLAMA = "ODEME_ONAYLAMA"
    ODEME_REDDETME = "ODEME_REDDETME"

    # Sistem İşlemleri
    SISTEM_AYAR_GUNCELLEME = "SISTEM_AYAR_GUNCELLEME"
    ISTATISTIK_GORUNTULEME = "ISTATISTIK_GORUNTULEME"


async def log_admin_action(
    admin_id: str,
    eylem: AdminEylem,
    hedef_tur: str,
    admin_email: str = "",
    hedef_id: str = "",
    detay: str = "",
    onceki_deger: Optional[Dict[str, Any]] = None,
    yeni_deger: Optional[Dict[str, Any]] = None,
    ip_adresi: str = "",
) -> Optional[str]:
    """
    Admin işlemini MongoDB 'admin_logs' koleksiyonuna asenkron kaydeder.
    
    Not: Bu fonksiyon exception fırlatmaz.
    """

    try:
        db = get_db()

        log_kaydi = {
            "admin_id": str(admin_id),
            "admin_email": admin_email,
            # Enum değerini doğrudan stringe çevir (JS/DB uyumu için)
            "eylem": eylem.value, 
            "hedef_tur": hedef_tur,
            "hedef_id": str(hedef_id) if hedef_id else "",
            "detay": detay,
            "onceki_deger": onceki_deger,
            "yeni_deger": yeni_deger,
            "ip_adresi": ip_adresi,
            "tarih": datetime.utcnow(),
        }

        result = await db.admin_logs.insert_one(log_kaydi)
        return str(result.inserted_id)

    except Exception as e:
        # print yerine logging modülü
        logger.error(f"Admin log kaydı yazılamadı: {str(e)}", exc_info=True)
        return None