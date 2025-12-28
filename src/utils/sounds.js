// Thèmes sonores disponibles
const soundThemes = {
  classic: {
    start: [600],
    complete: [800, 900, 1000],
    interrupted: [400, 400]
  },
  zen: {
    start: [432],
    complete: [528, 594, 648],
    interrupted: [256, 256]
  },
  gaming: {
    start: [523],
    complete: [659, 784, 988],
    interrupted: [330, 294]
  }
};

// Récupérer le thème actuel
const getSoundTheme = () => {
  return localStorage.getItem('soundTheme') || 'classic';
};

// Jouer un son avec une fréquence
const playSound = (frequency, duration = 150) => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  } catch (error) {
    console.log('Audio non disponible');
  }
};

// Sons publics
export const playSessionStart = () => {
  const theme = getSoundTheme();
  const frequencies = soundThemes[theme].start;
  playSound(frequencies[0], 100);
};

export const playTimerComplete = () => {
  const theme = getSoundTheme();
  const frequencies = soundThemes[theme].complete;
  playSound(frequencies[0], 150);
  setTimeout(() => playSound(frequencies[1], 150), 200);
  setTimeout(() => playSound(frequencies[2], 200), 400);
};

export const playSessionInterrupted = () => {
  const theme = getSoundTheme();
  const frequencies = soundThemes[theme].interrupted;
  playSound(frequencies[0], 100);
  setTimeout(() => playSound(frequencies[1], 100), 120);
};

// Nouveau : Définir le thème
export const setSoundTheme = (theme) => {
  if (soundThemes[theme]) {
    localStorage.setItem('soundTheme', theme);
    console.log('🎵 Thème sonore changé:', theme);
  }
};

// Nouveau : Liste des thèmes
export const getSoundThemes = () => Object.keys(soundThemes);
