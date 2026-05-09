/**
 * bidService.js — Teklif (Bidding) API Servisi
 * Backend /api/bids endpoint'lerine istek atar.
 */
import ApiService from '../../../base/services/ApiService';

class BidService extends ApiService {
    static async createBid(bidData) {
        return await this.post("/bids", bidData);
    }

    static async getBidsByJob(jobId, page = 1) {
        return await this.get(`/bids/job/${jobId}`, { page, limit: 20 });
    }

    static async getMyBids(page = 1) {
        return await this.get("/bids/my", { page, limit: 20 });
    }

    static async acceptBid(bidId) {
        return await this.patch(`/bids/${bidId}/status?status=onaylandi`);
    }

    static async rejectBid(bidId) {
        return await this.patch(`/bids/${bidId}/status?status=reddedildi`);
    }
}

const bidService = {
    createBid: (bidData) => BidService.createBid(bidData),
    getBidsByJob: (jobId, page) => BidService.getBidsByJob(jobId, page),
    getMyBids: (page) => BidService.getMyBids(page),
    acceptBid: (bidId) => BidService.acceptBid(bidId),
    rejectBid: (bidId) => BidService.rejectBid(bidId),
};

export default bidService;