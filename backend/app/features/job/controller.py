from fastapi import APIRouter, Depends, Query, status
from app.core.dependencies import get_current_user, authorize
from app.core.response import success_response
from app.features.job.dto import JobCreate, JobResponse
from app.features.job.service import JobService
from typing import List, Optional

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])
job_service = JobService()

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_job(
    body: JobCreate,
    current_user: dict = Depends(authorize("client", "admin"))
):
    """Yeni iş ilanı oluşturur."""
    customer_id = str(current_user.get("id"))
    job = await job_service.create_job(body.model_dump(), customer_id)
    return success_response("İş ilanı başarıyla oluşturuldu", job)

@router.get("/")
async def list_jobs(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    category: str = Query(None),
    min_budget: float = Query(None),
    max_budget: float = Query(None),
    is_veren_id: Optional[str] = Query(None)
):
    """İlanları listele (Dinamik filtreleme)."""
    filters = {}
    if category:
        filters["kategori"] = {"$regex": category, "$options": "i"}
    if is_veren_id:
        filters["is_veren_id"] = is_veren_id
        
    # Bütçe filtreleme
    if min_budget is not None or max_budget is not None:
        filters["butce"] = {}
        if min_budget is not None:
            filters["butce"]["$gte"] = min_budget
        if max_budget is not None:
            filters["butce"]["$lte"] = max_budget
        
    skip = (page - 1) * limit
    jobs, total_count = await job_service.list_jobs(skip=skip, limit=limit, filters=filters)
    
    total_pages = (total_count + limit - 1) // limit if limit > 0 else 0
    pagination = {
        "currentPage": page,
        "totalPages": total_pages,
        "totalItems": total_count,
        "hasNextPage": page < total_pages,
        "hasPrevPage": page > 1
    }
    return success_response("İlanlar listelendi", {"jobs": jobs, "pagination": pagination})

@router.get("/{job_id}")
async def get_job(job_id: str):
    """İlan detaylarını getir."""
    job = await job_service.get_job(job_id)
    return success_response("İlan detayları getirildi", job)

@router.patch("/{job_id}/status")
async def update_job_status(
    job_id: str,
    status: str = Query(..., pattern="^(acik|devam_ediyor|tamamlandi|iptal)$"),
    current_user: dict = Depends(get_current_user)
):
    """İlan durumunu günceller."""
    job = await job_service.update_job_status(job_id, status)
    return success_response("İlan durumu güncellendi", job)

@router.put("/{job_id}/extend")
async def extend_job_deadline(
    job_id: str,
    current_user: dict = Depends(authorize("client", "admin"))
):
    """İlanın bitiş tarihini 7 gün uzatır."""
    job = await job_service.get_job(job_id)
    if current_user.get("rol") != "admin" and str(job.get("is_veren_id")) != str(current_user.get("id")):
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Kendi ilanınız dışındaki ilanları güncelleyemezsiniz.")
        
    updated_job = await job_service.extend_job_deadline(job_id, days=7)
    return success_response("İlan süresi uzatıldı", dict(updated_job))

@router.delete("/{job_id}")
async def delete_job(
    job_id: str,
    current_user: dict = Depends(authorize("client", "admin"))
):
    """İlanı siler (Soft Delete)."""
    # Yetki kontrolü: İlanın sahibi mi?
    job = await job_service.get_job(job_id)
    if current_user.get("rol") != "admin" and str(job.get("is_veren_id")) != str(current_user.get("id")):
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Kendi ilanınız dışındaki ilanları silemezsiniz.")
        
    await job_service.delete(job_id)
    return success_response("İş ilanı silindi")
