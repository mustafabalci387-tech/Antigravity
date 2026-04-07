// App.js
// CollabFlow Mobil Uygulama — Ana Giriş Noktası
// Navigation container ve global provider'ları burada sarmalıyoruz

import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/core/navigation/AppNavigator';

export default function App() {
  return (
    <>
      {/* StatusBar — Durum çubuğu stili */}
      <StatusBar style="auto" />
      {/* AppNavigator — Tüm ekranlar ve navigasyon yapısı */}
      <AppNavigator />
    </>
  );
}
