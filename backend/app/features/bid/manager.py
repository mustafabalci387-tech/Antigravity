from app.base.BaseManager import BaseManager
from app.core.exceptions import ApiError

class BidManager(BaseManager):
    """
    BidManager: İş Mantığı (Business Logic).
    """
    def __init__(self):
        super().__init__()

    def validate_bid_amount(self, amount: float):
        if amount <= 0:
            raise ApiError("Teklif fiyatı 0'dan büyük olmalıdır", 400)
        return amount
