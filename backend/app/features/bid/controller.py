from fastapi import APIRouter, Depends, Query, status, BackgroundTasks
from app.core.dependencies import get_current_user
from app.core.response import success_response
from app.features.bid.dto import BidCreate, BidResponse
from app.features.bid.service import BidService
from app.features.job.service import JobService
from typing import List
from datetime import datetime
from fastapi import HTTPException

router = APIRouter(prefix="/api/bids", tags=["Bids"])
bid_service = BidService()
job_service = JobService()
@router.post("/")
async def post_bid(
    body: BidCreate,
    current_user: dict = Depends(get_current_user)
):
    """Teklif verir."""
    # Deadline kontrolü
    job = await job_service.get_job(body.ilan_id)
    if job and job.get("bitis_tarihi"):
        # bitis_tarihi string gelebilir (ISO format), datetime objesine çeviriyoruz
        deadline = job["bitis_tarihi"]
        if isinstance(deadline, str):
            deadline = datetime.fromisoformat(deadline.replace("Z", "+00:00"))
        
        if datetime.now(deadline.tzinfo if deadline.tzinfo else None) > deadline:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="İlanın başvuru süresi dolduğu için yeni teklif verilemez."
            )

    freelancer_id = str(current_user.get("id"))
    freelancer_name = f"{current_user.get('ad')} {current_user.get('soyad')}"
    bid = await bid_service.post_bid(body.model_dump(), freelancer_id, freelancer_name)
    return success_response("Teklifiniz başarıyla iletildi", bid)

@router.get("/job/{ilan_id}")
async def get_job_bids(ilan_id: str):
    """Bir ilana gelen teklifleri listeler."""
    bids = await bid_service.list_job_bids(ilan_id)
    return success_response("Teklifler listelendi", {"bids": bids})

@router.patch("/{bid_id}/status")
async def update_bid_status(
    bid_id: str,
    background_tasks: BackgroundTasks,
    status: str = Query(..., pattern="^(beklemede|onaylandi|reddedildi)$")
):
    """Teklif durumunu günceller ve arka planda e-posta/bildirim atar."""
    bid = await bid_service.update_bid_status(bid_id, status, background_tasks)
    return success_response("Teklif durumu güncellendi", bid)
