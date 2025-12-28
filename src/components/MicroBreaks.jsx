import { useState, useEffect } from 'react';

const exercises = [
  {
    id: 'breathing478',
    name: 'Respiration 4-7-8',
    duration: 60,
    steps: ['Inspirez 4 secondes', 'Retenez 7 secondes', 'Expirez 8 secondes'],
    animation: '🌬️'
  },
  {
    id: 'eyeYoga',
    name: 'Yoga des Yeux',
    duration: 45,
    steps: ['Regardez à gauche 5s', 'Regardez à droite 5s', 'Cercles lents', 'Fermez les yeux'],
    animation: '👁️'
  },
  {
    id: 'neckStretch',
    name: 'Étirement Nuque',
    duration: 30,
    steps: ['Penchez tête à gauche', 'Penchez tête à droite', 'Rotation douce'],
    animation: '🧘'
  }
];

export default function MicroBreaks({ onComplete }) {
  const [currentExercise, setCurrentExercise] = useState(exercises[0]);
  const [timeLeft, setTimeLeft] = useState(currentExercise.duration);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
      
      // Changer de step toutes les duration/steps.length secondes
      const stepDuration = currentExercise.duration / currentExercise.steps.length;
      const newStep = Math.floor((currentExercise.duration - timeLeft) / stepDuration);
      if (newStep !== currentStep && newStep < currentExercise.steps.length) {
        setCurrentStep(newStep);
        speak(currentExercise.steps[newStep]);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const changeExercise = (exercise) => {
    setCurrentExercise(exercise);
    setTimeLeft(exercise.duration);
    setCurrentStep(0);
  };

  return (
    <div className="micro-break">
      <div className="break-header">
        <h2>Micro-Pause Scientifique</h2>
        <p>{currentExercise.name}</p>
      </div>

      <div className="exercise-animation">
        <span style={{ fontSize: '120px' }}>{currentExercise.animation}</span>
      </div>

      <div className="exercise-instruction">
        <h3>{currentExercise.steps[currentStep]}</h3>
      </div>

      <div className="circular-timer">
        <svg width="150" height="150">
          <circle
            cx="75"
            cy="75"
            r="70"
            stroke="#0f3460"
            strokeWidth="10"
            fill="none"
            strokeDasharray={`${(1 - timeLeft / currentExercise.duration) * 440} 440`}
            transform="rotate(-90 75 75)"
          />
        </svg>
        <span className="timer-text">{timeLeft}s</span>
      </div>

      <div className="exercise-options">
        {exercises.map(ex => (
          <button
            key={ex.id}
            onClick={() => changeExercise(ex)}
            className={ex.id === currentExercise.id ? 'active' : ''}
          >
            {ex.animation} {ex.name}
          </button>
        ))}
      </div>

      <button onClick={onComplete} className="skip-btn">
        Passer cette pause
      </button>
    </div>
  );
}

