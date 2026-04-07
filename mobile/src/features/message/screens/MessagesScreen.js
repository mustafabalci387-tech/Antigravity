// features/message/screens/MessagesScreen.js
// Mesajlaşma ekranı
// Backend'deki /api/messages/conversations endpoint'inden veri çekerek konuşmaları listeler

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, Modal, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../../../core/theme/colors';
import messageService from '../services/messageService';
import { userService } from '../../user/services/userService';
import { useSocket } from '../../../features/message/hooks/useSocket';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';

export default function MessagesScreen({ navigation }) {
  const [conversations, setConversations] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const { socket, isConnected } = useSocket();
  const conversationsRef = useRef([]);

  // Ref güncelliğini koru (socket callback'leri için)
  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  const loadAllUsers = async () => {
    try {
      const res = await userService.getAll();
      // BaseService zaten response.data?.data ayıklamasını yapıyor (backend: {"users": [...]})
      setAllUsers(res?.users || (Array.isArray(res) ? res : []));
    } catch (e) { console.error('Kullanıcılar yüklenemedi:', e); }
  };

  useEffect(() => {
    loadAllUsers();
  }, []);

  const handleStartChat = (otherUser) => {
    setShowUserModal(false);
    navigation.navigate('ChatScreen', {
      otherUser: {
        userId: otherUser.id || otherUser._id,
        firstName: otherUser.ad || otherUser.firstName || 'Bilinmeyen',
        lastName: otherUser.soyad || otherUser.lastName || 'Kullanıcı'
      },
      conversationId: null
    });
  };

  // Kullanıcı bilgisini çek
  useEffect(() => {
    const fetchUser = async () => {
      const userStr = await SecureStore.getItemAsync('user');
      if (userStr) {
        setCurrentUserId(JSON.parse(userStr).id);
      }
    };
    fetchUser();
  }, []);

  // Socket dinlemesi (Anlık liste güncelleme)
  useEffect(() => {
    if (!socket) return;

    const onReceive = (msg) => {
      setConversations(prev => {
        const convId = msg.konusma_id || msg.conversationId;
        const index = prev.findIndex(c => c.id === convId);
        if (index !== -1) {
          // Var olan konuşmayı güncelle ve başa taşı
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            lastMessage: msg.icerik || msg.content,
            lastMessageAt: msg.olusturulma_tarihi || msg.createdAt
          };
          return [updated[index], ...updated.filter((_, i) => i !== index)];
        } else {
          // Yeni bir konuşma ise (Henüz listede yoksa) listeyi yenilemek en güvenlisi
          loadConversations();
          return prev;
        }
      });
    };

    socket.on('receive_message', onReceive);
    return () => socket.off('receive_message', onReceive);
  }, [socket]);

  // Konuşmaları API'den çek
  const loadConversations = async () => {
    try {
      const data = await messageService.getMyConversations();
      // data, messageService içinde array olarak döndürülüyor olabilir
      setConversations(Array.isArray(data) ? data : (data?.konusmalar || data?.conversations || []));
    } catch (error) {
      console.error('Konuşmalar yüklenirken hata:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  const handleDeleteConversation = (convId) => {
    Alert.alert(
      "Konuşmayı Sil",
      "Bu konuşmayı ve tüm mesaj geçmişini silmek istediğinize emin misiniz?",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              await messageService.deleteConversation(convId);
              setConversations(prev => prev.filter(c => c.id !== convId));
            } catch (error) {
              Alert.alert("Hata", "Konuşma silinirken bir hata oluştu.");
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => {
    // Karşı kullanıcının bilgilerini bul
    const otherId = item?.katilimcilar?.find((p) => p !== currentUserId) || item?.participants?.find((p) => p !== currentUserId);
    const otherUser = allUsers?.find((u) => u.id === otherId || u._id === otherId) || {};

    return (
      <View style={styles.convItemWrapper}>
        <TouchableOpacity
          style={styles.convItem}
          onPress={() => navigation.navigate('ChatScreen', {
            conversationId: item.id || item._id,
            otherUser: {
              userId: otherUser.id || otherUser._id,
              firstName: otherUser.ad || otherUser.firstName || 'Bilinmeyen',
              lastName: otherUser.soyad || otherUser.lastName || 'Kullanıcı'
            }
          })}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(otherUser.ad || otherUser.firstName || '?').charAt(0)}
            </Text>
          </View>
          <View style={styles.convInfo}>
            <View style={styles.convHeader}>
              <Text style={styles.convName}>{otherUser.ad || otherUser.firstName} {otherUser.soyad || otherUser.lastName}</Text>
              {item.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{item.unreadCount}</Text>
                </View>
              )}
            </View>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.son_mesaj || item.lastMessage || 'Henüz mesaj yok'}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteConversation(item.id || item._id)}
          activeOpacity={0.7}
        >
          <View style={styles.deleteIconBox}>
             <Ionicons name="trash-outline" size={22} color="#EF4444" />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.socketStatus}>
          <Text style={{ color: isConnected ? 'green' : 'red', fontSize: 10 }}>● {isConnected ? 'Çevrimiçi' : 'Bağlantı Kesildi'}</Text>
        </View>

        <TouchableOpacity
          style={styles.newChatBtn}
          onPress={() => setShowUserModal(true)}
          activeOpacity={0.8}
        >
          <View style={styles.newChatIconBox}>
             <Text style={styles.newChatIcon}>+</Text>
          </View>
          <Text style={styles.newChatText}>Yeni Sohbet Başlat</Text>
        </TouchableOpacity>

        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id || item._id || Math.random().toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>Henüz bir konuşmanız yok.</Text>
            </View>
          }
        />

        {/* Kullanıcı Seçim Modalı */}
        <Modal visible={showUserModal} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Kimi Arıyorsun?</Text>
              <TouchableOpacity onPress={() => setShowUserModal(false)}>
                <Text style={styles.closeBtn}>Kapat</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={(allUsers || []).filter(u => u?.id !== currentUserId)}
              keyExtractor={u => u?.id || Math.random().toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.userItem} onPress={() => handleStartChat(item)}>
                  <View style={[styles.avatar, { width: 40, height: 40 }]}>
                    <Text style={[styles.avatarText, { fontSize: 16 }]}>{(item?.ad || item?.firstName || '?').charAt(0)}</Text>
                  </View>
                  <View>
                    <Text style={styles.userName}>{item?.ad || item?.firstName || 'Bilinmeyen'} {item?.soyad || item?.lastName || 'Kullanıcı'}</Text>
                    <Text style={styles.userRole}>{item?.rol || item?.role || 'Üye'}</Text>
                  </View>
                </TouchableOpacity>
              )}
              contentContainerStyle={{ padding: 16 }}
            />
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    marginBottom: Platform.OS === 'android' ? 10 : 0,
  },
  socketStatus: {
    paddingVertical: 6,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  newChatBtn: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    borderStyle: 'dashed',
  },
  newChatIconBox: {
    backgroundColor: '#4F46E5',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  newChatIcon: { color: 'white', fontWeight: 'bold', fontSize: 18, marginTop: -2 },
  newChatText: {
    color: '#4F46E5',
    fontWeight: '800',
    fontSize: 15
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  // Modal Styles
  modalContainer: { flex: 1, backgroundColor: 'white' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.default100
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  closeBtn: { color: colors.primary, fontWeight: 'bold' },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.default50
  },
  userName: { fontWeight: 'bold', color: colors.foreground },
  userRole: { fontSize: 12, color: colors.default400 },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50
  },
  emptyText: {
    color: colors.default400,
    fontSize: 16,
  },
  convItemWrapper: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4
  },
  convItem: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  deleteButton: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    borderLeftWidth: 1,
    borderLeftColor: '#F3F4F6'
  },
  deleteIconBox: {
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    elevation: 3,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4
  },
  avatarText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '900',
  },
  convInfo: {
    flex: 1,
  },
  convHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  convName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  lastMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2
  },
  unreadBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    minWidth: 24,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  unreadText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '900',
  }
});
