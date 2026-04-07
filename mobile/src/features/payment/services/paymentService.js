/**
 * paymentService.js — Ödeme (Payment) API Servisi (Mobile)
 * Backend /api/payments endpoint'lerine istek atar.
 */
import BaseService from '../../../base/services/BaseService';

class PaymentService extends BaseService {
    static async createPayment(paymentData) {
        return await this.post("/payments", paymentData);
    }

    static async approvePayment(paymentId) {
        return await this.patch(`/payments/${paymentId}/approve`);
    }

    static async rejectPayment(paymentId) {
        return await this.patch(`/payments/${paymentId}/reject`);
    }

    static async getPaymentsByIsveren(isverenId, page = 1, limit = 20) {
        return await this.get(`/payments/isveren/${isverenId}`, { page, limit });
    }

    static async getPaymentsByFreelancer(freelancerId, page = 1, limit = 20) {
        return await this.get(`/payments/freelancer/${freelancerId}`, { page, limit });
    }

    static async getPaymentsByIlan(ilanId) {
        return await this.get(`/payments/ilan/${ilanId}`);
    }

    static async getPaymentById(paymentId) {
        return await this.get(`/payments/${paymentId}`);
    }

    static async deletePayment(paymentId) {
        return await this.delete(`/payments/${paymentId}`);
    }
}

const paymentService = {
    createPayment: (data) => PaymentService.createPayment(data),
    approvePayment: (id) => PaymentService.approvePayment(id),
    rejectPayment: (id) => PaymentService.rejectPayment(id),
    getPaymentsByIsveren: (id, page, limit) => PaymentService.getPaymentsByIsveren(id, page, limit),
    getPaymentsByFreelancer: (id, page, limit) => PaymentService.getPaymentsByFreelancer(id, page, limit),
    getPaymentsByIlan: (id) => PaymentService.getPaymentsByIlan(id),
    getPaymentById: (id) => PaymentService.getPaymentById(id),
    deletePayment: (id) => PaymentService.deletePayment(id),
};

export default paymentService;
