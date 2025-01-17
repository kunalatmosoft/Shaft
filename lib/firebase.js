// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCjEZfKKBjCGoOCkOhg4rxq2Wne2Tk4WF8",
  authDomain: "oxpix-eb03f.firebaseapp.com",
  projectId: "oxpix-eb03f",
  storageBucket: "oxpix-eb03f.firebasestorage.app",
  messagingSenderId: "427711348171",
  appId: "1:427711348171:web:060cf8da986aeafe244a4e",
  measurementId: "G-KH48YL9C49"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
