/**
 * paymentService.js — Ödeme (Payment) API Servisi (Mobile)
 * Backend /api/payment endpoint'lerine istek atar.
 * 
 * Backend Endpoint'leri:
 *   GET    /api/payment/user-payments      → JWT'den kullanıcıyı tanır, ödeme geçmişini döner
 *   POST   /api/payment/process            → Yeni ödeme oluşturur
 *   DELETE /api/payment/user-payments/clear → Tüm ödeme geçmişini siler
 *   DELETE /api/payment/{payment_id}       → Tek ödeme siler
 */
import ApiService from '../../../shared/services/ApiService';

class PaymentService extends ApiService {
    /**
     * Giriş yapmış kullanıcının ödeme geçmişini getirir.
     * Backend JWT token'dan kullanıcıyı tanır, ayrıca userId göndermeye gerek yok.
     */
    static async getUserPayments() {
        return await this.get("/payment/user-payments");
    }

    /** Ödeme işlemi başlatır */
    static async createPayment(paymentData) {
        return await this.post("/payment/process", paymentData);
    }

    /** Tek ödeme kaydını siler */
    static async deletePayment(paymentId) {
        return await this.delete(`/payment/${paymentId}`);
    }

    /** Tüm ödeme geçmişini temizler */
    static async clearAllPayments() {
        return await this.delete("/payment/user-payments/clear");
    }
}

const paymentService = {
    getUserPayments: () => PaymentService.getUserPayments(),
    createPayment: (data) => PaymentService.createPayment(data),
    deletePayment: (id) => PaymentService.deletePayment(id),
    clearAllPayments: () => PaymentService.clearAllPayments(),
    // Geriye uyumluluk: eski fonksiyon isimleri → yeni endpoint'e yönlendir
    getPaymentsByIsveren: () => PaymentService.getUserPayments(),
    getPaymentsByFreelancer: () => PaymentService.getUserPayments(),
};

export default paymentService;
