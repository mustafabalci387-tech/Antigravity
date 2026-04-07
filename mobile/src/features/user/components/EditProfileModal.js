import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, SafeAreaView, StyleSheet } from 'react-native';

export default function EditProfileModal({
  visible,
  onClose,
  editForm,
  setEditForm,
  onSave,
  isSaving
}) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Profili Düzenle</Text>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
            <Text style={styles.modalCloseBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalBody}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ad</Text>
            <TextInput style={styles.inputBox} value={editForm.ad} onChangeText={(t) => setEditForm({ ...editForm, ad: t })} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Soyad</Text>
            <TextInput style={styles.inputBox} value={editForm.soyad} onChangeText={(t) => setEditForm({ ...editForm, soyad: t })} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ünvan</Text>
            <TextInput style={styles.inputBox} value={editForm.unvan} onChangeText={(t) => setEditForm({ ...editForm, unvan: t })} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Biyografi</Text>
            <TextInput style={[styles.inputBox, { height: 100, textAlignVertical: 'top' }]} multiline value={editForm.bio} onChangeText={(t) => setEditForm({ ...editForm, bio: t })} />
          </View>
          <TouchableOpacity style={styles.saveButton} onPress={onSave} disabled={isSaving}>
            <Text style={styles.saveButtonText}>{isSaving ? "Kaydediliyor..." : "Kaydet ✨"}</Text>
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
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});
