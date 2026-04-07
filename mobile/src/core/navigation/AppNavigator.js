// core/navigation/AppNavigator.js
// Ana navigasyon yapısı — Auth durumuna göre koşullu ekran geçişi
// Token varsa → TabNavigator (Ana uygulama)
// Token yoksa → Auth Stack (Login / Register)
//
// 9. Hafta — Admin Dashboard: Admin rolündeki kullanıcılara özel tab eklendi.

import React, { useState, useEffect, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { colors } from '../theme/colors';

// Auth Ekranları
import LoginScreen from '../../features/auth/screens/LoginScreen';
import RegisterScreen from '../../features/auth/screens/RegisterScreen';

// Ana Ekranlar
import HomeScreen from '../../features/dashboard/screens/HomeScreen';
import JobsScreen from '../../features/job/screens/JobsScreen';
import ProjectsScreen from '../../features/project/screens/ProjectsScreen';
import MessagesScreen from '../../features/message/screens/MessagesScreen';
import ChatScreen from '../../features/message/screens/ChatScreen';
import ProfileScreen from '../../features/user/screens/ProfileScreen';
import JobDetailScreen from '../../features/job/screens/JobDetailScreen';
import EditProfileScreen from '../../features/user/screens/EditProfileScreen';
import NotificationsScreen from '../../features/notification/screens/NotificationsScreen';
import PaymentsScreen from '../../features/payment/screens/PaymentsScreen';

// 9. Hafta — Admin Dashboard Ekranı
import AdminDashboardScreen from '../../features/admin/screens/AdminDashboardScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

/**
 * AuthNavigator — Giriş yapmamış kullanıcılar için
 * Login ve Register ekranları arasında geçiş sağlar
 * 
 * @param {Function} onLoginSuccess — Başarılı giriş/kayıt sonrası çağrılır
 */
function AuthNavigator({ onLoginSuccess }) {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <AuthStack.Screen name="Login">
        {(props) => (
          <LoginScreen {...props} onLoginSuccess={onLoginSuccess} />
        )}
      </AuthStack.Screen>
      <AuthStack.Screen name="Register">
        {(props) => (
          <RegisterScreen {...props} onLoginSuccess={onLoginSuccess} />
        )}
      </AuthStack.Screen>
    </AuthStack.Navigator>
  );
}

/**
 * TabNavigator — Alt menü navigasyonu
 * Giriş yapmış kullanıcılar için ana sekmeler
 * 
 * 9. Hafta: Admin rolündeki kullanıcılara "Admin Panel" sekmesi gösterilir.
 * Rol bilgisi SecureStore'dan okunur. Admin değilse bu tab hiç render edilmez.
 * 
 * @param {Function} onLogout — Çıkış yapıldığında çağrılır
 */
