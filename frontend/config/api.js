/**
 * api.js — Merkezi Axios Yapılandırması (Web Frontend)
 *
 * Bu dosya, Web arayüzümüz ile Python (FastAPI) sunucumuz arasındaki ana köprüdür.
 * SSR (Server-Side Rendering) uyumluluğu göz önünde bulundurularak, 
 * tarayıcı (window) kontrolleri güvenli bir şekilde sağlanmıştır.
 */

import axios from "axios";

// Merkezi Axios Instance (FastAPI Backend'imize bağlanır)
const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
    timeout: 30000,
});

/**
 * Request Interceptor — İstek Gönderilmeden Önce
 * Tarayıcı ortamında (window) çalışıyorsak sessionStorage'dan token'ı alır
 * ve tüm backend isteklerinin Authorization header'ına güvenli bir şekilde ekler.
 */
api.interceptors.request.use((config) => {
    // SSR uyumluluk kontrolü: Sadece tarayıcıda çalıştır
    if (typeof window !== "undefined") {
        const token = sessionStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // CORS proxy bypass
        config.headers["Access-Control-Allow-Origin"] = "*";
        config.headers["Cross-Origin-Opener-Policy"] = "same-origin";
    }
    return config;
});

/**
 * Response Interceptor — Yanıt Alındığında
 * Eğer FastAPI backend'imiz 401 Unauthorized (Geçersiz/Süresi Dolmuş Token) dönerse,
 * sessionStorage temizlenir ve kullanıcı otomatik olarak login sayfasına atılır.
 */
api.interceptors.response.use(
    (res) => res,
    (err) => {
        const isLoginRequest = err.config?.url?.includes("/auth/login");
        if (err.response?.status === 401 && typeof window !== "undefined" && !isLoginRequest) {
            console.warn("⚠️ Oturum süresi doldu. Güvenlik gereği çıkış yapılıyor.");
            sessionStorage.clear();
            // Kullanıcıyı giriş ekranına zorla yönlendir
            window.location.href = "/login";
        }
        return Promise.reject(err);
    }
);

export default api;