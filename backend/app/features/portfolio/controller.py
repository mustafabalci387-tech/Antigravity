from fastapi import APIRouter, Depends, UploadFile, File, status
from typing import List
from app.core.dependencies import get_current_user 
from app.features.shared.services.cloudinary_service import CloudinaryService
from app.core.response import success_response
from app.features.portfolio.dto import PortfolioCreate, PortfolioUpdate, PortfolioResponse
from app.features.portfolio.service import PortfolioService

router = APIRouter(prefix="/api/portfolio", tags=["Portfolio"])

# DI Helper
def get_portfolio_service():
    return PortfolioService()

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_portfolio_item(
    item: PortfolioCreate,
    current_user: dict = Depends(get_current_user),
    portfolio_service: PortfolioService = Depends(get_portfolio_service)
):
    """Yeni bir portfolyo öğesi ekler."""
    created = await portfolio_service.add_item(item.model_dump(), str(current_user["id"]))
    return success_response("Portfolyo başarıyla eklendi", PortfolioResponse.model_validate(created).model_dump())

@router.get("/user/{user_id}")
async def get_user_portfolio(
    user_id: str,
    portfolio_service: PortfolioService = Depends(get_portfolio_service)
):
    items = await portfolio_service.get_user_portfolio(user_id)
    return success_response(
        "Portfolyo listesi başarıyla getirildi", 
        [PortfolioResponse.model_validate(i).model_dump() for i in items]
    )

@router.put("/{portfolio_id}")
async def update_portfolio_item(
    portfolio_id: str,
    item: PortfolioUpdate,
    current_user: dict = Depends(get_current_user),
    portfolio_service: PortfolioService = Depends(get_portfolio_service)
):
    """Portfolyo öğesini günceller."""
    updated = await portfolio_service.update_item(
        portfolio_id, 
        str(current_user["id"]), 
        item.model_dump(exclude_unset=True)
    )
    return success_response("Portfolyo öğesi başarıyla güncellendi", PortfolioResponse.model_validate(updated).model_dump())

@router.delete("/{portfolio_id}")
async def delete_portfolio_item(
    portfolio_id: str,
    current_user: dict = Depends(get_current_user),
    portfolio_service: PortfolioService = Depends(get_portfolio_service)
):
    """Portfolyo öğesini siler."""
    await portfolio_service.delete_item(portfolio_id, str(current_user["id"]))
    return success_response("Portfolyo başarıyla silindi", {"id": portfolio_id})

@router.post("/upload")
async def upload_portfolio_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Portfolyo için görsel yükler."""
    url = await CloudinaryService.upload_image(file, folder="portfolios")
    return success_response("Görsel başarıyla yüklendi", {"medya_url": url})