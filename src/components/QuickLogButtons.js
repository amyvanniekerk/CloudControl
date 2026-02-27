import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function QuickLogButtons({ onLogCraving, onLogSession }) {
  return (
    <View style={styles.row}>
      <TouchableOpacity style={[styles.btn, styles.cravingBtn]} onPress={onLogCraving}>
        <Text style={styles.btnIcon}>~</Text>
        <Text style={styles.btnText}>Log Craving</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, styles.sessionBtn]} onPress={onLogSession}>
        <Text style={styles.btnIcon}>+</Text>
        <Text style={styles.btnText}>Log Vape</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  btn: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  cravingBtn: {
    backgroundColor: '#E8D5F5',
  },
  sessionBtn: {
    backgroundColor: '#D9B9E2',
  },
  btnIcon: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  btnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});
