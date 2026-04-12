import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    RefreshControl,
    ActivityIndicator,
    Dimensions,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import BaseService from '../../../base/services/BaseService';
import { colors } from '../../../core/theme/colors';

const { width: EKRAN_GENISLIGI } = Dimensions.get('window');
const KART_GENISLIGI = (EKRAN_GENISLIGI - 48) / 2;

// ─── ALT BİLEŞENLER (DRY Prensibi) ─────────────────────────────────────────────

// 1. Üst Kısım 2'li Grid Kartları
const MetrikKart = ({ baslik, deger, ikon, altBilgi, renkler }) => (
    <View style={[styles.metrikKart, { backgroundColor: renkler[0] }]}>
        <View style={styles.metrikUst}>
            <Text style={styles.metrikIkon}>{ikon}</Text>
            <Text style={styles.metrikDeger}>{deger.toLocaleString('tr-TR')}</Text>
        </View>
        <Text style={styles.metrikBaslik}>{baslik}</Text>
        <View style={styles.metrikAltBilgiContainer}>
            <Text style={styles.metrikAltBilgi}>{altBilgi}</Text>
        </View>
    </View>
);

// 2. Detay Kartı Sarıcısı (Wrapper)
const DetayKartWrapper = ({ baslik, footerLabel, footerDeger, footerRenk = colors.primary, children }) => (
    <View style={styles.detayKart}>
        <Text style={styles.detayBaslik}>{baslik}</Text>
        {children}
        {footerLabel && (
            <>
                <View style={styles.ayirici} />
                <View style={styles.altBilgiSatir}>
                    <Text style={styles.altBilgiLabel}>{footerLabel}</Text>
                    <Text style={[styles.altBilgiDeger, { color: footerRenk }]}>{footerDeger}</Text>
                </View>
            </>
        )}
    </View>
);

// 3. Durum Listesi Elemanı (İlanlar ve Ödemeler İçin Ortak)
const DurumChip = ({ label, sayi, renk }) => (
    <View style={styles.chipSatir}>
        <View style={styles.chipSol}>
            <View style={[styles.chipDot, { backgroundColor: renk }]} />
            <Text style={styles.chipLabel}>{label}</Text>
        </View>
        <View style={[styles.chipBadge, { backgroundColor: renk + '18' }]}>
            <Text style={[styles.chipBadgeText, { color: renk }]}>{sayi}</Text>
        </View>
    </View>
);

// ─── SABİTLER ──────────────────────────────────────────────────────────────────

const ROL_AYARLARI = {
    freelancer: { label: 'Freelancer', ikon: '💻', renk: '#6366f1' },
    client: { label: 'İş Veren', ikon: '🏢', renk: '#8b5cf6' },
    admin: { label: 'Admin', ikon: '🛡️', renk: '#ef4444' },
};

