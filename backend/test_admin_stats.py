"""Admin istatistik sorgusunu dogrudan test et."""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
import certifi

MONGO_URI = "mongodb+srv://admin_baris:Baris123456@cluster0.6mgrocx.mongodb.net/collabflow_db?retryWrites=true&w=majority"

async def test_stats():
    client = AsyncIOMotorClient(MONGO_URI, tlsCAFile=certifi.where())
    db = client.collabflow_db
    
    # Koleksiyonlari listele
    collections = await db.list_collection_names()
    print(f"Mevcut koleksiyonlar: {collections}")
    
    base_filter = {"silindi_mi": False}
    simdi = datetime.utcnow()
    son_7_gun_filter = {**base_filter, "olusturulma_tarihi": {"$gte": simdi - timedelta(days=7)}}
    
    # Her sorguyu tek tek test et
    tests = [
        ("users count (base)", lambda: db.users.count_documents(base_filter)),
        ("users count (7gun)", lambda: db.users.count_documents(son_7_gun_filter)),
        ("users count (30gun)", lambda: db.users.count_documents({**base_filter, "olusturulma_tarihi": {"$gte": simdi - timedelta(days=30)}})),
        ("users rol dagilimi", lambda: db.users.aggregate([
            {"$match": base_filter},
            {"$group": {"_id": "$rol", "sayi": {"$sum": 1}}},
            {"$sort": {"sayi": -1}}
        ]).to_list(10)),
    ]
    
    for name, func in tests:
        try:
            result = await func()
            print(f"  [OK] {name}: {result}")
        except Exception as e:
            print(f"  [HATA] {name}: {e}")
    
    # jobs koleksiyonu var mi?
    print("\n--- jobs testi ---")
    try:
        jobs_count = await db.jobs.count_documents(base_filter)
        print(f"  [OK] jobs count: {jobs_count}")
    except Exception as e:
        print(f"  [HATA] jobs: {e}")

    # bids koleksiyonu
    print("\n--- bids testi ---")
    try:
        bids_count = await db.bids.count_documents(base_filter)
        print(f"  [OK] bids count: {bids_count}")
    except Exception as e:
        print(f"  [HATA] bids: {e}")

    # payments koleksiyonu
    print("\n--- payments testi ---")
    try:
        payments_count = await db.payments.count_documents(base_filter)
        print(f"  [OK] payments count: {payments_count}")
    except Exception as e:
        print(f"  [HATA] payments: {e}")

    # butce aggregate testi
    print("\n--- butce aggregate testi ---")
    try:
        cursor = db.jobs.aggregate([
            {"$match": base_filter},
            {"$group": {"_id": None, "toplam": {"$sum": "$butce"}}}
        ])
        data = await cursor.to_list(length=1)
        print(f"  [OK] butce aggregate: {data}")
    except Exception as e:
        print(f"  [HATA] butce aggregate: {e}")
    
    # teklif aggregate
    print("\n--- teklif aggregate testi ---")
    try:
        cursor = db.bids.aggregate([
            {"$match": base_filter},
            {"$group": {"_id": None, "ortalama": {"$avg": "$teklif_tutari"}, "toplam": {"$sum": "$teklif_tutari"}}}
        ])
        data = await cursor.to_list(length=1)
        print(f"  [OK] teklif aggregate: {data}")
    except Exception as e:
        print(f"  [HATA] teklif aggregate: {e}")
    
    # payment durum dagilimi
    print("\n--- payment durum dagilimi ---")
    try:
        cursor = db.payments.aggregate([
            {"$match": base_filter},
            {"$group": {"_id": "$odeme_durumu", "sayi": {"$sum": 1}}},
            {"$sort": {"sayi": -1}}
        ])
        data = await cursor.to_list(length=10)
        print(f"  [OK] payment durum: {data}")
    except Exception as e:
        print(f"  [HATA] payment durum: {e}")
    
    # payment hacim
    print("\n--- payment hacim testi ---")
    try:
        cursor = db.payments.aggregate([
            {"$match": {**base_filter, "odeme_durumu": "Completed"}},
            {"$group": {"_id": None, "toplam": {"$sum": "$tutar"}}}
        ])
        data = await cursor.to_list(length=1)
        result = data[0] if data else {}
        print(f"  [OK] payment hacim: {result}")
        print(f"  toplam = {result.get('toplam', 0)}")
    except Exception as e:
        print(f"  [HATA] payment hacim: {e}")

    # Tam asyncio.gather simülasyonu
    print("\n\n=== FULL GATHER TEST ===")
    try:
        async def _get_distribution(collection, group_field, match_query={"silindi_mi": False}):
            cursor = collection.aggregate([
                {"$match": match_query},
                {"$group": {"_id": f"${group_field}", "sayi": {"$sum": 1}}},
                {"$sort": {"sayi": -1}}
            ])
            data = await cursor.to_list(length=10)
            return {item["_id"]: item["sayi"] for item in data if item["_id"] is not None}

        async def _get_metric(collection, match_query, group_dict):
            cursor = collection.aggregate([
                {"$match": match_query},
                {"$group": {"_id": None, **group_dict}}
            ])
            data = await cursor.to_list(length=1)
            return data[0] if data else {}

        tasks = [
            db.users.count_documents(base_filter),
            db.users.count_documents(son_7_gun_filter),
            db.users.count_documents({**base_filter, "olusturulma_tarihi": {"$gte": simdi - timedelta(days=30)}}),
            _get_distribution(db.users, "rol"),
            db.jobs.count_documents(base_filter),
            db.jobs.count_documents(son_7_gun_filter),
            _get_distribution(db.jobs, "durum"),
            _get_metric(db.jobs, base_filter, {"toplam": {"$sum": "$butce"}}),
            db.bids.count_documents(base_filter),
            db.bids.count_documents(son_7_gun_filter),
            _get_metric(db.bids, base_filter, {"ortalama": {"$avg": "$teklif_tutari"}, "toplam": {"$sum": "$teklif_tutari"}}),
            db.payments.count_documents(base_filter),
            _get_distribution(db.payments, "odeme_durumu"),
            _get_metric(db.payments, {**base_filter, "odeme_durumu": "Completed"}, {"toplam": {"$sum": "$tutar"}})
        ]
        
        sonuclar = await asyncio.gather(*tasks)
        print(f"  Gather sonuc sayisi: {len(sonuclar)}")
        for i, s in enumerate(sonuclar):
            print(f"    [{i}]: {s}")
        
        # Controller'daki gibi kullan
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
                "toplam_teklif_tutari": sonuclar[10].get("toplam", 0),
            },
            "odemeler": {
                "toplam": sonuclar[11],
                "durum_dagilimi": sonuclar[12],
                "tamamlanan_toplam_hacim": sonuclar[13].get("toplam", 0),
            },
        }
        print(f"\n  FINAL RESULT: {istatistikler}")
        
    except Exception as e:
        import traceback
        print(f"  [HATA] GATHER: {e}")
        traceback.print_exc()

    client.close()

if __name__ == "__main__":
    asyncio.run(test_stats())
