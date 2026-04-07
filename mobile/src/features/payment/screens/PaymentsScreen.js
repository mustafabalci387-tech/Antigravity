/**
 * PaymentsScreen.js — Mobil Ödeme ve İş Onay Ekranı (Orijinal - Backend Bağlantılı)
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppCard } from '../../../base/components';
import { colors } from '../../../core/theme/colors';
import paymentService from '../services/paymentService';
import authService from '../../auth/services/authService';
import { showSuccessToast, showErrorToast } from '../../../base/utils/toast';
import { formatDate } from '../../../base/utils/dateFormatter';

const ODEME_DURUM = {
  Pending: { label: 'Bekliyor', color: colors.warning, bg: colors.warningLight, icon: '⏳' },
  Completed: { label: 'Tamamlandı', color: colors.success, bg: colors.successLight, icon: '✅' },
  Rejected: { label: 'Reddedildi', color: colors.danger, bg: colors.dangerLight, icon: '❌' },
};

const ONAY_DURUM = {
  beklemede: { label: 'Onay Bekliyor', color: colors.warning, bg: colors.warningLight },
  onaylandi: { label: 'Onaylandı', color: colors.success, bg: colors.successLight },
  reddedildi: { label: 'Reddedildi', color: colors.danger, bg: colors.dangerLight },
};

export default function PaymentsScreen() {
  const [user, setUser] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  // 1. Kullanıcıyı getir
  useEffect(() => {
    const getUser = async () => {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    };
    getUser();
  }, []);

  // 2. Gerçek API'den Ödemeleri Çek
  const fetchPayments = useCallback(async () => {
    if (!user) return;
    try {
      if (!refreshing) setLoading(true);
      const userId = user.id || user._id;
      const isClient = user.role === 'client' || user.rol === 'client';

      let data;
      if (isClient) {
        data = await paymentService.getPaymentsByIsveren(userId);
      } else {
        data = await paymentService.getPaymentsByFreelancer(userId);
      }

      setPayments(data?.payments || []);
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

  // 3. Gerçek Onaylama İşlemi (Backend'e gider)
  const handleApprove = (paymentId) => {
    Alert.alert("İşi Onayla", "Ödemeyi tamamlamak istediğinize emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Onayla",
        onPress: async () => {
          setActionLoading(paymentId);
          try {
            await paymentService.approvePayment(paymentId);
            showSuccessToast("İş onaylandı! ✅");
            fetchPayments();
          } catch (err) {
            showErrorToast(err, "Onaylama başarısız.");
          } finally {
            setActionLoading(null);
          }
        }
      }
    ]);
  };

  const isClient = user?.role === 'client' || user?.rol === 'client';

  const renderPaymentItem = ({ item }) => {
    const paymentId = item.id || item._id;
    const odemeDurum = ODEME_DURUM[item.odeme_durumu] || ODEME_DURUM.Pending;
    const isPending = item.odeme_durumu === 'Pending';

    return (
      <AppCard style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.paymentTitle}>{item.ad || 'Ödeme Kaydı'}</Text>
          <Text style={styles.amount}>₺{(item.tutar || 0).toLocaleString('tr-TR')}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>👤 {isClient ? 'Freelancer' : 'İşveren'}: {isClient ? item.freelancer_id?.slice(-6) : item.isveren_id?.slice(-6)}</Text>
          <Text style={styles.infoText}>📅 {formatDate(item.olusturulma_tarihi)}</Text>
        </View>

        <View style={[styles.badge, { backgroundColor: odemeDurum.bg }]}>
          <Text style={[styles.badgeText, { color: odemeDurum.color }]}>{odemeDurum.icon} {odemeDurum.label}</Text>
        </View>

        {isClient && isPending && (
          <TouchableOpacity
            style={styles.approveBtn}
            onPress={() => handleApprove(paymentId)}
            disabled={actionLoading === paymentId}
          >
            {actionLoading === paymentId ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Onayla ve Öde</Text>}
          </TouchableOpacity>
        )}
      </AppCard>
    );
  };

  if (loading && !refreshing) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💳 {isClient ? 'Ödemelerim' : 'Ödeme Geçmişim'}</Text>
        <Text style={styles.headerUser}>{user?.ad} {user?.soyad}</Text>
      </View>
      <FlatList
        data={payments}
        renderItem={renderPaymentItem}
        keyExtractor={item => String(item.id || item._id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.emptyText}>Henüz ödeme kaydı bulunamadı.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.default50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: colors.foreground },
  headerUser: { fontSize: 12, color: colors.primary, fontWeight: '700', marginTop: 4 },
  list: { padding: 15 },
  card: { padding: 20, marginBottom: 15, borderRadius: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  paymentTitle: { fontSize: 16, fontWeight: '700', color: colors.foreground, flex: 1 },
  amount: { fontSize: 18, fontWeight: '800', color: colors.primary },
  infoContainer: { marginBottom: 12 },
  infoText: { fontSize: 12, color: colors.default500, marginBottom: 4 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  approveBtn: { backgroundColor: colors.success, paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 15 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 50, color: colors.default400 }
});