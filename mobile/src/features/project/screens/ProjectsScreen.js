// features/project/screens/ProjectsScreen.js
// Proje listesi ekranı
// Backend'deki /api/projects endpoint'inden veri çekerek projeleri listeler

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppCard } from '../../../base/components';
import { colors } from '../../../core/theme/colors';

export default function ProjectsScreen() {
  return (
    <View style={styles.container}>
      <AppCard title="📋 Projeler">
        <Text style={styles.text}>
          Projeleriniz burada listelenecek.
        </Text>
        <Text style={styles.hint}>
          Backend'deki project modülü tamamlandığında bu ekran aktifleşecek.
        </Text>
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.default50,
    padding: 20,
  },
  text: {
    fontSize: 16,
    color: colors.foreground,
    marginBottom: 8,
  },
  hint: {
    fontSize: 13,
    color: colors.default400,
    fontStyle: 'italic',
  },
});
