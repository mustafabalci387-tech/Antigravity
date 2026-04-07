// features/auth/services/authService.js
// Auth işlemleri için API servisi
// Backend'deki /api/auth endpoint'leri ile iletişim kurar

import api from '../../../config/api';
import * as SecureStore from 'expo-secure-store';

const authService = {
  /**
   * Giriş yap
   * @param {string} email
   * @param {string} password
   * @returns {Promise} - { user, token }
   */
  login: async (email, password) => {
    // FastAPI (backend/app/features/auth/dto.py) "LoginRequest" modeline göre 
    // JSON gövdesinden 'email' ve 'sifre' alanlarını beklemektedir.
    const response = await api.post('/auth/login', { 
      email: email, 
      sifre: password 
    });

    const { token, user } = response.data.data;

    // Token ve kullanıcı bilgisini güvenli depoya kaydet
    await SecureStore.setItemAsync('token', token);
    await SecureStore.setItemAsync('user', JSON.stringify(user));

    return { token, user };
  },

  /**
   * Kayıt ol
   * @param {object} userData - { name, email, password }
   * @returns {Promise} - { user, token }
   */
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    const { token, user } = response.data.data;

    await SecureStore.setItemAsync('token', token);
    await SecureStore.setItemAsync('user', JSON.stringify(user));

    return { token, user };
  },

  /**
   * Çıkış yap
   */
  logout: async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('user');
  },

  /**
   * Mevcut kullanıcı bilgisini al
   * @returns {Promise<object|null>}
   */
  getCurrentUser: async () => {
    try {
      const userStr = await SecureStore.getItemAsync('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  /**
   * Token var mı kontrol et
   * @returns {Promise<boolean>}
   */
  isAuthenticated: async () => {
    const token = await SecureStore.getItemAsync('token');
    return !!token;
  },
};

export default authService;
