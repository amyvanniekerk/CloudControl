import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

// Screen width minus: StatsScreen padding (24*2) + chartCard padding (4*2) + container padding (16*2) + chartWrapper paddingLeft (24)
const chartWidth = Dimensions.get('window').width - 48 - 8 - 32 - 24;
const CHART_HEIGHT = 120;
const BAR_WIDTH = 10;

const COLORS = {
  sessions: '#9C27B0',
  cravings: '#CE93D8',
  nightWakes: '#F48FB1',
};

function dateKey(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function WeeklyChart({ weeklyStats }) {
  if (!weeklyStats || weeklyStats.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No data yet</Text>
        <Text style={styles.emptyText}>
          Log your first session or craving to see your chart
        </Text>
      </View>
    );
  }

  const allValues = weeklyStats.flatMap((d) => [d.sessions, d.cravings, d.nightWakes]);
  const maxVal = Math.max(...allValues, 1);
  const colWidth = chartWidth / 7;
  const todayKey = dateKey(new Date());

  const barHeight = (val) => {
    if (val === 0) return 0;
    return Math.max((val / maxVal) * CHART_HEIGHT, 6);
  };

  // Grid lines at 25%, 50%, 75% of max
  const gridLines = [];
  if (maxVal >= 2) {
    const steps = maxVal <= 4 ? [Math.ceil(maxVal / 2)] : [
      Math.round(maxVal * 0.25),
      Math.round(maxVal * 0.5),
      Math.round(maxVal * 0.75),
    ];
    for (const v of [...new Set(steps)]) {
      if (v > 0 && v < maxVal) gridLines.push(v);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Past 7 Days</Text>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.sessions }]} />
          <Text style={styles.legendText}>Sessions</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.cravings }]} />
          <Text style={styles.legendText}>Cravings</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.nightWakes }]} />
          <Text style={styles.legendText}>Night</Text>
        </View>
      </View>

      {/* Chart with grid */}
      <View style={styles.chartWrapper}>
        {/* Grid lines (behind bars) */}
        {gridLines.map((val) => (
          <View
            key={val}
            style={[
              styles.gridLine,
              { bottom: (val / maxVal) * CHART_HEIGHT + 1 },
            ]}
          />
        ))}
        {/* Max label */}
        <Text style={[styles.gridLabel, { top: 0 }]}>{maxVal}</Text>
        {gridLines.map((val) => (
          <Text
            key={`l-${val}`}
            style={[
              styles.gridLabel,
              { bottom: (val / maxVal) * CHART_HEIGHT - 6 },
            ]}
          >
            {val}
          </Text>
        ))}

        {/* Bars */}
        <View style={styles.chartRow}>
          {weeklyStats.map((day) => {
            const isToday = day.date === todayKey;

            return (
              <View key={day.date} style={[styles.dayCol, { width: colWidth }]}>
                <View style={styles.barGroup}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight(day.sessions),
                        backgroundColor: COLORS.sessions,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight(day.cravings),
                        backgroundColor: COLORS.cravings,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight(day.nightWakes),
                        backgroundColor: COLORS.nightWakes,
                      },
                    ]}
                  />
                </View>

                <View style={[styles.dayLabelWrap, isToday && styles.todayLabelWrap]}>
                  <Text style={[styles.dayLabel, isToday && styles.todayLabel]}>
                    {isToday ? 'Today' : day.label}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    overflow: 'hidden',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  legend: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },

  // Chart
  chartWrapper: {
    position: 'relative',
    paddingLeft: 24,
  },
  gridLine: {
    position: 'absolute',
    left: 24,
    right: 0,
    height: 1,
    backgroundColor: '#F0E4F7',
  },
  gridLabel: {
    position: 'absolute',
    left: 0,
    fontSize: 9,
    color: '#CCC',
    fontWeight: '500',
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  dayCol: {
    alignItems: 'center',
  },
  barGroup: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: CHART_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 1,
  },
  bar: {
    width: BAR_WIDTH,
    borderRadius: 5,
  },

  // Day labels
  dayLabelWrap: {
    marginTop: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  todayLabelWrap: {
    backgroundColor: '#F0E4F7',
  },
  dayLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  todayLabel: {
    color: '#6A1B9A',
    fontWeight: '700',
  },

  // Empty
  empty: {
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#BBB',
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    color: '#CCC',
    textAlign: 'center',
  },
});
