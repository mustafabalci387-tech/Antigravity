/**
 * authService.js — Kimlik doğrulama servisi.
 *
 * Görev:
 * → Backend /api/auth endpoint'lerine istek atar.
 * → Token ve kullanıcı bilgisini sessionStorage'da yönetir.
 * → Login, Register, Logout, getCurrentUser işlemleri.
 */

import ApiService from "../../../base/services/ApiService";
class AuthService extends ApiService {
    // Kayıt ol
    static async register(data) {
        const responseData = await this.post("/auth/register", data);
        const { user, token } = responseData;
        if (typeof window !== "undefined") {
            sessionStorage.setItem("token", token);
            sessionStorage.setItem("user", JSON.stringify(user));
        }
        return responseData;
    }

    // Giriş yap
    static async login(data) {
        const responseData = await this.post("/auth/login", data);
        const { user, token } = responseData;
        if (typeof window !== "undefined") {
            sessionStorage.setItem("token", token);
            sessionStorage.setItem("user", JSON.stringify(user));
        }
        return responseData;
    }

    // Çıkış yap
    static logout() {
        if (typeof window !== "undefined") {
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
        }
    }

    // sessionStorage'dan kullanıcıyı oku
    static getCurrentUser() {
        if (typeof window === "undefined") return null;
        const user = sessionStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    }

    // Token var mı?
    static isAuthenticated() {
        if (typeof window === "undefined") return false;
        return !!sessionStorage.getItem("token");
    }
}

export default AuthService;
