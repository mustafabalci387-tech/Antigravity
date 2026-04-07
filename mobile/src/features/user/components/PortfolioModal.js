import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, SafeAreaView, Image, StyleSheet } from 'react-native';

export default function PortfolioModal({
  visible,
  onClose,
  portfolioForm,
  setPortfolioForm,
  onSave,
  isSaving,
  onPickImage,
  onDelete
}) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{portfolioForm.id ? "Projeyi Düzenle" : "Yeni Proje Ekle"}</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {portfolioForm.id && (
              <TouchableOpacity onPress={onDelete} style={[styles.modalCloseBtn, { backgroundColor: '#FEE2E2' }]}>
                <Text style={[styles.modalCloseBtnText, { color: '#EF4444' }]}>🗑️ Sil</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <Text style={styles.modalCloseBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView style={styles.modalBody}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Proje Görseli</Text>
            <TouchableOpacity onPress={onPickImage} style={styles.imagePickerBtn}>
              {portfolioForm.gorsel ? (
                <Image source={{ uri: portfolioForm.gorsel }} style={styles.imagePreview} resizeMode="cover" />
              ) : (
                <View style={styles.imagePickerPlaceholder}>
                  <Text style={{ fontSize: 24, marginBottom: 8 }}>📷</Text>
                  <Text style={styles.imagePickerText}>Galeriden Resim Seç</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Proje Başlığı</Text>
            <TextInput style={styles.inputBox} placeholder="Örn: E-Ticaret" value={portfolioForm.baslik} onChangeText={(t) => setPortfolioForm({ ...portfolioForm, baslik: t })} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Proje Açıklaması</Text>
            <TextInput style={[styles.inputBox, { height: 100, textAlignVertical: 'top' }]} multiline placeholder="Proje detaylarından bahsedin..." value={portfolioForm.aciklama} onChangeText={(t) => setPortfolioForm({ ...portfolioForm, aciklama: t })} />
          </View>
          <TouchableOpacity style={styles.saveButton} onPress={onSave} disabled={isSaving}>
            <Text style={styles.saveButtonText}>{isSaving ? "İşleniyor..." : "Yayınla 🚀"}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#111827' },
  modalCloseBtn: { padding: 8, backgroundColor: '#F3F4F6', borderRadius: 20 },
  modalCloseBtnText: { fontSize: 14, fontWeight: 'bold', color: '#4B5563' },
  modalBody: { padding: 20 },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8 },
  inputBox: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#D1D5DB', padding: 14, borderRadius: 12, color: '#111827', fontSize: 15 },
  saveButton: { backgroundColor: '#4F46E5', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, marginBottom: 40 },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  imagePickerBtn: { width: '100%', height: 180, backgroundColor: '#F3F4F6', borderRadius: 16, borderWidth: 2, borderColor: '#E5E7EB', borderStyle: 'dashed', overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  imagePickerPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  imagePickerText: { color: '#6B7280', fontWeight: '600' },
  imagePreview: { width: '100%', height: '100%' }
});
