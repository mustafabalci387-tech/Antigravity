from typing import List, Optional
from bson import ObjectId
from app.base.BaseService import BaseService
from app.features.portfolio.repository import PortfolioRepository
from app.features.portfolio.manager import PortfolioManager

class PortfolioService(BaseService):
    """
    PortfolioService: Orkestrasyon katmanı.
    """
    def __init__(self, repository: PortfolioRepository = None, manager: PortfolioManager = None):
        repo = repository or PortfolioRepository()
        super().__init__(repository=repo)
        self.manager = manager or PortfolioManager(portfolio_repo=repo)

    async def add_item(self, data: dict, user_id: str) -> dict:
        data["kullanici_id"] = str(user_id)
        id = await self.create(data)
        return await self.get_by_id(id)

    async def get_user_portfolio(self, user_id: str) -> List[dict]:
        query = {"kullanici_id": str(user_id), "silindi_mi": False}
        cursor = self.repository.collection.find(query)
        documents = await cursor.to_list(length=100)
        return [self.repository.to_dict(doc) for doc in documents if doc]

    async def update_item(self, portfolio_id: str, user_id: str, data: dict) -> dict:
        item = await self.get_by_id(portfolio_id)
        self.manager.check_portfolio_ownership(item, user_id)
        return await self.update(portfolio_id, data)

    async def delete_item(self, portfolio_id: str, user_id: str):
        item = await self.get_by_id(portfolio_id)
        self.manager.check_portfolio_ownership(item, user_id)
        return await self.delete(portfolio_id)
