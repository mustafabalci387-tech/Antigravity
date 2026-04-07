import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { colors } from '../../../core/theme/colors';

export default function EditProfileScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Profili Düzenle</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.message}>
          Bu özellik CollabFlow web sürümünde (Gelişmiş Profil Yönetimi) tam kapasiteyle çalışmaktadır. 
        </Text>
        <Text style={styles.message}>
          Mobil uygulamada profil düzenleme özellikleri yakında aktif olacaktır.
        </Text>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.actionButtonText}>Profilime Dön</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.default200,
    backgroundColor: '#fff'
  },
  backButton: { padding: 5 },
  backButtonText: { fontSize: 16, color: colors.primary, fontWeight: 'bold' },
  title: { fontSize: 18, fontWeight: 'bold', color: colors.foreground },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30
  },
  message: {
    fontSize: 16,
    color: colors.default600,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
