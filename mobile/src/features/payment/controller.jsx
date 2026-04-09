import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import PaymentManager from './manager';

const PaymentController = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    kart_sahibi: '',
    kart_numarasi: '',
    son_kullanma: '',
    cvv: '',
    tutar: '100.00'
  });

  const manager = new PaymentManager();

  const handlePayment = async () => {
    if (form.kart_numarasi.length !== 16) {
      Alert.alert("Hata", "Lütfen 16 haneli kart numaranızı girin.");
      return;
    }

    setLoading(true);
    try {
      const response = await manager.process_payment({
        kart_sahibi: form.kart_sahibi,
        kart_numarasi: form.kart_numarasi,
        son_kullanma_tarihi: form.son_kullanma,
        cvv: form.cvv,
        tutar: parseFloat(form.tutar)
      });

      if (response.durum === "Başarılı") {
        Alert.alert("Başarılı", response.mesaj || "Ödeme onaylandı!");
      } else {
        Alert.alert("Reddedildi", response.mesaj || "Ödeme işlemi başarısız.");
      }
    } catch (error) {
      Alert.alert("Hata", error.message || "Ödeme sırasında bir sorun oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.cardContainer}>
          <View style={styles.creditCard}>
            <Text style={styles.cardBrand}>PREMIUM CARD</Text>
            <Text style={styles.cardNumber}>
              {form.kart_numarasi ? form.kart_numarasi.replace(/(\d{4})/g, '$1 ').trim() : "**** **** **** ****"}
            </Text>
            <View style={styles.cardRow}>
              <View>
                <Text style={styles.cardLabel}>KART SAHİBİ</Text>
                <Text style={styles.cardValue}>{form.kart_sahibi.toUpperCase() || "AD SOYAD"}</Text>
              </View>
              <View>
                <Text style={styles.cardLabel}>VALİD THRU</Text>
                <Text style={styles.cardValue}>{form.son_kullanma || "MM/YY"}</Text>
              </View>
            </View>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>Kart Sahibi</Text>
            <TextInput
              style={styles.input}
              placeholder="AD SOYAD"
              value={form.kart_sahibi}
              onChangeText={(text) => setForm({...form, kart_sahibi: text})}
            />

            <Text style={styles.inputLabel}>Kart Numarası</Text>
            <TextInput
              style={styles.input}
              placeholder="0000 0000 0000 0000"
              keyboardType="numeric"
              maxLength={16}
              value={form.kart_numarasi}
              onChangeText={(text) => setForm({...form, kart_numarasi: text})}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.inputLabel}>Son Kullanma</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  value={form.son_kullanma}
                  onChangeText={(text) => setForm({...form, son_kullanma: text})}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="***"
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                  value={form.cvv}
                  onChangeText={(text) => setForm({...form, cvv: text})}
                />
              </View>
            </View>

            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Ödenecek Tutar:</Text>
              <Text style={styles.amountValue}>{form.tutar} TRY</Text>
            </View>

            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handlePayment}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>ÖDEMEYİ TAMAMLA</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    padding: 20,
  },
  cardContainer: {
    marginTop: 20,
  },
  creditCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 24,
    height: 200,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    marginBottom: 30,
  },
  cardBrand: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  cardNumber: {
    color: '#FFF',
    fontSize: 22,
    letterSpacing: 4,
    textAlign: 'center',
    marginVertical: 20,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    color: '#AAA',
    fontSize: 10,
    marginBottom: 4,
  },
  cardValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  formContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
  },
  amountLabel: {
    fontSize: 14,
    color: '#0066CC',
    fontWeight: '500',
  },
  amountValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066CC',
  },
  button: {
    backgroundColor: '#0066CC',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#0066CC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#A0C4FF',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default PaymentController;
