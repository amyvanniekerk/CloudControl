import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MoneySavedCard({ purchases }) {
  if (!purchases || purchases.length === 0) return null;

  const totalSpent = purchases.reduce((sum, p) => sum + p.amount, 0);
  const firstPurchase = new Date(purchases[0].timestamp);
  const daysSinceFirst = Math.max(1, Math.floor((Date.now() - firstPurchase.getTime()) / (24 * 60 * 60 * 1000)));

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Total Spent on Vapes</Text>
      <Text style={styles.amount}>${totalSpent.toFixed(2)}</Text>
      <Text style={styles.sub}>
        {purchases.length} purchase{purchases.length !== 1 ? 's' : ''} over {daysSinceFirst} day{daysSinceFirst !== 1 ? 's' : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    alignItems: 'center',
    shadowColor: '#9C27B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  amount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#EF5350',
  },
  sub: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});
