from app.base.BaseRepo import BaseRepository

class PortfolioRepository(BaseRepository):
    """
    PortfolioRepository: Portfolyo veritabanı işlemleri.
    """
    def __init__(self):
        super().__init__(collection_name="portfolios")