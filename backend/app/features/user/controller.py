import os
from fastapi import APIRouter, Depends, Query, UploadFile, File, status
from app.core.response import success_response
from app.core.dependencies import authorize, get_current_user
from app.features.user.service import UserService
from app.features.user.dto import UserUpdate, UserResponse, UserListResponse
from app.features.shared.services.cloudinary_service import CloudinaryService
from typing import List

router = APIRouter(prefix="/api/users", tags=["Users"])

# DI Helper
def get_user_service():
    return UserService()

@router.get("/")
async def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    current_user: dict = Depends(authorize("client", "freelancer", "admin")),
    user_service: UserService = Depends(get_user_service)
):
    """Kullanıcıları listele (Tüm roller)."""
    users = await user_service.list_users(skip=skip, limit=limit)
    return success_response("Kullanıcılar listelendi", {"users": users})

@router.get("/{user_id}")
async def get_user_by_id(
    user_id: str,
    current_user: dict = Depends(authorize("client", "freelancer", "admin")),
    user_service: UserService = Depends(get_user_service)
):
    """Kullanıcı detaylarını getir."""
    user = await user_service.get_user_by_id(user_id)
    return success_response("Kullanıcı detayları getirildi", user)

@router.patch("/profile")
async def update_profile(
    data: UserUpdate,
    current_user: dict = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service)
):
    """Profil günceller."""
    updated_user = await user_service.update_user(str(current_user["id"]), data.model_dump(exclude_unset=True))
    return success_response("Profil güncellendi", updated_user)

@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service)
):
    """Avatar yükler (Max 5MB)."""
    # ACİL ÇÖZÜM: Klasör kontrolü (Sonsuz döngü/Timeout engelleyici)
    os.makedirs("static/uploads", exist_ok=True)
    # 5MB Dosya Boyutu Kontrolü
    MAX_SIZE = 5 * 1024 * 1024  # 5 Megabytes
    content = await file.read()
    if len(content) > MAX_SIZE:
        from fastapi import HTTPException
        raise HTTPException(status_code=413, detail="Dosya boyutu çok büyük (Maksimum 5MB).")
    
    # Dosya imlecini başa sar (cloudinary okuyabilsin diye)
    await file.seek(0)
    
    avatar_url = await CloudinaryService.upload_image(file, folder="avatars")
    await user_service.update_user(str(current_user["id"]), {"avatar": avatar_url})
    return success_response("Avatar yüklendi", {"avatar_url": avatar_url})
