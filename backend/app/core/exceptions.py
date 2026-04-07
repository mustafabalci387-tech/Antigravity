"""
exceptions.py — Özel hata sınıfları ve FastAPI exception handler'ları.

Express.js'deki ApiError ve errorHandler'ın karşılığı.
"""

from fastapi import Request
from fastapi.responses import JSONResponse
import traceback


class ApiError(Exception):
    """
    Standart API hata sınıfı.
    Express.js'deki ApiError sınıfının karşılığı.

    Kullanım:
        raise ApiError("E-posta veya şifre hatalı", 401)
    """
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        self.status = "fail" if str(status_code).startswith("4") else "error"
        super().__init__(self.message)


async def api_error_handler(request: Request, exc: ApiError):
    """
    ApiError exception handler — Express errorHandler karşılığı.
    Tüm ApiError'ları standart JSON formatında döndürür.
    """
    return JSONResponse(
        status_code=exc.status_code,
        headers={"Access-Control-Allow-Origin": "*"},
        content={
            "success": False,
            "message": exc.message,
        }
    )


async def generic_error_handler(request: Request, exc: Exception):
    """
    Beklenmeyen hataları yakalar — 500 Internal Server Error.
    """
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        headers={"Access-Control-Allow-Origin": "*"},
        content={
            "success": False,
            "message": "Sunucu hatası",
            "detail": str(exc)
        }
    )
