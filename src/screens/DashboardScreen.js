import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getLogs, getPhaseData, getSettings, getTodayCheckin, addCheckin, getCheckins, getPurchases, addPurchase } from '../storage/store';
import { getTodayLogs, countByType, nightWakeCount, bedFreeStreak, checkinStreak } from '../utils/stats';
import { PHASES, REPLACEMENT_STRATEGIES } from '../data/phases';
import CheckInBanner from '../components/CheckInBanner';
import MoneySavedCard from '../components/MoneySavedCard';
import HealthTimelineCard from '../components/HealthTimelineCard';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function getTimeSince(logs) {
  const sessions = logs
    .filter((l) => l.type === 'vape_session')
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  if (sessions.length === 0) return null;
  const diff = Date.now() - new Date(sessions[0].timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  if (hrs > 0) return `${hrs}h ${mins % 60}m`;
  return `${mins}m`;
}

export default function DashboardScreen({ navigation }) {
  const [logs, setLogs] = useState([]);
  const [phase, setPhase] = useState(1);
  const [timeSince, setTimeSince] = useState(null);
  const [settings, setSettings] = useState(null);
  const [todayCheckin, setTodayCheckin] = useState(null);
  const [checkInStreakCount, setCheckInStreakCount] = useState(0);
  const [purchases, setPurchases] = useState([]);
  const [tip] = useState(
    () => REPLACEMENT_STRATEGIES[Math.floor(Math.random() * REPLACEMENT_STRATEGIES.length)]
  );
  const [toastMessage, setToastMessage] = useState(null);
  const toastAnim = useRef(new Animated.Value(0)).current;

  const showToast = (message) => {
    setToastMessage(message);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(4000),
      Animated.timing(toastAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setToastMessage(null));
  };

  const loadData = async () => {
    const [allLogs, phaseData, s, checkin, allCheckins, allPurchases] = await Promise.all([
      getLogs(),
      getPhaseData(),
      getSettings(),
      getTodayCheckin(),
      getCheckins(),
      getPurchases(),
    ]);
    setLogs(allLogs);
    setPhase(phaseData.currentPhase);
    setTimeSince(getTimeSince(allLogs));
    setSettings(s);
    setTodayCheckin(checkin);
    setCheckInStreakCount(checkinStreak(allCheckins));
    setPurchases(allPurchases);
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const handleCheckIn = async (stuckToRules) => {
    await addCheckin(stuckToRules);
    if (!stuckToRules && settings?.quitReasons?.length > 0) {
      const reason = settings.quitReasons[Math.floor(Math.random() * settings.quitReasons.length)];
      showToast(reason);
    }
    loadData();
  };

  const handleLogPurchase = () => {
    Alert.prompt(
      'Log Purchase',
      'How much did you spend?',
      [
        { text: 'Cancel', },
        {
          text: 'Submit',
          onPress: async (value) => {
            const amount = parseFloat(value);
            if (isNaN(amount) || amount <= 0) {
              Alert.alert('Invalid amount', 'Please enter a valid number.');
              return;
            }
            await addPurchase(amount);
            loadData();
            Alert.alert('Purchase Logged', `$${amount.toFixed(2)} recorded.`);
          },
        },
      ],
      'plain-text',
      '',
      'decimal-pad'
    );
  };

  // Live timer update every minute
  useEffect(() => {
    if (logs.length > 0) {
      setTimeSince(getTimeSince(logs));
      const id = setInterval(() => setTimeSince(getTimeSince(logs)), 60000);
      return () => clearInterval(id);
    }
  }, [logs]);

  const todayLogs = getTodayLogs(logs);
  const sessions = countByType(todayLogs, 'vape_session');
  const cravings = countByType(todayLogs, 'craving');
  const nightWakes = nightWakeCount(todayLogs);
  const streak = bedFreeStreak(logs);
  const currentPhase = PHASES.find((p) => p.id === phase);

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <Text style={styles.greeting}>{getGreeting()}</Text>

        {/* Tip */}
        <Text style={styles.tip}>{tip}</Text>

        {/* Daily Check-in */}
        <CheckInBanner
          todayCheckin={todayCheckin}
          streak={checkInStreakCount}
          onCheckIn={handleCheckIn}
        />

        {/* Hero Streak */}
        <View style={styles.streakCard}>
          <View style={styles.streakRing}>
            <Text style={styles.streakNum}>{streak}</Text>
          </View>
          <Text style={styles.streakLabel}>
            day{streak !== 1 ? 's' : ''} no vape in bed
          </Text>
          {timeSince && (
            <View style={styles.timeSinceRow}>
              <Text style={styles.timeSinceLabel}>Last smoke</Text>
              <Text style={styles.timeSinceValue}>{timeSince} ago</Text>
            </View>
          )}
        </View>

        {/* Money Spent on Vapes */}
        <MoneySavedCard purchases={purchases} />

        {/* Health Timeline */}
        <HealthTimelineCard
          quitDate={settings?.quitDate}
          onPress={() => navigation.navigate('HealthTimeline')}
        />

        {/* Phase Pill */}
        <View style={styles.phasePill}>
          <View style={styles.phaseIndicator}>
            <Text style={styles.phaseIndicatorText}>{currentPhase?.id}</Text>
          </View>
          <View style={styles.phaseInfo}>
            <Text style={styles.phaseTitle}>{currentPhase?.name}</Text>
            <Text style={styles.phaseWeeks}>{currentPhase?.weeks}</Text>
          </View>
        </View>

        {/* Today's Stats */}
        <Text style={styles.sectionTitle}>Today</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{sessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{cravings}</Text>
            <Text style={styles.statLabel}>Cravings</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{nightWakes}</Text>
            <Text style={styles.statLabel}>Night</Text>
          </View>
        </View>

        {/* Log Buttons */}
        <View style={styles.logBtns}>
          <TouchableOpacity
            style={[styles.logBtn, styles.cravingBtn]}
            onPress={() => navigation.navigate('Log', { type: 'craving' })}
          >
            <Text style={styles.logBtnLabel}>Log Craving</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.logBtn, styles.sessionBtn]}
            onPress={() => navigation.navigate('Log', { type: 'vape_session' })}
          >
            <Text style={styles.logBtnLabel}>Log Smoke</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Toast */}
      {toastMessage && (
        <Animated.View
          style={[
            styles.toast,
            {
              opacity: toastAnim,
              transform: [{ translateY: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
            },
          ]}
        >
          <Text style={styles.toastLabel}>Reminder:</Text>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 64,
  },

  // Greeting
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333',
  },
  tip: {
    fontSize: 14,
    color: '#9C27B0',
    marginTop: 4,
    marginBottom: 24,
    fontStyle: 'italic',
  },

  // Hero Streak
  streakCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#9C27B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  streakRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 5,
    borderColor: '#D9B9E2',
    backgroundColor: '#F0E4F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  streakNum: {
    fontSize: 44,
    fontWeight: '900',
    color: '#6A1B9A',
  },
  streakLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555',
  },
  timeSinceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    backgroundColor: '#F0E4F7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timeSinceLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  timeSinceValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6A1B9A',
  },

  // Phase Pill
  phasePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  phaseIndicator: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#9C27B0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  phaseIndicatorText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  phaseInfo: {
    flex: 1,
  },
  phaseTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  phaseWeeks: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
    marginTop: 2,
  },

  purchaseBtn: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 14,
  },
  purchaseBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E65100',
  },

  // Stats
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
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
  statNum: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333',
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    fontWeight: '600',
  },

  // Log Buttons
  logBtns: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingBottom: 20,
  },
  logBtn: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#9C27B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  cravingBtn: {
    backgroundColor: '#E8D5F5',
  },
  sessionBtn: {
    backgroundColor: '#D9B9E2',
  },
  logBtnLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A148C',
  },

  // Toast
  toast: {
    position: 'absolute',
    top: 70,
    left: 24,
    right: 24,
    backgroundColor: '#6A1B9A',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  toastLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D9B9E2',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  toastText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    fontStyle: 'italic',
  },
});
