/**
 * ApiService.js — Merkezi API istek ve hata yönetimi sınıfı.
 * 
 * Tüm servisler bu yapıyı kullanarak API isteklerini yönetir.
 * Gelen response içerisindeki 'data.data' yapısını otomatik ayıklar
 * ve hata (error) durumunda loglama işlemlerini tek bir merkezden yürütür.
 */
import api from "../../../config/api";

class ApiService {
    /**
     * GET İsteği
     */
    static async get(url, params = {}) {
        try {
            const response = await api.get(url, { params });
            return response.data?.data !== undefined ? response.data.data : response.data;
        } catch (error) {
            ApiService.handleError(error);
            throw error;
        }
    }

    /**
     * POST İsteği
     */
    static async post(url, data = {}, config = {}) {
        try {
            const response = await api.post(url, data, config);
            return response.data?.data !== undefined ? response.data.data : response.data;
        } catch (error) {
            ApiService.handleError(error);
            throw error;
        }
    }

    /**
     * PUT İsteği
     */
    static async put(url, data = {}, config = {}) {
        try {
            const response = await api.put(url, data, config);
            return response.data?.data !== undefined ? response.data.data : response.data;
        } catch (error) {
            ApiService.handleError(error);
            throw error;
        }
    }

    /**
     * PATCH İsteği (Kısmi Güncelleme - Hoca Kuralı)
     */
    static async patch(url, data = {}, config = {}) {
        try {
            const response = await api.patch(url, data, config);
            return response.data?.data !== undefined ? response.data.data : response.data;
        } catch (error) {
            ApiService.handleError(error);
            throw error;
        }
    }

    /**
     * DELETE İsteği
     */
    static async delete(url, config = {}) {
        try {
            const response = await api.delete(url, config);
            return response.data?.data !== undefined ? response.data.data : response.data;
        } catch (error) {
            ApiService.handleError(error);
            throw error;
        }
    }

    /**
     * Merkezi Hata Yönetimi
     */
    static handleError(error) {
        // İsteğe bağlı olarak toast mesajları veya genel logging eklenebilir.
        console.error(
            "[ApiService Error]:",
            error?.response?.data || error.message
        );
    }
}

export default ApiService;
