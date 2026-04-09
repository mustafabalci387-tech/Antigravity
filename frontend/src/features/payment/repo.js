import BaseRepo from '@/src/base/BaseRepo';
import BaseService from '@/src/base/services/BaseService';

/**
 * PaymentRepo - Ödeme Veri Erişim Katmanı
 * Backend API (FastAPI) ile fiziksel iletişimi sağlar.
 * BaseRepo'yu miras alarak DRY ilkesine uyum sağlar.
 */
export default class PaymentRepo extends BaseRepo {
  constructor() {
    super();
  }

  /**
   * Backend'deki /payment/process endpoint'ine POST isteği atar.
   * @param {Object} data - Backend'in PaymentRequest (DTO) şemasında beklediği veriler.
   * @returns {Promise<Object>} Backend'den dönen PaymentResponse verisi.
   */
  async process(data) {
    // Merkezi BaseService kullanarak POST isteği atılır.
    // Content-Type ve BaseURL ayarları merkezi yapılandırmada (api.js / BaseService.js) yapılmıştır.
    try {
      return await BaseService.post('/payment/process', data);
    } catch (error) {
      console.error("PaymentRepo process hatası:", error);
      throw error;
    }
  }
}
