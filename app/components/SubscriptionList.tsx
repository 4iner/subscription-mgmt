import React from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Image } from 'react-native';
import { Subscription, Currency } from '../../types/subscription';
import { format } from 'date-fns';

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  CAD: 'C$',
  USD: '$',
  EUR: '€',
  GBP: '£'
};

interface SubscriptionListProps {
  subscriptions: Subscription[];
  onEditSubscription: (subscription: Subscription) => void;
  onDeleteSubscription: (id: string) => void;
}

export default function SubscriptionList({ 
  subscriptions, 
  onEditSubscription, 
  onDeleteSubscription 
}: SubscriptionListProps) {
  const formatPrice = (price: number, currency: Currency, includeTax: boolean) => {
    const formattedPrice = new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
    
    return `${formattedPrice}${includeTax ? ' (incl. tax)' : ''}`;
  };

  const renderSubscription = ({ item }: { item: Subscription }) => (
    <Pressable 
      style={styles.subscriptionItem}
      onPress={() => onEditSubscription(item)}
    >
      <View style={styles.subscriptionHeader}>
        <View style={styles.titleContainer}>
          <View style={styles.nameContainer}>
            {item.iconUrl && (
              <Image
                source={{ uri: item.iconUrl }}
                style={styles.serviceIcon}
                resizeMode="contain"
              />
            )}
            <Text style={styles.subscriptionName}>{item.name}</Text>
          </View>
          <Text style={styles.subscriptionPrice}>
            {formatPrice(item.price, item.currency, item.includeTax)}
          </Text>
        </View>
        <Pressable 
          onPress={() => onDeleteSubscription(item.id)}
          style={styles.deleteButton}
        >
          <Text style={styles.deleteButtonText}>×</Text>
        </Pressable>
      </View>
      
      <View style={styles.subscriptionDetails}>
        {item.isFreeTrial && (
          <Text style={styles.freeTrialBadge}>Free Trial</Text>
        )}
        {item.isCancelled && (
          <Text style={styles.cancelledBadge}>Cancelled</Text>
        )}
        <Text style={styles.dateText}>
          {item.isCancelled ? 'Ends' : 'Renews'} on {format(item.renewalDate, 'MMM d, yyyy')}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <FlatList
      data={subscriptions}
      renderItem={renderSubscription}
      keyExtractor={(item) => item.id}
      style={styles.list}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  subscriptionItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subscriptionName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  subscriptionPrice: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 24,
    color: '#ff4444',
    fontWeight: 'bold',
  },
  subscriptionDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  freeTrialBadge: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  cancelledBadge: {
    backgroundColor: '#ffebee',
    color: '#d32f2f',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  dateText: {
    color: '#666',
    fontSize: 14,
  },
  serviceIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
    borderRadius: 4,
  },
}); 