import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getSettings, updateSettings, resetAll } from '../storage/store';
import { requestPermissions, scheduleDailyReminder, cancelAllNotifications } from '../utils/notifications';

const TIME_OPTIONS = ['07:00', '08:00', '09:00', '12:00', '18:00', '21:00'];
const TIME_LABELS = { '07:00': '7 AM', '08:00': '8 AM', '09:00': '9 AM', '12:00': '12 PM', '18:00': '6 PM', '21:00': '9 PM' };

export default function SettingsScreen() {
  const [settings, setSettings] = useState(null);
  const [spendInput, setSpendInput] = useState('');
  const [reasonInput, setReasonInput] = useState('');
  const [rewardInputs, setRewardInputs] = useState({ 1: '', 2: '', 3: '', 4: '' });

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const s = await getSettings();
        setSettings(s);
        setSpendInput(s.weeklySpend ? s.weeklySpend.toString() : '');
        setRewardInputs({
          1: s.phaseRewards[1] || '',
          2: s.phaseRewards[2] || '',
          3: s.phaseRewards[3] || '',
          4: s.phaseRewards[4] || '',
        });
      })();
    }, [])
  );

  if (!settings) return null;

  const save = async (partial) => {
    const updated = await updateSettings(partial);
    setSettings(updated);
  };

  const handleSaveSpend = async () => {
    const num = parseFloat(spendInput);
    if (isNaN(num) || num <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid number.');
      return;
    }
    await save({ weeklySpend: num });
    Alert.alert('Total:', ` R${num.toFixed(2)}`);
  };

  const handleAddReason = async () => {
    const trimmed = reasonInput.trim();
    if (!trimmed) return;
    const reasons = [...settings.quitReasons, trimmed];
    await save({ quitReasons: reasons });
    setReasonInput('');
  };

  const handleRemoveReason = (index) => {
    const reasons = settings.quitReasons.filter((_, i) => i !== index);
    save({ quitReasons: reasons });
  };

  const handleSaveReward = async (phaseId) => {
    const text = rewardInputs[phaseId].trim();
    const rewards = { ...settings.phaseRewards, [phaseId]: text || null };
    await save({ phaseRewards: rewards });
  };

  const handleToggleNotifications = async (enabled) => {
    if (enabled) {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert('Permission Required', 'Please enable notifications in your device settings.');
        return;
      }
      await scheduleDailyReminder(settings.notificationTime);
    } else {
      await cancelAllNotifications();
    }
    await save({ notificationsEnabled: enabled });
  };

  const handleSetTime = async (time) => {
    await save({ notificationTime: time });
    if (settings.notificationsEnabled) {
      await scheduleDailyReminder(time);
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset All Data?',
      'This will delete all logs, phase progress, settings, and check-ins. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            await resetAll();
            const s = await getSettings();
            setSettings(s);
            setSpendInput('');
            setReasonInput('');
            setRewardInputs({ 1: '', 2: '', 3: '', 4: '' });
            Alert.alert('Done', 'All data has been reset.');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Profile</Text>

      {/* Weekly Spend */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Spending</Text>
        <Text style={styles.hint}>How much did you spend on smoking?</Text>
        <View style={styles.inputRow}>
          <Text style={styles.currency}>R</Text>
          <TextInput
            style={styles.input}
            value={spendInput}
            onChangeText={setSpendInput}
            keyboardType="decimal-pad"
            placeholder="25.00"
            placeholderTextColor="#CCC"
          />
          <TouchableOpacity style={styles.smallBtn} onPress={handleSaveSpend}>
            <Text style={styles.smallBtnText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quit Reasons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Why I'm Quitting</Text>
        <Text style={styles.hint}>These will be shown when you need motivation</Text>
        {settings.quitReasons.map((reason, i) => (
          <View key={i} style={styles.reasonRow}>
            <Text style={styles.reasonText}>{reason}</Text>
            <TouchableOpacity onPress={() => handleRemoveReason(i)}>
              <Text style={styles.removeBtn}>x</Text>
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={reasonInput}
            onChangeText={setReasonInput}
            placeholder="Add a reason..."
            placeholderTextColor="#CCC"
            onSubmitEditing={handleAddReason}
          />
          <TouchableOpacity style={styles.smallBtn} onPress={handleAddReason}>
            <Text style={styles.smallBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Reminders</Text>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Enable notifications</Text>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={handleToggleNotifications}
            trackColor={{ true: '#CE93D8' }}
            thumbColor={settings.notificationsEnabled ? '#9C27B0' : '#ccc'}
          />
        </View>
        {settings.notificationsEnabled && (
          <>
            <Text style={styles.hint}>Reminder time</Text>
            <View style={styles.chipRow}>
              {TIME_OPTIONS.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[styles.chip, settings.notificationTime === time && styles.chipActive]}
                  onPress={() => handleSetTime(time)}
                >
                  <Text style={[styles.chipText, settings.notificationTime === time && styles.chipTextActive]}>
                    {TIME_LABELS[time]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>

      {/* Reset */}
      <TouchableOpacity style={styles.dangerBtn} onPress={handleReset}>
        <Text style={styles.dangerBtnText}>Reset All Data</Text>
      </TouchableOpacity>

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
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#333',
    marginBottom: 24,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  hint: {
    fontSize: 13,
    color: '#999',
    marginBottom: 12,
  },
  quitDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quitDateText: {
    fontSize: 15,
    color: '#555',
    fontWeight: '600',
  },
  resetLink: {
    fontSize: 13,
    color: '#9C27B0',
    fontWeight: '600',
  },
  primaryBtn: {
    backgroundColor: '#9C27B0',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currency: {
    fontSize: 18,
    fontWeight: '700',
    color: '#555',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#333',
  },
  smallBtn: {
    backgroundColor: '#9C27B0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  smallBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  reasonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0E4F7',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  reasonText: {
    fontSize: 14,
    color: '#6A1B9A',
    fontWeight: '500',
    flex: 1,
  },
  removeBtn: {
    fontSize: 16,
    color: '#999',
    fontWeight: '700',
    paddingLeft: 12,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  rewardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    width: 65,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 15,
    color: '#555',
    fontWeight: '500',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#EEEEEE',
  },
  chipActive: {
    backgroundColor: '#9C27B0',
  },
  chipText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#fff',
  },
  dangerBtn: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF5350',
    marginTop: 8,
  },
  dangerBtnText: {
    color: '#EF5350',
    fontSize: 15,
    fontWeight: '600',
  },
});
