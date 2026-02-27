import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PhaseCard({ phase, isCurrent }) {
  return (
    <View style={[styles.card, isCurrent && styles.current]}>
      <Text style={styles.weeks}>{phase.weeks}</Text>
      <Text style={[styles.name, isCurrent && styles.currentText]}>
        Phase {phase.id}: {phase.name}
      </Text>
      <Text style={styles.goal}>{phase.goal}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  current: {
    backgroundColor: '#F0E4F7',
    borderWidth: 2,
    borderColor: '#B388C9',
  },
  weeks: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  currentText: {
    color: '#6A1B9A',
  },
  goal: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
});
