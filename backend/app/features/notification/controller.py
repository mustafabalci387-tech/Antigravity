from fastapi import APIRouter, Depends, status, HTTPException
from app.core.dependencies import get_current_user
from app.core.response import success_response
from app.features.notification.service import NotificationService

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])
notification_service = NotificationService()

@router.get("/")
async def get_my_notifications(current_user: dict = Depends(get_current_user)):
    """Mevcut kullanıcının bildirimlerini getirir."""
    user_id = str(current_user.get("id"))
    notifications = await notification_service.get_user_notifications(user_id)
    return success_response("Bildirimler getirildi.", {"notifications": notifications})

@router.patch("/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    """Belirtilen bildirimi okundu olarak işaretler."""
    user_id = str(current_user.get("id"))
    notification = await notification_service.get_by_id(notification_id)
    
    if not notification:
        raise HTTPException(status_code=404, detail="Bildirim bulunamadı.")
        
    if str(notification.get("user_id")) != user_id:
        raise HTTPException(status_code=403, detail="Bu bildirimi okuma yetkiniz yok.")
        
    updated = await notification_service.mark_as_read(notification_id)
    return success_response("Bildirim okundu olarak işaretlendi.", updated)

@router.patch("/read-all")
async def mark_all_read(current_user: dict = Depends(get_current_user)):
    """Kullanıcının tüm okunmamış bildirimlerini okundu olarak işaretler."""
    user_id = str(current_user.get("id"))
    count = await notification_service.mark_all_as_read(user_id)
    return success_response(f"{count} bildirim okundu olarak işaretlendi.")

@router.delete("/{notification_id}")
async def delete_notification(notification_id: str, current_user: dict = Depends(get_current_user)):
    """Belirtilen bildirimi siler (Soft Delete)."""
    user_id = str(current_user.get("id"))
    notification = await notification_service.get_by_id(notification_id)
    
    if not notification:
        raise HTTPException(status_code=404, detail="Bildirim bulunamadı.")
        
    if str(notification.get("user_id")) != user_id:
        raise HTTPException(status_code=403, detail="Bu bildirimi silme yetkiniz yok.")
        
    success = await notification_service.delete_notification(notification_id)
    if not success:
        raise HTTPException(status_code=500, detail="Silme işlemi başarısız.")
    return success_response("Bildirim silindi.")

@router.delete("/clear/all")
async def clear_all_notifications(current_user: dict = Depends(get_current_user)):
    """Kullanıcının tüm bildirimlerini siler (Soft Delete)."""
    user_id = str(current_user.get("id"))
    count = await notification_service.clear_all_notifications(user_id)
    return success_response(f"{count} bildirim silindi.")
