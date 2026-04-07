import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { colors } from '../../../core/theme/colors';

export default function BidModal({
  visible,
  onClose,
  amount,
  setAmount,
  deliveryDays,
  setDeliveryDays,
  message,
  setMessage,
  onSubmit,
  isSubmitting
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Teklif Hazırla</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeModalBtn}>
              <Text style={styles.closeModalText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.inputLabel}>Teklif Tutarı (₺)</Text>
              <TextInput style={styles.modalInput} placeholder="Örn: 5000" keyboardType="numeric" value={amount} onChangeText={setAmount} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Teslim Süresi (Gün)</Text>
              <TextInput style={styles.modalInput} placeholder="Örn: 14" keyboardType="numeric" value={deliveryDays} onChangeText={setDeliveryDays} />
            </View>
          </View>

          <Text style={styles.inputLabel}>Mesajınız</Text>
          <TextInput
            style={[styles.modalInput, styles.modalTextArea]}
            placeholder="İlan sahibine neden sizi seçmesi gerektiğini açıklayın..."
            multiline
            numberOfLines={5}
            value={message}
            onChangeText={setMessage}
          />

          <TouchableOpacity style={styles.modalSubmitBtn} onPress={onSubmit} disabled={isSubmitting}>
            <Text style={styles.modalSubmitBtnText}>
              {isSubmitting ? 'Gönderiliyor...' : 'Teklifi Gönder'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, minHeight: '50%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: colors.foreground },
  closeModalBtn: { padding: 8, backgroundColor: colors.default100, borderRadius: 20 },
  closeModalText: { fontSize: 16, fontWeight: 'bold', color: colors.default600 },
  inputRow: { flexDirection: 'row', marginBottom: 14 },
  inputLabel: { fontSize: 13, fontWeight: '800', color: colors.default500, marginBottom: 8, marginLeft: 4, letterSpacing: 0.5 },
  modalInput: { backgroundColor: colors.default50, borderWidth: 1, borderColor: colors.default200, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: colors.foreground, marginBottom: 16 },
  modalTextArea: { height: 120, textAlignVertical: 'top' },
  modalSubmitBtn: { backgroundColor: colors.primary, borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 10, elevation: 4, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  modalSubmitBtnText: { color: 'white', fontWeight: '900', fontSize: 18, letterSpacing: 0.5 }
});
