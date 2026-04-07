from app.base.BaseRepo import BaseRepository

class JobRepository(BaseRepository):
    def __init__(self):
        super().__init__(collection_name="jobs")
