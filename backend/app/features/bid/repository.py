from app.base.BaseRepo import BaseRepository

class BidRepository(BaseRepository):
    def __init__(self):
        super().__init__(collection_name="bids")

    async def get_job_bids(self, ilan_id: str):
        return await self.get_many(filters={"ilan_id": ilan_id})
