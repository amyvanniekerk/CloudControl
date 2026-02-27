import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { HEALTH_MILESTONES } from '../data/healthMilestones';

export default function HealthTimelineCard({ quitDate, onPress }) {
  if (!quitDate) return null;

  const hoursElapsed = (Date.now() - new Date(quitDate).getTime()) / (1000 * 60 * 60);
  const achieved = HEALTH_MILESTONES.filter(m => hoursElapsed >= m.hours).length;
  const next = HEALTH_MILESTONES.find(m => hoursElapsed < m.hours);

  if (!next && achieved === HEALTH_MILESTONES.length) {
    return (
      <TouchableOpacity style={styles.card} onPress={onPress}>
        <Text style={styles.label}>Health Milestones</Text>
        <Text style={styles.allDone}>All {achieved} milestones achieved!</Text>
      </TouchableOpacity>
    );
  }

  const hoursLeft = next ? next.hours - hoursElapsed : 0;
  let timeLeft;
  if (hoursLeft < 1) timeLeft = 'Less than an hour';
  else if (hoursLeft < 24) timeLeft = `${Math.round(hoursLeft)}h`;
  else timeLeft = `${Math.round(hoursLeft / 24)}d`;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={styles.label}>Next Milestone</Text>
          <Text style={styles.title}>{next.title}</Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.timeLeft}>{timeLeft}</Text>
          <Text style={styles.timeLabel}>to go</Text>
        </View>
      </View>
      <Text style={styles.progress}>{achieved}/{HEALTH_MILESTONES.length} achieved</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flex: 1,
  },
  right: {
    alignItems: 'center',
    marginLeft: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  timeLeft: {
    fontSize: 22,
    fontWeight: '800',
    color: '#9C27B0',
  },
  timeLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
  },
  progress: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  allDone: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2E7D32',
  },
});
