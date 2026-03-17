# Exeter Marketplace

A campus marketplace app for buying and selling items. Includes a React web app and a React Native (Expo) mobile app, both backed by Firebase Firestore.

## Project Structure

```
exetermarketplace/
├── src/                    # React web app (Create React App)
├── mobile/                 # React Native / Expo mobile app
│   ├── src/
│   │   ├── components/
│   │   ├── config/
│   │   ├── context/
│   │   ├── navigation/
│   │   ├── screens/
│   │   ├── services/
│   │   └── theme/
│   ├── App.js
│   └── app.json
├── firebase.json           # Firebase CLI config
├── firestore.rules         # Firestore security rules
└── package.json            # Web app dependencies
```

## Firebase Configuration

The Firebase CLI expects `firebase.json` in the project root when you run `firebase deploy`. Both the web and mobile apps use the same Firestore database, so one set of rules at the root applies to both.

- **firebase.json** – Tells the Firebase CLI where Firestore rules live
- **firestore.rules** – Defines who can read/write items, conversations, and messages

## Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project
- (Mobile) Expo Go app on your device, or iOS/Android simulator

## Setup

### 1. Clone and install

```bash
# Web app
npm install

# Mobile app
cd mobile && npm install
```

### 2. Firebase

Create a Firebase project at [Firebase Console](https://console.firebase.google.com), enable Firestore, and add a web app to get your config.

Create `.env` in the project root (web) and configure Firebase in `mobile/src/config/firebase.js` with your project credentials.

### 3. Deploy Firestore rules (optional)

```bash
firebase deploy --only firestore
```

## Running the Apps

### Web app

```bash
npm start
```

Opens at [http://localhost:3000](http://localhost:3000).

### Mobile app

```bash
cd mobile
npm start
```

Then scan the QR code with Expo Go (Android) or the Camera app (iOS), or press `a` for Android emulator / `i` for iOS simulator.

## Features

- **Items** – Browse, post, edit, and mark items as sold
- **Photos** – Optional; supports multiple photos, camera capture, and gallery selection
- **Watchlist** – Save favorites (stored locally)
- **Messaging** – Real-time chat between buyers and sellers
- **Push notifications** – New message alerts (mobile)
- **Auth** – Sign in with email/password via Firebase Auth

## Tech Stack

| Layer   | Web              | Mobile                    |
|---------|------------------|---------------------------|
| Framework | React (CRA)     | React Native + Expo       |
| Backend | Firebase Firestore | Firebase Firestore     |
| Auth    | Firebase Auth   | Firebase Auth             |
| Navigation | React Router | React Navigation          |