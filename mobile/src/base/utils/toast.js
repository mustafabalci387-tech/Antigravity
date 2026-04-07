import { Alert, ToastAndroid, Platform } from 'react-native';

export const showToast = (message, type = 'success') => {
    try {
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
            Alert.alert(type === 'error' ? 'Hata' : 'Bilgi', message);
        }
    } catch (e) {
        console.error("Native alert/toast yüklenemedi:", e);
    }
};

export const showErrorToast = (error, defaultMessage = "Bir hata oluştu") => {
    const errorMsg = 
        error?.response?.data?.message || 
        error?.response?.data?.detail || 
        error?.message || 
        defaultMessage;
    
    showToast(errorMsg, 'error');
};

export const showSuccessToast = (message) => {
    showToast(message, 'success');
};
