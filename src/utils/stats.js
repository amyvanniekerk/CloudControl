// Get local date string YYYY-MM-DD (not UTC)
function dateKey(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get start of day for a date (local time)
function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Get logs for today
export function getTodayLogs(logs) {
  const today = dateKey(new Date());
  return logs.filter((l) => dateKey(l.timestamp) === today);
}

// Count by type for a set of logs
export function countByType(logs, type) {
  return logs.filter((l) => l.type === type).length;
}

// Night wake count (vape sessions flagged as night wake)
export function nightWakeCount(logs) {
  return logs.filter((l) => l.type === 'vape_session' && l.isNightWake).length;
}

// Streak: consecutive COMPLETED days with no vape session in bed
// Today doesn't count — only yesterday and before (you haven't finished today yet)
export function bedFreeStreak(allLogs) {
  if (allLogs.length === 0) return 0;

  // Find the earliest log date to know when tracking started
  const sortedByDate = [...allLogs].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );
  const firstLogDate = startOfDay(new Date(sortedByDate[0].timestamp));

  const vapeLogs = allLogs.filter((l) => l.type === 'vape_session');
  const today = startOfDay(new Date());
  let streak = 0;

  // Start from yesterday (i=1), today is not yet complete
  for (let i = 1; i <= 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);

    // Don't count days before the user started tracking
    if (checkDate < firstLogDate) break;

    const key = dateKey(checkDate);
    const hasBedVape = vapeLogs.some(
      (l) => dateKey(l.timestamp) === key && l.location === 'bed'
    );

    if (hasBedVape) break;
    streak++;
  }

  return streak;
}

// Get past N days stats for chart (null = all time)
export function getWeeklyStats(logs, numDays = 7) {
  const days = [];
  const today = startOfDay(new Date());

  let totalDays = numDays || 7;
  if (!numDays && logs.length > 0) {
    const sorted = [...logs].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const earliest = startOfDay(new Date(sorted[0].timestamp));
    totalDays = Math.max(1, Math.floor((today - earliest) / (24 * 60 * 60 * 1000)) + 1);
  }

  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = dateKey(d);
    const dayLogs = logs.filter((l) => dateKey(l.timestamp) === key);

    days.push({
      date: key,
      label: totalDays <= 7
        ? d.toLocaleDateString('en-US', { weekday: 'short' })
        : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sessions: countByType(dayLogs, 'vape_session'),
      cravings: countByType(dayLogs, 'craving'),
      nightWakes: nightWakeCount(dayLogs),
    });
  }

  return days;
}

// Craving counts per day for past N days
export function getCravingTrend(logs, days = 14) {
  const result = [];
  const today = startOfDay(new Date());
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = dateKey(d);
    const count = logs.filter(l => l.type === 'craving' && dateKey(l.timestamp) === key).length;
    result.push({ date: key, label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }), count });
  }
  return result;
}

// Check-in streak: consecutive days with stuckToRules === true
export function checkinStreak(checkins) {
  if (checkins.length === 0) return 0;
  const sorted = [...checkins].sort((a, b) => b.date.localeCompare(a.date));
  const today = dateKey(new Date());
  let streak = 0;
  const startDay = sorted[0].date === today ? 0 : 1;
  for (let i = startDay; i <= 365; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dateKey(d);
    const checkin = sorted.find(c => c.date === key);
    if (!checkin || !checkin.stuckToRules) break;
    streak++;
  }
  return streak;
}

// Summary for the week
export function getWeeklySummary(logs) {
  const stats = getWeeklyStats(logs);
  const totalSessions = stats.reduce((sum, d) => sum + d.sessions, 0);
  const totalCravings = stats.reduce((sum, d) => sum + d.cravings, 0);
  const totalNightWakes = stats.reduce((sum, d) => sum + d.nightWakes, 0);

  return {
    totalSessions,
    totalCravings,
    totalNightWakes,
    avgSessionsPerDay: (totalSessions / 7).toFixed(1),
  };
}
