import asyncio
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.config.database import connect_db, get_db
from app.features.message.manager import MessageManager

async def run_test():
    await connect_db()
    db = get_db()
    user1 = await db.users.find_one()
    user2 = await db.users.find_one({'_id': {'$ne': user1['_id']}})
    
    print(f"Test basliyor: {user1['_id']} -> {user2['_id']}")
    
    mgr = MessageManager()
    try:
        res = await mgr.send_message(str(user1['_id']), str(user2['_id']), "Test mesaji")
        print("SUCCESS:", res)
    except Exception as e:
        import traceback
        with open("traceback.txt", "w") as f:
            traceback.print_exc(file=f)

if __name__ == '__main__':
    asyncio.run(run_test())
