import urllib.request
import json
import uuid

email = f"test_{uuid.uuid4().hex[:8]}@test.com"
req1 = urllib.request.Request(
    'http://localhost:5000/api/auth/register', 
    data=json.dumps({'email': email, 'password': 'password123', 'firstName': 'A', 'lastName': 'B', 'role': 'client'}).encode(),
    headers={'Content-Type': 'application/json'}
)
token = json.loads(urllib.request.urlopen(req1).read().decode())['data']['token']

req_conv = urllib.request.Request(
    'http://localhost:5000/api/messages/', 
    data=json.dumps({"receiverId":"6f8d0a7a4f9b", "content":"Test message for conversation"}).encode(),
    headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {token}'}
)
urllib.request.urlopen(req_conv)

req2 = urllib.request.Request(
    'http://localhost:5000/api/messages/conversations', 
    headers={'Authorization': f'Bearer {token}'}
)
convs_raw = urllib.request.urlopen(req2).read().decode()
convs = json.loads(convs_raw)

conv_id = convs['data']['conversations'][0]['id']

req3 = urllib.request.Request(
    f'http://localhost:5000/api/messages/{conv_id}', 
    headers={'Authorization': f'Bearer {token}'}
)
try:
    print(urllib.request.urlopen(req3).read().decode())
except urllib.error.HTTPError as e:
    print("messages error:", e.read().decode())
