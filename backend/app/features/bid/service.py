from typing import List
from fastapi import BackgroundTasks
from app.base.BaseService import BaseService
from app.features.bid.repository import BidRepository
from app.features.bid.manager import BidManager
from app.features.notification.service import NotificationService
from app.core.email import EmailService
from app.features.user.service import UserService

class BidService(BaseService):
    """
    BidService: Orkestrasyon katmanı.
    """
    def __init__(self, repository: BidRepository = None, manager: BidManager = None):
        super().__init__(repository=repository or BidRepository())
        self.manager = manager or BidManager()

    async def post_bid(self, data: dict, freelancer_id: str, freelancer_name: str) -> dict:
        self.manager.validate_bid_amount(data["fiyat"])
        data["freelancer_id"] = str(freelancer_id)
        data["freelancer_adi"] = freelancer_name
        id = await self.create(data)
        return await self.get_by_id(id)

    async def list_job_bids(self, ilan_id: str) -> List[dict]:
        bids, count = await self.repository.get_job_bids(ilan_id)
        return bids

    async def update_bid_status(self, bid_id: str, status: str, background_tasks: BackgroundTasks = None) -> dict:
        updated_bid = await self.update(bid_id, {"durum": status})
        
        if status == "onaylandi":
            ilan_id = updated_bid.get("ilan_id")
            freelancer_id = updated_bid.get("freelancer_id")
            
            notification_svc = NotificationService()
            user_svc = UserService()
            
            # Kabul Edilen Freelancer'a Bildirim ve Email
            if freelancer_id:
                # Bildirim at
                await notification_svc.create_notification(
                    user_id=freelancer_id,
                    mesaj="Tebrikler! Bir ilan için verdiğiniz teklif kabul edildi.",
                    ilan_id=ilan_id,
                    tip="teklif_kabul"
                )
                
                # İlgili freelancerin mail bilgilerini bul ve mail at
                freelancer = await user_svc.get_by_id(freelancer_id)
                if freelancer and background_tasks:
                    email_html = f"""
                    <h2>Tebrikler {freelancer.get('ad', '')}!</h2>
                    <p>CollabFlow platformunda yer alan bir ilana yaptığınız teklif işveren tarafından onaylandı!</p>
                    <p>Lütfen ilan detaylarını kontrol edin ve projeye başlayın.</p>
                    """
                    background_tasks.add_task(
                        EmailService.send_email_sync, 
                        freelancer.get("email"), 
                        "Teklifiniz Kabul Edildi! 🚀", 
                        email_html
                    )

            if ilan_id:
                # 1. Aynı ilana yapılmış "beklemede" olan tüm teklifleri "reddedildi" yap
                bids, _ = await self.repository.get_job_bids(ilan_id)
                for b in bids:
                    b_id = b.get("id") or b.get("_id")
                    if str(b_id) != str(bid_id) and b.get("durum") == "beklemede":
                        await self.update(str(b_id), {"durum": "reddedildi"})
                        
                        # Reddedilenlere bildirim at
                        reddedilen_fl_id = b.get("freelancer_id")
                        if reddedilen_fl_id:
                            await notification_svc.create_notification(
                                user_id=reddedilen_fl_id,
                                mesaj="Verdiğiniz teklif işveren tarafından ne yazık ki reddedildi.",
                                ilan_id=ilan_id,
                                tip="teklif_red"
                            )
                
                # 2. İlanın (Job) durumunu "devam_ediyor" olarak güncelle
                from app.features.job.service import JobService
                job_svc = JobService()
                await job_svc.update_job_status(str(ilan_id), "devam_ediyor")
                
        return updated_bid
