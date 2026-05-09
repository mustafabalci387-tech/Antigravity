import DataValidator from '@/src/base/DataValidator';
import PaymentRepo from './repo';

/**
 * PaymentManager - Ödeme İş Mantığı Katmanı
 * Controller'dan gelen verileri doğrular ve Repo üzerinden API çağrılarını yönetir.
 */
export default class PaymentManager extends DataValidator {
  constructor() {
    super();
    this.repo = new PaymentRepo();
  }

  /**
   * Ödeme sürecini yönetir.
   * @param {Object} paymentData - Kart ve tutar bilgilerini içeren nesne.
   * @returns {Promise<Object>} API'den dönen yanıt veya hata mesajı.
   */
  async process_payment(paymentData) {
    // 1. İş Mantığı: Temel Validasyonlar (Hocanın kuralı gereği manager'da)
    if (!paymentData.kart_sahibi || paymentData.kart_sahibi.trim() === "") {
        throw new Error("Kart sahibi ismi boş olamaz.");
    }

    if (!paymentData.kart_numarasi || paymentData.kart_numarasi.length !== 16) {
        throw new Error("Geçerli bir 16 haneli kart numarası giriniz.");
    }

    if (!paymentData.cvv || paymentData.cvv.length < 3) {
        throw new Error("Güvenlik kodu (CVV) geçersiz.");
    }

    // 2. Repo üzerinden Backend API'sine istek at
    try {
      const response = await this.repo.process(paymentData);
      
      // 3. Yanıtı Controller'ın beklediği formatta temizleyerek dön
      return {
        durum: response.durum, // "Başarılı" veya "Red"
        mesaj: response.mesaj,
        islem_id: response.islem_id,
        sistem_id: response.id
      };
    } catch (error) {
      console.error("Manager process_payment hatası:", error);
      throw error;
    }
  }
}
