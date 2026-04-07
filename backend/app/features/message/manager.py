from app.base.BaseManager import BaseManager
from app.core.exceptions import ApiError

class MessageManager(BaseManager):
    """
    MessageManager: İş Mantığı (Business Logic).
    """
    def __init__(self):
        super().__init__()

    def validate_message_content(self, content: str):
        if not content or len(content.strip()) == 0:
            raise ApiError("Mesaj içeriği boş olamaz", 400)
        return content.strip()