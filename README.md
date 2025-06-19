# Subscription Management App 📱

A React Native app built with Expo for tracking and managing your subscriptions. Keep track of your monthly expenses, renewal dates, and subscription details all in one place.

## Features

- 📋 **Subscription Tracking**: Add, edit, and delete subscriptions
- 💰 **Price Management**: Track prices in multiple currencies (CAD, USD, EUR, GBP)
- 📅 **Renewal Dates**: Never miss a renewal with automatic date calculations
- 🎯 **Billing Frequencies**: Support for monthly, yearly, quarterly, weekly, bi-weekly, and semi-annual billing
- 🏷️ **Service Icons**: Automatic logo fetching for subscription services
- 📊 **Expense Totals**: View your total monthly expenses by currency
- 🧪 **Free Trials**: Track free trial subscriptions separately
- ❌ **Cancelled Subscriptions**: Keep track of cancelled services

## Screenshots

### Main Subscription List
![Subscription List](images/Screenshot%202025-06-19%20152925.png)

### Add/Edit Subscription Form
![Subscription Form](images/Screenshot%202025-06-19%20152951.png)

### Subscription Details with Icons
![Subscription Details](images/Screenshot%202025-06-19%20153229.png)

### Monthly Totals View
![Monthly Totals](images/Screenshot%202025-06-19%20153250.png)

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm start
   ```

3. **Run on your preferred platform**
   - **Web**: Press `w` in the terminal
   - **Android**: Press `a` in the terminal or scan the QR code with Expo Go
   - **iOS**: Press `i` in the terminal or scan the QR code with Expo Go

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **Expo Router** for navigation
- **AsyncStorage** for local data persistence
- **date-fns** for date manipulation
- **Expo Vector Icons** for UI icons

## Project Structure

```
├── app/                    # Main app screens
│   ├── index.tsx          # Subscription list
│   ├── totals.tsx         # Monthly totals view
│   └── _layout.tsx        # Navigation layout
├── components/            # Reusable components
│   ├── SubscriptionForm.tsx
│   └── SubscriptionList.tsx
├── types/                 # TypeScript type definitions
│   └── subscription.ts
└── images/               # App screenshots
```

## Development

This project uses [file-based routing](https://docs.expo.dev/router/introduction) with Expo Router. You can start developing by editing the files inside the **app** directory.

## Learn More

- [Expo documentation](https://docs.expo.dev/)
- [React Native documentation](https://reactnative.dev/)
- [Expo Router documentation](https://docs.expo.dev/router/introduction/)

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
