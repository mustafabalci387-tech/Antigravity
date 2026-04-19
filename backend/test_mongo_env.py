import os
from pymongo import MongoClient
import certifi

def test_connection():
    # .env dosyasındaki satırları okuyoruz
    with open(".env", "r", encoding="utf-8") as f:
        for line in f:
            if line.startswith("MONGO_URI="):
                uri = line.strip().replace("MONGO_URI=", "")
                break
    
    print(f"Denenecek URI: {uri}")
        
    try:
        client = MongoClient(uri, tlsCAFile=certifi.where())
        client.server_info()
        print("PYTHON İLE BAĞLANTI BAŞARILI! SUNUCU ŞİFREYİ ONAYLADI.")
    except Exception as e:
        print(f"HATA OLUŞTU: {e}")

if __name__ == "__main__":
    test_connection()
