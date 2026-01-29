import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import DyslexiaView from './learning/DyslexiaView';
import ADHDView from './learning/ADHDView';
import AutismView from './learning/AutismView';

const Dashboard = () => {
  const { user } = useAuth();
  const { preferences } = usePreferences();
  const containerRef = useRef(null);

  // Apply preferences to the learning container whenever preferences change
  useEffect(() => {
    if (!preferences || !containerRef.current) return;

    const container = containerRef.current;

    // Reset classes (default = motion enabled)
    container.className = 'dashboard motion-enabled';

    // Apply theme
    if (preferences.contrastTheme && preferences.contrastTheme !== 'default') {
      container.classList.add(`theme-${preferences.contrastTheme}`);
    }

    // Apply font family
    if (preferences.fontFamily && preferences.fontFamily !== 'default') {
      container.classList.add(`font-${preferences.fontFamily}`);
    }

    // Apply font size
    if (preferences.fontSize) {
      container.classList.add(`font-${preferences.fontSize}`);
    }

    // Apply letter spacing
    if (preferences.letterSpacing) {
      container.classList.add(`letter-spacing-${preferences.letterSpacing}`);
    }

    // Apply word spacing
    if (preferences.wordSpacing) {
      container.classList.add(`word-spacing-${preferences.wordSpacing}`);
    }

    // Apply line height
    if (preferences.lineHeight) {
      container.classList.add(`line-height-${preferences.lineHeight}`);
    }

    // Apply distraction-free mode (Autism only)
    if (preferences.distractionFreeMode && user?.learningCondition === 'autism') {
      container.classList.add('distraction-free');
    }

    // Apply reduced animations
    // For Autism, treat reduced animations as part of distraction-free so normal mode stays animated.
    if (preferences.reduceAnimations && preferences.distractionFreeMode && user?.learningCondition === 'autism') {
      container.classList.add('reduce-animations');
    }
  }, [preferences]);

  // Render the appropriate learning view based on user's condition
  const renderLearningView = () => {
    switch (user?.learningCondition) {
      case 'dyslexia':
        return <DyslexiaView />;
      case 'adhd':
        return <ADHDView />;
      case 'autism':
        return <AutismView />;
      default:
        return <DyslexiaView />; // Default view
    }
  };

  return (
    <div
      ref={containerRef}
      className="dashboard"
      id="learning-container"
      data-user-condition={user?.learningCondition || ''}
    >
      {renderLearningView()}
    </div>
  );
};

export default Dashboard;
