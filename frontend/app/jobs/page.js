/**
 * jobs/page.js — İş İlanları Sayfası (Next.js - Saf JS)
 *
 * Görev: İşverenler (Client) ilan oluşturur/siler, Freelancer'lar ilanları inceler.
 * Özellikler: Merkezi Axios (api.js) kullanımı, Rol bazlı arayüz (Conditional Rendering),
 * Sayfalama (Pagination) entegrasyonu.
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import JobService from '@/src/features/job/services/jobService';
import AuthService from '@/src/features/auth/services/authService';
import NotificationService from '@/src/features/notification/services/notificationService';
import { showToast, showErrorToast } from '@/src/shared/utils/toast';

export default function JobsPage() {
    const [user, setUser] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(null);
    const [pagination, setPagination] = useState({});
    const [page, setPage] = useState(1);
    const [unreadCount, setUnreadCount] = useState(0);

    // Filtre state'leri
    const [filterKategori, setFilterKategori] = useState("");
    const [filterMinBudget, setFilterMinBudget] = useState("");
    const [filterMaxBudget, setFilterMaxBudget] = useState("");

    const router = useRouter();

    // İlan oluşturma formu state'leri
    const [ad, setAd] = useState("");
    const [aciklama, setAciklama] = useState("");
    const [butce, setButce] = useState("");
    const [kategori, setKategori] = useState("");
    const [bitisTarihi, setBitisTarihi] = useState("");
    const [formLoading, setFormLoading] = useState(false);

    // 1. Yetki Kontrolü
    useEffect(() => {
        if (!AuthService.isAuthenticated()) {
            router.push("/login");
            return;
        }
        setUser(AuthService.getCurrentUser());
    }, [router]);

    // 2. Veri Çekme İşlemi (JobService ile)
    const fetchJobs = useCallback(async (forcedPage = null, resetFilters = false) => {
        setLoading(true);
        try {
            const currentPage = forcedPage !== null ? forcedPage : page;
            const params = { page: currentPage, limit: 6, sort: "-createdAt" };
            
            if (user?.rol === "client") {
                params.is_veren_id = user.id || user._id; // Sadece kendi ilanları
            }
            if (!resetFilters) {
                if (filterKategori) params.category = filterKategori.trim();
                if (filterMinBudget) params.min_budget = Number(filterMinBudget);
                if (filterMaxBudget) params.max_budget = Number(filterMaxBudget);
            }

            const responseData = await JobService.listJobs(params);

            setJobs(responseData?.jobs || []);
            setPagination(responseData?.pagination || {});

        } catch (err) {
            console.error("İlan çekme hatası:", err);
        } finally {
            setLoading(false);
        }
    }, [page, user, filterKategori, filterMinBudget, filterMaxBudget]);

    // Kullanıcı veya sayfa değiştiğinde ilanları getir
    useEffect(() => {
        if (user) {
            fetchJobs();
            NotificationService.getMyNotifications()
                .then(res => {
                    const count = res?.notifications?.filter(n => !n.okundu_mu)?.length || 0;
                    setUnreadCount(count);
                })
                .catch(err => console.error(err));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, page]);

    // İlan Oluşturma (JobService ile)
    const handleCreate = async (e) => {
        e.preventDefault();

        const cleanAd = ad.trim();
        const cleanAciklama = aciklama.trim();
        const numButce = Number(butce);

        if (!cleanAd || !cleanAciklama || !numButce) return;

        setFormLoading(true);
        try {
            await JobService.createJob({
                ad: cleanAd,
                aciklama: cleanAciklama,
                butce: numButce,
                kategori: kategori.trim(),
                bitis_tarihi: bitisTarihi || null
            });

            // Formu temizle ve listeyi güncelle
            setAd(""); setAciklama(""); setButce(""); setKategori(""); setBitisTarihi("");
            fetchJobs();
        } catch (err) {
            showErrorToast(err, "İlan oluşturulamadı.");
        } finally {
            setFormLoading(false);
        }
    };

    // İlan Silme (JobService ile)
    const handleDelete = async (jobId, jobAd) => {
        if (!window.confirm(`"${jobAd}" ilanını silmek istediğinize emin misiniz?`)) return;

        setDeleting(jobId);
        try {
            await JobService.deleteJob(jobId);
            fetchJobs();
        } catch (err) {
            showErrorToast(err, "Silinemedi.");
        } finally {
            setDeleting(null);
        }
    };

    const handleLogout = () => {
        AuthService.logout();
        router.push("/login");
    };

    if (!user) return null; // Kullanıcı yüklenene kadar boş bekle

    // Rol kontrolü (Görünümü belirler)
    const isClient = user.rol === "client";

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar (Mevcut Navbar kodun korundu) */}
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
                            <Link href="/jobs" className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-50 text-indigo-600">💼 İş İlanları</Link>
                            <Link href="/payments" className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">💳 Ödemeler</Link>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/notifications" className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors mr-2">
                                <span className="text-xl block">🔔</span>
                                {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                                )}
                            </Link>
                            <div className="hidden sm:flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl">
                                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                    {user.ad?.[0]}{user.soyad?.[0]}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800 leading-tight">{user.ad} {user.soyad}</p>
                                    <p className="text-[10px] font-semibold text-indigo-500 uppercase">{isClient ? "İş Veren" : "Freelancer"}</p>
                                </div>
                            </div>
                            <button onClick={handleLogout} className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-100 border border-red-100 transition-all">Çıkış Yap</button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* İçerik */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <h1 className="text-3xl font-extrabold text-gray-800 mb-2">
                    {isClient ? "💼 İlanlarım" : "💼 İş İlanları"}
                </h1>
                <p className="text-gray-500 text-sm mb-8">
                    {isClient ? "İlanlarınızı yönetin ve yeni ilan oluşturun." : "Mevcut ilanları keşfedin ve teklif verin."}
                </p>

                {/* --- FİLTRELEME BÖLÜMÜ --- */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1 ml-1">Kategori</label>
                        <input type="text" placeholder="Örn: web_gelistirme" className="w-full p-2.5 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500 text-sm" value={filterKategori} onChange={(e) => setFilterKategori(e.target.value)} />
                    </div>
                    <div className="flex-1 w-full">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1 ml-1">Min Bütçe (₺)</label>
                        <input type="number" placeholder="Örn: 1000" className="w-full p-2.5 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500 text-sm" value={filterMinBudget} onChange={(e) => setFilterMinBudget(e.target.value)} />
                    </div>
                    <div className="flex-1 w-full">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1 ml-1">Max Bütçe (₺)</label>
                        <input type="number" placeholder="Örn: 50000" className="w-full p-2.5 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500 text-sm" value={filterMaxBudget} onChange={(e) => setFilterMaxBudget(e.target.value)} />
                    </div>
                    <button onClick={() => { setPage(1); fetchJobs(1); showToast("Filtreler uygulandı", "success"); }} className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all text-sm">
                        🔍 Filtrele
                    </button>
                    {(filterKategori || filterMinBudget || filterMaxBudget) && (
                        <button onClick={() => { 
                            setFilterKategori(""); setFilterMinBudget(""); setFilterMaxBudget(""); 
                            setPage(1); 
                            fetchJobs(1, true); 
                        }} className="w-full sm:w-auto bg-gray-100 text-gray-600 px-4 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-all text-sm">
                            Temizle
                        </button>
                    )}
                </div>

                {/* İş Veren — İlan Oluşturma Formu */}
                {isClient && (
                    <form onSubmit={handleCreate} className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 mb-8 space-y-4">
                        <h2 className="text-lg font-bold text-gray-800">✏️ Yeni İlan Oluştur</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input type="text" placeholder="İlan Başlığı" className="p-3 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500" value={ad} onChange={(e) => setAd(e.target.value)} required />
                            <input type="text" placeholder="Kategori (ör: web_gelistirme)" className="p-3 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500" value={kategori} onChange={(e) => setKategori(e.target.value)} />
                            <input type="number" placeholder="Bütçe (₺)" className="p-3 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500 text-sm" value={butce} onChange={(e) => setButce(e.target.value)} required min="1" />
                            <div className="flex flex-col">
                                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1">Bitiş Tarihi</label>
                                <input type="date" className="p-3 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500 text-sm" value={bitisTarihi} onChange={(e) => setBitisTarihi(e.target.value)} />
                            </div>
                        </div>
                        <textarea placeholder="Açıklama" className="w-full p-3 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none" value={aciklama} onChange={(e) => setAciklama(e.target.value)} required />
                        <button type="submit" disabled={formLoading} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50">
                            {formLoading ? "Oluşturuluyor..." : "İlan Oluştur"}
                        </button>
                    </form>
                )}

                {/* Freelancer — Bilgi kartı */}
                {!isClient && (
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-5 mb-8 flex items-center gap-4">
                        <span className="text-3xl">💡</span>
                        <div>
                            <p className="font-bold text-indigo-700 text-sm">Freelancer olarak giriş yaptınız</p>
                            <p className="text-indigo-500 text-xs mt-0.5">Aşağıdaki ilanları inceleyebilir, ileride teklif gönderebilirsiniz.</p>
                        </div>
                    </div>
                )}

                {/* İlan Listesi */}
                {loading ? (
                    <p className="text-center text-indigo-500 font-bold py-10">İlanlar Yükleniyor...</p>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {jobs.length > 0 ? jobs.map((job) => (
                                <div key={job.id || job._id} className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col justify-between hover:shadow-lg transition-all group">
                                    <div>
                                        <h3 className="text-xl font-bold text-blue-600 mb-2 group-hover:text-indigo-600 transition-colors">{job.ad}</h3>
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{job.aciklama}</p>
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                                        <span className="font-bold text-green-600 text-lg">₺{job.butce}</span>
                                        <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full uppercase">{job.kategori || "Genel"}</span>
                                    </div>

                                    {/* Sadece İş Veren (Client) İlan Silebilir */}
                                    {isClient && (
                                        <button
                                            onClick={() => handleDelete(job.id || job._id, job.ad)}
                                            disabled={deleting === (job.id || job._id)}
                                            className="mt-4 w-full bg-red-50 text-red-600 font-bold py-2.5 rounded-xl text-sm hover:bg-red-100 border border-red-100 disabled:opacity-50 transition-all"
                                        >
                                            {deleting === (job.id || job._id) ? "Siliniyor..." : "🗑️ İlanı Sil"}
                                        </button>
                                    )}

                                    {/* Detay & Teklif — Tüm kullanıcılar detay görebilir */}
                                    <Link
                                        href={`/jobs/${job.id || job._id}`}
                                        className="mt-4 w-full block text-center bg-indigo-50 text-indigo-600 font-bold py-2.5 rounded-xl text-sm hover:bg-indigo-100 border border-indigo-100 transition-all"
                                    >
                                        {isClient ? "📋 Teklifleri Gör" : "📩 Detaylar & Teklif Ver"}
                                    </Link>
                                </div>
                            )) : (
                                <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                    <p className="text-4xl mb-3">{isClient ? "📝" : "🔍"}</p>
                                    <p className="text-gray-500 font-medium">
                                        {isClient ? "Henüz ilan yayınlamadınız." : "Henüz ilan bulunamadı."}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Sayfalama (Pagination) */}
                        {pagination?.totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-10">
                                <button
                                    onClick={() => setPage(page - 1)}
                                    disabled={!pagination.hasPrevPage}
                                    className="px-5 py-2 rounded-xl bg-white border border-gray-200 font-bold text-sm disabled:opacity-40 hover:bg-gray-50 transition-all"
                                >
                                    ← Önceki
                                </button>
                                <span className="text-sm font-bold text-gray-600">
                                    Sayfa {pagination.currentPage} / {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(page + 1)}
                                    disabled={!pagination.hasNextPage}
                                    className="px-5 py-2 rounded-xl bg-white border border-gray-200 font-bold text-sm disabled:opacity-40 hover:bg-gray-50 transition-all"
                                >
                                    Sonraki →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}