/**
 * page.js — Ana sayfa (Dashboard).
 *
 * Auth kontrolü: Giriş yapmamışsa /login'e yönlendirir.
 * Navbar + karşılama ekranı + hızlı erişim kartları.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import JobService from '@/src/features/job/services/jobService';
import AuthService from '@/src/features/auth/services/authService';
import BaseService from '@/src/base/services/BaseService';
import NotificationService from '@/src/features/notification/services/notificationService';

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const initUser = async () => {
      if (!AuthService.isAuthenticated()) {
        router.push("/login");
        return;
      }

      // 1. Önce sessionStorage'dan oku (Anlık gösterim — flicker önleme)
      const cachedUser = AuthService.getCurrentUser();
      if (cachedUser) setUser(cachedUser);

      // 2. Backend'den güncel kullanıcı verisini çek (Token üzerinden)
      try {
        const freshUser = await BaseService.get("/auth/me");
        if (freshUser) {
          setUser(freshUser);
          // sessionStorage'ı da güncelle (diğer sayfalar için)
          sessionStorage.setItem("user", JSON.stringify(freshUser));
        }
      } catch (err) {
        console.error("[HomePage] Güncel kullanıcı verisi alınamadı:", err);
      }
    };

    initUser();
  }, [router]);

  useEffect(() => {
    if (user) {
      NotificationService.getMyNotifications()
        .then(res => {
          const count = res?.notifications?.filter(n => !n.okundu_mu)?.length || 0;
          setUnreadCount(count);
        })
        .catch(err => console.error(err));
    }
  }, [user]);

  const handleLogout = () => {
    AuthService.logout();
    router.push("/login");
  };

  // Auth kontrol edilene kadar boş ekran
  if (!user) return null;

  const isClient = user.rol === "client";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <div className="navbar-gradient-line" />
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🚀</span>
              <span className="text-xl font-extrabold gradient-text italic">CollabFlow</span>
            </Link>

            <div className="hidden sm:flex items-center gap-1">
              <Link href="/" className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-50 text-indigo-600">
                🏠 Ana Sayfa
              </Link>
              <Link href="/jobs" className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
                💼 İş İlanları
              </Link>
              <Link href="/payments" className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
                💳 Ödemeler
              </Link>
              {user?.rol === "admin" && (
                <Link href="/admin" className="px-4 py-2 rounded-xl text-sm font-semibold text-amber-600 hover:bg-amber-50 border border-amber-200 transition-colors">
                  ⚙️ Admin Paneli
                </Link>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Link href="/notifications" className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors mr-2">
                <span className="text-xl block">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
              <Link href={`/profile/${user.id || user._id}`} className="hidden sm:flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                  {user.ad?.[0]}{user.soyad?.[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800 leading-tight">{user.ad} {user.soyad}</p>
                  <p className="text-[10px] font-semibold text-indigo-500 uppercase">
                    {isClient ? "İş Veren" : "Freelancer"}
                  </p>
                </div>
              </Link>
              <button onClick={handleLogout}
                className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-100 border border-red-100 transition-all">
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Ana İçerik */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Karşılama */}
         <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 sm:p-12 text-white mb-10 shadow-xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">
            Merhaba, {user.ad}! 👋
          </h1>
          <p className="text-indigo-100 text-lg">
            {isClient
              ? "Projelerinize en uygun freelancer'ları bulun ve işlerinizi yönetin."
              : "Yeteneklerinize uygun projeleri keşfedin ve teklif verin."}
          </p>
        </div>

        {/* Hızlı Erişim Kartları */}
        <h2 className="text-2xl font-extrabold text-gray-800 mb-6">Hızlı Erişim</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          <Link href="/jobs" className="hover-card bg-white p-8 rounded-2xl shadow-md border border-gray-100 group">
            <span className="text-4xl block mb-4 icon-pulse">💼</span>
            <h3 className="text-xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
              {isClient ? "İlanlarım" : "İş İlanları"}
            </h3>
            <p className="text-gray-500 text-sm mt-2">
              {isClient ? "İlanlarınızı yönetin ve yeni ilan oluşturun." : "Mevcut iş ilanlarını keşfedin."}
            </p>
          </Link>

          <div className="hover-card bg-white p-8 rounded-2xl shadow-md border border-gray-100 opacity-60">
            <span className="text-4xl block mb-4">📋</span>
            <h3 className="text-xl font-bold text-gray-800">Projeler</h3>
            <p className="text-gray-500 text-sm mt-2">Proje takibi — Yakında</p>
          </div>

          <Link href="/messages" className="hover-card bg-white p-8 rounded-2xl shadow-md border border-gray-100 group">
            <span className="text-4xl block mb-4 icon-pulse">💬</span>
            <h3 className="text-xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">Mesajlar</h3>
            <p className="text-gray-500 text-sm mt-2">Mesajlaşma</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
