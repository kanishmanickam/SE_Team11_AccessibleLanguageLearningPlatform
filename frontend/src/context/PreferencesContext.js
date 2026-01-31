import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const PreferencesContext = createContext(null);

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};

export const PreferencesProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load preferences when user is authenticated
  useEffect(() => {
    const loadPreferences = async () => {
      if (!isAuthenticated) {
        setPreferences(null);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/preferences');
        setPreferences(response.data.preferences);
        applyPreferences(response.data.preferences);
      } catch (err) {
        console.error('Error loading preferences:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [isAuthenticated]);

  const applyPreferences = (prefs, containerId = 'learning-container') => {
    if (!prefs) return;

    // Only apply to learning container if it exists, not to body
    const container = document.getElementById(containerId);
    if (!container) return;

    // Reset classes
    container.className = 'motion-enabled';

    // Apply theme
    if (prefs.contrastTheme && prefs.contrastTheme !== 'default') {
      container.classList.add(`theme-${prefs.contrastTheme}`);
    }

    // Apply font family
    if (prefs.fontFamily && prefs.fontFamily !== 'default') {
      container.classList.add(`font-${prefs.fontFamily}`);
    }

    // Apply font size
    if (prefs.fontSize) {
      container.classList.add(`font-${prefs.fontSize}`);
    }

    // Apply letter spacing
    if (prefs.letterSpacing) {
      container.classList.add(`letter-spacing-${prefs.letterSpacing}`);
    }

    // Apply word spacing
    if (prefs.wordSpacing) {
      container.classList.add(`word-spacing-${prefs.wordSpacing}`);
    }

    // Apply line height
    if (prefs.lineHeight) {
      container.classList.add(`line-height-${prefs.lineHeight}`);
    }

    // Apply distraction-free mode
    const userCondition = container.dataset.userCondition;
    if (prefs.distractionFreeMode && userCondition === 'autism') {
      container.classList.add('distraction-free');
    }

    // Apply reduced animations
    // For Autism, treat reduced animations as part of distraction-free so normal mode stays animated.
    if (prefs.reduceAnimations && prefs.distractionFreeMode && userCondition === 'autism') {
      container.classList.add('reduce-animations');
    }
  };

  const updatePreferences = async (updates) => {
    try {
      const response = await api.put('/preferences', updates);
      setPreferences(response.data.preferences);
      applyPreferences(response.data.preferences);
      return { success: true };
    } catch (err) {
      console.error('Error updating preferences:', err);
      return { success: false, error: err.response?.data?.message };
    }
  };

  const updateAccessibilitySettings = async (settings) => {
    try {
      const response = await api.patch('/preferences/accessibility', settings);
      setPreferences(response.data.preferences);
      applyPreferences(response.data.preferences);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  };

  const updateDyslexiaSettings = async (settings) => {
    try {
      const response = await api.patch('/preferences/dyslexia', settings);
      setPreferences(response.data.preferences);
      applyPreferences(response.data.preferences);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  };

  const updateADHDSettings = async (settings) => {
    try {
      const response = await api.patch('/preferences/adhd', settings);
      setPreferences(response.data.preferences);
      applyPreferences(response.data.preferences);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  };

  const updateAutismSettings = async (settings) => {
    try {
      const response = await api.patch('/preferences/autism', settings);
      setPreferences(response.data.preferences);
      applyPreferences(response.data.preferences);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  };

  const resetPreferences = async () => {
    try {
      const response = await api.delete('/preferences/reset');
      setPreferences(response.data.preferences);
      applyPreferences(response.data.preferences);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  };

  const value = {
    preferences,
    loading,
    updatePreferences,
    updateAccessibilitySettings,
    updateDyslexiaSettings,
    updateADHDSettings,
    updateAutismSettings,
    resetPreferences,
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};
