import BaseManager from '../../base/BaseManager';
import PaymentRepo from './repo';

/**
 * PaymentManager - Mobil İş Mantığı Katmanı
 * Veri validasyonlarını yapar ve Repo katmanına iletir.
 */
export default class PaymentManager extends BaseManager {
  constructor() {
    super();
    this.repo = new PaymentRepo();
  }

  /**
   * Ödeme sürecini başlatmadan önce verileri doğrular.
   * @param {Object} paymentData 
   */
  async process_payment(paymentData) {
    // 1. İş Mantığı: Validasyonlar
    if (!paymentData.kart_sahibi || paymentData.kart_sahibi.trim() === "") {
        throw new Error("Lütfen kart sahibinin ismini giriniz.");
    }

    if (!paymentData.kart_numarasi || paymentData.kart_numarasi.length !== 16) {
        throw new Error("16 haneli geçerli bir kart numarası gereklidir.");
    }

    if (!paymentData.cvv || paymentData.cvv.length < 3) {
        throw new Error("CVV kodu geçersiz.");
    }

    if (!paymentData.son_kullanma_tarihi || !paymentData.son_kullanma_tarihi.includes("/")) {
        throw new Error("Son kullanma tarihi formatı geçersiz (MM/YY).");
    }

    // 2. Repo üzerinden backend'e istek at
    try {
      const response = await this.repo.process(paymentData);
      return response;
    } catch (error) {
      console.error("Mobil PaymentManager Hatası:", error);
      throw error;
    }
  }
}
