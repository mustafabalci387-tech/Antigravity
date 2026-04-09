import BaseRepo from '../../base/BaseRepo';
import BaseService from '../../base/services/BaseService';

/**
 * PaymentRepo - Mobil Veri Erişim Katmanı
 * Backend (FastAPI) /payment/process endpoint'i ile iletişimi sağlar.
 */
export default class PaymentRepo extends BaseRepo {
  constructor() {
    super();
  }

  /**
   * Ödeme isteğini Backend'e gönderir.
   * @param {Object} paymentData 
   */
  async process(paymentData) {
    try {
      // BaseService'in sağladığı merkezi POST yeteneği kullanılır.
      // baseURL ve headers (Token vb.) merkezi api.js yapılandırmasından gelir.
      const result = await BaseService.post('/payment/process', paymentData);
      return result;
    } catch (error) {
      console.error("Mobil PaymentRepo Hatası:", error);
      throw error;
    }
  }
}
