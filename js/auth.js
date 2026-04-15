
import { auth } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// 1. Register User
export const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Registered:", userCredential.user);
    window.location.href = "dashboard.html";
  } catch (error) {
    alert("Error: " + error.message);
  }
};

// 2. Login User
export const loginUser = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "dashboard.html";
  } catch (error) {
    alert("Login failed: " + error.message);
  }
};

// 3. Logout User
export const logoutUser = async () => {
  try {
    await signOut(auth);
    window.location.href = "index.html";
  } catch (error) {
    console.error("Logout error:", error);
  }
};

// 4. Check Auth State
export const checkAuth = (callback) => {
  onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};
