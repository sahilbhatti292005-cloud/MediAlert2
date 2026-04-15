
// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
export const auth = getAuth(app);
export const db = getFirestore(app);
