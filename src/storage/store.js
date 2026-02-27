import AsyncStorage from '@react-native-async-storage/async-storage';

const LOGS_KEY = '@logs';
const PHASE_KEY = '@phase';

// --- Logs ---

export async function getLogs() {
  const json = await AsyncStorage.getItem(LOGS_KEY);
  return json ? JSON.parse(json) : [];
}

export async function addLog(entry) {
  const logs = await getLogs();
  logs.push({ ...entry, id: Date.now().toString() + Math.random().toString(36).slice(2, 7) });
  await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  return logs;
}

export async function clearLogs() {
  await AsyncStorage.removeItem(LOGS_KEY);
}

// --- Phase ---

const DEFAULT_PHASE = {
  currentPhase: 1,
  phaseStartDates: { 1: new Date().toISOString() },
  completedPhases: [],
};

export async function getPhaseData() {
  const json = await AsyncStorage.getItem(PHASE_KEY);
  return json ? JSON.parse(json) : DEFAULT_PHASE;
}

export async function advancePhase() {
  const data = await getPhaseData();
  if (data.currentPhase >= 4) return data;
  data.completedPhases.push(data.currentPhase);
  data.currentPhase += 1;
  data.phaseStartDates[data.currentPhase] = new Date().toISOString();
  await AsyncStorage.setItem(PHASE_KEY, JSON.stringify(data));
  return data;
}

export async function resetAll() {
  await AsyncStorage.multiRemove([LOGS_KEY, PHASE_KEY]);
}
