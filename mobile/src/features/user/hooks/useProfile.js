import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { userService } from '../services/userService';
import { portfolioService } from '../services/portfolioService';
import authService from '../../auth/services/authService';

export default function useProfile({ route, navigation, onLogout }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userId, setUserId] = useState(route.params?.userId || null);
  const [user, setUser] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Profile States
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ ad: '', soyad: '', unvan: '', bio: '' });

  // Portfolio States
  const [isPortfolioModalVisible, setIsPortfolioModalVisible] = useState(false);
  const [isSavingPortfolio, setIsSavingPortfolio] = useState(false);
  const [portfolioForm, setPortfolioForm] = useState({ id: null, baslik: '', aciklama: '', gorsel: '' });

  useEffect(() => {
    loadData();
  }, [route.params?.userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      let loggedInUser = null;
      try {
        if (authService && typeof authService.getCurrentUser === 'function') {
          loggedInUser = await authService.getCurrentUser();
        } else if (authService && typeof authService.getUser === 'function') {
          loggedInUser = await authService.getUser();
        }
      } catch (authErr) {
        console.warn('Auth okuma atlandı:', authErr);
      }
      setCurrentUser(loggedInUser);

      const targetUserId = route.params?.userId || loggedInUser?.id || loggedInUser?._id;
      setUserId(targetUserId);

      if (!targetUserId) { setLoading(false); return; }

      const [userRes, portRes] = await Promise.all([
        userService.getUserById(targetUserId).catch(() => null),
        portfolioService.getUserPortfolio(targetUserId).catch(() => null)
      ]);

      if (userRes) setUser(userRes?.data?.user || userRes?.data || userRes);
      if (portRes) {
        const portData = portRes?.data?.portfolios || portRes?.data || portRes || [];
        setPortfolio(Array.isArray(portData) ? portData : []);
      }
    } catch (error) { console.error('Profil yükleme hatası:', error); }
    finally { setLoading(false); }
  };

  const handleLogout = () => {
    Alert.alert("Çıkış Yap", "Hesabınızdan çıkış yapmak istediğinize emin misiniz?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Çıkış Yap", style: "destructive", onPress: async () => {
          try {
            setLoading(true);
            if (authService && typeof authService.logout === 'function') await authService.logout();
            if (onLogout) onLogout(); else navigation.replace('Login');
          } catch (error) { setLoading(false); navigation.replace('Login'); }
        }
      }
    ]);
  };

  const openEditModal = () => {
    setEditForm({
      ad: user?.ad || user?.firstName || '',
      soyad: user?.soyad || user?.lastName || '',
      unvan: user?.unvan || user?.title || '',
      bio: user?.hakkinda || user?.bio || user?.biyografi || ''
    });
    setIsEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    try {
      setIsSavingProfile(true);
      const updateData = {
        ad: editForm.ad, soyad: editForm.soyad, unvan: editForm.unvan,
        hakkinda: editForm.bio, bio: editForm.bio, biyografi: editForm.bio
      };

      if (userService && typeof userService.updateProfile === 'function') {
        await userService.updateProfile(updateData);
      } else if (userService && typeof userService.updateUser === 'function') {
        await userService.updateUser(user.id || user._id, updateData);
      }
      setUser(prev => ({...prev, ...updateData}));

      // SecureStore'daki kullanıcı bilgisini de güncelle (diğer ekranlar için)
      try {
        const storedUser = await authService.getCurrentUser();
        if (storedUser) {
          const updatedUser = { ...storedUser, ...updateData };
          await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
        }
      } catch (e) {
        console.log('[useProfile] SecureStore güncelleme hatası:', e);
      }

      setIsEditModalVisible(false);
    } catch (error) {
      Alert.alert("Sunucu Hatası", "Profil güncellenemedi.");
    } finally { setIsSavingProfile(false); }
  };

  const handleChangeAvatar = async () => {
    if (String(userId) !== String(currentUser?.id || currentUser?._id)) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });

    if (!result.canceled) {
      setUser(prev => ({ ...prev, avatar: result.assets[0].uri, profil_fotografi: result.assets[0].uri }));
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [4, 3], quality: 0.8,
    });
    if (!result.canceled) setPortfolioForm({ ...portfolioForm, gorsel: result.assets[0].uri });
  };

  const openAddPortfolio = () => {
    setPortfolioForm({ id: null, baslik: '', aciklama: '', gorsel: '' });
    setIsPortfolioModalVisible(true);
  };

  const openEditPortfolio = (item) => {
    if (String(userId) !== String(currentUser?.id || currentUser?._id)) return;
    const incomingDesc = item.description || item.aciklama || item.icerik || item.content || item.detay || item.text || item.about || '';
    const incomingTitle = item.title || item.baslik || item.ad || item.name || '';

    setPortfolioForm({
      id: item.id || item._id,
      baslik: incomingTitle,
      aciklama: incomingDesc,
      gorsel: item.imageUrl || item.gorsel_url || item.gorsel || ''
    });
    setIsPortfolioModalVisible(true);
  };

  const handleSavePortfolio = async () => {
    try {
      setIsSavingPortfolio(true);
      const isEditing = !!portfolioForm.id;
      let finalImageUrl = portfolioForm.gorsel;

      if (portfolioForm.gorsel && portfolioForm.gorsel.startsWith('file://')) {
        const localUri = portfolioForm.gorsel;
        const filename = localUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        const photoData = new FormData();
        photoData.append('file', { uri: localUri, name: filename, type });
        
        try {
            const uploadRes = await portfolioService.uploadImage(photoData);
            finalImageUrl = uploadRes.medya_url || uploadRes.url || finalImageUrl;
        } catch (uploadErr) {
            console.error('Resim yükleme hatası:', uploadErr);
        }
      }

      const jsonData = {
          ad: portfolioForm.baslik,
          aciklama: portfolioForm.aciklama,
          medya_url: finalImageUrl
      };

      if (isEditing) {
        if (portfolioService && typeof portfolioService.updatePortfolio === 'function') await portfolioService.updatePortfolio(portfolioForm.id, jsonData);
      } else {
        if (portfolioService && typeof portfolioService.createPortfolio === 'function') await portfolioService.createPortfolio(jsonData);
      }

      const uiData = {
        baslik: portfolioForm.baslik, title: portfolioForm.baslik,
        aciklama: portfolioForm.aciklama, description: portfolioForm.aciklama,
        gorsel: portfolioForm.gorsel || 'https://via.placeholder.com/300', imageUrl: portfolioForm.gorsel || 'https://via.placeholder.com/300',
        medya_url: finalImageUrl
      };

      if (isEditing) {
        setPortfolio(prev => prev.map(p => (p.id === portfolioForm.id || p._id === portfolioForm.id) ? { ...p, ...uiData } : p));
      } else {
        const newProject = { id: Math.random().toString(), ...uiData };
        setPortfolio(prev => [newProject, ...prev]);
      }
      setIsPortfolioModalVisible(false);
    } catch (error) { Alert.alert("Sunucu Hatası", "Portfolyo kaydedilemedi!"); }
    finally { setIsSavingPortfolio(false); }
  };

  const handleDeletePortfolio = () => {
    Alert.alert("Sil", "Projeyi silmek istediğinize emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Sil", style: "destructive", onPress: async () => {
          try {
            setIsSavingPortfolio(true);
            if (portfolioService && typeof portfolioService.deletePortfolio === 'function') await portfolioService.deletePortfolio(portfolioForm.id);
            setPortfolio(prev => prev.filter(p => p.id !== portfolioForm.id && p._id !== portfolioForm.id));
            setIsPortfolioModalVisible(false);
          } catch (error) { Alert.alert("Hata", "Silinemedi."); }
          finally { setIsSavingPortfolio(false); }
        }
      }
    ]);
  };

  return {
    currentUser, userId, user, portfolio, loading,
    isEditModalVisible, setIsEditModalVisible, isSavingProfile, editForm, setEditForm,
    isPortfolioModalVisible, setIsPortfolioModalVisible, isSavingPortfolio, portfolioForm, setPortfolioForm,
    loadData, handleLogout, openEditModal, handleSaveProfile, handleChangeAvatar,
    pickImage, openAddPortfolio, openEditPortfolio, handleSavePortfolio, handleDeletePortfolio
  };
}
