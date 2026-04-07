from pymongo import MongoClient
import sys

def test_connection():
    uri = "mongodb+srv://mbrsblc0450:8W9DbHGtrRCOY9Ph@cluster0.e7hghqs.mongodb.net/collabflow_db?retryWrites=true&w=majority"
    try:
        client = MongoClient(uri)
        # Attempt to get server info
        client.server_info()
        print("BAĞLANTI BAŞARILI!")
    except Exception as e:
        print(f"HATA: {e}")

if __name__ == "__main__":
    test_connection()
