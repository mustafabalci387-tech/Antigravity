import { decode } from 'base-64';

/**
 * Token'i Node.js Buffer bağımlılığı olmadan güvenli bir şekilde Base64 üzerinden çözer
 * @param {string} token - Çözülecek JWT string'i
 * @returns {object|null} Payload objesi veya hata durumunda null
 */
export const decodeJWT = (token) => {
  if (!token) return null;

  try {
    // JWT 3 parçadır, bize ortadaki "Payload" (1. index) lazımdır.
    const base64Url = token.split('.')[1];
    
    // Base64-URL formatını standart Base64 formatına çeviriyoruz
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Güvenli Türkçe / Özel karakter UTF-8 çözümlemesi
    const jsonPayload = decodeURIComponent(
      decode(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Token çözülürken hata oluştu:", error);
    return null;
  }
};
