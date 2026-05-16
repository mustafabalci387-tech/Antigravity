/**
 * ProjectsScreen.js — Mobil Proje Listesi Ekranı (React Native - Saf JS)
 *
 * Görev: Kullanıcının dahil olduğu projeleri FlatList ile listeler.
 * Özellikler: ProjectService.getMyProjects() ile API çağrısı,
 * Pull-to-Refresh, durum badge'leri, bütçe/tarih gösterimi,
 * hata/boş durum yönetimi.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { ProjectService } from '../services/projectService';
import { colors } from '../../../core/theme/colors';

// ──────────────────────────────────────────────
// Durum badge renk haritası
// ──────────────────────────────────────────────
const STATUS_MAP = {
  devam_ediyor: {
    label: 'Devam Ediyor',
    bg: '#DBEAFE',
    text: '#1D4ED8',
    dot: '#3B82F6',
  },
  tamamlandi: {
    label: 'Tamamlandı',
    bg: '#D1FAE5',
    text: '#065F46',
    dot: '#10B981',
  },
  iptal: {
    label: 'İptal Edildi',
    bg: '#FEE2E2',
    text: '#991B1B',
    dot: '#EF4444',
  },
};

// ──────────────────────────────────────────────
// Yardımcı fonksiyonlar
// ──────────────────────────────────────────────
const formatBudget = (amount) => {
  if (!amount && amount !== 0) return '—';
  return `₺${Number(amount).toLocaleString('tr-TR')}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'Belirtilmedi';
  try {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return 'Belirtilmedi';
  }
};

export default function ProjectsScreen({ navigation }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Projeleri backend'den çeken ana fonksiyon
   */
  const fetchProjects = async () => {
    try {
      setError(null);
      const response = await ProjectService.getMyProjects();
      const projectsData = response?.projects || (Array.isArray(response) ? response : []);
      setProjects(projectsData);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Projeler yüklenemedi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Sayfa ilk yüklendiğinde çalışır
  useEffect(() => {
    fetchProjects();
  }, []);

  // Pull-to-Refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProjects();
  }, []);

  // ── Yüklenme Durumu ──
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Projeler Yükleniyor...</Text>
      </View>
    );
  }

  // ── Hata Durumu ──
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchProjects} style={styles.retryButton}>
          <Text style={styles.retryText}>🔄 Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Boş Liste Bileşeni ──
  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>Henüz projeniz bulunmuyor</Text>
      <Text style={styles.emptyHint}>
        Bir teklif onaylandığında proje otomatik olarak burada görünecektir.
      </Text>
    </View>
  );

  // ── Başlık Bileşeni ──
  const ListHeaderComponent = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>📋 Projelerim</Text>
      <View style={styles.headerBadge}>
        <Text style={styles.headerBadgeText}>{projects.length} proje</Text>
      </View>
    </View>
  );

  // ── Proje Kart Render Fonksiyonu ──
  const renderProjectCard = ({ item }) => {
    const statusInfo = STATUS_MAP[item.durum] || STATUS_MAP.devam_ediyor;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => {
          if (navigation) {
            navigation.navigate('ProjectDetailScreen', {
              id: item.id || item._id,
            });
          }
        }}
      >
        {/* Üst Renk Çizgisi */}
        <View style={[styles.cardTopLine, { backgroundColor: statusInfo.dot }]} />

        {/* Başlık & Durum Badge */}
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.baslik || item.ad || 'Proje'}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: statusInfo.dot }]} />
            <Text style={[styles.statusText, { color: statusInfo.text }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        {/* Detay Bilgileri */}
        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>💰 Bütçe</Text>
            <Text style={styles.infoBudget}>{formatBudget(item.butce)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📅 Teslim Tarihi</Text>
            <Text style={styles.infoValue}>{formatDate(item.teslim_tarihi)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🕐 Oluşturulma</Text>
            <Text style={styles.infoValueLight}>{formatDate(item.olusturulma_tarihi)}</Text>
          </View>
        </View>

        {/* Alt Buton */}
        <View style={styles.cardFooter}>
          <Text style={styles.detailButtonText}>📋 Proje Detayı →</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={projects}
        keyExtractor={(item) => (item.id || item._id)?.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          projects.length === 0 ? styles.flexGrow : styles.listContent
        }
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        renderItem={renderProjectCard}
      />
    </View>
  );
}

// ══════════════════════════════════════════════════
// Stiller
// ══════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.default50,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.default50,
  },
  flexGrow: {
    flexGrow: 1,
  },
  listContent: {
    paddingBottom: 24,
  },

  // ── Başlık ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.foreground,
  },
  headerBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },

  // ── Kart ──
  card: {
    backgroundColor: colors.background,
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  cardTopLine: {
    height: 3,
    width: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 8,
    gap: 10,
  },
  cardTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: colors.foreground,
    lineHeight: 22,
  },

  // ── Durum Badge ──
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // ── Kart İçeriği ──
  cardBody: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
    color: colors.default400,
    fontWeight: '500',
  },
  infoBudget: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.success,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.foreground,
  },
  infoValueLight: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.default500,
  },

  // ── Kart Alt Buton ──
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.default100,
    paddingVertical: 12,
    alignItems: 'center',
  },
  detailButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },

  // ── Yükleme / Hata / Boş ──
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.default500,
    fontWeight: '500',
  },
  errorIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: colors.default100,
    borderRadius: 10,
  },
  retryText: {
    color: colors.foreground,
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 13,
    color: colors.default400,
    textAlign: 'center',
    lineHeight: 20,
  },
});
