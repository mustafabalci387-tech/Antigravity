"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, Spinner, Chip } from "@heroui/react";
import AuthService from '@/src/features/auth/services/authService';
import ApiService from '@/src/shared/services/ApiService';

export default function AdminDashboardPage() {
    const [user, setUser] = useState(null);
    const [istatistikler, setIstatistikler] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hata, setHata] = useState(null);
    const [kullanicilar, setKullanicilar] = useState([]);
    const [secilenRoller, setSecilenRoller] = useState({});
    const [rolGuncelleLoading, setRolGuncelleLoading] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                // 1. Gerçek kullanıcı oturumunu al
                const currentUser = AuthService.getCurrentUser();

                // Kullanıcı yoksa veya admin değilse login'e yönlendir (Güvenlik kilidi geri geldi)
                if (!currentUser || currentUser.rol !== "admin") {
                    router.push("/login");
                    return;
                }

                setUser(currentUser);

                // 2. Backend'den istatistikleri çek
                const response = await BaseService.get("/admin/istatistikler");

                // Yanıt yapısını esnek şekilde parse et
                const cleanData = response?.data || response;
                setIstatistikler(cleanData);

                // 3. Kullanıcı listesini çek (Yetkilendirme tablosu için)
                const kullanicilarRes = await BaseService.get("/users");
                const kullanicilarData = kullanicilarRes?.users || kullanicilarRes || [];
                setKullanicilar(Array.isArray(kullanicilarData) ? kullanicilarData : []);

            } catch (error) {
                console.error("[AdminDashboard] Hata:", error);
                const errorMsg = error?.response?.data?.message || error?.message || "Yetki hatası!";
                setHata(errorMsg);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, [router]);

    // ── ROL GÜNCELLEME FONKSİYONU ──
    const handleRolDegistir = async (userId, yeniRol) => {
        try {
            setRolGuncelleLoading(userId);
            await BaseService.patch("/admin/kullanici-rol", {
                user_id: userId,
                yeni_rol: yeniRol,
            });
            // Başarılı → Tabloyu güncelle
            setKullanicilar(prev =>
                prev.map(k => (k.id || k._id) === userId ? { ...k, rol: yeniRol } : k)
            );
            setSecilenRoller(prev => {
                const copy = { ...prev };
                delete copy[userId];
                return copy;
            });
        } catch (err) {
            console.error("[Admin] Rol güncelleme hatası:", err);
            alert(err?.response?.data?.message || "Rol güncellenirken hata oluştu.");
        } finally {
            setRolGuncelleLoading(null);
        }
    };

    // ── KULLANICI SİLME FONKSİYONU ──
    const handleKullaniciSil = async (userId) => {
        if (!window.confirm("Bu kullanıcıyı silmek istediğinize emin misiniz?")) return;

        try {
            await BaseService.delete(`/users/${userId}`);
            // Tablodan sil
            setKullanicilar(prev => prev.filter(k => (k.id || k._id) !== userId));
            alert("Kullanıcı başarıyla silindi.");
        } catch (err) {
            console.error("[Admin] Kullanıcı silme hatası:", err);
            alert(err?.response?.data?.message || "Kullanıcı silinirken hata oluştu.");
        }
    };

    // ── DURUM YÖNETİMİ (Yükleniyor) ──
    if (loading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
                <Spinner size="lg" color="secondary" />
                <p className="text-sm text-gray-400 font-bold uppercase animate-pulse tracking-widest">
                    Dashboard Hazırlanıyor...
                </p>
            </div>
        );
    }

    // ── DURUM YÖNETİMİ (Hata) ──
    if (hata) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50 p-6">
                <Card className="max-w-lg w-full shadow-xl border border-red-100">
                    <CardBody className="text-center p-10">
                        <div className="text-5xl mb-4">🚫</div>
                        <h2 className="text-xl font-black text-gray-800 mb-3">Erişim Sorunu</h2>
                        <p className="text-gray-500 text-sm mb-6">{hata}</p>
                        <button
                            onClick={() => router.push("/")}
                            className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg"
                        >
                            Ana Sayfaya Dön
                        </button>
                    </CardBody>
                </Card>
            </div>
        );
    }

    // ── VERİLERİ TANIMLA ──
    const k = istatistikler?.kullanicilar || {};
    const il = istatistikler?.ilanlar || {};
    const o = istatistikler?.odemeler || {};

    const metricKartlari = [
        { baslik: "Toplam Kullanıcı", deger: k.toplam ?? 0, ikon: "👥", renk: "from-indigo-500 to-purple-600" },
        { baslik: "Toplam İlan", deger: il.toplam ?? 0, ikon: "📋", renk: "from-emerald-500 to-teal-600" },
        { baslik: "Toplam Bütçe", deger: `₺${(il.toplam_butce ?? 0).toLocaleString("tr-TR")}`, ikon: "💰", renk: "from-amber-500 to-orange-600" },
        { baslik: "Ödeme Hacmi", deger: `₺${(o.tamamlanan_toplam_hacim ?? 0).toLocaleString("tr-TR")}`, ikon: "💳", renk: "from-rose-500 to-pink-600" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Navigasyon */}
            <nav className="bg-white border-b border-gray-100 p-4 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <span className="text-xl font-bold italic text-indigo-600 tracking-tighter">CollabFlow🚀</span>
                    <div className="flex items-center gap-3">
                        <Chip size="sm" color="danger" variant="flat" className="font-bold">🛡️ Admin Modu</Chip>
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-black text-gray-800 uppercase">{user?.ad} {user?.soyad}</p>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-6">
                <div className="mb-10">
                    <h1 className="text-3xl font-black text-gray-800 tracking-tighter mb-1">📊 Platform Özeti</h1>
                    <p className="text-sm text-gray-400 font-medium">İstatistikler ve anlık platform verileri.</p>
                </div>

                {/* Metric Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {metricKartlari.map((kart, index) => (
                        <Card key={index} className="border-none shadow-lg hover:translate-y-[-4px] transition-all duration-300">
                            <CardBody className={`bg-gradient-to-r ${kart.renk} p-6 rounded-xl text-white`}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase opacity-80 tracking-widest">{kart.baslik}</p>
                                        <p className="text-3xl font-black mt-1 tracking-tighter">{kart.deger}</p>
                                    </div>
                                    <span className="text-4xl opacity-30">{kart.ikon}</span>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>

                {/* Detaylar Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="shadow-md border-none">
                        <CardHeader className="font-black text-gray-700 p-6 border-b border-gray-50 uppercase text-xs tracking-widest">
                            👥 Rol Dağılımı
                        </CardHeader>
                        <CardBody className="p-6">
                            {k.rol_dagilimi && Object.entries(k.rol_dagilimi).map(([rol, sayi]) => {
                                const yuzde = k.toplam > 0 ? (sayi / k.toplam) * 100 : 0;
                                return (
                                    <div key={rol} className="mb-5 last:mb-0">
                                        <div className="flex justify-between text-xs font-black mb-2 uppercase text-gray-500">
                                            <span>{rol}</span>
                                            <span className="text-gray-800">{sayi} Kişi</span>
                                        </div>
                                        <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                                                style={{ width: `${yuzde}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </CardBody>
                    </Card>

                    {/* Son 7 Gün Özet */}
                    <Card className="shadow-md border-none">
                        <CardHeader className="font-black text-gray-700 p-6 border-b border-gray-50 uppercase text-xs tracking-widest">
                            📈 Son 7 Gün
                        </CardHeader>
                        <CardBody className="p-6 space-y-5">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-500">Yeni Kayıt</span>
                                <span className="text-xl font-black text-indigo-600">{k.son_7_gun_yeni_kayit ?? 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-500">Yeni İlan</span>
                                <span className="text-xl font-black text-emerald-600">{il.son_7_gun_yeni_ilan ?? 0}</span>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* ─── KULLANICI YETKİLENDİRME TABLOSU ─── */}
                <div className="mt-10">
                    <h2 className="text-2xl font-black text-gray-800 tracking-tighter mb-6">🛡️ Kullanıcı Yetkilendirme</h2>
                    <Card className="shadow-md border-none">
                        <CardHeader className="font-black text-gray-700 p-6 border-b border-gray-50 uppercase text-xs tracking-widest flex justify-between items-center">
                            <span>Platform Kullanıcıları</span>
                            <Chip size="sm" variant="flat" color="secondary" className="font-bold">{kullanicilar.length} Kullanıcı</Chip>
                        </CardHeader>
                        <CardBody className="p-0 overflow-x-auto">
                            {kullanicilar.length > 0 ? (
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50/80">
                                            <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">#</th>
                                            <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Kullanıcı</th>
                                            <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Mevcut Rol</th>
                                            <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Yeni Rol</th>
                                            <th className="p-4 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">Aksiyon</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {kullanicilar.map((kul, index) => {
                                            const kulId = kul.id || kul._id;
                                            const secilenRol = secilenRoller[kulId];
                                            const rolDegisti = secilenRol && secilenRol !== kul.rol;
                                            return (
                                                <tr key={kulId} className="border-t border-gray-50 hover:bg-indigo-50/30 transition-colors">
                                                    <td className="p-4 text-sm font-bold text-gray-300">{index + 1}</td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0">
                                                                {kul.ad?.[0]}{kul.soyad?.[0]}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-sm text-gray-800">{kul.ad} {kul.soyad}</p>
                                                                <p className="text-xs text-gray-400">{kul.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <Chip
                                                            size="sm"
                                                            variant="flat"
                                                            color={kul.rol === "admin" ? "danger" : kul.rol === "client" ? "warning" : "primary"}
                                                            className="font-bold uppercase text-[10px]"
                                                        >
                                                            {kul.rol === "admin" ? "🛡️ Admin" : kul.rol === "client" ? "💼 İş Veren" : "👨‍💻 Freelancer"}
                                                        </Chip>
                                                    </td>
                                                    <td className="p-4">
                                                        <select
                                                            value={secilenRol || kul.rol}
                                                            onChange={(e) => setSecilenRoller(prev => ({ ...prev, [kulId]: e.target.value }))}
                                                            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer hover:border-indigo-300 transition-colors"
                                                        >
                                                            <option value="freelancer">Freelancer</option>
                                                            <option value="client">İş Veren</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => handleRolDegistir(kulId, secilenRol)}
                                                                disabled={!rolDegisti || rolGuncelleLoading === kulId}
                                                                className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${
                                                                    rolDegisti
                                                                        ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 cursor-pointer"
                                                                        : "bg-gray-100 text-gray-300 cursor-not-allowed"
                                                                }`}
                                                            >
                                                                {rolGuncelleLoading === kulId ? "⏳ Kaydediliyor..." : "Kaydet"}
                                                            </button>

                                                            <button
                                                                onClick={() => handleKullaniciSil(kulId)}
                                                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm shadow-red-100"
                                                                title="Kullanıcıyı Sil"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-10 text-center">
                                    <p className="text-gray-400 font-bold">Henüz kullanıcı verisi yok.</p>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </div>
            </main>
        </div>
    );
}