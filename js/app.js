
import { db, auth } from './firebase-config.js';
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 1. Add Medicine
export const addMedicine = async (name, dosage, time) => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    await addDoc(collection(db, "medicines"), {
      userId: user.uid,
      name: name,
      dosage: dosage,
      time: time,
      createdAt: Date.now()
    });
  } catch (error) {
    console.error("Error adding document: ", error);
    alert("Error adding medicine: " + error.message);
  }
};

// 2. Fetch Medicines (Real-time)
export const getMedicines = (callback) => {
  const user = auth.currentUser;
  if (!user) return;

  const q = query(collection(db, "medicines"), where("userId", "==", user.uid));
  
  return onSnapshot(q, (snapshot) => {
    const medicines = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(medicines);
  }, (error) => {
    console.error("Firestore error:", error);
  });
};

// 3. Delete Medicine
export const deleteMedicine = async (id) => {
  try {
    await deleteDoc(doc(db, "medicines", id));
  } catch (error) {
    console.error("Delete error:", error);
    alert("Error deleting medicine: " + error.message);
  }
};
