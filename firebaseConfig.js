// firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD5lHcxRgaVIWd-64xCVMPpZrKOUnrynHo",
  authDomain: "movie-app-system-dc677.firebaseapp.com",
  projectId: "movie-app-system-dc677",
  storageBucket: "movie-app-system-dc677.firebasestorage.app",
  messagingSenderId: "291898286013",
  appId: "1:291898286013:web:95c999e0a9f1e87a57bcd4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };