import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function RewardBadge({ reward, status }) {
  if (!reward) return null;

  const isCompleted = status === 'completed';

  return (
    <View style={[styles.container, isCompleted && styles.completedContainer]}>
      <Text style={[styles.label, isCompleted && styles.completedLabel]}>
        {isCompleted ? '\u{1F389} Reward Unlocked' : '\u{1F381} Your Reward'}
      </Text>
      <Text style={[styles.reward, isCompleted && styles.completedReward]}>
        {reward}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  completedContainer: {
    backgroundColor: '#E8F5E9',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F9A825',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  completedLabel: {
    color: '#2E7D32',
  },
  reward: {
    fontSize: 14,
    fontWeight: '600',
    color: '#795548',
  },
  completedReward: {
    color: '#2E7D32',
  },
});
