import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Switch, 
  StyleSheet, 
  Pressable,
  Platform,
  KeyboardType,
  ScrollView,
  SafeAreaView,
  Image,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { Subscription, SubscriptionFormData, Currency } from '../../types/subscription';

const CURRENCIES: Currency[] = ['CAD', 'USD', 'EUR', 'GBP'];
const CURRENCY_SYMBOLS: Record<Currency, string> = {
  CAD: 'C$',
  USD: '$',
  EUR: '€',
  GBP: '£'
};

interface IconResult {
  id: string;
  url: string;
  title: string;
}

interface SubscriptionFormProps {
  subscription?: Subscription;
  onSubmit: (data: SubscriptionFormData) => void;
  onCancel: () => void;
}

export default function SubscriptionForm({ 
  subscription, 
  onSubmit, 
  onCancel 
}: SubscriptionFormProps) {
  const [name, setName] = useState(subscription?.name || '');
  const [price, setPrice] = useState(subscription?.price?.toString() || '');
  const [currency, setCurrency] = useState<Currency>(subscription?.currency || 'CAD');
  const [includeTax, setIncludeTax] = useState(subscription?.includeTax || false);
  const [isFreeTrial, setIsFreeTrial] = useState(subscription?.isFreeTrial || false);
  const [isCancelled, setIsCancelled] = useState(subscription?.isCancelled || false);
  const [renewalDate, setRenewalDate] = useState(
    subscription?.renewalDate || new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string>('');
  const [iconResults, setIconResults] = useState<IconResult[]>([]);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleNameChange = (text: string) => {
    setName(text);
    
    if (!text.trim()) {
      setIconResults([]);
      setIsSearching(false);
      return;
    }

    // Clear any existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set searching state
    setIsSearching(true);

    // Set a new 1-second debounce timeout
    const timeoutId = setTimeout(() => {
      const searchTerm = text.toLowerCase().trim();
      const cleanName = searchTerm.replace(/\s+/g, '');
      
      const iconOptions: IconResult[] = [
        {
          id: 'logo-1',
          url: `https://logo.clearbit.com/${cleanName}.com?size=64`,
          title: searchTerm
        }
      ];

      setIconResults(iconOptions);
      setIsSearching(false);
    }, 1000); // 1 second debounce

    setSearchTimeout(timeoutId);
  };

  const handlePriceChange = (text: string) => {
    // Remove any non-numeric characters except decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      setPrice(parts[0] + '.' + parts.slice(1).join(''));
    } else {
      setPrice(cleaned);
    }
  };

  const handleSubmit = () => {
    const priceValue = parseFloat(price) || 0;
    onSubmit({
      name,
      price: priceValue,
      currency,
      includeTax,
      isFreeTrial,
      isCancelled,
      renewalDate,
      iconUrl: selectedIcon,
    });
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(event.target.value);
    setRenewalDate(date);
  };

  const renderIconItem = ({ item }: { item: IconResult }) => (
    <Pressable
      style={styles.iconItem}
      onPress={() => setSelectedIcon(item.url)}
    >
      <Image
        source={{ uri: item.url }}
        style={styles.iconImage}
        resizeMode="contain"
      />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={onCancel} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>
        <Text style={styles.headerTitle}>
          {subscription ? 'Edit Subscription' : 'Add Subscription'}
        </Text>
        <View style={styles.closeButton} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Service Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={handleNameChange}
              placeholder="Enter service name"
            />
          </View>

          {/* Icon Selection */}
          {name.trim() && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Service Icon</Text>
              {selectedIcon && (
                <View style={styles.selectedIconContainer}>
                  <Image
                    source={{ uri: selectedIcon }}
                    style={styles.selectedIcon}
                    resizeMode="contain"
                  />
                  <Pressable
                    style={styles.changeIconButton}
                    onPress={() => setSelectedIcon('')}
                  >
                    <Text style={styles.changeIconText}>Change</Text>
                  </Pressable>
                </View>
              )}
              {!selectedIcon && (
                <View style={styles.iconSearchContainer}>
                  {isSearching ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#1976d2" />
                      <Text style={styles.loadingText}>Searching for logo...</Text>
                    </View>
                  ) : (
                    <FlatList
                      data={iconResults}
                      renderItem={renderIconItem}
                      keyExtractor={(item) => item.id}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.iconList}
                      contentContainerStyle={styles.iconListContent}
                    />
                  )}
                </View>
              )}
            </View>
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Price</Text>
            <View style={styles.priceContainer}>
              <View style={styles.currencySelector}>
                <Pressable
                  style={styles.currencyButton}
                  onPress={() => {
                    const currentIndex = CURRENCIES.indexOf(currency);
                    const nextIndex = (currentIndex + 1) % CURRENCIES.length;
                    setCurrency(CURRENCIES[nextIndex]);
                  }}
                >
                  <Text style={styles.currencyButtonText}>{CURRENCY_SYMBOLS[currency]}</Text>
                </Pressable>
              </View>
              <TextInput
                style={[styles.input, styles.priceInput]}
                value={price}
                onChangeText={handlePriceChange}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.switchGroup}>
            <Text style={styles.label}>Include Tax</Text>
            <Switch
              value={includeTax}
              onValueChange={setIncludeTax}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={includeTax ? '#1976d2' : '#f4f3f4'}
            />
          </View>

          <View style={styles.switchGroup}>
            <Text style={styles.label}>Free Trial</Text>
            <Switch
              value={isFreeTrial}
              onValueChange={setIsFreeTrial}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isFreeTrial ? '#1976d2' : '#f4f3f4'}
            />
          </View>

          <View style={styles.switchGroup}>
            <Text style={styles.label}>Cancelled</Text>
            <Switch
              value={isCancelled}
              onValueChange={setIsCancelled}
              trackColor={{ false: '#767577', true: '#ffb0b0' }}
              thumbColor={isCancelled ? '#d32f2f' : '#f4f3f4'}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              {isCancelled ? 'End Date' : 'Renewal Date'}
            </Text>
            <Pressable 
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {renewalDate.toLocaleDateString()}
              </Text>
            </Pressable>
            {showDatePicker && Platform.OS === 'web' && (
              <input
                type="date"
                value={renewalDate.toISOString().split('T')[0]}
                onChange={handleDateChange}
                min={new Date().toISOString().split('T')[0]}
                style={styles.webDateInput}
              />
            )}
          </View>

          <View style={styles.buttonGroup}>
            <Pressable 
              style={[styles.button, styles.submitButton]} 
              onPress={handleSubmit}
            >
              <Text style={[styles.buttonText, styles.submitButtonText]}>
                {subscription ? 'Save' : 'Add'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
    fontWeight: '300',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  submitButton: {
    backgroundColor: '#1976d2',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  submitButtonText: {
    color: 'white',
  },
  webDateInput: {
    marginTop: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    fontSize: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySelector: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRightWidth: 0,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  currencyButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  currencyButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  priceInput: {
    flex: 1,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  iconSearchContainer: {
    marginTop: 8,
  },
  iconList: {
    maxHeight: 80,
  },
  iconListContent: {
    paddingHorizontal: 8,
  },
  iconItem: {
    marginHorizontal: 4,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  iconImage: {
    width: 48,
    height: 48,
  },
  selectedIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  selectedIcon: {
    width: 48,
    height: 48,
    marginRight: 12,
  },
  changeIconButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
  },
  changeIconText: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
}); 