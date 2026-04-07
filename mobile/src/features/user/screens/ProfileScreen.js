import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';

// Refactored Hooks & Components
import useProfile from '../hooks/useProfile';
import EditProfileModal from '../components/EditProfileModal';
import PortfolioModal from '../components/PortfolioModal';
import PortfolioSection from '../components/PortfolioSection';

const ProfileScreen = ({ route, navigation, onLogout }) => {
  const {
    currentUser, userId, user, portfolio, loading,
    isEditModalVisible, setIsEditModalVisible, isSavingProfile, editForm, setEditForm,
    isPortfolioModalVisible, setIsPortfolioModalVisible, isSavingPortfolio, portfolioForm, setPortfolioForm,
    handleLogout, openEditModal, handleSaveProfile, handleChangeAvatar,
    pickImage, openAddPortfolio, openEditPortfolio, handleSavePortfolio, handleDeletePortfolio
  } = useProfile({ route, navigation, onLogout });

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4F46E5" /></View>;
  if (!user) return <View style={styles.center}><Text style={styles.emptyText}>Kullanıcı bulunamadı.</Text></View>;

  const isMyProfile = String(userId) === String(currentUser?.id || currentUser?._id);

  const getValidAvatarUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/200';
    if (url.startsWith('http') || url.startsWith('file:') || url.startsWith('data:')) return url;
    const baseUrl = 'http://10.31.231.121:5000';
    return baseUrl + (url.startsWith('/') ? url : '/' + url);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={styles.coverBanner} />
        <View style={styles.profileHeader}>

          {/* AVATAR BÖLÜMÜ - Tıklanabilir ve Kamera İkonlu */}
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={handleChangeAvatar} disabled={!isMyProfile} activeOpacity={0.8} style={{ position: 'relative' }}>
              <Image source={{ uri: getValidAvatarUrl(user.avatar || user.profil_fotografi) }} style={styles.avatar} />
              {isMyProfile && (
                <View style={styles.cameraBadge}>
                  <Text style={{ fontSize: 14 }}>📷</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.name}>{user.ad || user.firstName} {user.soyad || user.lastName}</Text>
          <Text style={styles.title}>{user?.rol === 'client' || user?.role === 'client' ? 'İş Veren' : 'Freelancer'}</Text>
          {isMyProfile && (
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.editButton} onPress={openEditModal}><Text style={styles.editButtonText}>Profili Düzenle</Text></TouchableOpacity>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}><Text style={styles.logoutButtonText}>Çıkış Yap</Text></TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hakkımda</Text>
          <Text style={styles.bio}>{user.hakkinda || user.bio || user.biyografi || 'Henüz bir biyografi eklenmemiş.'}</Text>
        </View>

        {/* PORTFOLYO BÖLÜMÜ */}
        <PortfolioSection
          portfolio={portfolio}
          isMyProfile={isMyProfile}
          onAddPortfolio={openAddPortfolio}
          onEditPortfolio={openEditPortfolio}
        />
      </ScrollView>

      {/* PROFİL MODAL */}
      <EditProfileModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        editForm={editForm}
        setEditForm={setEditForm}
        onSave={handleSaveProfile}
        isSaving={isSavingProfile}
      />

      {/* PORTFOLYO MODAL */}
      <PortfolioModal
        visible={isPortfolioModalVisible}
        onClose={() => setIsPortfolioModalVisible(false)}
        portfolioForm={portfolioForm}
        setPortfolioForm={setPortfolioForm}
        onSave={handleSavePortfolio}
        isSaving={isSavingPortfolio}
        onPickImage={pickImage}
        onDelete={handleDeletePortfolio}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  coverBanner: { height: 160, backgroundColor: '#4F46E5', width: '100%', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  profileHeader: { alignItems: 'center', paddingHorizontal: 20, paddingBottom: 25, marginTop: -65 },
  avatarContainer: { width: 130, height: 130, borderRadius: 65, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, marginBottom: 15 },
  avatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#E5E7EB' },
  cameraBadge: { position: 'absolute', bottom: 5, right: 5, backgroundColor: '#fff', borderRadius: 15, width: 30, height: 30, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, borderWidth: 1, borderColor: '#E5E7EB' },
  name: { fontSize: 26, fontWeight: '900', color: '#111827', letterSpacing: -0.5 },
  title: { fontSize: 16, color: '#4F46E5', fontWeight: '600', marginTop: 4 },
  actionButtons: { flexDirection: 'row', marginTop: 15, gap: 10 },
  editButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24, backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#C7D2FE' },
  editButtonText: { color: '#4F46E5', fontWeight: '800', fontSize: 13 },
  logoutButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
  logoutButtonText: { color: '#EF4444', fontWeight: '800', fontSize: 13 },
  section: { marginTop: 25, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#111827', letterSpacing: -0.5, marginBottom: 10 },
  bio: { fontSize: 15, color: '#4B5563', lineHeight: 24 },
  emptyText: { flex: 1, textAlign: 'center', color: '#6B7280', fontStyle: 'italic', marginTop: 10 }
});

export default ProfileScreen;