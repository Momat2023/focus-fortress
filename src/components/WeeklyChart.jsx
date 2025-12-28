import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function WeeklyChart({ userId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeeklyData();
  }, [userId]);

const fetchWeeklyData = async () => {
  if (!userId) return;

  try {
    // Récupérer TOUTES les sessions de l'utilisateur
    const sessionsRef = collection(db, 'sessions');
    const q = query(
      sessionsRef,
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    console.log('📊 Total sessions trouvées:', snapshot.size);
    
    const sessions = snapshot.docs.map(doc => ({
      ...doc.data(),
      startTime: doc.data().startTime?.toDate()
    }));

    console.log('📅 Sessions avec dates:', sessions);

    // Grouper par jour (derniers 7 jours)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
      const dateKey = date.toDateString();
      
      const daySessions = sessions.filter(s => {
        if (!s.startTime) return false;
        const sessionDate = new Date(s.startTime);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.toDateString() === dateKey;
      });

      const completed = daySessions.filter(s => s.completed).length;
      const interrupted = daySessions.filter(s => s.interrupted).length;

      console.log(`${dayName}: ${completed} complétées, ${interrupted} interrompues`);

      last7Days.push({
        day: dayName.charAt(0).toUpperCase() + dayName.slice(1),
        complétées: completed,
        interrompues: interrupted,
        total: completed + interrupted
      });
    }

    console.log('📈 Données finales:', last7Days);
    setData(last7Days);
    setLoading(false);
  } catch (error) {
    console.error('Erreur chargement données hebdo:', error);
    setLoading(false);
  }
};


  if (loading) {
    return (
      <div className="weekly-chart">
        <h3>📈 Tendance des 7 derniers jours</h3>
        <p style={{ color: '#94a3b8' }}>Chargement...</p>
      </div>
    );
  }

  if (data.every(d => d.total === 0)) {
    return (
      <div className="weekly-chart">
        <h3>📈 Tendance des 7 derniers jours</h3>
        <p style={{ color: '#94a3b8' }}>Pas encore de données pour cette semaine</p>
      </div>
    );
  }

  return (
    <div className="weekly-chart">
      <h3>📈 Tendance des 7 derniers jours</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis 
            dataKey="day" 
            stroke="#94a3b8"
            style={{ fontSize: '14px' }}
          />
          <YAxis 
            stroke="#94a3b8"
            style={{ fontSize: '14px' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1e293b', 
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f1f5f9'
            }}
          />
          <Bar dataKey="complétées" fill="#10b981" radius={[8, 8, 0, 0]} />
          <Bar dataKey="interrompues" fill="#ef4444" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#10b981' }}></span>
          Complétées
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#ef4444' }}></span>
          Interrompues
        </div>
      </div>
    </div>
  );
}
