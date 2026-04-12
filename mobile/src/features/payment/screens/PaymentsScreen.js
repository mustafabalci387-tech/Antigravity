/**
 * PaymentsScreen.js — Mobil Ödeme Ekranı
 * Web'deki /payments sayfasıyla birebir aynı görünüm ve işlevsellik.
 * 
 * Yapı (Web ile aynı):
 *  1. İşveren ise: Üstte "Yeni Ödeme Gerçekleştir" + Güvenli Ödeme formu
 *  2. Altta: "Ödemeler & İş Onayları" / "Kazançlarım & Geçmiş" başlığı
 *  3. "Geçmişi Temizle" butonu
 *  4. Her kayıt: ID badge, durum badge, başlık, tarih, tutar, silme butonu
 */

import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import paymentService from '../services/paymentService';
import authService from '../../auth/services/authService';
import { showSuccessToast, showErrorToast } from '../../../base/utils/toast';
import { formatDate } from '../../../base/utils/dateFormatter';
import PaymentManager from '../manager';

const ODEME_DURUM = {
  Pending:   { label: 'Bekliyor',    color: '#F59E0B', bg: '#FEF3C7', icon: '⏳' },
  Completed: { label: 'Tamamlandı',  color: '#10B981', bg: '#D1FAE5', icon: '✅' },
  Rejected:  { label: 'Reddedildi',  color: '#EF4444', bg: '#FEE2E2', icon: '❌' },
};

