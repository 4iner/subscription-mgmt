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
  ActivityIndicator,
  Modal
} from 'react-native';
import { Subscription, SubscriptionFormData, Currency, Frequency } from '../types/subscription';

const CURRENCIES: Currency[] = ['CAD', 'USD', 'EUR', 'GBP'];
const CURRENCY_SYMBOLS: Record<Currency, string> = {
  CAD: 'C$',
  USD: '$',
  EUR: '€',
  GBP: '£'
};

const FREQUENCIES: Frequency[] = ['monthly', 'yearly', 'quarterly', 'weekly', 'bi-weekly', 'semi-annual'];
const FREQUENCY_LABELS: Record<Frequency, string> = {
  'monthly': 'Monthly',
  'yearly': 'Yearly',
  'quarterly': 'Quarterly',
  'weekly': 'Weekly',
  'bi-weekly': 'Bi-weekly',
  'semi-annual': 'Semi-annual'
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

// Function to calculate next renewal date based on frequency
const calculateNextRenewalDate = (frequency: Frequency, fromDate: Date = new Date()): Date => {
  const nextDate = new Date(fromDate);
  
  switch (frequency) {
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'bi-weekly':
      nextDate.setDate(nextDate.getDate() + 14);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'quarterly':
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case 'semi-annual':
      nextDate.setMonth(nextDate.getMonth() + 6);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    default:
      nextDate.setMonth(nextDate.getMonth() + 1);
  }
  
  return nextDate;
};

// Function to calculate next renewal date from current renewal date
const calculateNextRenewalFromCurrent = (frequency: Frequency, currentRenewalDate: Date): Date => {
  const nextDate = new Date(currentRenewalDate);
  
  switch (frequency) {
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'bi-weekly':
      nextDate.setDate(nextDate.getDate() + 14);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'quarterly':
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case 'semi-annual':
      nextDate.setMonth(nextDate.getMonth() + 6);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    default:
      nextDate.setMonth(nextDate.getMonth() + 1);
  }
  
  return nextDate;
};

export default function SubscriptionForm({ 
  subscription, 
  onSubmit, 
  onCancel 
}: SubscriptionFormProps) {
  const [name, setName] = useState(subscription?.name || '');
  const [price, setPrice] = useState(subscription?.price?.toString() || '');
  const [currency, setCurrency] = useState<Currency>(subscription?.currency || 'CAD');
  const [frequency, setFrequency] = useState<Frequency>(subscription?.frequency || 'monthly');
  const [includeTax, setIncludeTax] = useState(subscription?.includeTax || false);
  const [isFreeTrial, setIsFreeTrial] = useState(subscription?.isFreeTrial || false);
  const [isCancelled, setIsCancelled] = useState(subscription?.isCancelled || false);
  const [renewalDate, setRenewalDate] = useState(
    subscription?.renewalDate ? new Date(subscription.renewalDate) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string>('');
  const [iconResults, setIconResults] = useState<IconResult[]>([]);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [noIconFound, setNoIconFound] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Update renewal date when frequency changes (only for existing subscriptions)
  useEffect(() => {
    if (subscription) {
      // For existing subscriptions, calculate next renewal date based on current frequency
      setRenewalDate(calculateNextRenewalDate(frequency));
    }
  }, [frequency, subscription]);

  const handleNameChange = (text: string) => {
    setName(text);
    
    if (!text.trim()) {
      setIconResults([]);
      setIsSearching(false);
      setNoIconFound(false);
      return;
    }

    // Clear any existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set searching state
    setIsSearching(true);
    setNoIconFound(false);

    // Set a new 1-second debounce timeout
    const timeoutId = setTimeout(() => {
      const searchTerm = text.toLowerCase().trim();
      const cleanName = searchTerm.replace(/\s+/g, '');
      
      const logoUrl = `https://logo.clearbit.com/${cleanName}.com?size=64`;
      
      const iconOptions: IconResult[] = [
        {
          id: 'logo-1',
          url: logoUrl,
          title: searchTerm
        }
      ];

      setIconResults(iconOptions);
      setIsSearching(false);
    }, 1000); // 1 second debounce

    setSearchTimeout(timeoutId);
  };

  const handleIconError = () => {
    setNoIconFound(true);
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
      frequency,
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

  const handleMobileDateChange = (year: number, month: number, day: number) => {
    const date = new Date(year, month - 1, day);
    setRenewalDate(date);
    setShowDatePicker(false);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date: Date) => {
    return renewalDate.getDate() === date.getDate() &&
           renewalDate.getMonth() === date.getMonth() &&
           renewalDate.getFullYear() === date.getFullYear();
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const selectDate = (date: Date) => {
    if (!isPastDate(date)) {
      setRenewalDate(date);
      setShowDatePicker(false);
    }
  };

  const renderDatePicker = () => {
    if (Platform.OS === 'web') {
      return (
        <input
          type="date"
          value={renewalDate.toISOString().split('T')[0]}
          onChange={handleDateChange}
          min={new Date().toISOString().split('T')[0]}
          style={styles.webDateInput}
        />
      );
    }

    // Custom mobile date picker
    const days = getDaysInMonth(currentMonth);
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarTitle}>Select Date</Text>
              <Pressable 
                onPress={() => setShowDatePicker(false)}
                style={styles.calendarCloseButton}
              >
                <Text style={styles.calendarClose}>✕</Text>
              </Pressable>
            </View>
            
            <View style={styles.calendarContent}>
              {/* Month Navigation */}
              <View style={styles.monthNavigation}>
                <Pressable 
                  style={styles.navButton}
                  onPress={() => changeMonth('prev')}
                >
                  <Text style={styles.navButtonText}>‹</Text>
                </Pressable>
                <Text style={styles.monthTitle}>
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </Text>
                <Pressable 
                  style={styles.navButton}
                  onPress={() => changeMonth('next')}
                >
                  <Text style={styles.navButtonText}>›</Text>
                </Pressable>
              </View>

              {/* Day Headers */}
              <View style={styles.dayHeaders}>
                {dayNames.map(day => (
                  <Text key={day} style={styles.dayHeader}>
                    {day}
                  </Text>
                ))}
              </View>

              {/* Calendar Grid */}
              <View style={styles.calendarGrid}>
                {days.map((date, index) => (
                  <View key={index} style={styles.dayCell}>
                    {date ? (
                      <Pressable
                        style={[
                          styles.dayButton,
                          isToday(date) && styles.todayButton,
                          isSelected(date) && styles.selectedButton,
                          isPastDate(date) && styles.pastDateButton
                        ]}
                        onPress={() => selectDate(date)}
                        disabled={isPastDate(date)}
                      >
                        <Text style={[
                          styles.dayText,
                          isToday(date) && styles.todayText,
                          isSelected(date) && styles.selectedText,
                          isPastDate(date) && styles.pastDateText
                        ]}>
                          {date.getDate()}
                        </Text>
                      </Pressable>
                    ) : (
                      <View style={styles.emptyCell} />
                    )}
                  </View>
                ))}
              </View>
            </View>
            
            <View style={styles.calendarFooter}>
              <Pressable 
                style={styles.calendarButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.calendarButtonText}>Cancel</Text>
              </Pressable>
              <Pressable 
                style={[styles.calendarButton, styles.calendarButtonPrimary]}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={[styles.calendarButtonText, styles.calendarButtonTextPrimary]}>
                  Confirm
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
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
        onError={handleIconError}
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
                  ) : noIconFound ? (
                    <View style={styles.noIconContainer}>
                      <View style={styles.noIconPlaceholder}>
                        <Text style={styles.noIconText}>?</Text>
                      </View>
                      <Text style={styles.noIconMessage}>No logo found for "{name}"</Text>
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

          <View style={styles.formGroup}>
            <Text style={styles.label}>Billing Frequency</Text>
            <View style={styles.frequencyContainer}>
              {FREQUENCIES.map((freq) => (
                <Pressable
                  key={freq}
                  style={[
                    styles.frequencyButton,
                    frequency === freq && styles.frequencyButtonActive
                  ]}
                  onPress={() => {
                    setFrequency(freq);
                    // Update renewal date based on new frequency (only for existing subscriptions)
                    if (subscription) {
                      // For existing subscriptions, calculate from current renewal date
                      setRenewalDate(calculateNextRenewalFromCurrent(freq, renewalDate));
                    }
                  }}
                >
                  <Text style={[
                    styles.frequencyButtonText,
                    frequency === freq && styles.frequencyButtonTextActive
                  ]}>
                    {FREQUENCY_LABELS[freq]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.switchGroup}>
            <Text style={styles.label}>Add Tax (13%)</Text>
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
                {renewalDate ? renewalDate.toLocaleDateString() : 'Select Date'}
              </Text>
            </Pressable>
            {!isCancelled && subscription && (
              <Text style={styles.helperText}>
                Automatically calculated based on {FREQUENCY_LABELS[frequency].toLowerCase()} billing cycle
              </Text>
            )}
            {showDatePicker && renderDatePicker()}
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
  noIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  noIconPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  noIconText: {
    fontSize: 20,
    color: '#999',
    fontWeight: 'bold',
  },
  noIconMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  frequencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  frequencyButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 80,
    alignItems: 'center',
  },
  frequencyButtonActive: {
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
  },
  frequencyButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  frequencyButtonTextActive: {
    color: 'white',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  calendarTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  calendarCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarClose: {
    fontSize: 18,
    color: '#666',
    fontWeight: '300',
  },
  calendarFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  calendarButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 8,
    alignItems: 'center',
  },
  calendarButtonPrimary: {
    backgroundColor: '#1976d2',
  },
  calendarButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  calendarButtonTextPrimary: {
    color: 'white',
  },
  calendarContent: {
    paddingHorizontal: 16,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    fontSize: 20,
    color: '#1976d2',
    fontWeight: '600',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 2,
  },
  dayButton: {
    flex: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  todayButton: {
    backgroundColor: '#e3f2fd',
    borderWidth: 2,
    borderColor: '#1976d2',
  },
  selectedButton: {
    backgroundColor: '#1976d2',
  },
  pastDateButton: {
    backgroundColor: '#f5f5f5',
  },
  dayText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '400',
  },
  todayText: {
    color: '#1976d2',
    fontWeight: '600',
  },
  selectedText: {
    color: 'white',
    fontWeight: '600',
  },
  pastDateText: {
    color: '#ccc',
  },
  emptyCell: {
    flex: 1,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
}); 