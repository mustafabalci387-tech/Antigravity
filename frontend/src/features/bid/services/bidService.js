/**
 * bidService.js — Teklif (Bidding) API Servisi
 * Backend /api/bids endpoint'lerine istek atar.
 */
import ApiService from "@/src/shared/services/ApiService";

class BidService extends ApiService {
    /**
     * Yeni teklif oluştur (Freelancer)
     */
    static async createBid(bidData) {
        // bidData içinde ilan_id, fiyat, aciklama, teslim_suresi olmalı
        return await this.post("/bids", bidData);
    }

    /**
     * İlana ait teklifleri getir
     */
    static async getBidsByJob(jobId, page = 1) {
        const data = await this.get(`/bids/job/${jobId}`, { page, limit: 20 });
        return data || { bids: [] };
    }

    /**
     * Freelancer'ın kendi tekliflerini getir
     */
    static async getMyBids(page = 1) {
        return await this.get("/bids/my", { page, limit: 20 });
    }

    /**
     * Teklifi kabul et (Client)
     */
    static async acceptBid(bidId) {
        return await this.patch(`/bids/${bidId}/status`, null, {
            params: { status: "onaylandi" }
        });
    }

    /**
     * Teklifi reddet (Client)
     */
    static async rejectBid(bidId) {
        return await this.patch(`/bids/${bidId}/status`, null, {
            params: { status: "reddedildi" }
        });
    }
}

export default BidService;