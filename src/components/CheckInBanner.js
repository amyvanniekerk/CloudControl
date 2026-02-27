import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function CheckInBanner({ todayCheckin, streak, onCheckIn }) {
  if (todayCheckin) {
    return (
      <View style={styles.doneBanner}>
        <Text style={styles.doneText}>
          {todayCheckin.stuckToRules ? '\u2713 Stuck to the rules today!' : 'Checked in today \u2014 keep going!'}
        </Text>
        {streak > 0 && (
          <Text style={styles.streakText}>{streak} day streak</Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.banner}>
      <Text style={styles.question}>Did you manage today?</Text>
      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.yesBtn} onPress={() => onCheckIn(true)}>
          <Text style={styles.yesBtnText}>Yes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.noBtn} onPress={() => onCheckIn(false)}>
          <Text style={styles.noBtnText}>No</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#9C27B0',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  question: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  yesBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 10,
  },
  yesBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2E7D32',
  },
  noBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 10,
  },
  noBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  doneBanner: {
    backgroundColor: '#F0E4F7',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    alignItems: 'center',
  },
  doneText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6A1B9A',
  },
  streakText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9C27B0',
    marginTop: 4,
  },
});