const DURUM_AYARLARI = {
    acik: { label: 'Açık', renk: '#22c55e' },
    devam_ediyor: { label: 'Devam Ediyor', renk: '#3b82f6' },
    tamamlandi: { label: 'Tamamlandı', renk: '#a855f7' },
    iptal: { label: 'İptal', renk: '#ef4444' },
    Pending: { label: 'Bekliyor', renk: '#f59e0b' },
    Completed: { label: 'Tamamlandı', renk: '#22c55e' },
    Rejected: { label: 'Reddedildi', renk: '#ef4444' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// ANA EKRAN
// ═══════════════════════════════════════════════════════════════════════════════

export default function AdminDashboardScreen() {
    const [istatistikler, setIstatistikler] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [hata, setHata] = useState(null);
    const [kullanicilar, setKullanicilar] = useState([]);
    const [secilenRoller, setSecilenRoller] = useState({});
    const [rolGuncelleLoading, setRolGuncelleLoading] = useState(null);

    const fetchIstatistikler = async () => {
        try {
            setHata(null);
            const data = await BaseService.get('/admin/istatistikler');
            setIstatistikler(data);

            // Kullanıcı listesini çek (Yetkilendirme tablosu için)
            try {
                const kullanicilarRes = await BaseService.get('/users');
                const kullanicilarData = kullanicilarRes?.users || kullanicilarRes || [];
                setKullanicilar(Array.isArray(kullanicilarData) ? kullanicilarData : []);
            } catch (e) {
                console.log('[Admin] Kullanıcı listesi yüklenemedi:', e);
            }
        } catch (error) {
            setHata(error?.response?.data?.message || 'İstatistikler yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(useCallback(() => { fetchIstatistikler(); }, []));

    const onRefresh = () => {
        setRefreshing(true);
        fetchIstatistikler();
    };

    // ── ROL GÜNCELLEME FONKSİYONU ──
    const handleRolDegistir = async (userId, yeniRol) => {
        try {
            setRolGuncelleLoading(userId);
            await BaseService.patch('/admin/kullanici-rol', {
                user_id: userId,
                yeni_rol: yeniRol,
            });
            setKullanicilar(prev =>
                prev.map(k => (k.id || k._id) === userId ? { ...k, rol: yeniRol } : k)
            );
            setSecilenRoller(prev => {
                const copy = { ...prev };
                delete copy[userId];
                return copy;
            });
            Alert.alert('Başarılı ✅', `Kullanıcı rolü "${yeniRol}" olarak güncellendi.`);
        } catch (err) {
            Alert.alert('Hata', err?.response?.data?.message || 'Rol güncellenirken hata oluştu.');
        } finally {
            setRolGuncelleLoading(null);
        }
    };

    // ── KULLANICI SİLME FONKSİYONU ──
    const handleKullaniciSil = (kulId, kulAd) => {
        Alert.alert(
            'Kullanıcıyı Sil',
            `"${kulAd}" adlı kullanıcıyı silmek istediğinize emin misiniz?\nBu işlem geri alınamaz.`,
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await BaseService.delete(`/users/${kulId}`);
                            setKullanicilar(prev => prev.filter(k => (k.id || k._id) !== kulId));
                            Alert.alert('Başarılı 🗑️', `"${kulAd}" kullanıcısı silindi.`);
                        } catch (err) {
                            Alert.alert('Hata', err?.response?.data?.detail || 'Kullanıcı silinirken hata oluştu.');
                        }
                    }
                }
            ]
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Dashboard yükleniyor...</Text>
            </View>
        );
    }

    if (hata && !istatistikler) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.hataIkon}>🚫</Text>
                <Text style={styles.hataBaslik}>Erişim Hatası</Text>
                <Text style={styles.hataMesaj}>{hata}</Text>
            </View>
        );
    }

    // Veri Güvenliği
    const k = istatistikler?.kullanicilar || {};
    const il = istatistikler?.ilanlar || {};
    const t = istatistikler?.teklifler || {};
    const o = istatistikler?.odemeler || {};

    const metrikler = [
        { baslik: 'Toplam Kullanıcı', deger: k.toplam ?? 0, ikon: '👥', altBilgi: `+${k.son_7_gun_yeni_kayit ?? 0} (7 gün)`, renkler: ['#6366f1'] },
        { baslik: 'Toplam İlan', deger: il.toplam ?? 0, ikon: '📋', altBilgi: `+${il.son_7_gun_yeni_ilan ?? 0} (7 gün)`, renkler: ['#10b981'] },
        { baslik: 'Toplam Teklif', deger: t.toplam ?? 0, ikon: '🤝', altBilgi: `+${t.son_7_gun_yeni_teklif ?? 0} (7 gün)`, renkler: ['#f59e0b'] },
        { baslik: 'Toplam Ödeme', deger: o.toplam ?? 0, ikon: '💳', altBilgi: `₺${(o.tamamlanan_toplam_hacim ?? 0).toLocaleString('tr-TR')}`, renkler: ['#ef4444'] },
    ];

    // Yardımcı Render Fonksiyonu
    const renderDurumListesi = (dagilimObjesi) => {
        if (!dagilimObjesi || Object.keys(dagilimObjesi).length === 0) {
            return <Text style={styles.bosVeri}>Veri bulunamadı</Text>;
        }
        return Object.entries(dagilimObjesi).map(([key, sayi]) => {
            const ayar = DURUM_AYARLARI[key] || { label: key, renk: '#94a3b8' };
            return <DurumChip key={key} label={ayar.label} sayi={sayi} renk={ayar.renk} />;
        });
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
            showsVerticalScrollIndicator={false}
        >
            {/* Başlık */}
            <View style={styles.headerContainer}>
                <View style={styles.headerBadge}><Text style={styles.headerBadgeText}>🛡️ Admin Panel</Text></View>
                <Text style={styles.headerTitle}>📊 Dashboard</Text>
                <Text style={styles.headerSubtitle}>Platform genelindeki anlık istatistikler</Text>
                {istatistikler?.rapor_tarihi && (
                    <Text style={styles.headerDate}>Son güncelleme: {new Date(istatistikler.rapor_tarihi).toLocaleString('tr-TR')}</Text>
                )}
            </View>

            {/* Metrik Grid */}
            <View style={styles.gridContainer}>
                {metrikler.map((m, index) => <MetrikKart key={index} {...m} />)}
            </View>

            {/* Kullanıcı Rolleri */}
            <DetayKartWrapper
                baslik="👥 Kullanıcı Rolleri"
                footerLabel="Son 30 gün yeni kayıt"
                footerDeger={`+${k.son_30_gun_yeni_kayit ?? 0}`}
            >
                {k.rol_dagilimi && Object.keys(k.rol_dagilimi).length > 0 ? (
                    Object.entries(k.rol_dagilimi).map(([rol, sayi]) => {
                        const ayar = ROL_AYARLARI[rol] || { label: rol, ikon: '👤', renk: '#94a3b8' };
                        const yuzde = k.toplam > 0 ? Math.round((sayi / k.toplam) * 100) : 0;
                        return (
                            <View key={rol} style={styles.dagilimSatir}>
                                <View style={styles.dagilimSol}>
                                    <Text style={styles.dagilimIkon}>{ayar.ikon}</Text>
                                    <Text style={styles.dagilimLabel}>{ayar.label}</Text>
                                </View>
                                <View style={styles.dagilimSag}>
                                    <View style={styles.barContainer}>
                                        <View style={[styles.barFill, { width: `${yuzde}%`, backgroundColor: ayar.renk }]} />
                                    </View>
                                    <Text style={styles.dagilimSayi}>{sayi} <Text style={styles.dagilimYuzde}>%{yuzde}</Text></Text>
                                </View>
                            </View>
                        );
                    })
                ) : <Text style={styles.bosVeri}>Veri bulunamadı</Text>}
            </DetayKartWrapper>

            {/* İlan Durumları */}
            <DetayKartWrapper
                baslik="📋 İlan Durumları"
                footerLabel="Toplam bütçe"
                footerDeger={`₺${(il.toplam_butce ?? 0).toLocaleString('tr-TR')}`}
                footerRenk="#10b981"
            >
                {renderDurumListesi(il.durum_dagilimi)}
            </DetayKartWrapper>

            {/* Ödeme Durumları */}
            <DetayKartWrapper
                baslik="💳 Ödeme Durumları"
                footerLabel="Tamamlanan hacim"
                footerDeger={`₺${(o.tamamlanan_toplam_hacim ?? 0).toLocaleString('tr-TR')}`}
                footerRenk="#22c55e"
            >
                {renderDurumListesi(o.durum_dagilimi)}
            </DetayKartWrapper>

            {/* Teklif Özeti */}
            <DetayKartWrapper baslik="🤝 Teklif Özeti">
                <View style={styles.teklifGrid}>
                    <View style={styles.teklifItem}>
                        <Text style={styles.teklifDeger}>₺{(t.ortalama_teklif_tutari ?? 0).toLocaleString('tr-TR')}</Text>
                        <Text style={styles.teklifLabel}>Ortalama Tutar</Text>
                    </View>
                    <View style={styles.teklifAyirici} />
                    <View style={styles.teklifItem}>
                        <Text style={styles.teklifDeger}>₺{(t.toplam_teklif_tutari ?? 0).toLocaleString('tr-TR')}</Text>
                        <Text style={styles.teklifLabel}>Toplam Tutar</Text>
                    </View>
                </View>
            </DetayKartWrapper>

            {/* ─── KULLANICI YETKİLENDİRME ─── */}
            <DetayKartWrapper baslik="🛡️ Kullanıcı Yetkilendirme">
                {kullanicilar.length > 0 ? kullanicilar.map((kul, index) => {
                    const kulId = kul.id || kul._id;
                    const secilenRol = secilenRoller[kulId] || kul.rol;
                    const rolDegisti = secilenRoller[kulId] && secilenRoller[kulId] !== kul.rol;
                    return (
                        <View key={kulId} style={styles.yetkilendirmeSatir}>
                            <View style={styles.yetkilendirmeKullanici}>
                                <View style={styles.yetkilendirmeAvatar}>
                                    <Text style={styles.yetkilendirmeAvatarText}>
                                        {kul.ad?.[0]}{kul.soyad?.[0]}
                                    </Text>
                                </View>
                                <View style={styles.yetkilendirmeBilgi}>
                                    <Text style={styles.yetkilendirmeAd}>{kul.ad} {kul.soyad}</Text>
                                    <Text style={styles.yetkilendirmeEmail}>{kul.email}</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => handleKullaniciSil(kulId, `${kul.ad} ${kul.soyad}`)}
                                    style={styles.silButon}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                    <Text style={styles.silButonText}>🗑️</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.rolButonlari}>
                                {['freelancer', 'client', 'admin'].map(rol => (
                                    <TouchableOpacity
                                        key={rol}
                                        onPress={() => setSecilenRoller(prev => ({ ...prev, [kulId]: rol }))}
                                        style={[
                                            styles.rolButon,
                                            secilenRol === rol && styles.rolButonAktif,
                                            secilenRol === rol && rol === 'admin' && styles.rolButonAdmin,
                                            secilenRol === rol && rol === 'client' && styles.rolButonClient,
                                        ]}
                                    >
                                        <Text style={[
                                            styles.rolButonText,
                                            secilenRol === rol && styles.rolButonTextAktif,
                                        ]}>
                                            {ROL_AYARLARI[rol]?.ikon} {ROL_AYARLARI[rol]?.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            {rolDegisti && (
                                <TouchableOpacity
                                    onPress={() => handleRolDegistir(kulId, secilenRoller[kulId])}
                                    disabled={rolGuncelleLoading === kulId}
                                    style={[styles.kaydetButon, rolGuncelleLoading === kulId && { opacity: 0.6 }]}
                                >
                                    <Text style={styles.kaydetButonText}>
                                        {rolGuncelleLoading === kulId ? '⏳ Kaydediliyor...' : '✅ Rolü Güncelle'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            {index < kullanicilar.length - 1 && <View style={styles.yetkilendirmeAyirici} />}
                        </View>
                    );
                }) : (
                    <Text style={styles.bosVeri}>Henüz kullanıcı verisi yok.</Text>
                )}
            </DetayKartWrapper>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

// ════════════════════════════════════════════════════════════════════════════════
// STİLLER
// ════════════════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    scrollContent: { paddingBottom: 20 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB', paddingHorizontal: 32 },
    loadingText: { marginTop: 12, fontSize: 13, color: colors.default400, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
    hataIkon: { fontSize: 48, marginBottom: 16 },
    hataBaslik: { fontSize: 20, fontWeight: '900', color: colors.foreground, marginBottom: 8 },
    hataMesaj: { fontSize: 14, color: colors.default500, textAlign: 'center', lineHeight: 20 },
    headerContainer: { paddingHorizontal: 16, paddingTop: 56, paddingBottom: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    headerBadge: { alignSelf: 'flex-start', backgroundColor: '#FEE2E2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 12 },
    headerBadgeText: { fontSize: 11, fontWeight: '800', color: '#EF4444', textTransform: 'uppercase', letterSpacing: 0.5 },
    headerTitle: { fontSize: 26, fontWeight: '900', color: '#1F2937', letterSpacing: -0.5 },
    headerSubtitle: { fontSize: 13, color: '#9CA3AF', marginTop: 4 },
    headerDate: { fontSize: 10, color: '#D1D5DB', fontWeight: '700', marginTop: 6, textTransform: 'uppercase', letterSpacing: 1 },
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 20 },
    metrikKart: { width: KART_GENISLIGI, borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 6 },
    metrikUst: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    metrikIkon: { fontSize: 28, opacity: 0.9 },
    metrikDeger: { fontSize: 28, fontWeight: '900', color: '#FFFFFF', letterSpacing: -1 },
    metrikBaslik: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: 0.5 },
    metrikAltBilgiContainer: { marginTop: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' },
    metrikAltBilgi: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
    detayKart: { marginHorizontal: 16, marginBottom: 16, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
    detayBaslik: { fontSize: 13, fontWeight: '900', color: '#374151', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 16 },
    dagilimSatir: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
    dagilimSol: { flexDirection: 'row', alignItems: 'center', width: 100 },
    dagilimIkon: { fontSize: 16, marginRight: 6 },
    dagilimLabel: { fontSize: 13, fontWeight: '700', color: '#4B5563' },
    dagilimSag: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
    barContainer: { flex: 1, height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden' },
    barFill: { height: 8, borderRadius: 4 },
    dagilimSayi: { fontSize: 13, fontWeight: '900', color: '#1F2937', minWidth: 60, textAlign: 'right' },
    dagilimYuzde: { fontSize: 11, fontWeight: '600', color: '#9CA3AF' },
    chipSatir: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8 },
    chipSol: { flexDirection: 'row', alignItems: 'center' },
    chipDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
    chipLabel: { fontSize: 14, fontWeight: '700', color: '#4B5563' },
    chipBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
    chipBadgeText: { fontSize: 14, fontWeight: '900' },
    teklifGrid: { flexDirection: 'row', alignItems: 'center' },
    teklifItem: { flex: 1, alignItems: 'center', paddingVertical: 8 },
    teklifAyirici: { width: 1, height: 40, backgroundColor: '#E5E7EB' },
    teklifDeger: { fontSize: 18, fontWeight: '900', color: '#F59E0B', letterSpacing: -0.5 },
    teklifLabel: { fontSize: 11, fontWeight: '600', color: '#9CA3AF', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
    ayirici: { height: 1, backgroundColor: '#F3F4F6', marginTop: 12, marginBottom: 12 },
    altBilgiSatir: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    altBilgiLabel: { fontSize: 12, color: '#9CA3AF' },
    altBilgiDeger: { fontSize: 14, fontWeight: '900' },
    bosVeri: { textAlign: 'center', color: '#D1D5DB', fontSize: 13, paddingVertical: 16 },
    yetkilendirmeSatir: { marginBottom: 4 },
    yetkilendirmeKullanici: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    yetkilendirmeAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    yetkilendirmeAvatarText: { color: '#FFF', fontWeight: '900', fontSize: 14 },
    yetkilendirmeBilgi: { flex: 1 },
    yetkilendirmeAd: { fontSize: 14, fontWeight: '800', color: '#1F2937' },
    yetkilendirmeEmail: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
    silButon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
    silButonText: { fontSize: 16 },
    rolButonlari: { flexDirection: 'row', gap: 6, marginBottom: 8 },
    rolButon: { flex: 1, paddingVertical: 8, paddingHorizontal: 4, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center' },
    rolButonAktif: { backgroundColor: '#6366f1' },
    rolButonAdmin: { backgroundColor: '#EF4444' },
    rolButonClient: { backgroundColor: '#F59E0B' },
    rolButonText: { fontSize: 11, fontWeight: '700', color: '#6B7280' },
    rolButonTextAktif: { color: '#FFFFFF' },
    kaydetButon: { backgroundColor: '#6366f1', borderRadius: 10, paddingVertical: 10, alignItems: 'center', marginTop: 4, marginBottom: 8 },
    kaydetButonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
    yetkilendirmeAyirici: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
});