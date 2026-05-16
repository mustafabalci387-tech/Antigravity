/**
 * projects/page.js — Proje Takibi Sayfası (Next.js - Saf JS)
 *
 * Görev: Kullanıcının (Client/Freelancer) dahil olduğu projeleri listeler.
 * Özellikler: ProjectService ile API çağrısı, durum badge'leri,
 * dinamik proje kartları, rol bazlı görünüm.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProjectService from "@/src/features/project/services/projectService";
import AuthService from "@/src/features/auth/services/authService";
import NotificationService from "@/src/features/notification/services/notificationService";

// ──────────────────────────────────────────────
// Yardımcı: Durum badge renkleri
// ──────────────────────────────────────────────
const STATUS_MAP = {
    devam_ediyor: {
        label: "Devam Ediyor",
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        dot: "bg-blue-500",
    },
    tamamlandi: {
        label: "Tamamlandı",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        dot: "bg-emerald-500",
    },
    iptal: {
        label: "İptal Edildi",
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        dot: "bg-red-500",
    },
};

export default function ProjectsPage() {
    const [user, setUser] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const router = useRouter();

    // 1. Yetki Kontrolü
    useEffect(() => {
        if (!AuthService.isAuthenticated()) {
            router.push("/login");
            return;
        }
        setUser(AuthService.getCurrentUser());
    }, [router]);

    // 2. Projeleri Çek (ProjectService ile)
    useEffect(() => {
        if (!user) return;

        const fetchProjects = async () => {
            setLoading(true);
            try {
                const data = await ProjectService.getMyProjects();
                setProjects(data?.projects || []);
            } catch (err) {
                console.error("[ProjectsPage] Proje çekme hatası:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();

        // Bildirim sayacı
        NotificationService.getMyNotifications()
            .then((res) => {
                const count =
                    res?.notifications?.filter((n) => !n.okundu_mu)?.length || 0;
                setUnreadCount(count);
            })
            .catch((err) => console.error(err));
    }, [user]);

    // Çıkış
    const handleLogout = () => {
        AuthService.logout();
        router.push("/login");
    };

    // Bütçe formatlama
    const formatBudget = (amount) => {
        if (!amount && amount !== 0) return "—";
        return new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: "TRY",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Tarih formatlama
    const formatDate = (dateStr) => {
        if (!dateStr) return "Belirtilmedi";
        try {
            return new Date(dateStr).toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "long",
                year: "numeric",
            });
        } catch {
            return "Belirtilmedi";
        }
    };

    // Auth kontrol edilene kadar boş
    if (!user) return null;

    const isClient = user.rol === "client";

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ── Navbar ── */}
            <div className="navbar-gradient-line" />
            <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-2xl">🚀</span>
                            <span className="text-xl font-extrabold gradient-text italic">
                                CollabFlow
                            </span>
                        </Link>

                        <div className="hidden sm:flex items-center gap-1">
                            <Link
                                href="/"
                                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
                            >
                                🏠 Ana Sayfa
                            </Link>
                            <Link
                                href="/jobs"
                                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
                            >
                                💼 İş İlanları
                            </Link>
                            <Link
                                href="/projects"
                                className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-50 text-indigo-600"
                            >
                                📋 Projeler
                            </Link>
                            <Link
                                href="/payments"
                                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
                            >
                                💳 Ödemeler
                            </Link>
                            {user?.rol === "admin" && (
                                <Link
                                    href="/admin"
                                    className="px-4 py-2 rounded-xl text-sm font-semibold text-amber-600 hover:bg-amber-50 border border-amber-200 transition-colors"
                                >
                                    ⚙️ Admin Paneli
                                </Link>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <Link
                                href="/notifications"
                                className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors mr-2"
                            >
                                <span className="text-xl block">🔔</span>
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                                        {unreadCount > 9 ? "9+" : unreadCount}
                                    </span>
                                )}
                            </Link>
                            <Link
                                href={`/profile/${user.id || user._id}`}
                                className="hidden sm:flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                    {user.ad?.[0]}
                                    {user.soyad?.[0]}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800 leading-tight">
                                        {user.ad} {user.soyad}
                                    </p>
                                    <p className="text-[10px] font-semibold text-indigo-500 uppercase">
                                        {isClient ? "İş Veren" : "Freelancer"}
                                    </p>
                                </div>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-100 border border-red-100 transition-all"
                            >
                                Çıkış Yap
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ── Ana İçerik ── */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Başlık Bölümü */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">
                            📋 Projelerim
                        </h1>
                        <p className="text-gray-500 text-sm">
                            {isClient
                                ? "Onayladığınız tekliflerle oluşan aktif projeleriniz."
                                : "Kabul edilen tekliflerinizle başlayan projeleriniz."}
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-400">
                            Toplam: {projects.length} proje
                        </span>
                    </div>
                </div>

                {/* Bilgi Kartı */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-5 mb-8 flex items-center gap-4">
                    <span className="text-3xl">
                        {isClient ? "🏢" : "💻"}
                    </span>
                    <div>
                        <p className="font-bold text-indigo-700 text-sm">
                            {isClient
                                ? "İş Veren olarak giriş yaptınız"
                                : "Freelancer olarak giriş yaptınız"}
                        </p>
                        <p className="text-indigo-500 text-xs mt-0.5">
                            {isClient
                                ? "Aşağıda onayladığınız tekliflerle oluşan projeleriniz listelenmektedir."
                                : "Aşağıda kabul edilen tekliflerinizle başlayan projeleriniz listelenmektedir."}
                        </p>
                    </div>
                </div>

                {/* Proje Listesi */}
                {loading ? (
                    <div className="text-center py-16">
                        <div className="inline-block w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
                        <p className="text-indigo-500 font-bold">
                            Projeler Yükleniyor...
                        </p>
                    </div>
                ) : projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => {
                            const statusInfo =
                                STATUS_MAP[project.durum] || STATUS_MAP.devam_ediyor;

                            return (
                                <div
                                    key={project.id || project._id}
                                    className="hover-card bg-white rounded-2xl shadow-md border border-gray-100 flex flex-col justify-between overflow-hidden group"
                                >
                                    {/* Kart Üst Çizgisi (durum rengi) */}
                                    <div
                                        className={`h-1 w-full ${statusInfo.dot}`}
                                    />

                                    <div className="p-6 flex-1">
                                        {/* Başlık & Durum */}
                                        <div className="flex items-start justify-between gap-3 mb-4">
                                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors leading-snug">
                                                {project.baslik || project.ad || "Proje"}
                                            </h3>
                                            <span
                                                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                                            >
                                                <span
                                                    className={`w-2 h-2 rounded-full ${statusInfo.dot}`}
                                                />
                                                {statusInfo.label}
                                            </span>
                                        </div>

                                        {/* Detay Bilgileri */}
                                        <div className="space-y-3 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-400 font-medium">
                                                    💰 Bütçe
                                                </span>
                                                <span className="font-bold text-emerald-600">
                                                    {formatBudget(project.butce)}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-400 font-medium">
                                                    📅 Teslim Tarihi
                                                </span>
                                                <span className="font-semibold text-gray-700">
                                                    {formatDate(project.teslim_tarihi)}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-400 font-medium">
                                                    🕐 Oluşturulma
                                                </span>
                                                <span className="font-semibold text-gray-500 text-xs">
                                                    {formatDate(project.olusturulma_tarihi)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Alt Buton Alanı */}
                                    <div className="px-6 pb-5">
                                        <Link
                                            href={`/projects/${project.id || project._id}`}
                                            className="w-full block text-center bg-indigo-50 text-indigo-600 font-bold py-2.5 rounded-xl text-sm hover:bg-indigo-100 border border-indigo-100 transition-all"
                                        >
                                            📋 Proje Detayı
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Boş Durum */
                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                        <p className="text-5xl mb-4">📋</p>
                        <p className="text-gray-500 font-bold text-lg mb-2">
                            Henüz projeniz bulunmuyor
                        </p>
                        <p className="text-gray-400 text-sm max-w-md mx-auto">
                            {isClient
                                ? "Bir iş ilanına gelen teklifi onayladığınızda, proje otomatik olarak burada görünecektir."
                                : "Verdiğiniz bir teklif onaylandığında, proje otomatik olarak burada listenecektir."}
                        </p>
                        <Link
                            href="/jobs"
                            className="inline-block mt-6 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all"
                        >
                            💼 İş İlanlarına Git
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
