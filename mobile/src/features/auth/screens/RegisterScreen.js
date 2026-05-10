// features/auth/screens/RegisterScreen.js
// Kayıt ekranı — Backend'e bağlı, authService ile JWT register

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { AppButton } from '../../../shared/components';
import { colors } from '../../../core/theme/colors';
import authService from '../services/authService';

export default function RegisterScreen({ navigation, onLoginSuccess }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('freelancer'); // varsayılan: freelancer
  const [loading, setLoading] = useState(false);

  /**
   * handleRegister — Kayıt butonuna basıldığında çalışır.
   *
   * Akış:
   *   1. Boş alan kontrolü
   *   2. Şifre eşleşme kontrolü
   *   3. authService.register() → Backend'e POST /api/auth/register
   *   4. Başarılı → onLoginSuccess() ile Main ekranına geçiş
   *   5. Hata → Alert ile kullanıcıya bildirilir
   */
  const handleRegister = async () => {
    // Boş alan kontrolü
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Uyarı', 'Lütfen tüm alanları doldurun.');
      return;
    }

    // Şifre eşleşme kontrolü
    if (password !== confirmPassword) {
      Alert.alert('Uyarı', 'Şifreler eşleşmiyor.');
      return;
    }

    // Minimum şifre uzunluğu
    if (password.length < 6) {
      Alert.alert('Uyarı', 'Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);
    try {
      await authService.register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        role,
      });

      // Başarılı kayıt — Token zaten kaydedildi, doğrudan ana ekrana geç
      Alert.alert('Başarılı', 'Kayıt başarılı! Hoş geldiniz 🎉', [
        { text: 'Devam Et', onPress: () => { if (onLoginSuccess) onLoginSuccess(); } },
      ]);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.';
      Alert.alert('Hata', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.logo}>🚀 CollabFlow</Text>
        <Text style={styles.title}>Kayıt Ol</Text>

        <TextInput
          style={styles.input}
          placeholder="Ad"
          value={firstName}
          onChangeText={setFirstName}
          placeholderTextColor={colors.default400}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Soyad"
          value={lastName}
          onChangeText={setLastName}
          placeholderTextColor={colors.default400}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="E-posta"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={colors.default400}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Şifre (min. 6 karakter)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor={colors.default400}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Şifre Tekrar"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholderTextColor={colors.default400}
          editable={!loading}
        />

        {/* Rol Seçici — Freelancer / İş Veren */}
        <Text style={styles.roleLabel}>Hesap Türü</Text>
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[
              styles.roleButton,
              role === 'freelancer' && styles.roleButtonActive,
            ]}
            onPress={() => setRole('freelancer')}
            disabled={loading}
          >
            <Text style={[
              styles.roleText,
              role === 'freelancer' && styles.roleTextActive,
            ]}>
              💻 Freelancer
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleButton,
              role === 'client' && styles.roleButtonActive,
            ]}
            onPress={() => setRole('client')}
            disabled={loading}
          >
            <Text style={[
              styles.roleText,
              role === 'client' && styles.roleTextActive,
            ]}>
              🏢 İş Veren
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={{ marginVertical: 16 }}
          />
        ) : (
          <AppButton
            title="Kayıt Ol"
            color="primary"
            variant="solid"
            size="lg"
            onPress={handleRegister}
          />
        )}

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>
            Zaten hesabınız var mı? <Text style={styles.linkBold}>Giriş Yap</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
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
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.default200,
    backgroundColor: colors.default50,
    alignItems: 'center',
  },
  roleButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '15',
  },
  roleText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.default400,
  },
  roleTextActive: {
    color: colors.primary,
    fontWeight: '600',
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

