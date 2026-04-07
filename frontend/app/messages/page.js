"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, Avatar, Input, Button, ScrollShadow } from "@heroui/react";
import MessageService from '@/src/features/message/services/messageService';
import { useSocket } from "@/src/features/message/hooks/useSocket";
import AuthService from '@/src/features/auth/services/authService';
import UserService from "@/src/features/user/services/userService";
import { showToast, showErrorToast } from '@/src/base/utils/toast';
import { useRouter } from "next/navigation"; // Added useRouter for navigation

export default function MessagesPage() {
    const [conversations, setConversations] = useState([]);
    const [selectedConvId, setSelectedConvId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [user, setUser] = useState(null);
    const [allUsers, setAllUsers] = useState([]); // Test için tüm kullanıcılar
    const { socket, isConnected } = useSocket();
    const messagesEndRef = useRef(null);
    const currentConvIdRef = useRef(null);
    const router = useRouter(); // Initialize useRouter

    useEffect(() => {
        currentConvIdRef.current = selectedConvId;
    }, [selectedConvId]);

    useEffect(() => {
        if (!AuthService.isAuthenticated()) {
            router.push("/login");
        } else {
            setUser(AuthService.getCurrentUser());
        }
    }, [router]);

    useEffect(() => {
        const initData = async () => {
            // setUser(getCurrentUser()); // Old line
            // setUser(AuthService.getCurrentUser()); // This line is already handled by the new useEffect above
            try {
                const convs = await MessageService.getMyConversations();
                setConversations(convs || []);
                const usersResponse = await UserService.getAllUsers();
                setAllUsers(usersResponse || []);
            } catch (error) {
                console.error("Data fetch error:", error);
            }
        };
        initData();
    }, []); // Removed user from dependency array as it's set by another useEffect

    useEffect(() => {
        if (!selectedConvId) return;
        const fetchMessages = async () => {
            try {
                const data = await MessageService.getMessagesByConversation(selectedConvId);
                setMessages(data || []);
                setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
            } catch (error) {
                console.error("Messages fetch error:", error);
            }
        };
        fetchMessages();
    }, [selectedConvId]);

    useEffect(() => {
        if (!socket) return;
        const onMessage = (msg) => {
            // Backend WebSocket BaseEntity (id, icerik, gonderen_id, konusma_id, olusturulma_tarihi) uyumu
            const normalizedMsg = {
                id: msg.id || msg._id || Date.now().toString(),
                icerik: msg.icerik || msg.message || "",
                gonderen_id: msg.gonderen_id || msg.senderId || "",
                konusma_id: msg.konusma_id || msg.conversationId || "",
                olusturulma_tarihi: msg.olusturulma_tarihi || new Date().toISOString()
            };

            if (normalizedMsg.konusma_id === currentConvIdRef.current) {
                setMessages(prev => [...prev, normalizedMsg]);
                setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
            }
            // Konuşma listesini güncelle
            setConversations(prev => prev.map(c =>
                c.id === normalizedMsg.konusma_id ? { ...c, son_mesaj: normalizedMsg.icerik } : c
            ));
        };
        socket.on("receive_message", onMessage);
        return () => socket.off("receive_message", onMessage);
    }, [socket]);

    const onSend = async () => {
        if (!newMessage.trim() || !selectedConvId) return;
        const conv = (conversations || []).find(c => c.id === selectedConvId);
        const receiverId = conv?.katilimcilar?.find(p => p !== user?.id);

        try {
            const res = await MessageService.sendMessage(receiverId, newMessage);
            setMessages(prev => [...prev, res.data || res]);
            setNewMessage("");
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

            // Eğer yeni bir konuşma ise listeyi de güncelle
            const updatedConvs = await MessageService.getMyConversations();
            setConversations(updatedConvs || []);
        } catch (err) { /* Hata yönetimi */ }
    };

    const startNewConversation = async (receiverId) => {
        if (!receiverId) return;
        try {
            // Sadece test için sahte bir mesaj atarak konuşmayı başlatıyoruz
            const res = await MessageService.sendMessage(receiverId, "Merhaba!");
            const updatedConvs = await MessageService.getMyConversations();
            setConversations(updatedConvs || []);
            setSelectedConvId(res?.konusma_id || res?.data?.konusma_id);
        } catch (err) {
            console.error(err);
        }
    };

    const onDeleteConversation = async (e, convId) => {
        e.stopPropagation(); // Tıklamanın konuşmayı seçmesini engelle
        if (!confirm("Bu konuşmayı ve tüm mesajları silmek istediğinize emin misiniz?")) return;

        try {
            await MessageService.deleteConversation(convId);
            if (selectedConvId === convId) {
                setSelectedConvId(null);
                setMessages([]);
            }
            setConversations(prev => prev.filter(c => c.id !== convId));
        } catch (err) {
            console.error("Silme hatası:", err);
            showErrorToast(err, "Konuşma silinirken bir hata oluştu.");
        }
    };

    // Helper functions for UI
    const getOtherUserId = (conv) => conv?.katilimcilar?.find(p => p !== user?.id);
    const getOtherUser = (otherId) => (allUsers || []).find(u => u.id === otherId);

    const getOtherUserDisplayName = (conv) => {
        const otherId = getOtherUserId(conv);
        const otherUser = getOtherUser(otherId);
        return otherUser ? `${otherUser.ad} ${otherUser.soyad || ""}` : (otherId ? "Kullanıcı " + String(otherId).slice(-4) : "Bilinmeyen Kullanıcı");
    };

    const getOtherUserAvatarName = (conv) => {
        const otherId = getOtherUserId(conv);
        const otherUser = getOtherUser(otherId);
        return otherUser?.ad?.charAt(0) || "U";
    };

    return (
        <div className="flex h-[80vh] w-full max-w-6xl mx-auto mt-6 bg-white rounded-xl shadow-lg border border-zinc-200 overflow-hidden">
            {/* SOL: Liste */}
            <div className="w-1/3 border-r border-zinc-200 flex flex-col bg-white">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold">Mesajlar</h2>
                    <span className={`text-xs ${isConnected ? "text-green-500" : "text-red-500"}`}>
                        {isConnected ? "● Bağlı" : "○ Bağlantı Kesildi"}
                    </span>
                </div>
                <ScrollShadow className="flex-1">
                    {(conversations || []).map((c) => (
                        <div key={c.id} onClick={() => setSelectedConvId(c.id)} className={`p-4 cursor-pointer hover:bg-zinc-50 border-b border-zinc-100 last:border-0 relative group ${selectedConvId === c.id ? "bg-primary-50" : ""}`}>
                            <div className="flex items-center gap-3">
                                <Avatar name="User" size="sm" color="primary" />
                                <div className="flex-1 overflow-hidden pr-6">
                                    <p className="text-sm font-bold truncate text-gray-800">
                                        {getOtherUserDisplayName(c)}
                                    </p>
                                    <p className="text-xs text-zinc-500 truncate">{c?.son_mesaj || "Yeni konuşma"}</p>
                                </div>

                                {/* Silme Butonu - Görünür ve Belirgin */}
                                <button
                                    onClick={(e) => onDeleteConversation(e, c.id)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all p-2 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-lg shadow-sm"
                                    title="Konuşmayı Sil"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </ScrollShadow>
            </div>

            {/* SAĞ: Sohbet */}
            <div className="w-2/3 flex flex-col bg-zinc-50 h-full">
                {selectedConvId ? (
                    <>
                        {/* Sohbet Başlığı */}
                        <div className="p-4 border-b bg-white flex items-center gap-3">
                            <Avatar size="sm" color="primary" name={getOtherUserAvatarName((conversations || []).find(c => c.id === selectedConvId))} />
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">
                                    {getOtherUserDisplayName((conversations || []).find(c => c.id === selectedConvId))}
                                </h3>
                                <p className="text-[10px] text-green-500 font-medium">● Çevrimiçi</p>
                            </div>
                        </div>

                        {/* Mesaj Akışı */}
                        <ScrollShadow className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
                            {messages?.map((m) => {
                                const isMe = m.gonderen_id === user?.id;
                                return (
                                    <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                        <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm shadow-sm transition-all hover:shadow-md ${isMe
                                            ? "bg-blue-600 text-white rounded-tr-none"
                                            : "bg-white border border-zinc-200 text-zinc-800 rounded-tl-none"
                                            }`}>
                                            <p className="leading-relaxed">{m.icerik}</p>
                                            <p className={`text-[9px] mt-1 text-right opacity-70 ${isMe ? "text-blue-100" : "text-zinc-500"}`}>
                                                {m.olusturulma_tarihi ? new Date(m.olusturulma_tarihi.endsWith('Z') ? m.olusturulma_tarihi : `${m.olusturulma_tarihi}Z`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </ScrollShadow>

                        {/* Mesaj Yazma Alanı */}
                        <div className="p-4 bg-white border-t flex items-center gap-3">
                            <Input
                                className="flex-1"
                                variant="bordered"
                                placeholder="Mesajınızı buraya yazın..."
                                value={newMessage}
                                onValueChange={setNewMessage}
                                onKeyDown={(e) => { if (e.key === "Enter") onSend(); }}
                            />
                            <Button
                                isIconOnly
                                color="primary"
                                radius="full"
                                variant="shadow"
                                onClick={onSend}
                                className="min-w-unit-12"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 p-12 text-center">
                        <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-300"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                        </div>
                        <h3 className="text-lg font-semibold text-zinc-700">Sohbet Seçin</h3>
                        <p className="max-w-xs text-sm mt-2">Mesajlaşmaya başlamak için sol taraftaki listeden bir arkadaşınızı seçin veya aşağıdan yeni bir sohbet başlatın.</p>

                        <div className="mt-8 w-full max-w-xs">
                            <select
                                className="w-full p-3 bg-white border border-zinc-200 rounded-xl shadow-sm text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                                onChange={(e) => startNewConversation(e.target.value)}
                                value=""
                            >
                                <option value="" disabled>Yeni Bir Kullanıcıya Mesaj At...</option>
                                {(allUsers || []).filter(u => u.id !== user?.id).map(u => (
                                    <option key={u.id} value={u.id}>{u.ad} {u.soyad} ({u.rol})</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}