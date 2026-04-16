
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration provided by the user
const firebaseConfig = {
  apiKey: "AIzaSyBG7Y8ib5_LPBb0qT72toltKWGCpVfcSV8",
  authDomain: "medicinereminder-fcaff.firebaseapp.com",
  projectId: "medicinereminder-fcaff",
  storageBucket: "medicinereminder-fcaff.firebasestorage.app",
  messagingSenderId: "135357689133",
  appId: "1:135357689133:web:dacf1ba0794e241a1937a4",
  measurementId: "G-9MGVVDM6KK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;
