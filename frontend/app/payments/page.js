"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthService from '@/src/features/auth/services/authService';
import PaymentService from '@/src/features/payment/services/paymentService';
import { showToast } from '@/src/base/utils/toast';
import { formatDate } from '@/src/base/utils/dateFormatter';
import { Chip, Spinner } from "@heroui/react";

const ODEME_DURUM_CONFIG = {
    Pending: { label: "Bekliyor", color: "warning", icon: "⏳" },
    Completed: { label: "Tamamlandı", color: "success", icon: "✅" },
    Rejected: { label: "Reddedildi", color: "danger", icon: "❌" },
};

export default function PaymentsPage() {
    const [user, setUser] = useState(null);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const currentUser = AuthService.getCurrentUser();
                if (!currentUser) {
                    router.push("/login");
                    return;
                }
                setUser(currentUser);

                // Backend servisi kontrolü
                if (PaymentService && typeof PaymentService.getUserPayments === "function") {
                    const response = await PaymentService.getUserPayments();
                    setPayments(response?.data || []);
                }
            } catch (error) {
                console.error("Ödeme yükleme hatası:", error);
                // showToast("Veriler şu an alınamıyor.", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [router]);

    const handleApprove = async (id) => {
        if (!window.confirm("İşi onaylıyor musunuz?")) return;
        setActionLoading(id);
        try {
            await PaymentService.approvePayment(id);
            setPayments(prev => prev.map(p => p.id === id ? { ...p, odeme_durumu: "Completed" } : p));
            showToast("İş onaylandı! ✅", "success");
        } catch (error) {
            showToast("İşlem başarısız.", "error");
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Reddetmek istediğinize emin misiniz?")) return;
        setActionLoading(id);
        try {
            await PaymentService.rejectPayment(id);
            setPayments(prev => prev.map(p => p.id === id ? { ...p, odeme_durumu: "Rejected" } : p));
            showToast("İş reddedildi.", "error");
        } catch (error) {
            showToast("İşlem başarısız.", "error");
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Spinner label="Yükleniyor..." /></div>;

    const isClient = user?.rol === "client";

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <nav className="bg-white border-b border-gray-100 p-4 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <span className="text-xl font-bold gradient-text italic">CollabFlow🚀</span>
                    <div className="flex gap-4 items-center">
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-800 uppercase tracking-tighter">{user?.ad} {user?.soyad}</p>
                            <p className="text-[10px] text-indigo-500 font-black uppercase">{isClient ? "İş Veren" : "Freelancer"}</p>
                        </div>
                        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                            {user?.ad?.[0].toUpperCase()}{user?.soyad?.[0].toUpperCase()}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto p-6">
                <h1 className="text-3xl font-black text-gray-800 mb-8 tracking-tighter">
                    💳 {isClient ? "Ödemeler & İş Onayları" : "Kazançlarım & Geçmiş"}
                </h1>

                <div className="grid gap-6">
                    {payments && payments.length > 0 ? (
                        payments.map(p => {
                            const status = ODEME_DURUM_CONFIG[p.odeme_durumu] || ODEME_DURUM_CONFIG.Pending;
                            return (
                                <div key={p.id} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                                    <div className="flex justify-between items-start flex-wrap gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500 font-bold">{p.id}</span>
                                                <Chip size="sm" color={status.color} variant="flat">{status.icon} {status.label}</Chip>
                                            </div>
                                            <h2 className="text-xl font-bold text-gray-800">{p.ad}</h2>
                                            <p className="text-xs text-gray-400 mt-2 font-medium">
                                                👤 {isClient ? `Freelancer: ${p.freelancer_id}` : `İşveren: ${p.isveren_id}`} | 📅 {formatDate(p.olusturulma_tarihi)}
                                            </p>
                                        </div>
                                        <div className="text-right min-w-[120px]">
                                            <p className="text-3xl font-black text-indigo-600 tracking-tighter">₺{p.tutar?.toLocaleString("tr-TR") || "0"}</p>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-gray-50">
                                        {isClient && p.odeme_durumu === "Pending" ? (
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleApprove(p.id)}
                                                    disabled={actionLoading === p.id}
                                                    className="flex-1 bg-emerald-600 text-white font-black py-4 rounded-2xl hover:bg-emerald-700 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                                                >
                                                    {actionLoading === p.id ? <Spinner size="sm" color="white" /> : "✅ İşi Onayla"}
                                                </button>
                                                <button
                                                    onClick={() => handleReject(p.id)}
                                                    disabled={actionLoading === p.id}
                                                    className="bg-red-50 text-red-600 font-black px-8 py-4 rounded-2xl hover:bg-red-100 transition-all border border-red-100 disabled:opacity-50"
                                                >
                                                    {actionLoading === p.id ? <Spinner size="sm" color="danger" /> : "❌ Reddet"}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="p-4 bg-gray-50 rounded-2xl text-center">
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                                                    {p.odeme_durumu === "Pending" ? "🔄 İşverenin onay süreci devam ediyor..." : "🏁 İşlem Tamamlandı"}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center p-20 bg-white rounded-[2rem] border border-dashed border-gray-200">
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Henüz bir ödeme kaydı bulunamadı.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}