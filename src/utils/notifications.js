import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

const MOTIVATION_QUOTES = [
  "Every craving you resist makes the next one weaker.",
  "You are stronger than your urges.",
  "One day at a time. You've got this.",
  "Your lungs are healing right now.",
  "Remember why you started this journey.",
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "Take care of your body. It's the only place you have to live.",
  "It is health that is real wealth and not pieces of gold and silver.",
];

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestPermissions() {
  if (!Device.isDevice) return false;
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }
  return true;
}

export async function scheduleDailyReminder(timeStr) {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const [hourStr, minuteStr] = timeStr.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  // Daily check-in reminder
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'CloudControl Check-in',
      body: 'Did you stick to the rules today? Open the app to log your check-in.',
    },
    trigger: {
      type: 'daily',
      hour,
      minute,
    },
  });

  // Morning motivation (1 hour before check-in)
  const motiveHour = hour > 0 ? hour - 1 : 23;
  const quote = MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)];
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Daily Motivation',
      body: quote,
    },
    trigger: {
      type: 'daily',
      hour: motiveHour,
      minute: 0,
    },
  });
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
