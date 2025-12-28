import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export default function AnalyticsHeatmap({ userId }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bestSlot, setBestSlot] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, [userId]);

const fetchSessions = async () => {
  try {
    const sessionsRef = collection(db, 'sessions');

    // Récupérer TOUTES les sessions (completed ET interrupted)
    const q = query(
      sessionsRef,
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    const sessionsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startTime: doc.data().startTime?.toDate()
    }));

    // NOUVEAU : Trier par date décroissante (plus récentes en premier)
    sessionsData.sort((a, b) => {
      if (!a.startTime || !b.startTime) return 0;
      return b.startTime.getTime() - a.startTime.getTime();
    });

    setSessions(sessionsData);
    calculateBestSlot(sessionsData);
    setLoading(false);
  } catch (error) {
    console.error('Erreur chargement sessions:', error);
    setLoading(false);
  }
};


  const calculateBestSlot = (sessionsData) => {
    if (sessionsData.length === 0) return;

    const hourlyStats = {};
    
    sessionsData.forEach(session => {
      if (session.startTime) {
        const day = session.startTime.getDay();
        const hour = session.startTime.getHours();
        const key = `${day}-${hour}`;
        
        if (!hourlyStats[key]) {
          hourlyStats[key] = { day, hour, minutes: 0, count: 0 };
        }
        
        hourlyStats[key].minutes += session.duration;
        hourlyStats[key].count += 1;
      }
    });

    let maxMinutes = 0;
    let best = null;

    Object.values(hourlyStats).forEach(slot => {
      if (slot.minutes > maxMinutes) {
        maxMinutes = slot.minutes;
        best = slot;
      }
    });

    setBestSlot(best);
  };

  const getDayName = (day) => {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[day];
  };

  const getStatusBadge = (session) => {
    if (session.completed) {
      return <span style={{color: '#2ed573'}}>✅ Complétée</span>;
    } else if (session.interrupted) {
      return <span style={{color: '#ff4757'}}>⚠️ Interrompue</span>;
    } else {
      return <span style={{color: '#f1f2f6'}}>⏱️ En cours</span>;
    }
  };

  if (loading) {
    return (
      <div className="analytics-section">
        <h2>📊 Votre Productivité Visualisée</h2>
        <p>Chargement des données...</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="analytics-section">
        <h2>📊 Votre Productivité Visualisée</h2>
        <p>Aucune session pour le moment.</p>
        <p>Complétez votre première session pour voir vos statistiques.</p>
      </div>
    );
  }

  const completedCount = sessions.filter(s => s.completed).length;
  const interruptedCount = sessions.filter(s => s.interrupted).length;
  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);

  return (
    <div className="analytics-section">
      <h2>📊 Votre Productivité Visualisée</h2>
      
      <div className="insights-cards">
        <div className="insight-card">
          <span className="icon">📈</span>
          <p>Sessions complétées</p>
          <strong>{completedCount}</strong>
        </div>

        <div className="insight-card">
          <span className="icon">⚠️</span>
          <p>Sessions interrompues</p>
          <strong>{interruptedCount}</strong>
        </div>

        <div className="insight-card">
          <span className="icon">⏱️</span>
          <p>Temps total de focus</p>
          <strong>{totalMinutes} min</strong>
        </div>

        {bestSlot && (
          <div className="insight-card">
            <span className="icon">🔥</span>
            <p>Meilleur créneau</p>
            <strong>{getDayName(bestSlot.day)} {bestSlot.hour}h</strong>
          </div>
        )}
      </div>

      <div className="sessions-list">
        <h3>Historique des Sessions</h3>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Durée</th>
              <th>Date</th>
              <th>Heure</th>
              <th>Statut</th>
            </tr>
          </thead>
<tbody>
  {sessions
    .filter(session => session.completed || session.interrupted) // Ignore "en cours"
    .slice(0, 20)
    .map(session => (
      <tr key={session.id}>
        <td>{session.type}</td>
        <td>{session.duration} min</td>
        <td>
          {session.startTime?.toLocaleDateString('fr-FR')}
        </td>
        <td>
          {session.startTime?.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </td>
        <td>{getStatusBadge(session)}</td>
      </tr>
    ))}
</tbody>
        </table>
      </div>
    </div>
  );
}
