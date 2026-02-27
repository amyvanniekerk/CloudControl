import React, { useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Dimensions,
    FlatList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {getPhaseData, advancePhase, startPhase, getSettings, updateSettings} from '../storage/store';
import { PHASES, REPLACEMENT_STRATEGIES, IDENTITY_AFFIRMATIONS } from '../data/phases';
import RewardBadge from '../components/RewardBadge';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PhaseScreen() {
  const [phaseData, setPhaseData] = useState({
    currentPhase: 1,
    completedPhases: [],
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const [phaseRewards, setPhaseRewards] = useState({});
  const [quitDate, setQuitDate] = useState(null);
  const flatListRef = useRef(null);

    const handleSetQuitDate = async (daysFromNow) => {
        const target = new Date();
        target.setDate(target.getDate() + daysFromNow);
        target.setHours(0, 0, 0, 0);
        const newDate = target.toISOString();
        await updateSettings({ quitDate: newDate });
        setQuitDate(newDate);
        const formatted = target.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        Alert.alert('Quit date set!', `You're going nicotine-free on ${formatted}.`);
    };

  const phaseStarted = !!phaseData.phaseStartedAt;
  const phaseStartDate = phaseData.phaseStartedAt ? new Date(phaseData.phaseStartedAt) : null;
  const dayCount = phaseStartDate
    ? Math.max(1, Math.floor((Date.now() - phaseStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1)
    : 0;

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [data, settings] = await Promise.all([getPhaseData(), getSettings()]);
        setPhaseData(data);
        setPhaseRewards(settings.phaseRewards || {});
        setQuitDate(settings.quitDate || null);
        const idx = data.currentPhase - 1;
        setActiveIndex(idx);
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({ index: idx, animated: false });
        }, 100);
      })();
    }, [])
  );

  const handleAdvance = () => {
    if (phaseData.currentPhase >= 4) {
      Alert.alert('Congratulations!', "You've completed all phases. You are nicotine-free!");
      return;
    }

    Alert.alert(
      'Complete Phase?',
      `Ready to move from Phase ${phaseData.currentPhase} to Phase ${phaseData.currentPhase + 1}?`,
      [
        { text: 'Not Yet', style: 'cancel' },
        {
          text: 'Yes, Advance!',
          onPress: async () => {
            const data = await advancePhase();
            setPhaseData(data);
            const idx = data.currentPhase - 1;
            setActiveIndex(idx);
            flatListRef.current?.scrollToIndex({ index: idx, animated: true });
          },
        },
      ]
    );
  };

  const getStatus = (phaseId) => {
    if (phaseData.completedPhases.includes(phaseId)) return 'completed';
    if (phaseId === phaseData.currentPhase) return 'current';
    return 'locked';
  };

  const goToPhase = (index) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setActiveIndex(index);
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const renderPhaseCard = ({ item: phase }) => {
    const status = getStatus(phase.id);
    const isActive = status === 'current' || status === 'completed';
    const requiredDays = phase.durationWeeks * 7;
    const canComplete = phaseStarted && phaseStartDate
      ? dayCount >= requiredDays
      : false;
    const daysRemaining = phaseStarted && phaseStartDate
      ? Math.max(0, requiredDays - dayCount)
      : requiredDays;

    return (
      <ScrollView
        style={styles.slideContainer}
        contentContainerStyle={styles.slideContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <View
          style={[
            styles.phaseCard,
            isActive ? styles.activeCard : styles.inactiveCard,
          ]}
        >
          {/* Status badge */}
          <View style={styles.badgeRow}>
            {status === 'completed' && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Done</Text>
              </View>
            )}
            {status === 'current' && (
              <View style={[styles.badge, styles.currentBadge]}>
                <Text style={[styles.badgeText, styles.currentBadgeText]}>Current</Text>
              </View>
            )}
            {status === 'locked' && (
              <View style={[styles.badge, styles.lockedBadge]}>
                <Text style={[styles.badgeText, styles.lockedBadgeText]}>Upcoming</Text>
              </View>
            )}
          </View>
          {status === 'current' && phaseStarted && (
            <Text style={styles.dayText}>Day {dayCount} of</Text>
          )}

          {/* Weeks */}
          <Text style={[styles.phaseWeeks, !isActive && styles.mutedText]}>
            {phase.weeks}
          </Text>

          {/* Title */}
          <Text style={[styles.phaseName, !isActive && styles.mutedTitle]}>
            Phase {phase.id}
          </Text>
          <Text style={[styles.phaseSubtitle, !isActive && styles.mutedText]}>
            {phase.name}
          </Text>

          {/* Divider */}
          <View style={[styles.divider, !isActive && styles.mutedDivider]} />

          {/* Rules */}
          {phase.rules.map((rule, i) => (
            <Text key={i} style={[styles.rule, !isActive && styles.mutedRule]}>
              {'\u2022'}  {rule}
            </Text>
          ))}

          {/* Goal */}
          <View style={[styles.goalBox, !isActive && styles.mutedGoalBox]}>
            <Text style={[styles.goalText, !isActive && styles.mutedGoalText]}>
              {phase.goal}
            </Text>
          </View>

          {/* Reward */}
          <RewardBadge reward={phaseRewards[phase.id]} status={status} />
        </View>

        {/* Below-card content */}
        <View style={styles.belowCard}>
          {/* Phase button — only show on current phase */}
          {status === 'current' && (
            <>
              <TouchableOpacity
                style={[
                  styles.advanceBtn,
                  phaseStarted && !canComplete && styles.advanceBtnDisabled,
                ]}
                disabled={phaseStarted && !canComplete}
                onPress={() => {
                  if (phaseStarted) {
                    handleAdvance();
                  } else {
                    startPhase().then(setPhaseData);
                  }
                }}
              >
                <Text style={styles.advanceBtnText}>
                  {phaseStarted
                    ? (phaseData.currentPhase >= 4
                        ? 'Complete Final Phase'
                        : `Complete Phase ${phaseData.currentPhase}`)
                    : `Start Phase ${phaseData.currentPhase}`}
                </Text>
              </TouchableOpacity>
              {phaseStarted && !canComplete && (
                <Text style={styles.daysRemainingText}>
                  {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
                </Text>
              )}
            </>
          )}

            {phaseData.currentPhase === 4 && (
                <View style={styles.section}>
                    <TouchableOpacity
                        disabled={!quitDate}
                        onPress={() => { setQuitDate(null); updateSettings({ quitDate: null }); }}
                    >
                        <Text style={styles.sectionTitle}>
                            {quitDate ? 'Change date' : 'Select Target Quit Date'}
                        </Text>
                    </TouchableOpacity>
                    {quitDate ? (
                        <View style={styles.quitDateSet}>
                            <Text style={styles.quitDateValue}>
                                {new Date(quitDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </Text>
                            <Text style={styles.quitDateCountdown}>
                                {Math.max(0, Math.ceil((new Date(quitDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days to go
                            </Text>
                        </View>
                    ) : (
                        <View>
                            <View style={styles.quitDateOptions}>
                                {[
                                    { label: 'In 1 week', days: 7 },
                                    { label: 'In 2 weeks', days: 14 },
                                    { label: 'In 1 month', days: 30 },
                                ].map((option) => (
                                    <TouchableOpacity
                                        key={option.days}
                                        style={styles.quitDateBtn}
                                        onPress={() => handleSetQuitDate(option.days)}
                                    >
                                        <Text style={styles.quitDateBtnText}>{option.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}
                </View>
            )
        }

          {/* Replacement Strategies */}
          <Text style={styles.sectionTitle}>Replacement Strategies</Text>
          {REPLACEMENT_STRATEGIES.map((s, i) => (
            <Text key={i} style={styles.strategy}>
              {'\u2022'}  {s}
            </Text>
          ))}

          {/* Motivation Quote — one per phase */}
          <View style={styles.identityCard}>
            <Text style={styles.identityText}>
              {IDENTITY_AFFIRMATIONS[phase.id - 1]}
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Your Plan</Text>

        {/* Phase nav buttons */}
        <View style={styles.navRow}>
          {PHASES.map((phase, i) => {
            const status = getStatus(phase.id);
            return (
              <TouchableOpacity
                key={phase.id}
                style={[
                  styles.navBtn,
                  i === activeIndex && styles.navBtnActive,
                  status === 'completed' && i !== activeIndex && styles.navBtnCompleted,
                ]}
                onPress={() => goToPhase(i)}
              >
                <Text
                  style={[
                    styles.navBtnText,
                    i === activeIndex && styles.navBtnTextActive,
                  ]}
                >
                  {phase.id}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Swipeable phases */}
      <FlatList
        ref={flatListRef}
        data={PHASES}
        renderItem={renderPhaseCard}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#333',
    marginBottom: 16,
  },
  navRow: {
    flexDirection: 'row',
    gap: 10,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnActive: {
    backgroundColor: '#9C27B0',
  },
  navBtnCompleted: {
    backgroundColor: '#EDE0F0',
  },
  navBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#999',
  },
  navBtnTextActive: {
    color: '#fff',
  },

  // Each slide fills the screen width
  slideContainer: {
    width: SCREEN_WIDTH,
  },
  slideContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  // Floating card
  phaseCard: {
    borderRadius: 20,
    padding: 24,
    marginTop: 8,
    minHeight: SCREEN_HEIGHT * 0.42,
  },
  activeCard: {
    backgroundColor: '#fff',
    shadowColor: '#9C27B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  inactiveCard: {
    backgroundColor: '#F5F5F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },

  badgeRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#EDE0F0',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7B1FA2',
  },
  currentBadge: {
    backgroundColor: '#D9B9E2',
  },
  currentBadgeText: {
    color: '#6A1B9A',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#BA68C8',
    marginBottom: 2,
  },
  lockedBadge: {
    backgroundColor: '#E8E8E8',
  },
  lockedBadgeText: {
    color: '#999',
  },

  phaseWeeks: {
    fontSize: 13,
    color: '#9C27B0',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  phaseName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333',
  },
  phaseSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 16,
  },

  divider: {
    height: 2,
    backgroundColor: '#EDE0F0',
    borderRadius: 1,
    marginBottom: 16,
  },
  mutedDivider: {
    backgroundColor: '#E0E0E0',
  },

  rule: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
    lineHeight: 20,
  },
  mutedText: {
    color: '#AAAAAA',
  },
  mutedTitle: {
    color: '#BBBBBB',
  },
  mutedRule: {
    color: '#AAAAAA',
  },

  goalBox: {
    backgroundColor: '#F0E4F7',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },
  mutedGoalBox: {
    backgroundColor: '#EEEEEE',
  },
  goalText: {
    fontSize: 14,
    color: '#6A1B9A',
    fontWeight: '600',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  mutedGoalText: {
    color: '#AAAAAA',
  },

  // Below-card section
  belowCard: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  advanceBtn: {
    backgroundColor: '#9C27B0',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#9C27B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  advanceBtnDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  advanceBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  daysRemainingText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginTop: -12,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  quitDatePrompt: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  quitDateOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  quitDateBtn: {
    flex: 1,
    backgroundColor: '#9C27B0',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  quitDateBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  quitDateSet: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#9C27B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quitDateLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  quitDateValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#6A1B9A',
    marginBottom: 4,
  },
  quitDateCountdown: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9C27B0',
  },
  resetLink: {
    fontSize: 13,
    color: '#999',
    fontWeight: '600',
  },
  strategy: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
    lineHeight: 20,
  },
  identityCard: {
    backgroundColor: '#F0E4F7',
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
  },
  identityText: {
    fontSize: 14,
    color: '#6A1B9A',
    lineHeight: 22,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // Dots
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DDD',
  },
  dotActive: {
    backgroundColor: '#9C27B0',
    width: 24,
  },
});
