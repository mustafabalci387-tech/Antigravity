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
  TextInput // Filtreleme için eklendi
} from 'react-native';
// Daha hassas güvenli alan kontrolü için SafeAreaView
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppCard, AppButton, AppChip } from '../../../base/components';
import { colors } from '../../../core/theme/colors';
import jobService from '../services/jobService';
import authService from '../../auth/services/authService';
import { useNavigation } from '@react-navigation/native';
import { showToast, showErrorToast, showSuccessToast } from '../../../base/utils/toast';

export default function JobsScreen() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null); // Silme işleminin spinner'ı için state
  const navigation = useNavigation();

  // Filtre State'leri
  const [filterKategori, setFilterKategori] = useState('');
  const [filterMinBudget, setFilterMinBudget] = useState('');
  const [filterMaxBudget, setFilterMaxBudget] = useState('');

  const fetchJobs = useCallback(async (isReset = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = { sort: '-createdAt' };
      if (!isReset) {
        if (filterKategori) params.category = filterKategori.trim();
        if (filterMinBudget) params.min_budget = Number(filterMinBudget);
        if (filterMaxBudget) params.max_budget = Number(filterMaxBudget);
      }

      const data = await jobService.getAll(params);
      // ApiService zaten response.data?.data ayıklamasını yaptığı için doğrudan data.jobs'a bakıyoruz
      if (data && data.jobs) {
        setJobs(data.jobs || []);
      } else if (Array.isArray(data)) {
        // Yedek durum (Fallback)
        setJobs(data);
      }
    } catch (err) {
      console.error('İlan çekme hatası:', err);
      setError('İlanlar yüklenirken bir sorun oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filterKategori, filterMinBudget, filterMaxBudget]);

  useEffect(() => {
    const getUser = async () => {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    };
    getUser();
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchJobs();
  };

  const handleDelete = (jobId, jobTitle) => {
    Alert.alert(
      "İlanı Sil",
      `"${jobTitle}" ilanını silmek istediğinize emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            setDeletingId(jobId);
            try {
              await jobService.delete(jobId);
              setJobs(prev => prev.filter(job => String(job.id || job._id) !== String(jobId)));
              showSuccessToast("İlan başarıyla silindi");
            } catch (err) {
              showErrorToast(err, 'Silinemedi');
            } finally {
              setDeletingId(null);
            }
          }
        }
      ]
    );
  };

  const isClient = user?.role === 'client';

  const renderJobItem = ({ item }) => (
    <AppCard style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.jobTitle}>{item.ad}</Text>
        <AppChip
          label={item.kategori || 'Genel'}
          color={isClient ? 'secondary' : 'primary'}
        />
      </View>

      <Text style={styles.jobDescription} numberOfLines={3}>
        {item.aciklama}
      </Text>

      <View style={styles.cardFooter}>
        <Text style={styles.budget}>{item.butce} ₺</Text>
      </View>

      <View style={styles.buttonContainer}>
        {isClient && (
          <TouchableOpacity
            style={[styles.fullWidthButton, styles.deleteButton]}
            onPress={() => handleDelete(item.id || item._id, item.title)}
            disabled={deletingId === (item.id || item._id)}
          >
            {deletingId === (item.id || item._id) ? (
              <ActivityIndicator size="small" color={colors.danger} style={{ marginRight: 8 }} />
            ) : (
              <Text style={styles.deleteButtonIcon}>🗑️ </Text>
            )}
            <Text style={styles.deleteButtonText}>
              {deletingId === (item.id || item._id) ? "Siliniyor..." : "İlanı Sil"}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.fullWidthButton, styles.detailButton]}
          onPress={() => navigation.navigate('JobDetailScreen', { id: item.id || item._id })}
        >
          <Text style={styles.detailButtonText}>
            {isClient ? "📋 Teklifleri Gör" : "📩 Detaylar & Teklif Ver"}
          </Text>
        </TouchableOpacity>
      </View>
    </AppCard>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>İş ilanları yükleniyor...</Text>
      </View>
    );
  }

  return (
    /* edges parametresini kaldırıp kapsayıcı bir View ekledik.
       Bu yöntem fiziksel cihazlarda çok daha kararlı çalışır.
    */
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {isClient ? "💼 İlanlarım" : "💼 İş İlanları"}
          </Text>
          <Text style={styles.subtitle}>
            {isClient
              ? "Yayınladığınız iş ilanlarını buradan takip edebilirsiniz."
              : "Yeteneklerinize uygun en yeni iş ilanları."}
          </Text>
        </View>

        {/* FİLTRELEME BÖLÜMÜ */}
        <View style={styles.filterContainer}>
          <TextInput 
            style={styles.filterInput} 
            placeholder="Kategori (ör: web_gelistirme)" 
            value={filterKategori} 
            onChangeText={setFilterKategori} 
          />
          <View style={styles.filterRow}>
            <TextInput 
              style={[styles.filterInput, {flex: 1, marginRight: 8}]} 
              placeholder="Min Bütçe" 
              keyboardType="numeric" 
              value={filterMinBudget} 
              onChangeText={setFilterMinBudget} 
            />
            <TextInput 
              style={[styles.filterInput, {flex: 1}]} 
              placeholder="Max Bütçe" 
              keyboardType="numeric" 
              value={filterMaxBudget} 
              onChangeText={setFilterMaxBudget} 
            />
          </View>
          <AppButton 
            title="🔍 Filtrele" 
            onPress={() => { fetchJobs(); showSuccessToast("Filtreler uygulandı"); }} 
            style={{marginTop: 8}} 
          />
          {(filterKategori || filterMinBudget || filterMaxBudget) ? (
            <TouchableOpacity 
              onPress={() => { 
                setFilterKategori(''); setFilterMinBudget(''); setFilterMaxBudget(''); 
                fetchJobs(true);
              }} 
              style={{marginTop: 12, alignItems: 'center'}}
            >
               <Text style={{color: colors.primary, fontWeight: 'bold'}}>Temizle</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {error ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <AppButton title="Tekrar Dene" onPress={fetchJobs} style={styles.retryButton} />
          </View>
        ) : (
        <FlatList
            data={jobs}
            renderItem={renderJobItem}
            keyExtractor={(item) => String(item._id || item.id || Math.random())}
            /* Alt menü çakışmasını engellemek için padding değerini 
               biraz daha artırıyoruz (140 civarı idealdir).
            */
            contentContainerStyle={[styles.listContent, { paddingBottom: 140 }]}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
            }
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={Platform.OS === 'android'}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Henüz hiç ilan bulunamadı.</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background, // Üst kısmın rengi bozulmasın diye
  },
  container: {
    flex: 1,
    backgroundColor: colors.default50,
    // Android'de fiziksel tuşlar için ekstra bir koruma
    marginBottom: Platform.OS === 'android' ? 10 : 0,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    padding: 20,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.default200,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.foreground,
  },
  subtitle: {
    fontSize: 14,
    color: colors.default500,
    marginTop: 4,
  },
  filterContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.default200,
  },
  filterInput: {
    backgroundColor: colors.default50,
    borderWidth: 1,
    borderColor: colors.default200,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    flex: 1,
    marginRight: 10,
  },
  jobDescription: {
    fontSize: 14,
    color: colors.default600,
    lineHeight: 20,
    marginBottom: 15,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.default100,
    paddingTop: 12,
  },
  budget: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.success,
  },
  buttonContainer: {
    marginTop: 15,
    gap: 8, // Butonlar arası boşluk (Android iOS için bazen margin kullanmak gerekebilir, FlatList içinde sorun olmuyor genelde)
  },
  fullWidthButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)', // bg-red-50 equivalent
    borderColor: 'rgba(239, 68, 68, 0.2)',    // border-red-100 equivalent
    marginBottom: 8,
  },
  deleteButtonText: {
    color: colors.danger,
    fontWeight: 'bold',
    fontSize: 14,
  },
  deleteButtonIcon: {
    fontSize: 14,
  },
  detailButton: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)', // bg-indigo-50 equivalent
    borderColor: 'rgba(99, 102, 241, 0.2)',   // border-indigo-100 equivalent
  },
  detailButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  loadingText: {
    marginTop: 10,
    color: colors.default500,
    fontSize: 14,
  },
  errorText: {
    color: colors.danger,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    width: 150,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.default400,
    fontSize: 16,
  },
});