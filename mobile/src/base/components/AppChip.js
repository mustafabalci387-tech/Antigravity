// core/components/AppChip.js
// Tekrar kullanılabilir etiket (chip/badge) bileşeni
// Web'deki HeroUI Chip bileşeninin React Native karşılığı

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from "../../core/theme/colors";
/**
 * AppChip — Etiket bileşeni
 * @param {string} label - Etiket metni
 * @param {string} color - Renk teması: primary, secondary, success, warning, danger
 */
const AppChip = ({ label, color = 'primary' }) => {
  const colorMap = {
    primary: { bg: colors.primaryLight, text: colors.primary },
    secondary: { bg: colors.secondaryLight, text: colors.secondary },
    success: { bg: colors.successLight, text: colors.success },
    warning: { bg: colors.warningLight, text: colors.warning },
    danger: { bg: colors.dangerLight, text: colors.danger },
  };

  const chipColor = colorMap[color] || colorMap.primary;

  return (
    <View style={[styles.chip, { backgroundColor: chipColor.bg }]}>
      <Text style={[styles.label, { color: chipColor.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default AppChip;
