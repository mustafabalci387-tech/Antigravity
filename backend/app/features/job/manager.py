from app.base.BaseManager import BaseManager
from app.core.exceptions import ApiError

class JobManager(BaseManager):
    """
    JobManager: İş Mantığı (Business Logic).
    """
    def __init__(self):
        super().__init__()

    def validate_budget(self, budget: float):
        if budget < 50:
            raise ApiError("Minimum iş bütçesi 50 birim olmalıdır", 400)
        return budget
