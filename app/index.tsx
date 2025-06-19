import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Pressable, 
  Text, 
  Modal,
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';
import { Subscription, SubscriptionFormData } from '../types/subscription';
import SubscriptionList from '../components/SubscriptionList';
import SubscriptionForm from '../components/SubscriptionForm';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple ID generator
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export default function Index() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | undefined>();

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const stored = await AsyncStorage.getItem('subscriptions');
      if (stored) {
        const parsedSubscriptions = JSON.parse(stored);
        setSubscriptions(parsedSubscriptions);
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    }
  };

  const saveSubscriptions = async (newSubscriptions: Subscription[]) => {
    try {
      await AsyncStorage.setItem('subscriptions', JSON.stringify(newSubscriptions));
    } catch (error) {
      console.error('Error saving subscriptions:', error);
    }
  };

  const handleAddSubscription = (data: SubscriptionFormData) => {
    let newSubscriptions: Subscription[];
    
    if (editingSubscription) {
      newSubscriptions = subscriptions.map(sub => 
        sub.id === editingSubscription.id 
          ? { ...data, id: sub.id }
          : sub
      );
    } else {
      newSubscriptions = [...subscriptions, { ...data, id: generateId() }];
    }
    
    setSubscriptions(newSubscriptions);
    saveSubscriptions(newSubscriptions);
    setIsFormVisible(false);
    setEditingSubscription(undefined);
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setIsFormVisible(true);
  };

  const handleDeleteSubscription = (id: string) => {
    const newSubscriptions = subscriptions.filter(sub => sub.id !== id);
    setSubscriptions(newSubscriptions);
    saveSubscriptions(newSubscriptions);
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setEditingSubscription(undefined);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.title}>My Subscriptions</Text>
        <Pressable 
          style={styles.addButton}
          onPress={() => setIsFormVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </Pressable>
      </View>

      <SubscriptionList
        subscriptions={subscriptions}
        onEditSubscription={handleEditSubscription}
        onDeleteSubscription={handleDeleteSubscription}
      />

      <Modal
        visible={isFormVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <SubscriptionForm
              subscription={editingSubscription}
              onSubmit={handleAddSubscription}
              onCancel={handleCancel}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalContent: {
    flex: 1,
    backgroundColor: 'white',
  },
});
