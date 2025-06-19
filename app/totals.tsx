import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView,
  Platform
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Subscription, Currency, Frequency } from '../types/subscription';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  CAD: 'C$',
  USD: '$',
  EUR: '€',
  GBP: '£'
};

// Frequency multipliers to convert to monthly equivalent
const FREQUENCY_MULTIPLIERS: Record<Frequency, number> = {
  'weekly': 4.33, // 52 weeks / 12 months
  'bi-weekly': 2.17, // 26 bi-weeks / 12 months
  'monthly': 1,
  'quarterly': 1/3,
  'semi-annual': 1/6,
  'yearly': 1/12
};

interface MonthlyTotals {
  [currency: string]: number;
}

interface TotalsBreakdown {
  total: MonthlyTotals;
  active: MonthlyTotals;
  cancelled: MonthlyTotals;
  freeTrials: number;
  totalSubscriptions: number;
}

export default function Totals() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [totals, setTotals] = useState<TotalsBreakdown>({
    total: {},
    active: {},
    cancelled: {},
    freeTrials: 0,
    totalSubscriptions: 0
  });

  const loadSubscriptions = async () => {
    try {
      const stored = await AsyncStorage.getItem('subscriptions');
      if (stored) {
        const parsedSubscriptions = JSON.parse(stored);
        setSubscriptions(parsedSubscriptions);
      } else {
        setSubscriptions([]);
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      setSubscriptions([]);
    }
  };

  // Load subscriptions when component mounts
  useEffect(() => {
    loadSubscriptions();
  }, []);

  // Reload subscriptions when tab comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadSubscriptions();
    }, [])
  );

  useEffect(() => {
    calculateTotals();
  }, [subscriptions]);

  const calculateTotals = () => {
    const newTotals: TotalsBreakdown = {
      total: {},
      active: {},
      cancelled: {},
      freeTrials: 0,
      totalSubscriptions: subscriptions.length
    };

    subscriptions.forEach(subscription => {
      const currency = subscription.currency;
      const price = subscription.price || 0;
      const frequency = subscription.frequency || 'monthly';
      
      // Convert to monthly equivalent
      let monthlyPrice = price * FREQUENCY_MULTIPLIERS[frequency];
      
      // Apply tax if includeTax is checked (13% tax rate)
      if (subscription.includeTax) {
        monthlyPrice = monthlyPrice * 1.13; // Add 13% tax
      }

      // Add to total
      newTotals.total[currency] = (newTotals.total[currency] || 0) + monthlyPrice;

      // Add to active or cancelled
      if (subscription.isCancelled) {
        newTotals.cancelled[currency] = (newTotals.cancelled[currency] || 0) + monthlyPrice;
      } else {
        newTotals.active[currency] = (newTotals.active[currency] || 0) + monthlyPrice;
      }

      // Count free trials
      if (subscription.isFreeTrial) {
        newTotals.freeTrials++;
      }
    });

    setTotals(newTotals);
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = CURRENCY_SYMBOLS[currency as Currency] || currency;
    return `${symbol}${amount.toFixed(2)}`;
  };

  const renderCurrencyBreakdown = (data: MonthlyTotals, title: string) => {
    const currencies = Object.keys(data);
    if (currencies.length === 0) return null;

    return (
      <View style={styles.breakdownSection}>
        <Text style={styles.breakdownTitle}>{title}</Text>
        {currencies.map(currency => (
          <View key={currency} style={styles.currencyRow}>
            <Text style={styles.currencyLabel}>{currency}</Text>
            <Text style={styles.currencyAmount}>
              {formatCurrency(data[currency], currency)}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Summary Cards */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Subscriptions</Text>
              <Text style={styles.summaryValue}>{totals.totalSubscriptions}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Free Trials</Text>
              <Text style={styles.summaryValue}>{totals.freeTrials}</Text>
            </View>
          </View>

          {/* Monthly Totals */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Monthly Totals</Text>
            <Text style={styles.sectionSubtitle}>
              All subscription costs converted to monthly equivalent
            </Text>
            {renderCurrencyBreakdown(totals.total, 'Total Monthly Cost')}
          </View>

          {/* Active Subscriptions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Subscriptions</Text>
            {renderCurrencyBreakdown(totals.active, 'Active Monthly Cost')}
          </View>

          {/* Cancelled Subscriptions */}
          {Object.keys(totals.cancelled).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cancelled Subscriptions</Text>
              {renderCurrencyBreakdown(totals.cancelled, 'Cancelled Monthly Cost')}
            </View>
          )}

          {/* No subscriptions message */}
          {totals.totalSubscriptions === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No subscriptions yet. Add some subscriptions to see your monthly totals!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  breakdownSection: {
    marginBottom: 16,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  currencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  currencyLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  currencyAmount: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
}); 