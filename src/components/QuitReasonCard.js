import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function QuitReasonCard({ reasons }) {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * Math.max(reasons.length, 1)));

  if (!reasons || reasons.length === 0) return null;

  const reason = reasons[index % reasons.length];

  const cycle = () => {
    setIndex((prev) => (prev + 1) % reasons.length);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={cycle} activeOpacity={0.7}>
      <Text style={styles.label}>Reminder</Text>
      <Text style={styles.reason}>{reason}</Text>
      {reasons.length > 1 && (
        <Text style={styles.tapHint}>Tap for another</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F0E4F7',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9C27B0',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  reason: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6A1B9A',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  tapHint: {
    fontSize: 11,
    color: '#BA68C8',
    marginTop: 6,
    textAlign: 'right',
  },
});
