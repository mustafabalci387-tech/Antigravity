import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import NotificationService from '../services/notificationService';

// 🔥 Doğru import yolları senin klasör yapına göre (core alt klasörü eklendi):
import { showToast } from '../../../base/utils/toast';
import { formatDate } from '../../../base/utils/dateFormatter';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      // Sunum için sahte bildirim ekleyelim (Gerçek veri gelene kadar boş kalmasın)
      const res = await NotificationService.getMyNotifications();
      let data = res?.notifications || [];

      if (data.length === 0) {
        data = [
          {
            _id: "1",
            mesaj: "3D Karakter Modelleme Projesi için ödemeniz havuzda bekliyor. Barış Bey onayınızı bekliyor.",
            okundu_mu: false,
            olusturulma_tarihi: new Date().toISOString()
          }
        ];
      }
      setNotifications(data);
    } catch (error) {
      console.error(error);
      // Hata durumunda uygulama çökmesin diye toast'ı kontrol edelim
      if (showToast) showToast('Bildirimler alınamadı', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAsRead = async (id) => {
    try {
      await NotificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id || n._id === id ? { ...n, okundu_mu: true } : n));
    } catch (error) {
      console.error(error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, okundu_mu: true })));
      showToast('Tümü okundu', 'success');
    } catch (error) {
      console.error(error);
    }
  };

  const renderItem = ({ item }) => {
    const isUnread = !item.okundu_mu;

    return (
      <TouchableOpacity
        style={[styles.card, isUnread ? styles.unreadCard : styles.readCard]}
        onPress={() => isUnread && markAsRead(item.id || item._id)}
        disabled={!isUnread}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.message, isUnread && styles.unreadText]}>
            {item.mesaj}
          </Text>
          {isUnread && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.date}>
          {formatDate ? formatDate(item.olusturulma_tarihi, true) : "Yeni"}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bildirimler</Text>
        {notifications.some(n => !n.okundu_mu) && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markAllText}>Tümünü Oku</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={item => String(item.id || item._id)}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4F46E5"]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Henüz bildiriminiz yok.</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

// Styles kısmın aynı kalabilir, yukarıdaki mantık değişikliği yeterli.
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1F2937' },
  markAllText: { color: '#4F46E5', fontWeight: '600', fontSize: 14 },
  listContent: { padding: 16 },
  card: { padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2, borderWidth: 1 },
  unreadCard: { backgroundColor: '#EEF2FF', borderColor: '#E0E7FF' },
  readCard: { backgroundColor: '#FFFFFF', borderColor: '#F3F4F6' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  message: { flex: 1, fontSize: 14, color: '#374151', lineHeight: 20, marginRight: 8 },
  unreadText: { fontWeight: '700', color: '#111827' },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#EF4444', marginTop: 4 },
  date: { fontSize: 11, color: '#6B7280' },
  emptyContainer: { padding: 32, alignItems: 'center' },
  emptyText: { color: '#9CA3AF', fontSize: 16 }
});