// features/job/screens/JobListScreen.js

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  RefreshControl
} from 'react-native';
import jobService from '../services/jobService';

export default function JobListScreen({ navigation }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  /**
   * İlanları backend'den (FastAPI) çeken ana fonksiyon
   */
  const fetchJobs = async () => {
    try {
      setError(null);
      const response = await jobService.getAll();

      // BaseService (mobile/src/services/BaseService.js) veriyi zaten ayıklıyor (response.data?.data)
      const jobsData = response?.jobs || (Array.isArray(response) ? response : []);
      setJobs(jobsData);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'İlanlar yüklenemedi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Sayfa ilk yüklendiğinde çalışır
  useEffect(() => {
    fetchJobs();
  }, []);

  // Kullanıcı listeyi aşağı çekip yenilediğinde çalışır (Pull-to-Refresh)
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchJobs();
  }, []);

  // ── Yüklenme ve Hata Durumları ──
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>İlanlar Yükleniyor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Hata: {error}</Text>
        <TouchableOpacity onPress={fetchJobs} style={styles.retryButton}>
          <Text style={styles.retryText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Liste Boşsa Gösterilecek Ekran ──
  const ListEmptyComponent = () => (
    <View style={styles.center}>
      <Text style={styles.emptyText}>Henüz hiç iş ilanı bulunmuyor.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.navigate('JobCreateScreen')}
        style={styles.createButton}
      >
        <Text style={styles.createButtonText}>+ Yeni İş İlanı Oluştur</Text>
      </TouchableOpacity>

      <FlatList
        data={jobs}
        // FastAPI hem id hem _id dönüyor, biz modern olan 'id'yi önceliklendiriyoruz
        keyExtractor={item => item.id || item._id?.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={jobs.length === 0 ? styles.flexGrow : styles.listContent}
        ListEmptyComponent={ListEmptyComponent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('JobDetailScreen', { id: item.id || item._id })}
          >
            <View>
              <Text style={styles.jobTitle}>{item.ad}</Text>
              <Text style={styles.jobInfo}>{item.kategori} — {item.durum}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// Inline stilleri StyleSheet içine alarak performansı artırdık
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  flexGrow: {
    flexGrow: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  createButton: {
    backgroundColor: '#e0e7ff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#4f46e5',
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2, // Android için gölge
  },
  jobTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#1f2937',
    marginBottom: 4,
  },
  jobInfo: {
    fontSize: 14,
    color: '#6b7280',
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    padding: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
  },
  retryText: {
    color: '#374151',
    fontWeight: '500',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
  },
});