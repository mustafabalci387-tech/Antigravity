"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AuthService from '@/src/features/auth/services/authService';
import PaymentService from '@/src/features/payment/services/paymentService';
import { showToast } from '@/src/shared/utils/toast';
import { formatDate } from '@/src/shared/utils/dateFormatter';
import { Chip, Spinner, Divider } from "@heroui/react";
import PaymentController from '@/src/features/payment/controller';

const ODEME_DURUM_CONFIG = {
    Pending: { label: "Bekliyor", color: "warning", icon: "⏳" },
    Completed: { label: "Tamamlandı", color: "success", icon: "✅" },
    Rejected: { label: "Reddedildi", color: "danger", icon: "❌" },
};

export default function PaymentsPage() {
    const [user, setUser] = useState(null);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Verileri çekme fonksiyonu
    const fetchPayments = useCallback(async () => {
        try {
            if (PaymentService && typeof PaymentService.getUserPayments === "function") {
                const response = await PaymentService.getUserPayments();
                // BaseService zaten response.data.data katmanını ayıklıyor.
                // Gelecek veri doğrudan bir dizidir (Array).
                setPayments(response || []);
            }
        } catch (error) {
            console.error("Ödeme listesi güncellenemedi:", error);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            const currentUser = AuthService.getCurrentUser();
            if (!currentUser) {
                router.push("/login");
                return;
            }
            setUser(currentUser);
            await fetchPayments();
            setLoading(false);
        };
        init();
    }, [router, fetchPayments]);

    // --- KRİTİK DÜZENLEME: Ödeme sonrası tetiklenecek fonksiyon ---
    const handlePaymentSuccess = () => {
        // Backend'in MongoDB'ye yazma süresi için 800ms bekleyip listeyi çekiyoruz
        setTimeout(async () => {
            await fetchPayments();
            showToast("Liste güncellendi! 🔄", "success");
        }, 800);
    };

    // --- SİLME FONKSİYONLARI ---
    const handleClearHistory = async () => {
        if (!window.confirm("Tüm geçmiş ödemeleri silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return;
        try {
            await PaymentService.clearUserPayments();
            showToast("Geçmiş başarıyla temizlendi! 🧹", "success");
            setPayments([]);
        } catch (error) {
            showToast("Geçmiş temizlenirken bir hata oluştu.", "error");
        }
    };

    const handleDeletePayment = async (paymentId) => {
        if (!window.confirm("Bu ödemeyi silmek istediğinize emin misiniz?")) return;
        try {
            await PaymentService.deletePayment(paymentId);
            showToast("Ödeme kaydı silindi! 🗑️", "success");
            setPayments(prev => prev.filter(p => p.id !== paymentId));
        } catch (error) {
            showToast("Silme işlemi başarısız.", "error");
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Spinner label="Yükleniyor..." /></div>;

    const isClient = user?.rol === "client";

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Navigasyon Çubuğu */}
            <nav className="bg-white border-b border-gray-100 p-4 sticky top-0 z-50 shadow-sm">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <span className="text-xl font-bold gradient-text italic">CollabFlow🚀</span>
                    <div className="flex gap-4 items-center">
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-800 uppercase tracking-tighter">{user?.ad} {user?.soyad}</p>
                            <p className="text-[10px] text-indigo-500 font-black uppercase">{isClient ? "İş Veren" : "Freelancer"}</p>
                        </div>
                        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                            {user?.ad?.[0].toUpperCase()}{user?.soyad?.[0].toUpperCase()}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto p-6 mt-4">
                {/* ÖDEME FORMU (Sadece İşveren Görür) */}
                {isClient && (
                    <section className="mb-12">
                        <h2 className="text-2xl font-black text-gray-800 mb-6 tracking-tighter uppercase italic ml-2">
                            🚀 Yeni Ödeme Gerçekleştir
                        </h2>
                        {/* handlePaymentSuccess fonksiyonunu prop olarak gönderiyoruz */}
                        <PaymentController onSuccess={handlePaymentSuccess} />
                        <Divider className="my-12 opacity-50" />
                    </section>
                )}

                <div className="flex justify-between items-center mb-8 ml-2">
                    <h1 className="text-3xl font-black text-gray-800 tracking-tighter">
                        💳 {isClient ? "Ödemeler & İş Onayları" : "Kazançlarım & Geçmiş"}
                    </h1>
                    {payments && payments.length > 0 && (
                        <button 
                            onClick={handleClearHistory}
                            className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
                        >
                            🗑️ Geçmişi Temizle
                        </button>
                    )}
                </div>

                {/* ÖDEME LİSTESİ */}
                <div className="grid gap-6">
                    {payments && payments.length > 0 ? (
                        // [...payments].reverse() ile yeni ödemeyi en üste alıyoruz
                        [...payments].reverse().map(p => {
                            const status = ODEME_DURUM_CONFIG[p.odeme_durumu] || ODEME_DURUM_CONFIG.Pending;
                            return (
                                <div key={p.id} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                                    <div className="flex justify-between items-start flex-wrap gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="text-[10px] bg-gray-100 px-3 py-1 rounded-full text-gray-500 font-bold">ID: {p.id ? p.id.slice(-6) : "GİZLİ"}</span>
                                                <Chip size="sm" color={status.color} variant="flat" className="font-bold">{status.icon} {status.label}</Chip>
                                                <button 
                                                    onClick={() => handleDeletePayment(p.id)}
                                                    className="w-7 h-7 flex items-center justify-center bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors ml-auto shadow-sm"
                                                    title="Kaydı Sil"
                                                >
                                                    ❌
                                                </button>
                                            </div>
                                            <h2 className="text-2xl font-bold text-gray-800 mb-2">{p.ad || "Servis Ödemesi"}</h2>
                                            <div className="text-xs text-gray-400 font-medium italic">📅 {formatDate(p.olusturulma_tarihi)}</div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-3xl font-black text-indigo-600 tracking-tighter italic">₺{p.tutar?.toLocaleString("tr-TR") || "0"}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center p-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 shadow-inner">
                            <div className="text-4xl mb-4">📭</div>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Henüz bir ödeme kaydı bulunamadı.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}