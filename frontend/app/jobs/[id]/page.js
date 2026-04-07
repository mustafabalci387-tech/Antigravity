/**
 * jobs/[id]/page.js — İş İlanı Detay ve Teklif Sistemi
 *
 * Görev: İlan detayını gösterir + rol bazlı teklif arayüzü sağlar.
 *   - Freelancer → Teklif verme formu
 *   - Client (İlan sahibi) → Gelen teklifleri listeler, kabul/red butonları
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import JobService from '@/src/features/job/services/jobService';
import AuthService from '@/src/features/auth/services/authService';
import BidService from '@/src/features/bid/services/bidService';
import { showToast, showErrorToast } from '@/src/base/utils/toast';
import { formatDate } from '@/src/base/utils/dateFormatter';

export default function JobDetailPage() {
    const router = useRouter();
    const params = useParams();
    const jobId = params.id;

    const [user, setUser] = useState(null);
    const [job, setJob] = useState(null);
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bidsLoading, setBidsLoading] = useState(true);

    // Teklif formu state'leri
    const [tutar, setTutar] = useState("");
    const [mesaj, setMesaj] = useState("");
    const [teslimSuresi, setTeslimSuresi] = useState("");
    const [bidFormLoading, setBidFormLoading] = useState(false);
    const [bidSuccess, setBidSuccess] = useState(false);
    const [bidError, setBidError] = useState("");

    // Kabul/Red işlem state'i
    const [actionLoading, setActionLoading] = useState(null);
    const [extendLoading, setExtendLoading] = useState(false);

    // 1. Yetki Kontrolü
    useEffect(() => {
        if (!AuthService.isAuthenticated()) {
            router.push("/login");
            return;
        }
        setUser(AuthService.getCurrentUser());
    }, [router]);

    // 2. İlan Detayını Getir
    const fetchJob = useCallback(async () => {
        setLoading(true);
        try {
            const jobData = await JobService.getJobById(jobId);
            setJob(jobData);
        } catch (err) {
            console.error("İlan detay hatası:", err);
        } finally {
            setLoading(false);
        }
    }, [jobId]);

    // 3. Teklifleri Getir
    const fetchBids = useCallback(async () => {
        setBidsLoading(true);
        try {
            const responseData = await BidService.getBidsByJob(jobId);
            setBids(responseData?.bids || responseData || []);
        } catch (err) {
            console.error("Teklifler getirilemedi:", err);
        } finally {
            setBidsLoading(false);
        }
    }, [jobId]);

    useEffect(() => {
        if (user) {
            fetchJob();
            fetchBids();
        }
    }, [user, fetchJob, fetchBids]);

    // Teklif Oluşturma
    const handleCreateBid = async (e) => {
        e.preventDefault();
        setBidError("");
        setBidSuccess(false);

        const numTutar = Number(tutar);
        const numGun = Number(teslimSuresi);

        // Validasyonlar: Backend limitleri ve Manager katmanı kurallarına uygunluk
        if (!numTutar || numTutar <= 0 || !mesaj.trim() || !numGun || numGun <= 0) {
            setBidError("Lütfen tüm alanları doğru doldurun.");
            return;
        }

        if (numTutar > 300000) {
            setBidError("Teklif bütçesi maksimum tutarın üzerinde olamaz.");
            return;
        }

        if (numGun > 365) {
            setBidError("Teslim süresi 365 günden fazla olamaz.");
            return;
        }

        setBidFormLoading(true);
        try {
            await BidService.createBid({
                ilan_id: jobId,
                fiyat: numTutar,
                aciklama: mesaj.trim(),
                teslim_suresi: numGun,
            });
            setBidSuccess(true);
            setTutar("");
            setMesaj("");
            setTeslimSuresi("");
            fetchBids(); // Teklifleri güncelle
        } catch (err) {
            setBidError(err.response?.data?.message || "Teklif gönderilemedi.");
        } finally {
            setBidFormLoading(false);
        }
    };

    // Teklif Kabul
    const handleAccept = async (bidId) => {
        if (!window.confirm("Bu teklifi kabul etmek istediğinize emin misiniz? Diğer teklifler otomatik reddedilecektir.")) return;

        setActionLoading(bidId);
        try {
            await BidService.acceptBid(bidId);
            showToast("Teklif başarıyla kabul edildi ve ilan durumu güncellendi! 🎉", "success");
            fetchBids();
            fetchJob(); // İlan durumu güncellenir
        } catch (err) {
            showErrorToast(err, "Hata oluştu.");
        } finally {
            setActionLoading(null);
        }
    };

    // Teklif Red
    const handleReject = async (bidId) => {
        if (!window.confirm("Bu teklifi reddetmek istediğinize emin misiniz?")) return;

        setActionLoading(bidId);
        try {
            await BidService.rejectBid(bidId);
            showToast("Teklif reddedildi.", "success");
            fetchBids();
        } catch (err) {
            showErrorToast(err, "Hata oluştu.");
        } finally {
            setActionLoading(null);
        }
    };

    // İlan Süresi Uzatma (+7 Gün)
    const handleExtendJob = async () => {
        if (!window.confirm("İlanın bitiş tarihine 7 gün eklenecektir. Onaylıyor musunuz?")) return;

        setExtendLoading(true);
        try {
            await JobService.extendJob(jobId);
            showToast("İlan süresi başarıyla 7 gün uzatıldı.", "success");
            fetchJob(); // Yeni tarihi ekrana yansıt
        } catch (err) {
            showErrorToast(err, "Hata oluştu.");
        } finally {
            setExtendLoading(false);
        }
    };

    if (!user) return null;

    const isClient = user.rol === "client";
    const isFreelancer = user.rol === "freelancer";
    const isJobOwner = isClient && job && String(job.is_veren_id) === String(user.id);

    // Status badge renkleri (Türkçe değerler)
    const statusColors = {
        acik: "bg-green-50 text-green-700 border-green-200",
        devam_ediyor: "bg-blue-50 text-blue-700 border-blue-200",
        tamamlandi: "bg-gray-50 text-gray-600 border-gray-200",
        iptal: "bg-red-50 text-red-600 border-red-200",
        beklemede: "bg-yellow-50 text-yellow-700 border-yellow-200",
        onaylandi: "bg-green-50 text-green-700 border-green-200",
        reddedildi: "bg-red-50 text-red-600 border-red-200",
    };

    const statusLabels = {
        acik: "Açık",
        devam_ediyor: "Proje Başladı",
        tamamlandi: "Tamamlandı",
        iptal: "İptal",
        beklemede: "Beklemede",
        onaylandi: "Onaylandı",
        reddedildi: "Reddedildi",
    };

    // Backend 'durum' alanını kullanıyor
    const jobStatus = (job?.durum || "acik").toLowerCase();
    const isExpired = job?.bitis_tarihi && new Date() > new Date(job.bitis_tarihi);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <div className="navbar-gradient-line" />
            <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-2xl">🚀</span>
                            <span className="text-xl font-extrabold gradient-text italic">CollabFlow</span>
                        </Link>
                        <div className="hidden sm:flex items-center gap-1">
                            <Link href="/" className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">🏠 Ana Sayfa</Link>
                            <Link href="/jobs" className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">💼 İş İlanları</Link>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl">
                                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                    {user.ad?.[0]}{user.soyad?.[0]}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800 leading-tight">{user.ad} {user.soyad}</p>
                                    <p className="text-[10px] font-semibold text-indigo-500 uppercase">{isClient ? "İş Veren" : "Freelancer"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* İçerik */}
            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                {/* Geri Butonu */}
                <Link href="/jobs" className="inline-flex items-center gap-2 text-indigo-600 font-semibold text-sm mb-6 hover:text-indigo-700 transition-colors">
                    ← İş İlanlarına Dön
                </Link>

                {loading ? (
                    <p className="text-center text-indigo-500 font-bold py-10">İlan yükleniyor...</p>
                ) : !job ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <p className="text-4xl mb-3">🔍</p>
                        <p className="text-gray-500 font-medium">İlan bulunamadı.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* İlan Detay Kartı */}
                        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800">{job.ad}</h1>
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold border uppercase ${statusColors[jobStatus] || "bg-gray-50 text-gray-600"}`}>
                                    {statusLabels[jobStatus] || jobStatus}
                                </span>
                            </div>

                            <p className="text-gray-600 leading-relaxed mb-6">{job.aciklama}</p>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-100">
                                <div>
                                    <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Bütçe</p>
                                    <p className="text-xl font-extrabold text-green-600">₺{job.butce}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Kategori</p>
                                    <p className="text-sm font-bold text-blue-600 bg-blue-50 inline-block px-3 py-1 rounded-full">{job.kategori || "Genel"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Oluşturulma</p>
                                    <p className="text-sm font-medium text-gray-600">
                                        {formatDate(job.olusturulma_tarihi)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Bitiş Tarihi</p>
                                    <p className="text-sm font-bold text-red-500 bg-red-50 inline-block px-3 py-1 rounded-full">
                                        {job.bitis_tarihi ? formatDate(job.bitis_tarihi) : "Süresiz"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ─── Freelancer: Teklif Verme Formu ─── */}
                        {isFreelancer && !isJobOwner && jobStatus === "acik" && !isExpired && (
                            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
                                <h2 className="text-lg font-bold text-gray-800 mb-1">📩 Teklif Ver</h2>
                                <p className="text-gray-400 text-xs mb-6">Bu ilana teklifinizi gönderin</p>

                                {bidSuccess && (
                                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium mb-4">
                                        ✅ Teklifiniz başarıyla gönderildi!
                                    </div>
                                )}

                                {bidError && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium mb-4">
                                        ❌ {bidError}
                                    </div>
                                )}

                                <form onSubmit={handleCreateBid} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Teklif Tutarı (₺)</label>
                                            <input
                                                type="number"
                                                placeholder="Örn: 5000"
                                                className="w-full p-3 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                                value={tutar}
                                                onChange={(e) => setTutar(e.target.value)}
                                                required
                                                min="1"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Teslim Süresi (Gün)</label>
                                            <input
                                                type="number"
                                                placeholder="Örn: 14"
                                                className="w-full p-3 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                                value={teslimSuresi}
                                                onChange={(e) => setTeslimSuresi(e.target.value)}
                                                required
                                                min="1"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Mesajınız</label>
                                        <textarea
                                            placeholder="İlan sahibine neden sizi seçmesi gerektiğini açıklayın..."
                                            className="w-full p-3 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500 h-28 resize-none text-sm"
                                            value={mesaj}
                                            onChange={(e) => setMesaj(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={bidFormLoading}
                                        className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 text-sm"
                                    >
                                        {bidFormLoading ? "Gönderiliyor..." : "📩 Teklif Gönder"}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Kendi ilanına teklif engeli uyarısı & YÖNETİM PANELİ */}
                        {isJobOwner && (
                            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <span className="text-3xl">👤</span>
                                    <div>
                                        <p className="font-bold text-indigo-700 text-sm">Bu sizin ilanınız</p>
                                        <p className="text-indigo-600 text-xs mt-0.5">Kendi ilanınıza teklif veremezsiniz. Gelen teklifleri aşağıdan yönetebilirsiniz.</p>
                                    </div>
                                </div>
                                
                                {/* Süreyi Uzat Butonu */}
                                <button
                                    onClick={handleExtendJob}
                                    disabled={extendLoading}
                                    className="bg-white border-2 border-indigo-200 text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                                >
                                    {extendLoading ? "Uzatılıyor..." : "📅 Süreyi Uzat (+7 Gün)"}
                                </button>
                            </div>
                        )}

                        {/* İlan kapalıysa bilgi mesajı */}
                        {jobStatus !== "acik" && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 flex items-center gap-4">
                                <span className="text-3xl">⚠️</span>
                                <div>
                                    <p className="font-bold text-yellow-700 text-sm">Bu ilan artık teklif almıyor</p>
                                    <p className="text-yellow-600 text-xs mt-0.5">İlan durumu: {statusLabels[jobStatus] || jobStatus}</p>
                                </div>
                            </div>
                        )}

                        {/* Süresi dolduysa bilgi mesajı */}
                        {jobStatus === "acik" && isExpired && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 flex items-center gap-4 mt-4">
                                <span className="text-3xl">⏰</span>
                                <div>
                                    <p className="font-bold text-yellow-700 text-sm">Bu ilanın başvuru süresi dolmuştur</p>
                                    <p className="text-yellow-600 text-xs mt-0.5">Bitiş Tarihi: {formatDate(job.bitis_tarihi)}</p>
                                </div>
                            </div>
                        )}

                        {/* ─── Teklifler Listesi ─── */}
                        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">📋 Teklifler</h2>
                                    <p className="text-gray-400 text-xs mt-0.5">Bu ilana gelen teklifler ({bids.length})</p>
                                </div>
                            </div>

                            {bidsLoading ? (
                                <p className="text-center text-indigo-500 font-bold py-6">Teklifler yükleniyor...</p>
                            ) : bids.length === 0 ? (
                                <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl">
                                    <p className="text-3xl mb-2">📭</p>
                                    <p className="text-gray-400 font-medium text-sm">Henüz teklif gelmedi.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {bids.map((bid) => (
                                        <div key={bid.id} className="border border-gray-100 rounded-xl p-5 hover:shadow-sm transition-all">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                        {bid.freelancer_adi?.[0] || "?"}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-800 text-sm">{bid.freelancer_adi || "Anonim"}</p>
                                                        <p className="text-[10px] text-gray-400">
                                                            {formatDate(bid.olusturulma_tarihi)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase ${statusColors[bid.durum] || "bg-gray-50 text-gray-600"}`}>
                                                    {statusLabels[bid.durum] || bid.durum}
                                                </span>
                                            </div>

                                            <p className="text-gray-600 text-sm mb-3 leading-relaxed">{bid.aciklama}</p>

                                            <div className="flex flex-wrap gap-4 items-center pt-3 border-t border-gray-50">
                                                <span className="text-lg font-extrabold text-green-600">₺{bid.fiyat}</span>
                                                <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
                                                    ⏱️ {bid.teslim_suresi} gün
                                                </span>

                                                {/* İlan sahibi ise kabul/red butonları */}
                                                {(() => {
                                                    const currentStatus = bid.durum || bid.status;
                                                    const canAct = ["beklemede", "pending", null, undefined, ""].includes(currentStatus);
                                                    return isJobOwner && canAct && (
                                                        <div className="flex gap-2 ml-auto">
                                                            <button
                                                                onClick={() => handleAccept(bid.id || bid._id)}
                                                                disabled={actionLoading === (bid.id || bid._id)}
                                                                className="bg-green-600 text-white font-bold px-4 py-2 rounded-lg text-xs hover:bg-green-700 shadow-sm transition-all disabled:opacity-50"
                                                            >
                                                                {actionLoading === (bid.id || bid._id) ? "..." : "✅ Kabul Et"}
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(bid.id || bid._id)}
                                                                disabled={actionLoading === (bid.id || bid._id)}
                                                                className="bg-red-500 text-white font-bold px-4 py-2 rounded-lg text-xs hover:bg-red-600 shadow-sm transition-all disabled:opacity-50"
                                                            >
                                                                {actionLoading === (bid.id || bid._id) ? "..." : "❌ Reddet"}
                                                            </button>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
