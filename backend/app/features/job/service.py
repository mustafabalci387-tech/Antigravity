from typing import List
from app.base.BaseService import BaseService
from app.features.job.repository import JobRepository
from app.features.job.manager import JobManager

class JobService(BaseService):
    """
    JobService: Orkestrasyon katmanı.
    """
    def __init__(self, repository: JobRepository = None, manager: JobManager = None):
        super().__init__(repository=repository or JobRepository())
        self.manager = manager or JobManager()

    async def create_job(self, data: dict, customer_id: str) -> dict:
        self.manager.validate_budget(data["butce"])
        data["is_veren_id"] = str(customer_id)
        if "durum" not in data:
            data["durum"] = "acik"
        id = await self.create(data)
        return await self.get_by_id(id)

    async def list_jobs(self, skip: int = 0, limit: int = 10, filters: dict = None):
        jobs, count = await self.repository.get_many(skip=skip, limit=limit, filters=filters)
        return jobs, count

    async def get_job(self, job_id: str) -> dict:
        return await self.get_by_id(job_id)

    async def update_job_status(self, job_id: str, status: str) -> dict:
        return await self.update(job_id, {"durum": status})

    async def extend_job_deadline(self, job_id: str, days: int = 7) -> dict:
        from datetime import datetime, timedelta
        job = await self.get_by_id(job_id)
        current_deadline = job.get("bitis_tarihi")
        
        if current_deadline:
            if isinstance(current_deadline, str):
                current_deadline = datetime.fromisoformat(current_deadline.replace('Z', '+00:00'))
            new_deadline = current_deadline + timedelta(days=days)
        else:
            new_deadline = datetime.utcnow() + timedelta(days=days)
            
        return await self.update(job_id, {"bitis_tarihi": new_deadline})
