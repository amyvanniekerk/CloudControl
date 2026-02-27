import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getSettings } from '../storage/store';
import { HEALTH_MILESTONES } from '../data/healthMilestones';

function formatTimeRemaining(hours) {
  if (hours < 1) return 'Less than an hour';
  if (hours < 24) return `${Math.round(hours)} hour${Math.round(hours) !== 1 ? 's' : ''}`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''}`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks} week${weeks !== 1 ? 's' : ''}`;
  const months = Math.round(days / 30);
  return `${months} month${months !== 1 ? 's' : ''}`;
}

export default function HealthTimelineScreen({ navigation }) {
  const [quitDate, setQuitDate] = useState(null);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const s = await getSettings();
        setQuitDate(s.quitDate);
      })();
    }, [])
  );

  const hoursElapsed = quitDate
    ? (Date.now() - new Date(quitDate).getTime()) / (1000 * 60 * 60)
    : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Health Timeline</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtn}>Done</Text>
        </TouchableOpacity>
      </View>

      {!quitDate ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Set your quit date in Settings to see your health timeline.</Text>
        </View>
      ) : (
        <View style={styles.timeline}>
          {HEALTH_MILESTONES.map((milestone, i) => {
            const achieved = hoursElapsed >= milestone.hours;
            const hoursLeft = milestone.hours - hoursElapsed;
            return (
              <View key={i} style={styles.milestoneRow}>
                {/* Timeline line */}
                <View style={styles.lineCol}>
                  <View style={[styles.dot, achieved && styles.dotAchieved]} />
                  {i < HEALTH_MILESTONES.length - 1 && (
                    <View style={[styles.line, achieved && styles.lineAchieved]} />
                  )}
                </View>
                {/* Content */}
                <View style={[styles.milestoneCard, achieved && styles.milestoneCardAchieved]}>
                  <View style={styles.milestoneHeader}>
                    <Text style={[styles.milestoneTitle, !achieved && styles.mutedTitle]}>
                      {achieved ? '\u2713 ' : ''}{milestone.title}
                    </Text>
                    <Text style={[styles.milestoneTime, achieved && styles.achievedTime]}>
                      {achieved ? 'Achieved!' : `${formatTimeRemaining(hoursLeft)} to go`}
                    </Text>
                  </View>
                  <Text style={[styles.milestoneDesc, !achieved && styles.mutedDesc]}>
                    {milestone.description}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    padding: 24,
    paddingTop: 64,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#333',
  },
  closeBtn: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9C27B0',
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
  },
  timeline: {
    paddingLeft: 4,
  },
  milestoneRow: {
    flexDirection: 'row',
    minHeight: 80,
  },
  lineCol: {
    width: 28,
    alignItems: 'center',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#DDD',
    borderWidth: 2,
    borderColor: '#CCC',
    zIndex: 1,
  },
  dotAchieved: {
    backgroundColor: '#9C27B0',
    borderColor: '#7B1FA2',
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#DDD',
  },
  lineAchieved: {
    backgroundColor: '#CE93D8',
  },
  milestoneCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginLeft: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  milestoneCardAchieved: {
    backgroundColor: '#F0E4F7',
    shadowColor: '#9C27B0',
    shadowOpacity: 0.1,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  milestoneTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  mutedTitle: {
    color: '#AAA',
  },
  milestoneTime: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999',
    marginLeft: 8,
  },
  achievedTime: {
    color: '#7B1FA2',
  },
  milestoneDesc: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
  mutedDesc: {
    color: '#BBB',
  },
});
