import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../../core/theme/colors';

function BidCard({
  bid,
  isOwner,
  onStartChat,
  onAccept,
  onReject,
  onNavigateToProfile
}) {
  const firstLetter = (bid.freelancerName || bid.isim || bid.gonderen_ad || 'F').charAt(0).toUpperCase();

  const getAvatarColor = (char) => {
    const bgColors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6'];
    const charCode = char.charCodeAt(0) % bgColors.length;
    return bgColors[charCode];
  };

  const freelancerId = bid.freelancerId || bid.gonderen_id;
  const bidId = bid.id || bid._id;

  return (
    <View style={styles.bidCard}>
      <View style={styles.bidHeader}>
        <View style={styles.userInfo}>
          <TouchableOpacity onPress={() => onNavigateToProfile(freelancerId)}>
            <View style={[styles.miniAvatar, { backgroundColor: getAvatarColor(firstLetter) }]}>
              <Text style={styles.avatarText}>{firstLetter}</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.userName}>{bid.freelancerName || bid.isim || bid.gonderen_ad || 'Freelancer'}</Text>
        </View>
        <Text style={styles.bidAmount}>₺{bid.fiyat || bid.amount}</Text>
      </View>

      <Text style={styles.bidMessage}>{bid.aciklama || bid.message}</Text>
      <Text style={styles.bidTime}>⏱️ {bid.teslim_suresi || bid.deliveryDays} gün</Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.chatButtonSolid} onPress={() => onStartChat(bid)}>
          <Text style={styles.chatButtonSolidText}>💬 Mesaj</Text>
        </TouchableOpacity>

        {isOwner && (bid.durum === 'beklemede' || bid.status === 'pending' || !bid.durum) && (
          <View style={styles.ownerBidActions}>
            <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]} onPress={() => onAccept(bidId)}>
              <Text style={styles.acceptBtnText}>✓ Kabul Et</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => onReject(bidId)}>
              <Text style={styles.rejectBtnText}>✕ Reddet</Text>
            </TouchableOpacity>
          </View>
        )}
        {isOwner && (bid.durum === 'kabul_edildi' || bid.status === 'accepted' || bid.durum === 'onaylandi') && (
          <View style={styles.acceptedBadge}>
            <Text style={styles.acceptedBadgeText}>✅ ONAYLANDI</Text>
          </View>
        )}
        {isOwner && (bid.durum === 'reddedildi' || bid.status === 'rejected') && (
          <View style={[styles.acceptedBadge, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
            <Text style={[styles.acceptedBadgeText, { color: '#EF4444' }]}>❌ REDDEDİLDİ</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default React.memo(BidCard);

const styles = StyleSheet.create({
  bidCard: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 14, borderWidth: 1, borderColor: colors.default200, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  bidHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  miniAvatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  avatarText: { color: 'white', fontSize: 18, fontWeight: '800' },
  userName: { fontWeight: '800', color: colors.foreground, fontSize: 15 },
  bidAmount: { fontWeight: '900', color: '#16A34A', fontSize: 17 },
  bidMessage: { fontSize: 15, color: colors.default600, marginBottom: 12, lineHeight: 22 },
  bidTime: { fontSize: 13, color: colors.default500, fontWeight: '600' },
  actions: { flexDirection: 'row', marginTop: 16, alignItems: 'center', justifyContent: 'space-between' },
  ownerBidActions: { flexDirection: 'row', gap: 6 },
  chatButtonSolid: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, backgroundColor: colors.default100 },
  chatButtonSolidText: { fontSize: 13, fontWeight: '800', color: colors.default700 },
  actionBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, elevation: 2, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3 },
  acceptBtn: { backgroundColor: '#10B981', shadowColor: '#10B981' },
  acceptBtnText: { color: 'white', fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },
  rejectBtn: { backgroundColor: '#FEF2F2', elevation: 0 },
  rejectBtnText: { color: '#EF4444', fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  acceptedBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#BBF7D0' },
  acceptedBadgeText: { color: '#166534', fontWeight: '900', fontSize: 12 }
});
