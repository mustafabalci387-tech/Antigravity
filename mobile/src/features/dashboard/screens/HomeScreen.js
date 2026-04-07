// features/dashboard/screens/HomeScreen.js
// Ana sayfa ekranı — Web'deki HomePage.jsx'in mobil karşılığı
// CollabFlow'un karşılama ekranı ve ana modüllere yönlendirme

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { AppCard, AppButton, AppChip } from '../../../base/components';
import { colors } from '../../../core/theme/colors';

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Başlık alanı */}
      <View style={styles.header}>
        <Text style={styles.title}>CollabFlow'a Hoş Geldiniz!</Text>
        <Text style={styles.subtitle}>
          Freelance İş & Proje Yönetim Platformu
        </Text>
      </View>

      {/* Teknoloji etiketleri */}
      <View style={styles.chipRow}>
        <AppChip label="React Native" color="primary" />
        <AppChip label="Expo" color="secondary" />
        <AppChip label="Node.js" color="success" />
        <AppChip label="MongoDB" color="danger" />
      </View>

      {/* Modül kartları */}
      <AppCard title="📋 Proje Yönetimi">
        <Text style={styles.cardText}>
          Projelerinizi oluşturun, takım üyelerinizi atayın ve görevleri takip
          edin.
        </Text>
        <AppButton
          title="Projelere Git"
          color="primary"
          variant="flat"
          size="sm"
          onPress={() => navigation.navigate('Projects')}
        />
      </AppCard>

      <AppCard title="💼 İş İlanları" style={styles.cardSpacing}>
        <Text style={styles.cardText}>
          Freelance iş ilanlarını görüntüleyin ve teklif verin.
        </Text>
        <AppButton
          title="İlanlara Git"
          color="secondary"
          variant="flat"
          size="sm"
          onPress={() => navigation.navigate('Jobs')}
        />
      </AppCard>

      <AppCard title="💬 Mesajlaşma" style={styles.cardSpacing}>
        <Text style={styles.cardText}>
          Müşteriler ve freelancer'lar ile gerçek zamanlı iletişim kurun.
        </Text>
        <AppButton
          title="Mesajlara Git"
          color="success"
          variant="flat"
          size="sm"
          onPress={() => navigation.navigate('Messages')}
        />
      </AppCard>

      {/* Durum kartı */}
      <AppCard style={[styles.cardSpacing, { backgroundColor: colors.primaryLight }]}>
        <Text style={styles.statusText}>
          ✅ Mobil uygulama çalışıyor! React Native + Expo
        </Text>
      </AppCard>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.default50,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  subtitle: {
    fontSize: 16,
    color: colors.default500,
    marginTop: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  cardText: {
    fontSize: 14,
    color: colors.default500,
    marginBottom: 12,
    lineHeight: 20,
  },
  cardSpacing: {
    marginTop: 16,
  },
  statusText: {
    textAlign: 'center',
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});
