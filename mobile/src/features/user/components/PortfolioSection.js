import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

function PortfolioSection({
  portfolio,
  isMyProfile,
  onAddPortfolio,
  onEditPortfolio
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Portfolyo</Text>
        {isMyProfile && (
          <TouchableOpacity onPress={onAddPortfolio} style={styles.addPortfolioBtn}>
            <Text style={styles.addPortfolioBtnText}>+ Ekle</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.portfolioGrid}>
        {portfolio.length > 0 ? portfolio.map((item, index) => {
          const displayTitle = item.title || item.baslik || item.ad || item.name || 'Başlıksız Proje';
          const displayDesc = item.description || item.aciklama || item.icerik || item.detay || item.text;

          const getValidImageUrl = (url) => {
            if (!url) return 'https://via.placeholder.com/300';
            if (url.startsWith('http') || url.startsWith('file:') || url.startsWith('data:')) return url;
            const baseUrl = 'http://10.31.231.121:5000';
            return baseUrl + (url.startsWith('/') ? url : '/' + url);
          };
          const displayImage = getValidImageUrl(item.medya_url || item.imageUrl || item.gorsel_url || item.gorsel);

          return (
            <TouchableOpacity key={item.id || item._id || index} style={styles.portfolioCard} activeOpacity={isMyProfile ? 0.7 : 1} onPress={() => onEditPortfolio(item)}>
              <Image source={{ uri: displayImage }} style={styles.portfolioImage} resizeMode="cover" />
              <View style={styles.portfolioCardBody}>
                <Text style={styles.portfolioTitle} numberOfLines={1}>{displayTitle}</Text>
                {displayDesc ? <Text style={styles.portfolioDesc} numberOfLines={2}>{displayDesc}</Text> : null}
              </View>
              {isMyProfile && (<View style={styles.editBadge}><Text style={{ color: 'white', fontSize: 10 }}>✏️</Text></View>)}
            </TouchableOpacity>
          )
        }) : (
          <Text style={styles.emptyText}>Henüz portfolyo öğesi yüklenmemiş.</Text>
        )}
      </View>
    </View>
  );
}

export default React.memo(PortfolioSection);

const styles = StyleSheet.create({
  section: { marginTop: 25, paddingHorizontal: 20 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#111827', letterSpacing: -0.5 },
  addPortfolioBtn: { backgroundColor: '#EEF2FF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addPortfolioBtnText: { color: '#4F46E5', fontWeight: '800', fontSize: 13 },
  portfolioGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  portfolioCard: { width: '48%', backgroundColor: 'white', borderRadius: 16, marginBottom: 15, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, borderWidth: 1, borderColor: '#F3F4F6' },
  portfolioImage: { width: '100%', height: 120, backgroundColor: '#F3F4F6' },
  portfolioCardBody: { padding: 12 },
  portfolioTitle: { fontSize: 14, fontWeight: '800', color: '#111827', marginBottom: 4 },
  portfolioDesc: { fontSize: 12, color: '#6B7280', lineHeight: 16 },
  editBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  emptyText: { flex: 1, textAlign: 'center', color: '#6B7280', fontStyle: 'italic', marginTop: 10 }
});
