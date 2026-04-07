import os
from pymongo import MongoClient
import certifi

def test_connection():
    # .env dosyasındaki ilk satırı çekip temizliyoruz
    with open(".env", "r", encoding="utf-8") as f:
        env_line = f.readline().strip()
        # Baştaki MONGODB_URL= kısmını atıyoruz
        uri = env_line.replace("MONGODB_URL=", "")
    
    print(f"Denenecek URI: {uri}")
        
    try:
        client = MongoClient(uri, tlsCAFile=certifi.where())
        client.server_info()
        print("PYTHON İLE BAĞLANTI BAŞARILI! SUNUCU ŞİFREYİ ONAYLADI.")
    except Exception as e:
        print(f"HATA OLUŞTU: {e}")

if __name__ == "__main__":
    test_connection()
