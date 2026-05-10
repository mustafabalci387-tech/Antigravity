// features/task/screens/TasksScreen.js
// Görev ekranı — İlerleyen aşamalarda aktifleştirilecek

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppCard } from '../../../shared/components';
import { colors } from '../../../core/theme/colors';

export default function TasksScreen() {
  return (
    <View style={styles.container}>
      <AppCard title="✅ Görevler">
        <Text style={styles.text}>
          Görevleriniz burada listelenecek.
        </Text>
        <Text style={styles.hint}>
          Backend'deki task modülü tamamlandığında bu ekran aktifleşecek.
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
