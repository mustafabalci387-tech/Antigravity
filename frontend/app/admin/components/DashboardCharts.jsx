"use client";

import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";
import { Card, CardBody, CardHeader } from "@heroui/react";

// ─── Renk Paletleri & Etiketler ────────────────────────────────────────────────

const ROL_RENKLERI = { freelancer: "#6366f1", client: "#8b5cf6", admin: "#ef4444" };
const ROL_ETIKETLERI = { freelancer: "Freelancer", client: "İş Veren", admin: "Admin" };

const ILAN_DURUM_RENKLERI = { acik: "#22c55e", devam_ediyor: "#3b82f6", tamamlandi: "#a855f7", iptal: "#ef4444" };
const ILAN_DURUM_ETIKETLERI = { acik: "Açık", devam_ediyor: "Devam Ediyor", tamamlandi: "Tamamlandı", iptal: "İptal" };

const BAR_RENKLERI = { toplam: "#6366f1", son7gun: "#14b8a6" };

// ─── Yardımcı Bileşenler ───────────────────────────────────────────────────────

function OzelTooltip({ active, payload, label }) {
    if (!active || !payload || payload.length === 0) return null;

    return (
        <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-xl shadow-xl px-4 py-3">
            {label && <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1">{label}</p>}
            {payload.map((entry, index) => (
                <p key={index} className="text-sm font-bold" style={{ color: entry.color || entry.fill }}>
                    {entry.name}: <span className="text-gray-800">{(entry.value || 0).toLocaleString("tr-TR")}</span>
                </p>
            ))}
        </div>
    );
}

function PieEtiket({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
    if (percent < 0.05) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text
            x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
            className="text-xs font-bold"
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
}

// ─── DRY: Tekrar Kullanılabilir Grafik Kartı (Wrapper) ─────────────────────────

function ChartCard({ icon, title, subtitle, dataLength, children }) {
    return (
        <Card className="shadow-md hover-card">
            <CardHeader className="border-b border-gray-100 px-6 pt-5 pb-3">
                <div>
                    <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider">
                        {icon} {title}
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-1">{subtitle}</p>
                </div>
            </CardHeader>
            <CardBody className="p-6">
                {dataLength > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                        {children}
                    </ResponsiveContainer>
                ) : (
                    <div className="h-[280px] flex items-center justify-center">
                        <p className="text-gray-400 text-xs">Veri bulunamadı</p>
                    </div>
                )}
            </CardBody>
        </Card>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANA BİLEŞEN
// ═══════════════════════════════════════════════════════════════════════════════

export default function DashboardCharts({ istatistikler }) {
    if (!istatistikler) return null;

    const { kullanicilar = {}, ilanlar = {}, teklifler = {}, odemeler = {} } = istatistikler;

    // Veri Hazırlama İşlemleri
    const rolVerisi = Object.entries(kullanicilar.rol_dagilimi || {}).map(([rol, sayi]) => ({
        name: ROL_ETIKETLERI[rol] || rol,
        value: sayi,
        renk: ROL_RENKLERI[rol] || "#94a3b8",
    }));

    const ilanDurumVerisi = Object.entries(ilanlar.durum_dagilimi || {}).map(([durum, sayi]) => ({
        name: ILAN_DURUM_ETIKETLERI[durum] || durum,
        value: sayi,
        renk: ILAN_DURUM_RENKLERI[durum] || "#94a3b8",
    }));

    const genelOzetVerisi = [
        { kategori: "Kullanıcı", toplam: kullanicilar.toplam || 0 },
        { kategori: "İlan", toplam: ilanlar.toplam || 0 },
        { kategori: "Teklif", toplam: teklifler.toplam || 0 },
        { kategori: "Ödeme", toplam: odemeler.toplam || 0 },
    ];

    const son7GunVerisi = [
        { kategori: "Yeni Kayıt", adet: kullanicilar.son_7_gun_yeni_kayit || 0 },
        { kategori: "Yeni İlan", adet: ilanlar.son_7_gun_yeni_ilan || 0 },
        { kategori: "Yeni Teklif", adet: teklifler.son_7_gun_yeni_teklif || 0 },
    ];

    return (
        <div className="space-y-6">
            {/* Üst Satır */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                <ChartCard
                    icon="👥" title="Kullanıcı Rol Dağılımı"
                    subtitle={`Toplam ${kullanicilar.toplam || 0} kullanıcı`}
                    dataLength={rolVerisi.length}
                >
                    <PieChart>
                        <Pie data={rolVerisi} cx="50%" cy="50%" innerRadius={65} outerRadius={110} paddingAngle={4} dataKey="value" labelLine={false} label={PieEtiket} animationDuration={800}>
                            {rolVerisi.map((entry, index) => <Cell key={`rol-${index}`} fill={entry.renk} stroke="none" />)}
                        </Pie>
                        <Tooltip content={<OzelTooltip />} />
                        <Legend verticalAlign="bottom" iconType="circle" iconSize={10} formatter={(v) => <span className="text-xs font-bold text-gray-600">{v}</span>} />
                    </PieChart>
                </ChartCard>

                <ChartCard
                    icon="📋" title="İlan Durum Dağılımı"
                    subtitle={`Toplam ${ilanlar.toplam || 0} ilan • Bütçe: ₺${(ilanlar.toplam_butce || 0).toLocaleString("tr-TR")}`}
                    dataLength={ilanDurumVerisi.length}
                >
                    <PieChart>
                        <Pie data={ilanDurumVerisi} cx="50%" cy="50%" innerRadius={65} outerRadius={110} paddingAngle={4} dataKey="value" labelLine={false} label={PieEtiket} animationBegin={200} animationDuration={800}>
                            {ilanDurumVerisi.map((entry, index) => <Cell key={`durum-${index}`} fill={entry.renk} stroke="none" />)}
                        </Pie>
                        <Tooltip content={<OzelTooltip />} />
                        <Legend verticalAlign="bottom" iconType="circle" iconSize={10} formatter={(v) => <span className="text-xs font-bold text-gray-600">{v}</span>} />
                    </PieChart>
                </ChartCard>

            </div>

            {/* Alt Satır */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                <ChartCard
                    icon="📊" title="Platform Genel Özet"
                    subtitle="Tüm zamanların toplam verileri"
                    dataLength={genelOzetVerisi.length}
                >
                    <BarChart data={genelOzetVerisi} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barCategoryGap="30%">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="kategori" tick={{ fontSize: 12, fontWeight: 700, fill: "#64748b" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <Tooltip content={<OzelTooltip />} cursor={{ fill: "#f1f5f9" }} />
                        <Bar dataKey="toplam" fill={BAR_RENKLERI.toplam} radius={[8, 8, 0, 0]} animationDuration={1000} />
                    </BarChart>
                </ChartCard>

                <ChartCard
                    icon="🔥" title="Son 7 Gün Aktivite"
                    subtitle="Haftalık yeni kayıt, ilan ve teklif sayıları"
                    dataLength={son7GunVerisi.length}
                >
                    <BarChart data={son7GunVerisi} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barCategoryGap="30%">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="kategori" tick={{ fontSize: 12, fontWeight: 700, fill: "#64748b" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip content={<OzelTooltip />} cursor={{ fill: "#f0fdfa" }} />
                        <Bar dataKey="adet" fill={BAR_RENKLERI.son7gun} radius={[8, 8, 0, 0]} animationDuration={1000} animationBegin={300} />
                    </BarChart>
                </ChartCard>

            </div>
        </div>
    );
}