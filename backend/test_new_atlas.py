import concurrent.futures
from pymongo import MongoClient
import certifi

def check_auth(username, password):
    uri = f"mongodb+srv://{username}:{password}@cluster0.6mgrocx.mongodb.net/collabflow_db?retryWrites=true&w=majority"
    try:
        client = MongoClient(uri, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=2000)
        client.server_info()
        return f"SUCCESS: {username} / {password}"
    except Exception as e:
        return f"FAIL: {username} / {password} - {e.__class__.__name__} ({str(e)})"

def test_combinations():
    combinations = [
        ("admin", "polis9090"),
        ("admin", "Polis9090"),
        ("admin", "polis123"),
        ("mbrsblc0450", "polis9090"),
    ]
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        results = executor.map(lambda p: check_auth(*p), combinations)
        
    for r in results:
        print(r)

if __name__ == "__main__":
    test_combinations()
