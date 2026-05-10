import DataFetcher from '../../shared/DataFetcher';
import ApiService from '../../shared/services/ApiService';

/**
 * PaymentRepo - Mobil Veri Erişim Katmanı
 * Backend (FastAPI) /payment/process endpoint'i ile iletişimi sağlar.
 */
export default class PaymentRepo extends DataFetcher {
  constructor() {
    super();
  }

  /**
   * Ödeme isteğini Backend'e gönderir.
   * @param {Object} paymentData 
   */
  async process(paymentData) {
    try {
      // ApiService'in sağladığı merkezi POST yeteneği kullanılır.
      // baseURL ve headers (Token vb.) merkezi api.js yapılandırmasından gelir.
      const result = await ApiService.post('/payment/process', paymentData);
      return result;
    } catch (error) {
      console.error("Mobil PaymentRepo Hatası:", error);
      throw error;
    }
  }
}
