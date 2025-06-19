export type Currency = 'CAD' | 'USD' | 'EUR' | 'GBP';

export interface Subscription {
  id: string;
  name: string;
  price: number;
  currency: Currency;
  includeTax: boolean;
  isFreeTrial: boolean;
  isCancelled: boolean;
  renewalDate: Date;
  iconUrl?: string;
}

export type SubscriptionFormData = Omit<Subscription, 'id'>; 