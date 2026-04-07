import concurrent.futures
from pymongo import MongoClient
import certifi

def check_auth(username, password):
    uri = f"mongodb+srv://{username}:{password}@cluster0.e7hghqs.mongodb.net/collabflow_db?retryWrites=true&w=majority"
    try:
        client = MongoClient(uri, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=2000)
        client.server_info()
        return f"SUCCESS: {username} / {password}"
    except Exception as e:
        return f"FAIL: {username} / {password} - {e.__class__.__name__}"

def test_combinations():
    combinations = [
        ("mbrsblc0450", "collabflow123"),
        ("mbrsblc0450", "polis9090"),
        ("mbrsblc0450", "8W9DbHGtrRCOY9Ph"),
        ("collabflow_user", "collabflow123"),
        ("admin_baris", "baris123456"),
        ("mbrsblc0404", "polis9090"),
        ("mbrsblc5004", "polis9090"),
    ]
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        results = executor.map(lambda p: check_auth(*p), combinations)
        
    for r in results:
        print(r)

if __name__ == "__main__":
    test_combinations()
