from fastapi import APIRouter, Depends, Query
from app.core.dependencies import authorize, get_current_user
from app.core.response import success_response
from app.features.bid.schemas import BidCreate
from app.features.bid.service import BidService

router = APIRouter(prefix="/api/bids", tags=["Bids"])
bid_service = BidService()

@router.post("/", status_code=201)
async def create_bid(
    body: BidCreate,
    current_user: dict = Depends(authorize("freelancer")),
):
    """Yeni teklif oluştur. (Sadece Freelancer)"""
    bid_data = body.model_dump()
    
    # Kullanıcı ID ve Ad-Soyad bilgilerini token'dan alıp enjekte ediyoruz
    bid_data["freelancerId"] = str(current_user.get("id", current_user.get("_id")))
    bid_data["freelancerName"] = f"{current_user.get('firstName', '')} {current_user.get('lastName', '')}".strip()

    bid = await bid_service.create(bid_data)
    return success_response("Teklif başarıyla oluşturuldu", {"bid": bid_service.to_response(bid)})

@router.get("/job/{job_id}")
async def get_bids_by_job(
    job_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    """İlana ait teklifleri getir. (Giriş yapmış herkes)"""
    result = await bid_service.get_bids_by_job(job_id, page, limit)
    return success_response("Teklifler başarıyla getirildi", {
        "bids": [bid_service.to_response(bid) for bid in result["data"]],
        "pagination": result["pagination"],
    })

@router.get("/my")
async def get_my_bids(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(authorize("freelancer")),
):
    """Freelancer'ın kendi tekliflerini getir. (Sadece Freelancer)"""
    result = await bid_service.get_bids_by_freelancer(str(current_user.get("id", current_user.get("_id"))), page, limit)
    return success_response("Teklifleriniz başarıyla getirildi", {
        "bids": [bid_service.to_response(bid) for bid in result["data"]],
        "pagination": result["pagination"],
    })

@router.patch("/{bid_id}/accept")
async def accept_bid(
    bid_id: str,
    current_user: dict = Depends(authorize("client")),
):
    """Teklifi kabul et. (Sadece Client)"""
    bid = await bid_service.accept_bid(bid_id, str(current_user.get("id", current_user.get("_id"))))
    return success_response("Teklif kabul edildi", {"bid": bid_service.to_response(bid)})

@router.patch("/{bid_id}/reject")
async def reject_bid(
    bid_id: str,
    current_user: dict = Depends(authorize("client")),
):
    """Teklifi reddet. (Sadece Client)"""
    bid = await bid_service.reject_bid(bid_id, str(current_user.get("id", current_user.get("_id"))))
    return success_response("Teklif reddedildi", {"bid": bid_service.to_response(bid)})