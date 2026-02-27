import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getLogs } from '../storage/store';
import { getWeeklyStats, getWeeklySummary, bedFreeStreak } from '../utils/stats';
import WeeklyChart from '../components/WeeklyChart';

const RANGES = [
  { key: '7d', label: '7 Days', days: 7 },
  { key: '30d', label: '30 Days', days: 30 },
  { key: 'all', label: 'All', days: null },
];

export default function StatsScreen() {
  const [logs, setLogs] = useState([]);
  const [range, setRange] = useState('7d');
  const [summary, setSummary] = useState(null);
  const [streak, setStreak] = useState(0);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const allLogs = await getLogs();
        setLogs(allLogs);
        setSummary(getWeeklySummary(allLogs));
        setStreak(bedFreeStreak(allLogs));
      })();
    }, [])
  );

  const selectedRange = RANGES.find(r => r.key === range);
  const chartStats = getWeeklyStats(logs, selectedRange.days);

  return (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Stats</Text>

      {/* Chart */}
      <View style={styles.chartCard}>
        <WeeklyChart weeklyStats={chartStats} />
      </View>

        {/* Range Toggle */}
        <View style={styles.rangeRow}>
            {RANGES.map(r => (
                <TouchableOpacity
                    key={r.key}
                    style={[styles.rangeBtn, range === r.key && styles.rangeBtnActive]}
                    onPress={() => setRange(r.key)}
                >
                    <Text style={[styles.rangeBtnText, range === r.key && styles.rangeBtnTextActive]}>
                        {r.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>

      {/* Summary Grid */}
      {summary && (
        <View style={styles.grid}>
          <View style={styles.gridRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNum}>{summary.totalSessions}</Text>
              <Text style={styles.summaryLabel}>Sessions</Text>
              <Text style={styles.summarySubtext}>this week</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNum}>{summary.totalCravings}</Text>
              <Text style={styles.summaryLabel}>Cravings</Text>
              <Text style={styles.summarySubtext}>this week</Text>
            </View>
          </View>
          <View style={styles.gridRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNum}>{summary.totalNightWakes}</Text>
              <Text style={styles.summaryLabel}>Night Wakes</Text>
              <Text style={styles.summarySubtext}>this week</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNum}>{summary.avgSessionsPerDay}</Text>
              <Text style={styles.summaryLabel}>Avg / Day</Text>
              <Text style={styles.summarySubtext}>sessions</Text>
            </View>
          </View>
        </View>
      )}

      {/* Streak */}
      <View style={styles.streakCard}>
        <View style={styles.streakLeft}>
          <Text style={styles.streakNum}>{streak}</Text>
        </View>
        <View style={styles.streakRight}>
          <Text style={styles.streakTitle}>Vape-Free Streak</Text>
          <Text style={styles.streakSub}>
            day{streak !== 1 ? 's' : ''} with no vaping during the night
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  contentInner: {
    padding: 24,
    paddingTop: 64,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#333',
    marginBottom: 20,
  },

  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  rangeBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#EEEEEE',
  },
  rangeBtnActive: {
    backgroundColor: '#9C27B0',
  },
  rangeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
  },
  rangeBtnTextActive: {
    color: '#fff',
  },

  // Chart card
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },

  // Summary grid
  grid: {
    gap: 10,
    marginBottom: 20,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryNum: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontWeight: '600',
  },
  summarySubtext: {
    fontSize: 10,
    color: '#BBB',
    marginTop: 2,
  },

  // Streak row
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#9C27B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  streakLeft: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0E4F7',
    borderWidth: 3,
    borderColor: '#D9B9E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  streakNum: {
    fontSize: 24,
    fontWeight: '900',
    color: '#6A1B9A',
  },
  streakRight: {
    flex: 1,
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  streakSub: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
});
