// js/firebase-config.js
// Firebase configuration for Billwise Invoicing
export const firebaseConfig = {
  // TODO: Replace with your actual Firebase config from Firebase Console
  apiKey: "your-api-key-here",
  authDomain: "billwise-invoicing.firebaseapp.com", // or your custom domain
  projectId: "billwise-invoicing", // your project ID
  storageBucket: "billwise-invoicing.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};

// Environment detection for GitHub Pages
export const isProd = window.location.hostname === 'bonellieric98-sys.github.io';
export const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Base URL for your project
export const baseURL = isProd ? '/invoicing-project' : '';
