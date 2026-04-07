import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, StyleSheet, RefreshControl,
  KeyboardAvoidingView, Platform, Image
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { colors } from '../../../core/theme/colors';
import { formatDate } from '../../../base/utils/dateFormatter';

// Refactored Hooks & Components
import useJobDetail from '../hooks/useJobDetail';
import BidCard from '../components/BidCard';
import BidModal from '../components/BidModal';

export default function JobDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id, jobId: paramJobId } = route.params || {};
  const jobId = id || paramJobId;

  const {
    user, job, jobOwner, bids,
    loading, refreshing,
    hasBidded, myBidStatus,
    amount, setAmount,
    deliveryDays, setDeliveryDays,
    message, setMessage,
    submitting,
    isBidModalOpen, setIsBidModalOpen,
    onRefresh, handleCreateBid, handleAction,
    handleExtendJob, handleDeleteJob
  } = useJobDetail(jobId, navigation);

  const startChat = (otherUser) => {
    navigation.navigate('ChatScreen', {
      otherUser: {
        userId: otherUser.userId || otherUser.freelancerId || otherUser.gonderen_id,
        firstName: otherUser.firstName || otherUser.isim || otherUser.gonderen_ad?.split(' ')[0] || 'Kullanıcı',
        lastName: otherUser.lastName || otherUser.soyisim || ''
      },
      conversationId: null
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const isOwner = user?.id === job?.clientId || user?.id === job?.is_veren_id;
  const isFreelancer = user?.role === 'freelancer' || user?.rol === 'freelancer';
  
  const isExpired = job?.bitis_tarihi && new Date() > new Date(job.bitis_tarihi);
  const jobStatus = job?.durum || job?.status || 'acik';

  const statusLabels = {
    acik: 'Açık', devam_ediyor: 'Proje Başladı',
    tamamlandi: 'Tamamlandı', iptal: 'İptal',
    beklemede: 'Beklemede', onaylandi: 'Onaylandı',
    reddedildi: 'Reddedildi',
  };
  const statusLabel = statusLabels[jobStatus] || jobStatus.toUpperCase();

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* İlan Detay */}
        <View style={styles.card}>
          <Text style={styles.title}>{job?.ad || job?.title || "İlan Başlığı Bulunamadı"}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{statusLabel.toUpperCase()}</Text>
            </View>
          </View>
          
          <Text style={styles.description}>{job?.aciklama || job?.description || "Açıklama belirtilmemiş."}</Text>

          {/* Web Stili Grid */}
          <View style={styles.gridContainer}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>BÜTÇE</Text>
              <Text style={styles.gridValueGreen}>₺{job?.butce || job?.budget || 0}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>KATEGORİ</Text>
              <View style={styles.catBadge}>
                <Text style={styles.catText}>{job?.kategori || job?.category || "Genel"}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>OLUŞTURULMA</Text>
              <Text style={styles.gridValue}>{formatDate(job?.olusturulma_tarihi || job?.createdAt)}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>BİTİŞ TARİHİ</Text>
              <View style={styles.deadlineBadge}>
                <Text style={styles.deadlineText}>{job?.bitis_tarihi ? formatDate(job?.bitis_tarihi) : "Süresiz"}</Text>
              </View>
            </View>
          </View>

          {/* İlan Sahibi Kartı */}
          {jobOwner && (
            <TouchableOpacity style={styles.ownerCard} onPress={() => navigation.navigate('ProfileScreen', { userId: jobOwner.id || jobOwner._id })}>
              <Image source={{ uri: jobOwner.avatar || jobOwner.profil_fotografi || 'https://via.placeholder.com/100' }} style={styles.ownerAvatar} />
              <View style={styles.ownerInfo}>
                <Text style={styles.ownerSub}>İlan Sahibi</Text>
                <Text style={styles.ownerName}>{jobOwner.ad || jobOwner.firstName} {jobOwner.soyad || jobOwner.lastName}</Text>
              </View>
              <Text style={styles.ownerArrow}>→</Text>
            </TouchableOpacity>
          )}

          {/* Süresi Doldu Uyarısı */}
          {jobStatus === "acik" && isExpired && (
            <View style={styles.expiredBanner}>
              <Text style={styles.expiredIcon}>⏰</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.expiredTitle}>Bu ilanın başvuru süresi dolmuştur</Text>
                <Text style={styles.expiredSubtitle}>Bitiş Tarihi: {formatDate(job?.bitis_tarihi)}</Text>
              </View>
            </View>
          )}

          {jobStatus !== "acik" && (
            <View style={[styles.expiredBanner, { backgroundColor: '#FEF9C3', borderColor: '#FEF08A' }]}>
              <Text style={styles.expiredIcon}>⚠️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.expiredTitle}>Bu ilan artık teklif almıyor</Text>
                <Text style={styles.expiredSubtitle}>İlan durumu: {statusLabel}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Teklifler Listesi */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gelen Teklifler <Text style={{ color: colors.primary }}>({bids.length})</Text></Text>
          {bids.map((bid) => (
            <BidCard
              key={bid.id || bid._id}
              bid={bid}
              isOwner={isOwner}
              onStartChat={startChat}
              onAccept={handleAction}
              onReject={(id) => handleAction(id, 'reject')}
              onNavigateToProfile={(userId) => navigation.navigate('ProfileScreen', { userId })}
            />
          ))}
          {bids.length === 0 && <Text style={styles.emptyText}>Henüz teklif gelmemiş.</Text>}
        </View>

        {isOwner && (
          <View style={styles.ownerActionsCard}>
            <TouchableOpacity style={styles.extendJobBtn} onPress={handleExtendJob}>
              <Text style={styles.extendJobText}>📅 Süreyi Uzat (+7 Gün)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.editJobBtn} onPress={() => {}}>
              <Text style={styles.editJobText}>✏️ Düzenle</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteJobBtn} onPress={handleDeleteJob}>
              <Text style={styles.deleteJobText}>🗑️ Sil</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sabit Teklif Ver Butonu */}
      {isFreelancer && !isOwner && (jobStatus === 'acik' || jobStatus === 'open') && !isExpired && (
        <View style={styles.stickyFooter}>
          <TouchableOpacity
            style={[styles.stickyButton, hasBidded && styles.stickyButtonDisabled]}
            onPress={() => setIsBidModalOpen(true)}
            disabled={hasBidded}
          >
            <Text style={styles.stickyButtonText}>
              {hasBidded 
                ? (myBidStatus === 'beklemede' || myBidStatus === 'pending' ? 'TEKLİFİNİZ BEKLEMEDE' : 
                   myBidStatus === 'kabul_edildi' || myBidStatus === 'accepted' ? 'TEKLİF KABUL EDİLDİ 🎉' : 'TEKLİF VERİLDİ') 
                : 'HEMEN TEKLİF VER'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Teklif Modalı */}
      <BidModal
        visible={isBidModalOpen}
        onClose={() => setIsBidModalOpen(false)}
        amount={amount}
        setAmount={setAmount}
        deliveryDays={deliveryDays}
        setDeliveryDays={setDeliveryDays}
        message={message}
        setMessage={setMessage}
        onSubmit={handleCreateBid}
        isSubmitting={submitting}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 24, marginBottom: 16, elevation: 4, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, borderWidth: 1, borderColor: colors.default100 },
  title: { fontSize: 26, fontWeight: '900', color: colors.foreground, marginBottom: 16, lineHeight: 32, letterSpacing: -0.5 },
  divider: { height: 1, backgroundColor: colors.default100, marginVertical: 16 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statusBadge: { backgroundColor: colors.primary + '15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statusText: { color: colors.primary, fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  description: { fontSize: 16, color: colors.default700, lineHeight: 26, marginBottom: 16 },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, borderTopColor: colors.default100, paddingTop: 16 },
  gridItem: { width: '50%', marginBottom: 12 },
  gridLabel: { fontSize: 11, color: colors.default400, fontWeight: '800', marginBottom: 4, letterSpacing: 0.5 },
  gridValue: { fontSize: 14, color: colors.default700, fontWeight: '600' },
  gridValueGreen: { fontSize: 18, color: '#166534', fontWeight: '900' },
  catBadge: { backgroundColor: colors.primary + '15', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  catText: { color: colors.primary, fontSize: 12, fontWeight: '800' },
  deadlineBadge: { backgroundColor: '#FEF2F2', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  deadlineText: { color: '#EF4444', fontSize: 12, fontWeight: '800' },

  expiredBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF9C3', borderColor: '#FEF08A', borderWidth: 1, padding: 12, borderRadius: 16, marginTop: 16 },
  expiredIcon: { fontSize: 24, marginRight: 10 },
  expiredTitle: { fontSize: 13, fontWeight: '800', color: '#A16207' },
  expiredSubtitle: { fontSize: 11, color: '#CA8A04', marginTop: 2 },
  
  ownerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 12, borderRadius: 16, marginTop: 16, borderWidth: 1, borderColor: '#F3F4F6' },
  ownerAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB', marginRight: 12 },
  ownerInfo: { flex: 1 },
  ownerSub: { fontSize: 12, color: colors.default500, fontWeight: '700', marginBottom: 2 },
  ownerName: { fontSize: 16, fontWeight: '900', color: colors.foreground },
  ownerArrow: { fontSize: 18, color: colors.default400 },

  section: { marginTop: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: colors.foreground, marginBottom: 16, letterSpacing: -0.3 },
  emptyText: { textAlign: 'center', color: colors.default400, marginTop: 20, fontWeight: '600' },
  
  ownerActionsCard: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, backgroundColor: 'white', borderRadius: 16, marginTop: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, borderWidth: 1, borderColor: colors.default100 },
  extendJobBtn: { flex: 2, backgroundColor: '#F0FDF4', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginRight: 6 },
  extendJobText: { color: '#166534', fontWeight: '800', fontSize: 13 },
  editJobBtn: { flex: 1.2, backgroundColor: '#EEF2FF', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginRight: 6 },
  editJobText: { color: colors.primary, fontWeight: '800', fontSize: 13 },
  deleteJobBtn: { flex: 1, backgroundColor: '#FEF2F2', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  deleteJobText: { color: '#EF4444', fontWeight: '800', fontSize: 13 },

  stickyFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', padding: 16, paddingBottom: Platform.OS === 'ios' ? 32 : 16, borderTopWidth: 1, borderTopColor: colors.default200, elevation: 12, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 8 },
  stickyButton: { backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 16, alignItems: 'center', elevation: 4, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  stickyButtonDisabled: { backgroundColor: colors.default300, elevation: 0 },
  stickyButtonText: { color: 'white', fontSize: 17, fontWeight: '900', letterSpacing: 1 }
});