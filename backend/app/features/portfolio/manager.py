from app.base.BaseManager import BaseManager
from app.core.exceptions import ApiError
from app.features.portfolio.repository import PortfolioRepository # Repoyu içeri alıyoruz

class PortfolioManager(BaseManager):
    """
    PortfolioManager: İş Mantığı (Business Logic).
    Görevi: Sahiplik kontrolü ve modüle özgü kurallar.
    """
    # DİKKAT: Dependency Injection (IoC) uygulandı!
    def __init__(self, portfolio_repo: PortfolioRepository):
        super().__init__() # Repoyu BaseManager'a GÖNDERMİYORUZ (Argüman beklemez)
        self.portfolio_repo = portfolio_repo

    def check_portfolio_ownership(self, portfolio_item: dict, user_id: str):
        """Sahiplik kuralını denetler."""
        if not portfolio_item:
            raise ApiError("Portfolyo öğesi bulunamadı!", 404)
        
        if str(portfolio_item.get("kullanici_id")) != str(user_id):
            raise ApiError("Bu işlem için yetkiniz yok!", 403)
        
        return True