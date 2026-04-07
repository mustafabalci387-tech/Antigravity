/**
 * Merkezi Bildirim (Toast) Yönetimi
 * Web ve Mobil projelerde ortak kullanılabilecek şekilde tasarlanmıştır.
 */
import toast from 'react-hot-toast';

export const showToast = (message, type = 'success') => {
    // Web ortamı (react-hot-toast)
    if (type === 'success') {
        toast.success(message);
    } else if (type === 'error') {
        toast.error(message);
    } else if (type === 'loading') {
        toast.loading(message);
    } else {
        toast(message);
    }
};

// API hata mesajlarını daha okunaklı göstermek için yardımcı fonksiyon
export const showErrorToast = (error, defaultMessage = "Bir hata oluştu") => {
    const errorMsg = 
        error?.response?.data?.message || 
        error?.response?.data?.detail || 
        error?.message || 
        defaultMessage;
    
    showToast(errorMsg, 'error');
};

// Başarı mesajları için yardımcı fonksiyon
export const showSuccessToast = (message) => {
    showToast(message, 'success');
};
