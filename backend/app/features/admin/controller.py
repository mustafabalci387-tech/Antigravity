"""
controller.py — Admin Dashboard İstatistik Endpoint'leri + Yetkilendirme
"""

import asyncio
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from bson import ObjectId
from app.core.database import get_db
from app.core.response import success_response
from app.core.exceptions import ApiError
from app.core.admin_middleware import require_admin

router = APIRouter(prefix="/api/admin", tags=["Admin"])


# ─── DTO (Rol Güncelleme İsteği) ─────────────────────────────────────────────
class RolGuncelleDTO(BaseModel):
    user_id: str
    yeni_rol: str  # "admin", "freelancer", "client"


# ─── Rol Güncelleme Endpoint'i ───────────────────────────────────────────────
@router.patch("/kullanici-rol")
async def kullanici_rol_guncelle(body: RolGuncelleDTO, admin: dict = Depends(require_admin)):
    """PATCH /api/admin/kullanici-rol — Kullanıcının rolünü günceller."""
    gecerli_roller = ["admin", "freelancer", "client"]
    if body.yeni_rol not in gecerli_roller:
        raise ApiError(f"Geçersiz rol. Kabul edilen roller: {', '.join(gecerli_roller)}", 400)

    db = get_db()

    try:
        hedef_kullanici = await db.users.find_one({"_id": ObjectId(body.user_id), "silindi_mi": False})
    except Exception:
        raise ApiError("Geçersiz kullanıcı ID formatı", 400)

    if not hedef_kullanici:
        raise ApiError("Kullanıcı bulunamadı", 404)

    # Rol güncelle
    await db.users.update_one(
        {"_id": ObjectId(body.user_id)},
        {"$set": {"rol": body.yeni_rol, "degistirilme_tarihi": datetime.utcnow()}}
    )

    return success_response(
        message=f"Kullanıcı rolü '{body.yeni_rol}' olarak güncellendi",
        data={
            "user_id": body.user_id,
            "yeni_rol": body.yeni_rol
        }
    )


# ─── Yardımcı Fonksiyonlar (DRY) ────────────────────────────────────────────────
async def _get_distribution(collection, group_field, match_query={"silindi_mi": False}):
    """Belirtilen alana göre dağılım çıkarır ve temiz bir dictionary döner."""
    cursor = collection.aggregate([
        {"$match": match_query},
        {"$group": {"_id": f"${group_field}", "sayi": {"$sum": 1}}},
        {"$sort": {"sayi": -1}}
    ])
    data = await cursor.to_list(length=10)
    return {item["_id"]: item["sayi"] for item in data if item["_id"] is not None}

async def _get_metric(collection, match_query, group_dict):
    """Toplam bütçe, ortalama gibi aggregation metriklerini hesaplar."""
    cursor = collection.aggregate([
        {"$match": match_query},
        {"$group": {"_id": None, **group_dict}}
    ])
    data = await cursor.to_list(length=1)
    return data[0] if data else {}


# ─── Endpoint ───────────────────────────────────────────────────────────────────
@router.get("/istatistikler")
async def get_istatistikler(admin: dict = Depends(require_admin)):
    try:
        db = get_db()
        simdi = datetime.utcnow()
        
        # Sık kullanılan filtreler
        base_filter = {"silindi_mi": False}
        son_7_gun_filter = {**base_filter, "olusturulma_tarihi": {"$gte": simdi - timedelta(days=7)}}
        son_30_gun_filter = {**base_filter, "olusturulma_tarihi": {"$gte": simdi - timedelta(days=30)}}

        # 1. BÜTÜN SORGULARI "TASK" OLARAK HAZIRLA (Henüz çalıştırma)
        tasks = [
            db.users.count_documents(base_filter),                  # 0: k_toplam
            db.users.count_documents(son_7_gun_filter),             # 1: k_7gun
            db.users.count_documents(son_30_gun_filter),            # 2: k_30gun
            _get_distribution(db.users, "rol"),                     # 3: k_rol
            
            db.jobs.count_documents(base_filter),                   # 4: i_toplam
            db.jobs.count_documents(son_7_gun_filter),              # 5: i_7gun
            _get_distribution(db.jobs, "durum"),                    # 6: i_durum
            _get_metric(db.jobs, base_filter, {"toplam": {"$sum": "$butce"}}), # 7: i_butce
            
            db.bids.count_documents(base_filter),                   # 8: t_toplam
            db.bids.count_documents(son_7_gun_filter),              # 9: t_7gun
            _get_metric(db.bids, base_filter, {                     # 10: t_metrik
                "ortalama": {"$avg": "$teklif_tutari"}, 
                "toplam": {"$sum": "$teklif_tutari"}
            }),
            
            db.payments.count_documents(base_filter),               # 11: o_toplam
            _get_distribution(db.payments, "odeme_durumu"),         # 12: o_durum
            _get_metric(db.payments, {**base_filter, "odeme_durumu": "Completed"}, {"toplam": {"$sum": "$tutar"}}) # 13: o_hacim
        ]

        # 2. TÜM SORGULARI AYNI ANDA (PARALEL) ÇALIŞTIR!
        sonuclar = await asyncio.gather(*tasks)

        # 3. YANIT OBJESİNİ OLUŞTUR
        istatistikler = {
            "kullanicilar": {
                "toplam": sonuclar[0],
                "son_7_gun_yeni_kayit": sonuclar[1],
                "son_30_gun_yeni_kayit": sonuclar[2],
                "rol_dagilimi": sonuclar[3],
            },
            "ilanlar": {
                "toplam": sonuclar[4],
                "son_7_gun_yeni_ilan": sonuclar[5],
                "durum_dagilimi": sonuclar[6],
                "toplam_butce": sonuclar[7].get("toplam", 0),
            },
            "teklifler": {
                "toplam": sonuclar[8],
                "son_7_gun_yeni_teklif": sonuclar[9],
                "ortalama_teklif_tutari": round(sonuclar[10].get("ortalama", 0) or 0, 2),
                "toplam_teklif_tutari": sonuclar[10].get("toplam", 0) or 0,
            },
            "odemeler": {
                "toplam": sonuclar[11],
                "durum_dagilimi": sonuclar[12],
                "tamamlanan_toplam_hacim": sonuclar[13].get("toplam", 0),
            },
            "rapor_tarihi": simdi.isoformat(),
        }

        return success_response(message="Admin istatistikleri getirildi", data=istatistikler)

    except Exception as e:
        raise ApiError(f"İstatistikler getirilirken hata oluştu: {str(e)}", 500)