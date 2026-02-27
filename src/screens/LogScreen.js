import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { addLog, getSettings } from '../storage/store';
import QuitReasonCard from '../components/QuitReasonCard';

const TRIGGERS = ['Craving', 'Habit', 'Stress', 'Boredom', 'Social', 'Other'];
const LOCATIONS = [
  { key: 'bed', label: 'Bed' },
  { key: 'coding', label: 'Coding' },
  { key: 'designated_spot', label: 'Designated Spot' },
  { key: 'other', label: 'Other' },
];

export default function LogScreen({ route, navigation }) {
  const type = route.params?.type || 'craving';
  const isSession = type === 'vape_session';

  const [trigger, setTrigger] = useState('Craving');
  const [location, setLocation] = useState('other');
  const [isNightWake, setIsNightWake] = useState(false);
  const [dragCount, setDragCount] = useState(3);
  const [quitReasons, setQuitReasons] = useState([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const s = await getSettings();
        setQuitReasons(s.quitReasons || []);
      })();
    }, [])
  );

  const handleSave = async () => {
    const entry = {
      type,
      timestamp: new Date().toISOString(),
      trigger: trigger.toLowerCase(),
      location,
      isNightWake,
      dragCount: isSession ? dragCount : null,
    };

    await addLog(entry);
    Alert.alert(
      isSession ? 'Vape Session Logged' : 'Craving Logged',
      'Keep going, you\'re doing great!',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>
        {isSession ? 'Log Smoke Session' : 'Log Craving'}
      </Text>

      {/* Trigger */}
      <Text style={styles.label}>What triggered this?</Text>
      <View style={styles.chipRow}>
        {TRIGGERS.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.chip, trigger === t && styles.chipActive]}
            onPress={() => setTrigger(t)}
          >
            <Text style={[styles.chipText, trigger === t && styles.chipTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Location */}
      <Text style={styles.label}>Whats your environment?</Text>
      <View style={styles.chipRow}>
        {LOCATIONS.map((l) => (
          <TouchableOpacity
            key={l.key}
            style={[styles.chip, location === l.key && styles.chipActive]}
            onPress={() => setLocation(l.key)}
          >
            <Text style={[styles.chipText, location === l.key && styles.chipTextActive]}>
              {l.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Night Wake */}
      <View style={styles.switchRow}>
        <Text style={styles.label}>Night wake?</Text>
        <Switch value={isNightWake} onValueChange={setIsNightWake} trackColor={{ false: '#DDD', true: '#D9B9E2' }} thumbColor={isNightWake ? '#9C27B0' : '#f4f3f4'} />
      </View>

      {/* Drag Count (vape sessions only) */}
      {isSession && (
        <>
          <Text style={styles.label}>Drag count: {dragCount}</Text>
          <View style={styles.dragRow}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <TouchableOpacity
                key={n}
                style={[styles.dragBtn, dragCount === n && styles.dragBtnActive]}
                onPress={() => setDragCount(n)}
              >
                <Text
                  style={[styles.dragText, dragCount === n && styles.dragTextActive]}
                >
                  {n}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Save */}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Save</Text>
      </TouchableOpacity>

      {/* Cancel */}
      <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#333',
      textAlign: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555',
    marginBottom: 16,
    marginTop: 10,
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  dragRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dragBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragBtnActive: {
    backgroundColor: '#7B1FA2',
  },
  dragText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  dragTextActive: {
    color: '#fff',
  },
  saveBtn: {
    backgroundColor: '#9C27B0',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 32,
    shadowColor: '#9C27B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  cancelBtn: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelText: {
    color: '#999',
    fontSize: 15,
  },
});
