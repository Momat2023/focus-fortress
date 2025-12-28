import { useState, useEffect } from 'react';
import { setSoundTheme, getSoundThemes, playSessionStart } from '../utils/sounds';

export default function SoundSelector() {
  const [currentTheme, setCurrentTheme] = useState(
    localStorage.getItem('soundTheme') || 'classic'
  );

  const themes = {
    classic: { name: '🔔 Classique', desc: 'Sons standards' },
    zen: { name: '🧘 Zen', desc: 'Fréquences apaisantes' },
    gaming: { name: '🎮 Gaming', desc: 'Sons énergiques' }
  };

  const handleThemeChange = (theme) => {
    setCurrentTheme(theme);
    setSoundTheme(theme);
    playSessionStart(); // Test du son
  };

  return (
    <div className="sound-selector">
      <h3>🎵 Thème Sonore</h3>
      <div className="sound-options">
        {Object.entries(themes).map(([key, value]) => (
          <button
            key={key}
            onClick={() => handleThemeChange(key)}
            className={`sound-option ${currentTheme === key ? 'active' : ''}`}
          >
            <div className="sound-name">{value.name}</div>
            <div className="sound-desc">{value.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