export default function PaymentsScreen() {
  const [user, setUser] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [formData, setFormData] = useState({
    kart_sahibi: '',
    kart_numarasi: '',
    son_kullanma: '',
    cvv: '',
    tutar: '100.00',
    aciklama: '',
  });

  const manager = new PaymentManager();

  // 1. Kullanıcıyı getir
  useEffect(() => {
    const getUser = async () => {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    };
    getUser();
  }, []);

  // 2. Ödeme listesini çek
  const fetchPayments = useCallback(async () => {
    if (!user) return;
    try {
      if (!refreshing) setLoading(true);
      const response = await paymentService.getUserPayments();
      setPayments(response || []);
    } catch (err) {
      console.error('Ödeme çekme hatası:', err);
      showErrorToast(err, 'Ödemeler yüklenemedi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, refreshing]);

  useEffect(() => {
    if (user) fetchPayments();
  }, [user, fetchPayments]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPayments();
  };

  // 3. Ödeme yapma
  const handlePayment = async () => {
    if (formData.kart_numarasi.length !== 16) {
      Alert.alert("Hata", "Lütfen 16 haneli kart numaranızı girin.");
      return;
    }

    setPaymentLoading(true);
    try {
      const payload = {
        kart_sahibi: formData.kart_sahibi,
        kart_numarasi: formData.kart_numarasi,
        son_kullanma_tarihi: formData.son_kullanma,
        cvv: formData.cvv,
        tutar: parseFloat(formData.tutar),
        freelancer_id: "65f123abc456def789",
        aciklama: formData.aciklama || "Hizmet Ödemesi",
      };

      const response = await manager.process_payment(payload);

      if (response.durum === "Başarılı") {
        Alert.alert("Başarılı", response.mesaj || "Ödeme onaylandı!");
        setFormData({
          kart_sahibi: '',
          kart_numarasi: '',
          son_kullanma: '',
          cvv: '',
          tutar: '100.00',
          aciklama: '',
        });
        // 800ms bekleyip listeyi güncelle
        setTimeout(() => fetchPayments(), 800);
      } else {
        Alert.alert("Reddedildi", response.mesaj || "Ödeme işlemi başarısız.");
      }
    } catch (error) {
      Alert.alert("Hata", error.message || "Ödeme sırasında bir sorun oluştu.");
    } finally {
      setPaymentLoading(false);
    }
  };

  // 4. Tek ödeme silme
  const handleDeletePayment = (paymentId) => {
    Alert.alert("Kaydı Sil", "Bu ödeme kaydını silmek istediğinize emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            await paymentService.deletePayment(paymentId);
            showSuccessToast("Ödeme kaydı silindi! 🗑️");
            setPayments(prev => prev.filter(p => (p.id || p._id) !== paymentId));
          } catch (err) {
            showErrorToast(err, "Silme işlemi başarısız.");
          }
        }
      }
    ]);
  };

  // 5. Tüm geçmişi temizle
  const handleClearHistory = () => {
    Alert.alert(
      "Geçmişi Temizle",
      "Tüm ödeme geçmişinizi silmek istediğinize emin misiniz?\nBu işlem geri alınamaz.",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Temizle",
          style: "destructive",
          onPress: async () => {
            try {
              await paymentService.clearAllPayments();
              showSuccessToast("Geçmiş başarıyla temizlendi! 🧹");
              setPayments([]);
            } catch (err) {
              showErrorToast(err, "Geçmiş temizlenirken hata oluştu.");
            }
          }
        }
      ]
    );
  };

  const isClient = user?.role === 'client' || user?.rol === 'client';

  // Ödeme formu (Web'deki Güvenli Ödeme kartı — sadece İşveren görür)
  const renderPaymentForm = () => {
    if (!isClient) return null;

    return (
      <View style={styles.paymentFormSection}>
        <Text style={styles.sectionTitle}>🚀 YENİ ÖDEME GERÇEKLEŞTİR</Text>

        <View style={styles.formCard}>
          {/* Header */}
          <View style={styles.formHeader}>
            <Text style={styles.formHeaderTitle}>💳 GÜVENLİ ÖDEME</Text>
            <Text style={styles.formHeaderSub}>STRIPE SECURE SIMULATION</Text>
          </View>

          {/* Tutar Paneli — Web'deki indigo bar */}
          <View style={styles.amountBar}>
            <View>
              <Text style={styles.amountBarLabel}>ÖDENECEK TOPLAM</Text>
              <Text style={styles.amountBarSub}>Hizmet Bedeli</Text>
            </View>
            <Text style={styles.amountBarValue}>₺{formData.tutar || '0.00'}</Text>
          </View>

          {/* Form Alanları */}
          <View style={styles.formFields}>
            <Text style={styles.inputLabel}>ÖDEME TUTARI (₺)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              keyboardType="numeric"
              value={formData.tutar}
              onChangeText={(text) => setFormData({...formData, tutar: text})}
            />

            <Text style={styles.inputLabel}>ÖDEME AÇIKLAMASI</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: Yazılım Geliştirme Hizmeti"
              value={formData.aciklama}
              onChangeText={(text) => setFormData({...formData, aciklama: text})}
            />

            <Text style={styles.inputLabel}>KART SAHİBİ</Text>
            <TextInput
              style={styles.input}
              placeholder="MUSTAFA BALCI"
              value={formData.kart_sahibi}
              onChangeText={(text) => setFormData({...formData, kart_sahibi: text})}
            />

            <Text style={styles.inputLabel}>KART NUMARASI</Text>
            <TextInput
              style={styles.input}
              placeholder="0000 0000 0000 0000"
              keyboardType="numeric"
              maxLength={16}
              value={formData.kart_numarasi}
              onChangeText={(text) => setFormData({...formData, kart_numarasi: text})}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={styles.inputLabel}>SON KULLANMA</Text>
                <TextInput
                  style={styles.input}
                  placeholder="AA/YY"
                  value={formData.son_kullanma}
                  onChangeText={(text) => setFormData({...formData, son_kullanma: text})}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="***"
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                  value={formData.cvv}
                  onChangeText={(text) => setFormData({...formData, cvv: text})}
                />
              </View>
            </View>
          </View>

          {/* Ödeme Butonu */}
          <TouchableOpacity
            style={[styles.payButton, paymentLoading && styles.payButtonDisabled]}
            onPress={handlePayment}
            disabled={paymentLoading}
          >
            {paymentLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.payButtonText}>ÖDEMEYİ TAMAMLA</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Ayırıcı çizgi */}
        <View style={styles.divider} />
      </View>
    );
  };

  // Ödeme kartı render — Web'deki tasarımla birebir aynı yapı
  const renderPaymentItem = ({ item }) => {
    const paymentId = item.id || item._id;
    const status = ODEME_DURUM[item.odeme_durumu] || ODEME_DURUM.Pending;

    return (
      <View style={styles.card}>
        {/* Üst satır: ID + Durum badge + Sil butonu */}
        <View style={styles.cardTopRow}>
          <View style={styles.badgeRow}>
            {/* ID Badge */}
            <View style={styles.idBadge}>
              <Text style={styles.idBadgeText}>
                ID: {paymentId ? paymentId.slice(-6) : "—"}
              </Text>
            </View>

            {/* Durum Badge */}
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <Text style={[styles.statusBadgeText, { color: status.color }]}>
                {status.icon} {status.label}
              </Text>
            </View>
          </View>

          {/* Sağ: Sil butonu + Tutar */}
          <View style={styles.rightSection}>
            <TouchableOpacity
              onPress={() => handleDeletePayment(paymentId)}
              style={styles.deleteBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.deleteBtnText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.amount}>
              ₺{(item.tutar || 0).toLocaleString('tr-TR')}
            </Text>
          </View>
        </View>

        {/* Başlık */}
        <Text style={styles.paymentTitle}>{item.ad || "Servis Ödemesi"}</Text>

        {/* Tarih */}
        <Text style={styles.dateText}>📅 {formatDate(item.olusturulma_tarihi)}</Text>
      </View>
    );
  };

  // Loading state
  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Header — Web'deki nav bar ile aynı */}
        <View style={styles.header}>
          <Text style={styles.headerBrand}>CollabFlow🚀</Text>
          <View style={styles.headerRight}>
            <View style={styles.headerUserInfo}>
              <Text style={styles.headerUserName}>{user?.ad} {user?.soyad}</Text>
              <Text style={styles.headerUserRole}>{isClient ? "İŞ VEREN" : "FREELANCER"}</Text>
            </View>
            <View style={styles.headerAvatar}>
              <Text style={styles.headerAvatarText}>
                {user?.ad?.[0]?.toUpperCase()}{user?.soyad?.[0]?.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        <FlatList
          data={payments && payments.length > 0 ? [...payments].reverse() : []}
          renderItem={renderPaymentItem}
          keyExtractor={item => String(item.id || item._id)}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366F1']} />}
          ListHeaderComponent={
            <View>
              {/* Ödeme Formu (sadece client) */}
              {renderPaymentForm()}

              {/* Ödeme Geçmişi Başlık + Temizle */}
              <View style={styles.historyHeader}>
                <Text style={styles.historyTitle}>
                  💳 {isClient ? 'Ödemeler & İş Onayları' : 'Kazançlarım & Geçmiş'}
                </Text>
                {payments && payments.length > 0 && (
                  <TouchableOpacity onPress={handleClearHistory} style={styles.clearBtn}>
                    <Text style={styles.clearBtnText}>🗑️ Geçmişi Temizle</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>Henüz bir ödeme kaydı bulunamadı.</Text>
            </View>
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '600',
  },

  // Header — Web nav bar tarzı
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  headerBrand: {
    fontSize: 18,
    fontWeight: '900',
    color: '#6366F1',
    fontStyle: 'italic',
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerUserInfo: {
    alignItems: 'flex-end',
  },
  headerUserName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1F2937',
    textTransform: 'uppercase',
    letterSpacing: -0.3,
  },
  headerUserRole: {
    fontSize: 9,
    fontWeight: '900',
    color: '#6366F1',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    backgroundColor: '#4F46E5',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  headerAvatarText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 13,
  },

  // Ödeme Formu Bölümü
  paymentFormSection: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1F2937',
    letterSpacing: -0.5,
    textTransform: 'uppercase',
    fontStyle: 'italic',
    marginBottom: 16,
  },

  // Form Kartı — Web'deki beyaz rounded kart
  formCard: {
    backgroundColor: '#FFF',
    borderRadius: 28,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  formHeader: {
    marginBottom: 16,
  },
  formHeaderTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#6366F1',
    letterSpacing: -0.5,
    textTransform: 'uppercase',
    fontStyle: 'italic',
  },
  formHeaderSub: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: 2,
  },

  // Tutar Paneli — Web'deki indigo bar
  amountBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  amountBarLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    fontStyle: 'italic',
    letterSpacing: 1,
  },
  amountBarSub: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
    fontStyle: 'italic',
    marginTop: 2,
  },
  amountBarValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    fontStyle: 'italic',
    letterSpacing: -1,
  },

  // Form alanları
  formFields: {
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#6B7280',
    textTransform: 'uppercase',
    fontStyle: 'italic',
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    marginBottom: 16,
    color: '#1F2937',
    fontWeight: '600',
    backgroundColor: '#FAFAFA',
  },
  row: {
    flexDirection: 'row',
  },

  // Ödeme Butonu — Web'deki koyu buton
  payButton: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 4,
  },
  payButtonDisabled: {
    backgroundColor: '#6B7280',
  },
  payButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 1,
  },

  // Ayırıcı
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 28,
    opacity: 0.5,
  },

  // Ödeme Geçmişi Header
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1F2937',
    letterSpacing: -0.5,
    flex: 1,
  },

  // Geçmişi Temizle
  clearBtn: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  clearBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },

  // Liste
  list: {
    padding: 16,
    paddingBottom: 30,
  },

  // Kart — Web'deki rounded-[2rem] white card
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  // Üst satır
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },

  // ID Badge
  idBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  idBadgeText: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '700',
  },

  // Durum Badge
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Sağ kısım: Sil + Tutar
  rightSection: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 10,
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },

  // Tutar
  amount: {
    fontSize: 22,
    fontWeight: '900',
    color: '#6366F1',
    letterSpacing: -1,
    fontStyle: 'italic',
  },

  // Başlık
  paymentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },

  // Tarih
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
    fontStyle: 'italic',
  },

  // Boş durum
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: '#FFF',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    borderStyle: 'dashed',
    marginTop: 20,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    color: '#9CA3AF',
    fontWeight: '700',
    textTransform: 'uppercase',
    fontSize: 11,
    letterSpacing: 1,
  },
});