import { useState, useEffect } from 'react';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { playTimerComplete, playSessionInterrupted } from '../utils/sounds';
import confetti from 'canvas-confetti';



export default function DeepWorkFortress({ userId, sessionId, duration, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);

  useEffect(() => {
    document.documentElement.requestFullscreen().catch(err => console.log(err));
    setIsFullscreen(true);

    if ('Notification' in window && Notification.permission === 'granted') {
      // Notifications gérées par service worker
    }

    // NOUVEAU : Marquer comme interrompue si fermeture
    const handleBeforeUnload = async (e) => {
      if (userId && sessionId && !sessionId.startsWith('local-')) {
        try {
          const sessionRef = doc(db, 'sessions', sessionId);
          await updateDoc(sessionRef, {
            interrupted: true,
            endTime: new Date()
          });
          console.log('⚠️ Session marquée interrompue (fermeture page)');
        } catch (error) {
          console.error('Erreur:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [userId, sessionId]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSessionComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

const handleSessionComplete = async () => {
  // Test confettis
  console.log('🎊 Session terminée - Lancement confettis');
  
  try {
    // Import dynamique
    const confetti = (await import('canvas-confetti')).default;
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    console.log('✅ Confettis lancés');
  } catch (error) {
    console.error('❌ Erreur confettis:', error);
  }
  
  playTimerComplete();
  
  // Marquer la session comme complétée dans Firebase
  if (userId && sessionId && !sessionId.startsWith('local-')) {
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      await updateDoc(sessionRef, {
        completed: true,
        endTime: new Date()
      });
      console.log('✅ Session marquée comme complétée:', sessionId);
    } catch (error) {
      console.error('❌ Erreur update session:', error);
    }
  }
  onComplete();
};


  const handleExitAttempt = async () => {
    const minutesLost = Math.floor(timeLeft / 60);
    setShowExitWarning(true);
    
    // Enregistrer tentative d'interruption
    if (userId && sessionId && !sessionId.startsWith('local-')) {
      try {
        const sessionRef = doc(db, 'sessions', sessionId);
        await updateDoc(sessionRef, {
          interruptionAttempts: increment(1)
        });
      } catch (error) {
        console.error('❌ Erreur update interruption:', error);
      }
    }
  };

  const handleForceExit = async () => {
	  playSessionInterrupted();
    // Marquer comme interrompue
    if (userId && sessionId && !sessionId.startsWith('local-')) {
      try {
        const sessionRef = doc(db, 'sessions', sessionId);
        await updateDoc(sessionRef, {
          interrupted: true,
          endTime: new Date()
        });
        console.log('⚠️ Session interrompue:', sessionId);
      } catch (error) {
        console.error('❌ Erreur update interruption:', error);
      }
    }
    onComplete();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fortress-mode">
      <div className="shield-animation">🛡️</div>
      
      <div className="timer-display">
        <h1>{formatTime(timeLeft)}</h1>
        <p>Mode Deep Work Actif</p>
      </div>

      <div className="progress-ring">
        <svg width="200" height="200">
          <circle
            cx="100"
            cy="100"
            r="90"
            stroke="#ff4757"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${(1 - timeLeft / (duration * 60)) * 565} 565`}
          />
        </svg>
      </div>

      <button onClick={handleExitAttempt} className="exit-btn">
        Quitter la session
      </button>

      {showExitWarning && (
        <div className="warning-modal">
          <h2>⚠️ Attention!</h2>
          <p>Quitter maintenant vous fera perdre {Math.floor(timeLeft / 60)} minutes de concentration</p>
          <p>Temps restant: {formatTime(timeLeft)}</p>
          <div className="modal-actions">
            <button onClick={() => setShowExitWarning(false)}>Continuer la session</button>
            <button onClick={handleForceExit} className="danger-btn">Quitter quand même</button>
          </div>
        </div>
      )}
    </div>
  );
}
