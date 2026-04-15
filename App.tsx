
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User, Medicine, MedicineLog, MedicineStatus, ActiveReminder } from './types';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, setDoc, deleteDoc, getDocFromServer } from 'firebase/firestore';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AddEditMedicine from './pages/AddEditMedicine';
import History from './pages/History';
import Auth from './pages/Auth';
import ReminderModal from './components/ReminderModal';
import { NotificationService } from './services/notification';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [logs, setLogs] = useState<MedicineLog[]>([]);
  const [activeReminder, setActiveReminder] = useState<ActiveReminder | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Test connection to Firestore
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email || ''
        });
      } else {
        setUser(null);
        setMedicines([]);
        setLogs([]);
      }
      setIsReady(true);
    });

    NotificationService.requestPermission();
    return () => unsubscribe();
  }, []);

  // Real-time data listeners
  useEffect(() => {
    if (!user) return;

    const medQuery = query(collection(db, 'medicines'), where('userId', '==', user.id));
    const unsubMeds = onSnapshot(medQuery, (snapshot) => {
      const meds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Medicine));
      setMedicines(meds);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'medicines');
    });

    const logQuery = query(collection(db, 'logs'), where('userId', '==', user.id));
    const unsubLogs = onSnapshot(logQuery, (snapshot) => {
      const l = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MedicineLog));
      setLogs(l);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'logs');
    });

    return () => {
      unsubMeds();
      unsubLogs();
    };
  }, [user]);

  // Timer logic for reminders
  useEffect(() => {
    if (!user) return;

    const checkReminders = () => {
      if (activeReminder) return;

      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      const today = now.toISOString().split('T')[0];

      medicines.forEach(med => {
        if (med.startDate > today) return;
        if (med.endDate && med.endDate < today) return;

        med.times.forEach(time => {
          if (time === currentTime) {
            const alreadyLogged = logs.some(l => 
              l.medicineId === med.id && 
              l.date === today && 
              l.time === time
            );

            if (!alreadyLogged) {
              setActiveReminder({ medicine: med, time });
              NotificationService.showNotification(
                `Time to take ${med.name}`,
                `Dosage: ${med.dosage}`
              );
            }
          }
        });
      });
    };

    const interval = setInterval(checkReminders, 15000);
    return () => clearInterval(interval);
  }, [user, medicines, logs, activeReminder]);

  const handleLogin = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRegister = async (name: string, email: string, pass: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(cred.user, { displayName: name });
      
      // Create user document
      await setDoc(doc(db, 'users', cred.user.uid), {
        name,
        email,
        createdAt: Date.now()
      });

      setUser({ id: cred.user.uid, name, email });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error('Logout error', err);
    }
  };

  const handleSaveMedicine = async (med: Medicine) => {
    try {
      const medId = med.id || Math.random().toString(36).substr(2, 9);
      const medData = { ...med, id: medId, userId: user?.id };
      await setDoc(doc(db, 'medicines', medId), medData);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'medicines');
    }
  };

  const handleDeleteMedicine = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this medicine reminder?')) {
      try {
        await deleteDoc(doc(db, 'medicines', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, 'medicines');
      }
    }
  };

  const handleReminderAction = async (status: MedicineStatus) => {
    if (!activeReminder || !user) return;

    if (status === MedicineStatus.SNOOZED) {
      setActiveReminder(null);
      return;
    }

    const logId = Math.random().toString(36).substr(2, 9);
    const log: MedicineLog = {
      id: logId,
      userId: user.id,
      medicineId: activeReminder.medicine.id,
      date: new Date().toISOString().split('T')[0],
      time: activeReminder.time,
      status,
      timestamp: Date.now()
    };

    try {
      await setDoc(doc(db, 'logs', logId), log);
      setActiveReminder(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'logs');
    }
  };

  if (!isReady) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!user) {
    return <Auth onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <HashRouter>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard medicines={medicines} logs={logs} onDelete={handleDeleteMedicine} />} />
          <Route path="/add" element={<AddEditMedicine userId={user.id} onSave={handleSaveMedicine} existingMedicines={medicines} />} />
          <Route path="/edit/:id" element={<AddEditMedicine userId={user.id} onSave={handleSaveMedicine} existingMedicines={medicines} />} />
          <Route path="/history" element={<History logs={logs} medicines={medicines} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>

      {activeReminder && (
        <ReminderModal 
          reminder={activeReminder} 
          onAction={handleReminderAction} 
        />
      )}
    </HashRouter>
  );
};

export default App;
