from app.base.BaseManager import BaseManager
from app.core.exceptions import ApiError

# Geçerli ödeme durumu ve onay durumu değerleri
VALID_ODEME_DURUMLARI = ["Pending", "Completed", "Rejected"]
VALID_ONAY_DURUMLARI = ["beklemede", "onaylandi", "reddedildi"]

class PaymentManager(BaseManager):
    """
    PaymentManager: Ödeme İş Mantığı (Business Logic) Katmanı.

    BaseManager'dan miras alınan:
        - validate_data

    Ödemeye özel iş kuralları:
        - validate_payment_amount  : Tutarın geçerli olup olmadığını kontrol eder
        - validate_odeme_durumu    : Ödeme durumunun geçerli bir değer olduğunu kontrol eder
        - validate_onay_durumu     : Onay durumunun geçerli bir değer olduğunu kontrol eder
        - get_or_404               : Ödeme bulunamazsa 404 hatası fırlatır
        - update_payment_status    : Ödeme durumunu güvenli bir şekilde günceller
        - update_onay_status       : Onay durumunu güvenli bir şekilde günceller
    """
    def __init__(self):
        super().__init__()

    def validate_payment_amount(self, tutar: float):
        """Hoca Kuralı: Ödeme tutarı 0'dan büyük olmalıdır."""
        if tutar is None or tutar <= 0:
            raise ApiError("Ödeme tutarı 0'dan büyük olmalıdır", 400)
        return tutar

    def validate_odeme_durumu(self, durum: str):
        """Ödeme durumunun geçerli bir değer olup olmadığını kontrol eder."""
        if durum not in VALID_ODEME_DURUMLARI:
            raise ApiError(
                f"Geçersiz ödeme durumu: '{durum}'. Geçerli değerler: {', '.join(VALID_ODEME_DURUMLARI)}",
                400
            )
        return durum

    def validate_onay_durumu(self, durum: str):
        """Onay durumunun geçerli bir değer olup olmadığını kontrol eder."""
        if durum not in VALID_ONAY_DURUMLARI:
            raise ApiError(
                f"Geçersiz onay durumu: '{durum}'. Geçerli değerler: {', '.join(VALID_ONAY_DURUMLARI)}",
                400
            )
        return durum

    def get_or_404(self, payment: dict, payment_id: str = ""):
        """Hoca Kuralı: Kayıt bulunamazsa 404 fırlat."""
        if not payment:
            raise ApiError(f"Ödeme bulunamadı (ID: {payment_id})", 404)
        return payment

    def update_payment_status(self, current: str, new_status: str) -> str:
        """
        Ödeme durumunu güvenli şekilde günceller.
        İş Kuralı: Rejected veya Completed olan ödeme tekrar Pending yapılamaz.
        """
        self.validate_odeme_durumu(new_status)

        if current == "Completed" and new_status == "Pending":
            raise ApiError("Tamamlanmış bir ödeme tekrar bekleyen durumuna alınamaz", 400)
        if current == "Rejected" and new_status == "Pending":
            raise ApiError("Reddedilmiş bir ödeme tekrar bekleyen durumuna alınamaz", 400)

        return new_status

    def update_onay_status(self, current: str, new_status: str) -> str:
        """
        Onay durumunu güvenli şekilde günceller.
        İş Kuralı: Onaylanmış veya reddedilmiş bir iş tekrar beklemede yapılamaz.
        """
        self.validate_onay_durumu(new_status)

        if current in ["onaylandi", "reddedildi"] and new_status == "beklemede":
            raise ApiError("Sonuçlanmış bir onay tekrar beklemede durumuna alınamaz", 400)

        return new_status
