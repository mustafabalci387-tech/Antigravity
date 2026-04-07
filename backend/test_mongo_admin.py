from pymongo import MongoClient
import certifi

def test_connection():
    uri = "mongodb+srv://admin_baris:baris123456@cluster0.e7hghqs.mongodb.net/collabflow_db?retryWrites=true&w=majority"
    print(f"Denenecek URI: {uri}")
        
    try:
        client = MongoClient(uri, tlsCAFile=certifi.where())
        client.server_info()
        print("PYTHON İLE BAĞLANTI BAŞARILI! SUNUCU ŞİFREYİ ONAYLADI.")
    except Exception as e:
        print(f"HATA OLUŞTU: {e}")

if __name__ == "__main__":
    test_connection()
