class BaseService:
    def __init__(self, repository):
        self.repository = repository

    async def get_by_id(self, id: str):
        return await self.repository.get_by_id(id)

    async def list_all(self, skip: int = 0, limit: int = 10, filters: dict = None):
        return await self.repository.get_many(skip=skip, limit=limit, filters=filters)

    async def create(self, data: dict):
        return await self.repository.create(data)

    async def update(self, id: str, data: dict):
        return await self.repository.update(id, data)

    async def delete(self, id: str):
        return await self.repository.soft_delete(id)