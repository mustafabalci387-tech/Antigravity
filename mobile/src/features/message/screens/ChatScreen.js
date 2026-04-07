import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { colors } from '../../../core/theme/colors';
import messageService from '../services/messageService';
import { useSocket } from '../../../features/message/hooks/useSocket';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';

export default function ChatScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { conversationId, otherUser } = route.params;

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [currentUserId, setCurrentUserId] = useState(null);
    const { socket, isConnected } = useSocket();
    const flatListRef = React.useRef(null);

    useEffect(() => {
        // `undefined undefined` sorununu çözmek için ekstra kontrol
        const displayName = otherUser?.firstName && otherUser?.lastName
            ? `${otherUser.firstName} ${otherUser.lastName}`
            : 'Sohbet';

        const handleDeleteChat = () => {
            if (!conversationId || conversationId === 'undefined') return;
            Alert.alert(
                "Sohbeti Sil",
                "Bu mesajlaşma geçmişini tamamen silmek istediğinize emin misiniz?",
                [
                    { text: "Vazgeç", style: "cancel" },
                    { text: "Sil", style: "destructive", onPress: async () => {
                        try {
                            await messageService.deleteConversation(conversationId);
                            navigation.goBack();
                        } catch (e) { console.error("Silme hatası:", e); }
                    }}
                ]
            );
        };

        navigation.setOptions({ 
            title: displayName,
            headerRight: () => (
                <TouchableOpacity onPress={handleDeleteChat} style={{ marginRight: 15, padding: 4 }}>
                    <Ionicons name="trash-outline" size={24} color="#EF4444" />
                </TouchableOpacity>
            )
        });

        SecureStore.getItemAsync('user').then(u => u && setCurrentUserId(JSON.parse(u).id));

        if (!conversationId || conversationId === 'undefined') {
            console.log("Yeni sohbet, geçmiş mesaj yok.");
            setMessages([]);
            return;
        }

        messageService.getMessagesByConversation(conversationId).then(data => {
            // Backend artık en yeni mesajı en başta (Desc/sort_order=-1) döndüğü için doğrudan ekrana alabiliriz
            setMessages(Array.isArray(data) ? data : (data?.mesajlar || data?.messages || []));
        }).catch(err => console.error("Mesajları çekerken hata:", err));
    }, [conversationId]);

    useEffect(() => {
        if (!socket) return;
        const onReceive = (msg) => {
            const convId = msg.konusma_id || msg.conversationId;
            if (convId === conversationId) {
                setMessages(prev => [msg, ...prev]); // Inverted olduğu için başa ekle
            }
        };
        socket.on('receive_message', onReceive);
        return () => socket.off('receive_message', onReceive);
    }, [socket]);

    const handleSend = async () => {
        if (!newMessage.trim()) return;
        try {
            const tempMessage = newMessage;
            setNewMessage(''); // Input'u hemen temizle (UX)

            const responseData = await messageService.sendMessage(otherUser.userId, tempMessage);
            const msgObj = responseData?.message || responseData;

            // Local state güncellemesi (Zaten socket'ten gelecek ama çift gitmemesi için socket dinleyicisinde kontrol var)
            setMessages(prev => {
                // Eğer mesaj zaten socket'ten gelip eklenmişse tekrar ekleme
                if (prev.find(m => m.id === msgObj.id)) return prev;
                return [msgObj, ...prev];
            });

            // Inverted list olduğu için yeni mesaj 0. indexe eklenir. En alta inmek için 0'a scroll yapıyoruz.
            setTimeout(() => {
                flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
            }, 100);

        } catch (e) {
            console.error("Mesaj gönderim hatası:", e);
        }
    };

    const renderItem = useCallback(({ item }) => {
        const senderId = item?.gonderen_id || item?.senderId;
        const isMe = senderId === currentUserId;
        const content = item?.icerik || item?.content;
        const createdAt = item?.olusturulma_tarihi || item?.createdAt;

        return (
            <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
                <Text style={{ color: isMe ? 'white' : '#111827', fontSize: 15, lineHeight: 22 }}>{content}</Text>
                {createdAt && (
                    <Text style={[styles.time, isMe && styles.timeMe]}>
                        {new Date(createdAt.endsWith('Z') ? createdAt : `${createdAt}Z`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                )}
            </View>
        );
    }, [currentUserId]);

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <View style={styles.status}>
                <Text style={{ color: isConnected ? 'green' : 'red', fontSize: 10 }}>● {isConnected ? 'Çevrimiçi' : 'Bağlantı Kesildi'}</Text>
            </View>

            <FlatList
                ref={flatListRef}
                inverted // PERFORMANS: Listeyi ters çevirerek en alttan başlatır
                data={messages}
                keyExtractor={(item) => item.id || item._id || Math.random().toString()}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 16 }}
                initialNumToRender={15}
            />

            <View style={styles.inputArea}>
                <TextInput
                    style={styles.input}
                    placeholder="Mesaj..."
                    value={newMessage}
                    onChangeText={setNewMessage}
                    multiline
                />
                <TouchableOpacity onPress={handleSend} disabled={!newMessage.trim()} style={styles.send}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Gönder</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    status: { paddingVertical: 6, alignItems: 'center', backgroundColor: '#F3F4F6', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    bubble: { maxWidth: '80%', padding: 14, borderRadius: 20, marginBottom: 10, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
    bubbleMe: { alignSelf: 'flex-end', backgroundColor: '#4F46E5', borderBottomRightRadius: 4 },
    bubbleOther: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#F3F4F6' },
    time: { fontSize: 10, color: 'rgba(0,0,0,0.4)', marginTop: 4, alignSelf: 'flex-end', fontWeight: '600' },
    timeMe: { color: 'rgba(255,255,255,0.7)' },
    inputArea: { flexDirection: 'row', padding: 12, backgroundColor: 'white', borderTopWidth: 1, borderColor: '#E5E7EB', alignItems: 'flex-end', paddingBottom: Platform.OS === 'ios' ? 32 : 12 },
    input: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 24, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, maxHeight: 120, fontSize: 15, color: '#111827', borderWidth: 1, borderColor: '#E5E7EB' },
    send: { marginLeft: 10, backgroundColor: '#4F46E5', borderRadius: 24, paddingVertical: 12, paddingHorizontal: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 2 }
});