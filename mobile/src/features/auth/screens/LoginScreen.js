// features/auth/screens/LoginScreen.js

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { AppButton } from '../../../base/components';
import { colors } from '../../../core/theme/colors';
import authService from '../services/authService';

export default function LoginScreen({ navigation, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * handleLogin — Kullanıcı giriş işlemi
   * Backend API ile konuşur, başarılıysa oturum açar.
   */
  const handleLogin = async () => {
    Keyboard.dismiss(); // İstek atarken klavyeyi kapat
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      Alert.alert('Uyarı', 'Lütfen e-posta ve şifre alanlarını doldurun.');
      return;
    }

    setLoading(true);

    try {
      await authService.login(cleanEmail, cleanPassword);
      // Başarılı giriş — Navigator'ı tetikle
      if (onLoginSuccess) onLoginSuccess();
    } catch (error) {
      // Backend'den (FastAPI) gelen ApiError mesajını yakala
      const errorMessage =
        error.response?.data?.message ||
        'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.';
      Alert.alert('Hata', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <Text style={styles.logo}>🚀 CollabFlow</Text>
        <Text style={styles.title}>Giriş Yap</Text>

        <TextInput
          style={styles.input}
          placeholder="E-posta"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor={colors.default400}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Şifre"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          placeholderTextColor={colors.default400}
          editable={!loading}
        />

        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={styles.loader}
          />
        ) : (
          <AppButton
            title="Giriş Yap"
            color="primary"
            variant="solid"
            size="lg"
            onPress={handleLogin}
            disabled={loading} // Butona çift tıklamayı engeller
          />
        )}

        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          disabled={loading} // Yüklenirken kayıt sayfasına geçişi engelle
        >
          <Text style={styles.link}>
            Hesabınız yok mu? <Text style={styles.linkBold}>Kayıt Ol</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.foreground,
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.default200,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: colors.foreground,
    backgroundColor: colors.default50,
    marginBottom: 16,
  },
  loader: {
    marginVertical: 16,
  },
  link: {
    textAlign: 'center',
    color: colors.default400,
    marginTop: 20,
    fontSize: 14,
  },
  linkBold: {
    color: colors.primary,
    fontWeight: '600',
  },
});