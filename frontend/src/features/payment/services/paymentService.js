/**
 * paymentService.js — Ödeme (Payment) API Servisi
 * Backend /api/payments endpoint'lerine istek atar.
 *
 * ApiService'den miras alınan:
 *   - get, post, patch, delete (merkezi hata yönetimi dahil)
 *
 * Ödemeye özel metodlar:
 *   - createPayment              : Yeni ödeme oluştur
 *   - approvePayment             : İş onayla + ödeme tamamla
 *   - rejectPayment              : İş reddet + ödeme iptal
 *   - getPaymentsByIsveren       : İşverene ait ödemeler
 *   - getPaymentsByFreelancer    : Freelancer'a ait ödemeler
 *   - getPaymentsByIlan          : İlana ait ödemeler
 *   - getPaymentById             : Tek ödeme detayı
 *   - deletePayment              : Ödeme sil (admin)
 */
import ApiService from "@/src/base/services/ApiService";
class PaymentService extends ApiService {
    /**
     * Yeni ödeme oluştur (İşveren/Admin)
     * @param {Object} paymentData - { ilan_id, freelancer_id, tutar, aciklama?, odeme_yontemi?, islem_notu? }
     */
    static async createPayment(paymentData) {
        return await this.post("/payment/process", paymentData);
    }

    /**
     * Sadece giriş yapan kullanıcının ödemelerini getirir (Dinamik)
     * Backend: GET /api/payment/user-payments
     */
    static async getUserPayments() {
        return await this.get("/payment/user-payments");
    }

    /**
     * İş onayla ve ödeme tamamla (İşveren/Admin)
     * Backend: PATCH /api/payments/{id}/approve
     */
    static async approvePayment(paymentId) {
        return await this.patch(`/payments/${paymentId}/approve`);
    }

    /**
     * İş reddet ve ödeme iptal et (İşveren/Admin)
     * Backend: PATCH /api/payments/{id}/reject
     */
    static async rejectPayment(paymentId) {
        return await this.patch(`/payments/${paymentId}/reject`);
    }

    /**
     * İşverene ait ödemeleri listele (Paginated)
     * Backend: GET /api/payments/isveren/{isveren_id}
     */
    static async getPaymentsByIsveren(isverenId, page = 1, limit = 20) {
        const data = await this.get(`/payments/isveren/${isverenId}`, { page, limit });
        return data || { payments: [], pagination: {} };
    }

    /**
     * Freelancer'a ait ödemeleri listele (Paginated)
     * Backend: GET /api/payments/freelancer/{freelancer_id}
     */
    static async getPaymentsByFreelancer(freelancerId, page = 1, limit = 20) {
        const data = await this.get(`/payments/freelancer/${freelancerId}`, { page, limit });
        return data || { payments: [], pagination: {} };
    }

    /**
     * Belirli bir ilana ait ödemeleri getir
     * Backend: GET /api/payments/ilan/{ilan_id}
     */
    static async getPaymentsByIlan(ilanId) {
        const data = await this.get(`/payments/ilan/${ilanId}`);
        return data || { payments: [], total: 0 };
    }

    /**
     * Tek ödeme detayını getir
     * Backend: GET /api/payments/{id}
     */
    static async getPaymentById(paymentId) {
        return await this.get(`/payments/${paymentId}`);
    }

    /**
     * Ödeme sil — Soft Delete (Sadece Admin)
     * Backend: DELETE /api/payments/{id}
     */
    static async deletePayment(paymentId) {
        return await this.delete(`/payment/${paymentId}`);
    }

    /**
     * Kullanıcının tüm geçmiş ödemelerini temizle
     * Backend: DELETE /api/payment/user-payments/clear
     */
    static async clearUserPayments() {
        return await this.delete("/payment/user-payments/clear");
    }
}

export default PaymentService;
