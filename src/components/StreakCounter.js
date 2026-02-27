import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function StreakCounter({ days }) {
  return (
    <View style={styles.container}>
      <Text style={styles.number}>{days}</Text>
      <Text style={styles.label}>day{days !== 1 ? 's' : ''} no vape in bed</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#D9B9E2',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  number: {
    fontSize: 48,
    fontWeight: '800',
    color: '#000000',
  },
  label: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '600',
    marginTop: 4,
  },
});
