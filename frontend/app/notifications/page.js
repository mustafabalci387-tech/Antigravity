"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NotificationService from '@/src/features/notification/services/notificationService';
import AuthService from '@/src/features/auth/services/authService';
import { formatDate } from '@/src/base/utils/dateFormatter';

export default function NotificationsPage() {
    const [user, setUser] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!AuthService.isAuthenticated()) {
            router.push("/login");
            return;
        }
        setUser(AuthService.getCurrentUser());
        fetchNotifications();
    }, [router]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await NotificationService.getMyNotifications();
            setNotifications(res?.notifications || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await NotificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id || n._id === id ? { ...n, okundu_mu: true } : n));
        } catch (error) {
            console.error(error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await NotificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, okundu_mu: true })));
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteNotification = async (id) => {
        try {
            await NotificationService.deleteNotification(id);
            setNotifications(prev => prev.filter(n => (n.id || n._id) !== id));
        } catch (error) {
            console.error(error);
        }
    };

    const handleClearAll = async () => {
        if (!confirm('Tüm bildirimleri silmek istediğinize emin misiniz?')) return;
        try {
            await NotificationService.clearAllNotifications();
            setNotifications([]);
        } catch (error) {
            console.error(error);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-2xl">🚀</span>
                            <span className="text-xl font-extrabold gradient-text italic">CollabFlow</span>
                        </Link>
                        <div className="hidden sm:flex items-center gap-1">
                            <Link href="/" className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">🏠 Ana Sayfa</Link>
                            <Link href="/jobs" className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">💼 İş İlanları</Link>
                            <Link href="/notifications" className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-50 text-indigo-600">🔔 Bildirimler</Link>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl">
                                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                    {user?.ad?.[0]}{user?.soyad?.[0]}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto w-full px-4 py-8 flex-1">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Bildirimleriniz</h1>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleMarkAllAsRead}
                            className="text-indigo-600 text-sm font-semibold hover:underline"
                        >
                            Tümünü Okundu İşaretle
                        </button>
                        {notifications.length > 0 && (
                            <button 
                                onClick={handleClearAll}
                                className="text-red-500 text-sm font-semibold hover:underline"
                            >
                                Tümünü Sil
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-white shadow-sm rounded-xl border border-gray-100 divide-y divide-gray-50">
                    {loading ? (
                        <p className="p-6 text-center text-gray-500">Yükleniyor...</p>
                    ) : notifications.length > 0 ? (
                        notifications.map(notif => (
                            <div 
                                key={notif.id || notif._id} 
                                className={`p-4 flex justify-between items-center transition-colors ${notif.okundu_mu ? 'bg-white' : 'bg-indigo-50/50'}`}
                            >
                                <div className="flex-1">
                                    <p className={`text-sm ${notif.okundu_mu ? 'text-gray-600' : 'text-gray-900 font-semibold'}`}>
                                        {notif.mesaj}
                                    </p>
                                    <small className="text-xs text-gray-400 mt-1 block">
                                        {formatDate(notif.olusturulma_tarihi, true)}
                                    </small>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    {!notif.okundu_mu && (
                                        <button 
                                            onClick={() => handleMarkAsRead(notif.id || notif._id)}
                                            className="bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-50"
                                        >
                                            Okundu
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => handleDeleteNotification(notif.id || notif._id)}
                                        className="bg-white border border-red-200 text-red-500 px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-50 transition-colors"
                                        title="Bildirimi Sil"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="p-8 text-center text-gray-400">Henüz bildiriminiz yok.</p>
                    )}
                </div>
            </main>
        </div>
    );
}
