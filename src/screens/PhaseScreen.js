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
import { getPhaseData, advancePhase } from '../storage/store';
import { PHASES, REPLACEMENT_STRATEGIES, IDENTITY_AFFIRMATION } from '../data/phases';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PhaseScreen() {
  const [phaseData, setPhaseData] = useState({
    currentPhase: 1,
    completedPhases: [],
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const data = await getPhaseData();
        setPhaseData(data);
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
        </View>

        {/* Below-card content */}
        <View style={styles.belowCard}>
          {/* Complete Phase button — only show on current phase */}
          {status === 'current' && (
            <TouchableOpacity style={styles.advanceBtn} onPress={handleAdvance}>
              <Text style={styles.advanceBtnText}>
                {phaseData.currentPhase >= 4
                  ? 'Complete Final Phase'
                  : `Complete Phase ${phaseData.currentPhase}`}
              </Text>
            </TouchableOpacity>
          )}

          {/* Replacement Strategies */}
          <Text style={styles.sectionTitle}>Replacement Strategies</Text>
          {REPLACEMENT_STRATEGIES.map((s, i) => (
            <Text key={i} style={styles.strategy}>
              {'\u2022'}  {s}
            </Text>
          ))}

          {/* Identity */}
          <View style={styles.identityCard}>
            <Text style={styles.identityText}>{IDENTITY_AFFIRMATION}</Text>
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

      {/* Swipe hint dots */}
      <View style={styles.dotsRow}>
        {PHASES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === activeIndex && styles.dotActive]}
          />
        ))}
      </View>
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
  advanceBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
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
