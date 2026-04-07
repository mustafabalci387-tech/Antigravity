import cloudinary
import cloudinary.uploader
from fastapi import UploadFile
import os
from dotenv import load_dotenv

load_dotenv()

# Cloudinary yapılandırması
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

class CloudinaryService:
    @staticmethod
    async def upload_image(file: UploadFile, folder: str = "collabflow") -> str:
        """
        Dosyayı Cloudinary'ye yükler ve URL'sini döner.
        """
        try:
            result = cloudinary.uploader.upload(
                file.file,
                folder=folder,
                resource_type="auto"
            )
            return result.get("secure_url")
        except Exception as e:
            print(f"Cloudinary Upload Error: {e}")
            raise e

    @staticmethod
    async def delete_image(public_id: str):
        """
        Cloudinary'den dosya siler.
        """
        try:
            cloudinary.uploader.destroy(public_id)
        except Exception as e:
            print(f"Cloudinary Delete Error: {e}")
            raise e
