/**
 * register/page.js — Kayıt sayfası.
 *
 * authService.register() ile backend'e bağlanır.
 * Rol seçici (Freelancer / İş Veren) içerir.
 * Başarılı kayıtta login sayfasına yönlendirir.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthService from '@/src/features/auth/services/authService';
import { showToast } from '@/src/shared/utils/toast';

export default function RegisterPage() {
    const [ad, setAd] = useState("");
    const [soyad, setSoyad] = useState("");
    const [email, setEmail] = useState("");
    const [sifre, setSifre] = useState("");
    const [sifreTekrar, setSifreTekrar] = useState("");
    const [rol, setRol] = useState("freelancer");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const router = useRouter();

    const handleRegister = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        if (!ad.trim() || !soyad.trim() || !email.trim() || !sifre) {
            setErrorMessage("Lütfen tüm alanları doldurun!");
            return;
        }
        if (sifre !== sifreTekrar) {
            setErrorMessage("Şifreler eşleşmiyor!");
            return;
        }
        if (sifre.length < 6) {
            setErrorMessage("Şifre en az 6 karakter olmalıdır!");
            return;
        }

        setLoading(true);
        try {
            await AuthService.register({
                ad: ad.trim(),
                soyad: soyad.trim(),
                email: email.trim(),
                sifre: sifre,
                rol: rol,
            });
            showToast("Kayıt başarılı! Giriş yapabilirsiniz. 🎉", "success");
            router.push("/login");
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message || "Kayıt başarısız. Bilgilerinizi kontrol edin."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-lg text-center">
                <div className="flex flex-col items-center mb-6">
                    <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg mb-4">
                        <span className="text-3xl">🚀</span>
                    </div>
                    <h2 className="text-3xl font-black text-indigo-600">CollabFlow</h2>
                    <p className="text-gray-500 text-sm mt-1">Hesap oluşturun</p>
                </div>

                {errorMessage && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 font-bold text-sm">
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4" autoComplete="off">
                    <div className="flex gap-4">
                        <input type="text" placeholder="Ad" autoComplete="off" className="w-1/2 p-4 rounded-2xl border bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50" value={ad} onChange={(e) => setAd(e.target.value)} disabled={loading} />
                        <input type="text" placeholder="Soyad" autoComplete="off" className="w-1/2 p-4 rounded-2xl border bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50" value={soyad} onChange={(e) => setSoyad(e.target.value)} disabled={loading} />
                    </div>
                    <input type="email" placeholder="E-posta" autoComplete="new-email" className="w-full p-4 rounded-2xl border bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
                    <input type="password" placeholder="Şifre (min 6 karakter)" autoComplete="new-password" className="w-full p-4 rounded-2xl border bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50" value={sifre} onChange={(e) => setSifre(e.target.value)} disabled={loading} />
                    <input type="password" placeholder="Şifre Tekrar" autoComplete="new-password" className="w-full p-4 rounded-2xl border bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50" value={sifreTekrar} onChange={(e) => setSifreTekrar(e.target.value)} disabled={loading} />

                    {/* Rol Seçici */}
                    <div>
                        <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Hesap Türü</p>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setRol("freelancer")} disabled={loading}
                                className={`flex-1 p-3 rounded-2xl border-2 font-bold text-sm transition-all ${rol === "freelancer" ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"}`}>
                                💻 Freelancer
                            </button>
                            <button type="button" onClick={() => setRol("client")} disabled={loading}
                                className={`flex-1 p-3 rounded-2xl border-2 font-bold text-sm transition-all ${rol === "client" ? "border-purple-500 bg-purple-50 text-purple-700" : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"}`}>
                                🏢 İş Veren
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-xl hover:bg-indigo-700 transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Kayıt yapılıyor...
                            </>
                        ) : "Kayıt Ol"}
                    </button>
                </form>

                <Link href="/login" className="mt-8 inline-block text-indigo-600 font-bold underline text-sm">
                    Zaten hesabın var mı? Giriş Yap
                </Link>
            </div>
        </div>
    );
}
