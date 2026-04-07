from fastapi import APIRouter, Depends, Query, status
from app.core.dependencies import get_current_user, authorize
from app.core.response import success_response
from app.features.payment.service import PaymentService
from app.features.payment.dto import PaymentCreateDTO, PaymentResponseDTO
from typing import Optional

router = APIRouter(prefix="/api/payments", tags=["Payments"])
payment_service = PaymentService()

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_payment(
    body: PaymentCreateDTO,
    current_user: dict = Depends(authorize("client", "admin"))
):
    """Yeni ödeme kaydı oluşturur."""
    data = body.model_dump()
    data["isveren_id"] = str(current_user.get("id"))
    payment = await payment_service.create_payment(data)
    return success_response("Ödeme başarıyla oluşturuldu", payment)

@router.patch("/{payment_id}/approve")
async def approve_payment(
    payment_id: str,
    current_user: dict = Depends(authorize("client", "admin"))
):
    """İşveren işi onaylar, ödeme tamamlanır."""
    payment = await payment_service.approve_work_and_complete_payment(payment_id)
    return success_response("İş onaylandı ve ödeme tamamlandı", payment)

@router.patch("/{payment_id}/reject")
async def reject_payment(
    payment_id: str,
    current_user: dict = Depends(authorize("client", "admin"))
):
    """İş reddedilir, ödeme iptal edilir."""
    payment = await payment_service.reject_work_and_cancel_payment(payment_id)
    return success_response("İş reddedildi ve ödeme iptal edildi", payment)

@router.get("/isveren/{isveren_id}")
async def get_isveren_payments(
    isveren_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """İşverene ait tüm ödemeleri listeler."""
    skip = (page - 1) * limit
    payments, total_count = await payment_service.get_payments_by_isveren(isveren_id, skip=skip, limit=limit)

    total_pages = (total_count + limit - 1) // limit if limit > 0 else 0
    pagination = {
        "currentPage": page,
        "totalPages": total_pages,
        "totalItems": total_count,
        "hasNextPage": page < total_pages,
        "hasPrevPage": page > 1
    }
    return success_response("İşveren ödemeleri listelendi", {"payments": payments, "pagination": pagination})

@router.get("/freelancer/{freelancer_id}")
async def get_freelancer_payments(
    freelancer_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """Freelancer'a ait tüm ödemeleri listeler."""
    skip = (page - 1) * limit
    payments, total_count = await payment_service.get_payments_by_freelancer(freelancer_id, skip=skip, limit=limit)

    total_pages = (total_count + limit - 1) // limit if limit > 0 else 0
    pagination = {
        "currentPage": page,
        "totalPages": total_pages,
        "totalItems": total_count,
        "hasNextPage": page < total_pages,
        "hasPrevPage": page > 1
    }
    return success_response("Freelancer ödemeleri listelendi", {"payments": payments, "pagination": pagination})

@router.get("/ilan/{ilan_id}")
async def get_ilan_payments(
    ilan_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Belirli bir ilana ait ödemeleri listeler."""
    payments, total_count = await payment_service.get_payments_by_ilan(ilan_id)
    return success_response("İlan ödemeleri listelendi", {"payments": payments, "total": total_count})

@router.get("/{payment_id}")
async def get_payment(
    payment_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Ödeme detaylarını getirir."""
    payment = await payment_service.get_by_id(payment_id)
    return success_response("Ödeme detayları getirildi", payment)

@router.delete("/{payment_id}")
async def delete_payment(
    payment_id: str,
    current_user: dict = Depends(authorize("admin"))
):
    """Ödemeyi siler (Soft Delete — Sadece Admin)."""
    await payment_service.delete(payment_id)
    return success_response("Ödeme silindi")
