import DataFetcher from '@/src/base/DataFetcher';
import ApiService from '@/src/base/services/ApiService';

/**
 * PaymentRepo - Ödeme Veri Erişim Katmanı
 * Backend API (FastAPI) ile fiziksel iletişimi sağlar.
 * DataFetcher'u miras alarak DRY ilkesine uyum sağlar.
 */
export default class PaymentRepo extends DataFetcher {
  constructor() {
    super();
  }

  /**
   * Backend'deki /payment/process endpoint'ine POST isteği atar.
   * @param {Object} data - Backend'in PaymentRequest (DTO) şemasında beklediği veriler.
   * @returns {Promise<Object>} Backend'den dönen PaymentResponse verisi.
   */
  async process(data) {
    // Merkezi ApiService kullanarak POST isteği atılır.
    // Content-Type ve BaseURL ayarları merkezi yapılandırmada (api.js / ApiService.js) yapılmıştır.
    try {
      return await ApiService.post('/payment/process', data);
    } catch (error) {
      console.error("PaymentRepo process hatası:", error);
      throw error;
    }
  }
}
