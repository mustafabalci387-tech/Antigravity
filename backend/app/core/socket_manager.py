import socketio
import os
from jose import jwt, JWTError

# 1. Asenkron Socket.IO Sunucusu
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")

class SocketManager:
    """
    SocketManager: Soket işlemlerini merkezi bir sınıf üzerinden yönetir.
    Hocanın 'kurumsal nesne yönelimli' mimari isteğine tam uygundur.
    """
    def __init__(self, sio_instance):
        self.sio = sio_instance

    def verify_token(self, token: str):
        try:
            if token.startswith("Bearer "):
                token = token.split(" ")[1]
            
            payload = jwt.decode(
                token, 
                os.getenv("JWT_SECRET", "collabflow_super_secret_key_2026"), 
                algorithms=["HS256"]
            )
            return payload.get("id")
        except JWTError:
            return None

    async def emit_to_user(self, user_id: str, event_name: str, data: dict):
        """
        Belirli bir kullanıcıya (kendi odasına) anlık veri gönderir.
        Service katmanı bu metodu çağırır.
        """
        await self.sio.emit(event_name, data, room=str(user_id))

# 2. Sınıfın bir örneğini (instance) oluşturuyoruz ki 
# diğer dosyalar 'from app.core.socket_manager import socket_manager' diyebilsin.
socket_manager = SocketManager(sio)

# 3. Socket Olayları (Events)
@sio.on("connect")
async def connect(sid, environ, auth):
    token = auth.get("token") if auth else None
    
    if not token:
        raise socketio.exceptions.ConnectionRefusedError('No token provided')

    user_id = socket_manager.verify_token(token)
    if not user_id:
        raise socketio.exceptions.ConnectionRefusedError('Invalid token')

    # Kullanıcıyı kendi ID'sine özel odaya al
    sio.enter_room(sid, str(user_id))
    print(f"[Socket] Connected: {user_id}")

@sio.on("disconnect")
async def disconnect(sid):
    print(f"[Socket] Disconnected: {sid}")