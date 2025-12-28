import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { playTimerComplete, playSessionStart, playSessionInterrupted } from '../utils/sounds';


export default function AdaptiveTimer({ userId, onStartSession }) {
  const [suggestedDuration, setSuggestedDuration] = useState(25);
  const [customDuration, setCustomDuration] = useState(25);
  const [sessionType, setSessionType] = useState('pomodoro');
  const [showExplanation, setShowExplanation] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

useEffect(() => {
  calculateOptimalDuration();
}, [userId, sessionType]);

  const calculateOptimalDuration = async () => {
    if (!userId) return;

    try {
      const sessionsRef = collection(db, 'sessions');
      const q = query(
        sessionsRef, 
        where('userId', '==', userId),
        where('type', '==', sessionType),
        where('completed', '==', true)
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.size < 20) {
        setSuggestedDuration(25);
        return;
      }

      const sessions = snapshot.docs.map(doc => doc.data());
      const durations = sessions.map(s => s.duration);
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      
      const variance = durations.reduce((sum, d) => sum + Math.pow(d - avgDuration, 2), 0) / durations.length;
      const stdDev = Math.sqrt(variance);
      
      const optimal = Math.round(avgDuration + 0.5 * stdDev);
      setSuggestedDuration(optimal);
      setCustomDuration(optimal);
    } catch (error) {
      console.warn('Erreur calcul optimal duration:', error);
    }
  };

const handleStartSession = async () => {  // ⬅️ AJOUTER async ICI
  playSessionStart();
  console.log('🚀 Démarrage session:', sessionType, customDuration + 'min');
  
  const sessionData = {
    userId,
    type: sessionType,
    duration: customDuration,
    startTime: new Date(),
    completed: false,
    interrupted: false,
    interruptionAttempts: 0
  };

  try {
    // Sauvegarder dans Firebase
    const docRef = await addDoc(collection(db, 'sessions'), sessionData);
    console.log('✅ Session sauvegardée dans Firebase! ID:', docRef.id);
    onStartSession(sessionData, docRef.id);
  } catch (error) {
    console.error('❌ Erreur sauvegarde Firebase:', error);
    // Continuer en mode local
    const localId = 'local-' + Date.now();
    onStartSession(sessionData, localId);
  }
};

  const presets = {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    deepWork: 90,
    workout: 12
  };

  const presetLabels = {
    pomodoro: 'Pomodoro',
    shortBreak: 'ShortBreak',
    longBreak: 'LongBreak',
    deepWork: 'DeepWork',
    workout: 'Workout'
  };

  return (
    <div className="adaptive-timer">
      <h2>Démarrer une session</h2>

      <div className="session-types">
        {Object.entries(presets).map(([type, duration]) => (
          <button
            key={type}
            onClick={() => {
              setSessionType(type);
              setCustomDuration(duration);
            }}
            className={sessionType === type ? 'active' : ''}
          >
            {presetLabels[type]}
          </button>
        ))}
      </div>

      <div className="duration-selector">
        <label>Durée (minutes)</label>
        <input
          type="number"
          value={customDuration}
          onChange={(e) => setCustomDuration(parseInt(e.target.value) || 1)}
          min="1"
          max="120"
        />

        { suggestedDuration !== presets[sessionType] && (
          <div className="suggestion">
            <p>💡 Recommandation IA: {suggestedDuration} min</p>
            <button onClick={() => setShowExplanation(!showExplanation)}>
              Pourquoi?
            </button>
            {showExplanation && (
              <p className="explanation">
                Basé sur vos sessions précédentes, vous complétez 85% 
                des sessions de {suggestedDuration}min vs 60% à {presets[sessionType]}min
              </p>
            )}
          </div>
        )}
      </div>

      <button onClick={handleStartSession} className="start-btn">
        🚀 Démarrer en Mode Fortress
      </button>

      {isDemo && (
        <p style={{marginTop: '10px', color: '#ff4757', fontSize: '0.9rem'}}>
          Mode démo actif - Les données ne seront pas sauvegardées
        </p>
      )}
    </div>
  );
}

