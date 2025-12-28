import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import AdaptiveTimer from './components/AdaptiveTimer';
import DeepWorkFortress from './components/DeepWorkFortress';
import MicroBreaks from './components/MicroBreaks';
import AnalyticsHeatmap from './components/AnalyticsHeatmap';
import InstallButton from './components/InstallButton';
import './App.css';
import StreakCounter from './components/StreakCounter';


function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSession, setCurrentSession] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [showBreak, setShowBreak] = useState(false);
  
  // Lire la vue depuis l'URL
  const [view, setView] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('view') || 'timer';
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log('✅ Utilisateur connecté:', currentUser.uid);
        setUser(currentUser);
        setLoading(false);
      } else {
        signInAnonymously(auth)
          .then((userCred) => {
            console.log('✅ Connexion anonyme réussie:', userCred.user.uid);
            setUser(userCred.user);
            setLoading(false);
          })
          .catch((error) => {
            console.error('❌ Erreur:', error.message);
            setLoading(false);
          });
      }
    });

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => unsubscribe();
  }, []);

  // Mettre à jour l'URL quand la vue change
  const handleViewChange = (newView) => {
    setView(newView);
    window.history.pushState(null, '', `?view=${newView}`);
  };

  const handleStartSession = (sessionData, id) => {
    setCurrentSession(sessionData);
    setSessionId(id);
  };

  const handleSessionComplete = () => {
    setCurrentSession(null);
    setShowBreak(true);
  };

  const handleBreakComplete = () => {
    setShowBreak(false);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loader"></div>
        <p>Connexion à Firebase...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="error-screen">
        <h2>⚠️ Erreur</h2>
        <button onClick={() => window.location.reload()}>Réessayer</button>
      </div>
    );
  }

  return (
    <div className="app">

      <header>
        <h1>⚔️ Focus Fortress</h1>
        <nav>
          <button 
            onClick={() => handleViewChange('timer')}
            className={view === 'timer' ? 'active' : ''}
          >
            Minuteur
          </button>
          <button 
            onClick={() => handleViewChange('analytics')}
            className={view === 'analytics' ? 'active' : ''}
          >
            Analytics
          </button>
        </nav>
      </header>
{user && <StreakCounter userId={user.uid} />}
      <main>
        {view === 'timer' && (
          <>
            {!currentSession && !showBreak && (
              <AdaptiveTimer userId={user.uid} onStartSession={handleStartSession} />
            )}
            {currentSession && (
              <DeepWorkFortress
                userId={user.uid}
                sessionId={sessionId}
                duration={currentSession.duration}
                onComplete={handleSessionComplete}
              />
            )}
            {showBreak && <MicroBreaks onComplete={handleBreakComplete} />}
          </>
        )}
        {view === 'analytics' && <AnalyticsHeatmap userId={user.uid} />}
      </main>
	  <InstallButton />
    </div>
  );
}

export default App;
