export type Currency = 'CAD' | 'USD' | 'EUR' | 'GBP';
export type Frequency = 'monthly' | 'yearly' | 'quarterly' | 'weekly' | 'bi-weekly' | 'semi-annual';

export interface Subscription {
  id: string;
  name: string;
  price: number;
  currency: Currency;
  frequency: Frequency;
  includeTax: boolean;
  isFreeTrial: boolean;
  isCancelled: boolean;
  renewalDate: Date;
  iconUrl?: string;
}

export type SubscriptionFormData = Omit<Subscription, 'id'>; 