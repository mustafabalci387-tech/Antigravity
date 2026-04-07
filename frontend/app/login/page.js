/**
 * login/page.js — Giriş Sayfası (Next.js - Saf JS)
 *
 * Görev: authService üzerinden Python (FastAPI) backend'ine bağlanır.
 * Özellikler: Client-side rendering ("use client"), Loading stateleri,
 * ve sağlamlaştırılmış Hata Yönetimi (Error Handling).
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthService from '@/src/features/auth/services/authService';

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [sifre, setSifre] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const router = useRouter();

    const handleLogin = async (e) => {
        // Formun sayfayı yenilemesini engelle (SPA standartı)
        e.preventDefault();
        setErrorMessage("");

        const cleanEmail = email.trim();
        const cleanSifre = sifre.trim();

        // 1. Aşama: Frontend Doğrulaması (Validation)
        if (!cleanEmail || !cleanSifre) {
            setErrorMessage("Lütfen tüm alanları doldurun!");
            return;
        }

        setLoading(true);

        // 2. Aşama: Backend İstek ve Hata Yönetimi
        try {
            // authService api.js üzerinden token'ı otomatik sessionStorage'a yazar
            const { user } = await AuthService.login({ email: cleanEmail, sifre: cleanSifre });

            // Rol kontrolü: Admin ise /admin, değilse ana sayfaya yönlendir
            if (user?.rol === "admin") {
                router.push("/admin");
            } else {
                router.push("/");
            }
        } catch (error) {
            // Güvenli Hata Yakalama (Fallback mekanizması eklendi)
            const backendMessage = error.response?.data?.message;
            const fallbackMessage = "Sunucuya ulaşılamıyor. Lütfen internet bağlantınızı kontrol edin.";

            setErrorMessage(backendMessage || fallbackMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
            <div className="bg-white/90 backdrop-blur-sm p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white/20">

                {/* Başlık Alanı */}
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg mb-4">
                        <span className="text-3xl">🚀</span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-800">Hoş Geldiniz</h2>
                    <p className="text-gray-500 text-sm mt-2">CollabFlow hesabınıza giriş yapın</p>
                </div>

                {/* Hata Mesajı Kutusu */}
                {errorMessage && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl mb-6 font-medium text-sm">
                        {errorMessage}
                    </div>
                )}

                {/* Form Alanı */}
                <form onSubmit={handleLogin} className="space-y-5" autoComplete="off">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 ml-1">E-posta</label>
                        <input
                            type="email"
                            className="w-full px-5 py-3 rounded-2xl border border-gray-200 outline-none bg-gray-50 focus:ring-2 focus:ring-indigo-500 transition-shadow disabled:opacity-50 disabled:bg-gray-100"
                            placeholder="örnek@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            autoComplete="off"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 ml-1">Şifre</label>
                        <input
                            type="password"
                            className="w-full px-5 py-3 rounded-2xl border border-gray-200 outline-none bg-gray-50 focus:ring-2 focus:ring-indigo-500 transition-shadow disabled:opacity-50 disabled:bg-gray-100"
                            placeholder="Şifrenizi girin"
                            value={sifre}
                            onChange={(e) => setSifre(e.target.value)}
                            disabled={loading}
                            autoComplete="new-password"
                            required
                        />
                    </div>

                    {/* Submit Butonu */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Giriş yapılıyor...
                            </>
                        ) : (
                            "Giriş Yap"
                        )}
                    </button>
                </form>

                {/* Alt Bağlantı */}
                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-gray-500 text-sm">
                        Hesabınız yok mu?{" "}
                        <Link href="/register" className="text-indigo-600 font-bold hover:underline ml-1">
                            Ücretsiz Kayıt Ol
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}