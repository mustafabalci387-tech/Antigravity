/**
 * api.js — Axios instance ve interceptor yapılandırması.
 *
 * Bu dosya ne yapar?
 * → Tüm API istekleri için merkezi bir Axios instance oluşturur.
 * → Request interceptor: SecureStore'dan token okuyup header'a ekler.
 * → Response interceptor: 401 hatalarında otomatik logout yapar.
 *
 * DİKKAT: baseURL'deki IP adresini kendi bilgisayarının yerel IP'si ile değiştir.
 *         Bulmak için: terminal → ipconfig (Windows) veya ifconfig (Mac/Linux)
 */

import axios from "axios";
import * as SecureStore from "expo-secure-store";

const api = axios.create({
  // DİKKAT: 
  // → BlueStacks / Android emülatörü için: 10.0.2.2
  // → Gerçek telefon (aynı WiFi) için: kendi IP adresini yaz (ipconfig)
  baseURL: "http://10.0.2.2:5000/api",
  timeout: 10000,
});

/**
 * Request Interceptor — Her istek gönderilmeden önce çalışır.
 *
 * Akış:
 *   1. SecureStore'dan JWT token'ı oku
 *   2. Token varsa → Authorization header'ına ekle
 *   3. İsteği gönder
 *
 * Neden SecureStore?
 * → Mobilde localStorage yok. SecureStore şifreli depolama sağlar.
 * → iOS: Keychain, Android: EncryptedSharedPreferences kullanır.
 */
api.interceptors.request.use(
  async (config) => {
    console.log(`[API REQUEST] => ${config.method.toUpperCase()} ${config.url}`);
    const token = await SecureStore.getItemAsync("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor — Her yanıt alındığında çalışır.
 *
 * 401 Unauthorized → Token geçersiz veya süresi dolmuş.
 * Bu durumda SecureStore'daki token ve user bilgisi temizlenir.
 */
api.interceptors.response.use(
  (res) => {
    console.log(`[API RESPONSE] <= ${res.status} ${res.config.url}`);
    return res;
  },
  async (err) => {
    console.log(`[API ERROR] <= ${err.message} (${err.response?.status || 'No Status'}) url: ${err.config?.url}`);
    const isLoginRequest = err.config?.url?.includes("/auth/login");
    if (err.response?.status === 401 && !isLoginRequest) {
      console.log("⚠️ Oturum geçersiz — token temizleniyor");
      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("user");
    }
    return Promise.reject(err);
  }
);

export default api;