function TabNavigator({ onLogout, userRole }) {
  // Rol bilgisi artık AppNavigator'dan prop olarak geliyor
  const isAdmin = userRole === 'admin';

  return (
    <Tab.Navigator
      initialRouteName={isAdmin ? 'AdminDashboard' : 'Home'}
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 1,
          shadowOpacity: 0.1,
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: colors.foreground,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.default400,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.default200,
          paddingBottom: 4,
          paddingTop: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Ana Sayfa',
          headerTitle: '🚀 CollabFlow',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22 }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Jobs"
        component={JobsScreen}
        options={{
          title: 'İlanlar',
          headerTitle: '💼 İş İlanları',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22 }}>💼</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Projects"
        component={ProjectsScreen}
        options={{
          title: 'Projeler',
          headerTitle: '📋 Projeler',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22 }}>📋</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          title: 'Mesajlar',
          headerTitle: '💬 Mesajlar',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22 }}>💬</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Bildirimler',
          headerTitle: '🔔 Bildirimler',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22 }}>🔔</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Payments"
        component={PaymentsScreen}
        options={{
          title: 'Ödemeler',
          headerTitle: '💳 Ödemeler',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22 }}>💳</Text>
          ),
        }}
      />

      {/* ── 9. Hafta: Admin Panel Sekmesi (Sadece admin rolü) ────────── */}
      {isAdmin && (
        <Tab.Screen
          name="AdminDashboard"
          component={AdminDashboardScreen}
          options={{
            title: 'Admin',
            headerTitle: '🛡️ Admin Panel',
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 22 }}>📊</Text>
            ),
            tabBarActiveTintColor: colors.danger,
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '700',
              color: colors.danger,
            },
          }}
        />
      )}

      <Tab.Screen
        name="Profile"
        options={{
          title: 'Profil',
          headerTitle: '👤 Profil',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22 }}>👤</Text>
          ),
        }}
      >
        {(props) => <ProfileScreen {...props} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

/**
 * SplashScreen — Uygulama başlangıcında token kontrolü sırasında gösterilir
 */
function SplashScreen() {
  return (
    <View style={styles.splash}>
      <Text style={styles.splashLogo}>🚀</Text>
      <Text style={styles.splashTitle}>CollabFlow</Text>
      <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
    </View>
  );
}

/**
 * AppNavigator — Ana navigasyon container'ı
 *
 * Akış:
 *   1. Uygulama açılır → SplashScreen gösterilir
 *   2. SecureStore'dan token kontrol edilir
 *   3. Token varsa → TabNavigator (Main)
 *   4. Token yoksa → AuthNavigator (Login/Register)
 *   5. Login başarılı → isLoggedIn = true → TabNavigator'a geçiş
 *   6. Logout → SecureStore temizlenir → AuthNavigator'a geçiş
 */
export default function AppNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  // Uygulama başlangıcında token kontrolü
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    console.log('[AppNavigator] Checking auth status (SecureStore)...');
    try {
      // FORCED LOGIN ON APP START: Always clear the token when the app initializes
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user');
      console.log('[AppNavigator] Cleared previous session for forced fresh login.');

      const token = await SecureStore.getItemAsync('token');
      console.log(`[AppNavigator] Token check result: ${token ? 'Found' : 'Not found'}`);
      setIsLoggedIn(!!token);
    } catch (error) {
      console.log('[AppNavigator] Token kontrol hatası:', error);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Login/Register başarılı olduğunda çağrılır
  const handleLoginSuccess = useCallback(async () => {
    // Kullanıcı rolünü oku (Admin tab yönlendirmesi için)
    try {
      const userStr = await SecureStore.getItemAsync('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        setUserRole(userData.rol || 'freelancer');
      }
    } catch (e) {
      console.log('[AppNavigator] Rol okuma hatası:', e);
    }
    setIsLoggedIn(true);
  }, []);

  // Logout yapıldığında çağrılır
  const handleLogout = useCallback(async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('user');
    setUserRole(null);
    setIsLoggedIn(false);
  }, []);

  // Token kontrolü yapılırken splash göster
  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {isLoggedIn ? (
        // Giriş yapmış → Ana uygulama ve ek ekranlar
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main">
            {(props) => <TabNavigator {...props} onLogout={handleLogout} userRole={userRole} />}
          </Stack.Screen>
          <Stack.Screen
            name="ChatScreen"
            component={ChatScreen}
            options={{
              headerShown: true,
              title: "Sohbet",
              headerBackTitle: "Geri",
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.foreground
            }}
          />
          <Stack.Screen
            name="JobDetailScreen"
            component={JobDetailScreen}
            options={{
              headerShown: true,
              title: "İlan Detayı",
              headerBackTitle: "Geri",
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.foreground
            }}
          />
          <Stack.Screen
            name="ProfileScreen"
            component={ProfileScreen}
            options={{
              headerShown: true,
              title: "Profil",
              headerBackTitle: "Geri",
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.foreground
            }}
          />
          <Stack.Screen
            name="EditProfile"
            component={EditProfileScreen}
            options={{
              headerShown: false,
              presentation: 'modal'
            }}
          />
        </Stack.Navigator>
      ) : (
        // Giriş yapmamış → Auth ekranları
        <AuthNavigator onLoginSuccess={handleLoginSuccess} />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  splashLogo: {
    fontSize: 64,
  },
  splashTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 10,
  },
});

