from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user
from app.core.response import success_response
from app.features.auth.dto import RegisterRequest, LoginRequest
from app.features.auth.manager import AuthManager

# ⚠️ YÜKSEK SEVİYE IOC
auth_manager = AuthManager()
router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/register", status_code=201)
async def register(body: RegisterRequest):
    """POST /api/auth/register — Yeni kullanıcı kaydı."""
    result = await auth_manager.register(body.model_dump())
    return success_response(message="Kayıt başarılı", data=result)

@router.post("/login")
async def login(body: LoginRequest):
    """POST /api/auth/login — Kullanıcı girişi."""
    result = await auth_manager.login(body.model_dump())
    return success_response(message="Giriş başarılı", data=result)

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """GET /api/auth/me — Mevcut kullanıcı bilgisi."""
    user = await auth_manager.get_me(str(current_user.get("_id", current_user.get("id"))))
    return success_response(message="Kullanıcı bilgileri", data=user)
