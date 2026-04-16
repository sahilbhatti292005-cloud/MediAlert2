
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User, Medicine, MedicineLog, MedicineStatus, ActiveReminder } from './types';
import { StorageService } from './services/storage';
import { NotificationService } from './services/notification';
import { onAuthChange, logoutUser } from './services/auth';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AddEditMedicine from './pages/AddEditMedicine';
import History from './pages/History';
import Support from './pages/Support';
import Auth from './pages/Auth';
import ReminderModal from './components/ReminderModal';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [logs, setLogs] = useState<MedicineLog[]>([]);
  const [activeReminder, setActiveReminder] = useState<ActiveReminder | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Initialize and listen for Auth changes
  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        const u: User = { 
          id: firebaseUser.uid, 
          name: firebaseUser.displayName || 'User', 
          email: firebaseUser.email || '' 
        };
        setUser(u);
        setMedicines(StorageService.getMedicines().filter(m => m.userId === u.id));
        setLogs(StorageService.getLogs().filter(l => l.userId === u.id));
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
        // Check if medicine is active today
        if (med.startDate > today) return;
        if (med.endDate && med.endDate < today) return;

        med.times.forEach(time => {
          if (time === currentTime) {
            // Check if already handled for today
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

    const interval = setInterval(checkReminders, 15000); // Check every 15s
    return () => clearInterval(interval);
  }, [user, medicines, logs, activeReminder]);

  const handleLogin = () => {
    // Handled in Auth.tsx via Firebase service
  };

  const handleRegister = () => {
    // Handled in Auth.tsx via Firebase service
  };

  const handleLogout = async () => {
    const { error } = await logoutUser();
    if (error) alert(error);
  };

  const handleSaveMedicine = (med: Medicine) => {
    StorageService.saveMedicine(med);
    setMedicines(StorageService.getMedicines().filter(m => m.userId === user?.id));
  };

  const handleDeleteMedicine = (id: string) => {
    if (window.confirm('Are you sure you want to delete this medicine reminder?')) {
      StorageService.deleteMedicine(id);
      setMedicines(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleReminderAction = (status: MedicineStatus) => {
    if (!activeReminder || !user) return;

    if (status === MedicineStatus.SNOOZED) {
      // Simulate snooze by just clearing active reminder
      // In a real app, we'd add a 10 min offset
      setActiveReminder(null);
      return;
    }

    const log: MedicineLog = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      medicineId: activeReminder.medicine.id,
      date: new Date().toISOString().split('T')[0],
      time: activeReminder.time,
      status,
      timestamp: Date.now()
    };

    StorageService.saveLog(log);
    setLogs(prev => [...prev, log]);
    setActiveReminder(null);
  };

  if (!isReady) return null;

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
          <Route path="/support" element={<Support />} />
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
