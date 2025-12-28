import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export default function StreakCounter({ userId }) {
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateStreak();
  }, [userId]);

  const calculateStreak = async () => {
    if (!userId) return;

    try {
      const sessionsRef = collection(db, 'sessions');
      const q = query(
        sessionsRef,
        where('userId', '==', userId),
        where('completed', '==', true)
      );

      const snapshot = await getDocs(q);
      const sessions = snapshot.docs.map(doc => ({
        ...doc.data(),
        startTime: doc.data().startTime?.toDate()
      }));

      // Grouper par jour
      const days = {};
      sessions.forEach(session => {
        if (session.startTime) {
          const dateKey = session.startTime.toDateString();
          days[dateKey] = true;
        }
      });

      // Calculer streak
      const sortedDays = Object.keys(days).sort((a, b) => 
        new Date(b) - new Date(a)
      );

      let currentStreak = 0;
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      // Si aujourd'hui ou hier a une session, commencer le compte
      if (sortedDays[0] === today || sortedDays[0] === yesterday) {
        for (let i = 0; i < sortedDays.length; i++) {
          const expected = new Date(Date.now() - i * 86400000).toDateString();
          if (sortedDays[i] === expected) {
            currentStreak++;
          } else {
            break;
          }
        }
      }

      setStreak(currentStreak);
      setLoading(false);
    } catch (error) {
      console.error('Erreur calcul streak:', error);
      setLoading(false);
    }
  };

  if (loading) return null;

  return (
    <div className="streak-counter">
      <div className="streak-flame">🔥</div>
      <div className="streak-content">
        <div className="streak-number">{streak}</div>
        <div className="streak-label">jour{streak > 1 ? 's' : ''} de suite</div>
      </div>
    </div>
  );
}

