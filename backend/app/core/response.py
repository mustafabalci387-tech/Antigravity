"""
response.py — Standart API yanıt formatı.

Express.js'deki responseHelper.js'in karşılığı.
Tüm yanıtlar aynı yapıda döner:
{
    "status": "success",
    "message": "...",
    "data": { ... },
    "pagination": { ... }
}
"""


def success_response(message="İşlem başarılı", data=None, pagination=None):
    """
    Başarılı yanıt formatı oluşturur.

    Express karşılığı: successResponse(res, { message, data, pagination })
    FastAPI'de doğrudan dict döndürüyoruz (JSONResponse otomatik).
    """
    response = {
        "status": "success",
        "success": True,
        "message": message,
    }

    if data is not None:
        response["data"] = data

    if pagination is not None:
        response["pagination"] = pagination

    return response


def error_response(message="Sunucu hatası", errors=None):
    """Hata yanıt formatı."""
    response = {
        "status": "error",
        "success": False,
        "message": message,
    }

    if errors is not None:
        response["errors"] = errors

    return response
