export const playSound = (frequency, duration) => {
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

export const playTimerComplete = () => {
  playSound(800, 150);
  setTimeout(() => playSound(900, 150), 200);
  setTimeout(() => playSound(1000, 200), 400);
};

export const playSessionStart = () => {
  playSound(600, 100);
};

export const playSessionInterrupted = () => {
  playSound(400, 100);
  setTimeout(() => playSound(400, 100), 120);
};

