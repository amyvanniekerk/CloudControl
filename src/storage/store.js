import AsyncStorage from '@react-native-async-storage/async-storage';

const LOGS_KEY = '@logs';
const PHASE_KEY = '@phase';
const SETTINGS_KEY = '@settings';
const CHECKINS_KEY = '@checkins';
const PURCHASES_KEY = '@purchases';

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

export async function startPhase() {
  const data = await getPhaseData();
  data.phaseStartedAt = new Date().toISOString();
  await AsyncStorage.setItem(PHASE_KEY, JSON.stringify(data));
  return data;
}

export async function advancePhase() {
  const data = await getPhaseData();
  if (data.currentPhase >= 4) return data;
  data.completedPhases.push(data.currentPhase);
  data.currentPhase += 1;
  data.phaseStartedAt = null;
  data.phaseStartDates[data.currentPhase] = new Date().toISOString();
  await AsyncStorage.setItem(PHASE_KEY, JSON.stringify(data));
  return data;
}

// --- Settings ---

const DEFAULT_SETTINGS = {
  weeklySpend: null,
  quitReasons: [],
  phaseRewards: { 1: null, 2: null, 3: null, 4: null },
  notificationTime: '09:00',
  notificationsEnabled: false,
  quitDate: null,
};

export async function getSettings() {
  const json = await AsyncStorage.getItem(SETTINGS_KEY);
  return json ? { ...DEFAULT_SETTINGS, ...JSON.parse(json) } : DEFAULT_SETTINGS;
}

export async function updateSettings(partial) {
  const current = await getSettings();
  const updated = { ...current, ...partial };
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  return updated;
}

// --- Purchases ---

export async function getPurchases() {
  const json = await AsyncStorage.getItem(PURCHASES_KEY);
  return json ? JSON.parse(json) : [];
}

export async function addPurchase(amount) {
  const purchases = await getPurchases();
  purchases.push({
    id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
    amount,
    timestamp: new Date().toISOString(),
  });
  await AsyncStorage.setItem(PURCHASES_KEY, JSON.stringify(purchases));
  return purchases;
}

// --- Check-ins ---

export async function getCheckins() {
  const json = await AsyncStorage.getItem(CHECKINS_KEY);
  return json ? JSON.parse(json) : [];
}

export async function addCheckin(stuckToRules) {
  const checkins = await getCheckins();
  const today = new Date().toISOString().split('T')[0];
  if (checkins.some(c => c.date === today)) return checkins;
  checkins.push({ date: today, stuckToRules, timestamp: new Date().toISOString() });
  await AsyncStorage.setItem(CHECKINS_KEY, JSON.stringify(checkins));
  return checkins;
}

export async function getTodayCheckin() {
  const checkins = await getCheckins();
  const today = new Date().toISOString().split('T')[0];
  return checkins.find(c => c.date === today) || null;
}

// --- Reset ---

export async function resetAll() {
  await AsyncStorage.multiRemove([LOGS_KEY, PHASE_KEY, SETTINGS_KEY, CHECKINS_KEY, PURCHASES_KEY]);
}
