// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyD9SrWqQVL0_GxfBISBBezUOqQMbE_fiRU",
  authDomain: "invoicing-platform-f29ac.firebaseapp.com",
  projectId: "invoicing-platform-f29ac",
  storageBucket: "invoicing-platform-f29ac.firebasestorage.app",
  messagingSenderId: "632172765378",
  appId: "1:632172765378:web:072134627a2226ddab9b5b",
  measurementId: "G-NSK0H0SQBE"
};

// Environment detection for GitHub Pages
export const isProd = window.location.hostname === 'bonellieric98-sys.github.io';
export const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Base URL for your project
export const baseURL = isProd ? '/invoicing-project' : '';
