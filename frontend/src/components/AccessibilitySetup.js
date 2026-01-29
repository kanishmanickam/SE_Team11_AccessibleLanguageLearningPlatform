import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import './AccessibilitySetup.css';

const AccessibilitySetup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updatePreferences } = usePreferences();

  const [step, setStep] = useState(1);
  const [settings, setSettings] = useState({
    fontSize: 'medium',
    contrastTheme: 'default',
    fontFamily: user?.learningCondition === 'dyslexia' ? 'opendyslexic' : 'default',
    letterSpacing: user?.learningCondition === 'dyslexia' ? 'wide' : 'normal',
    wordSpacing: 'normal',
    lineHeight: user?.learningCondition === 'dyslexia' ? 'relaxed' : 'normal',
    learningPace: 'normal',
    sessionDuration: 20,
    breakReminders: false,
    distractionFreeMode: user?.learningCondition === 'autism',
    reduceAnimations: user?.learningCondition === 'autism',
    simplifiedLayout: user?.learningCondition === 'autism',
    soundEffects: true,
    enableTextToSpeech: false,
  });

  const handleChange = (name, value) => {
    setSettings({ ...settings, [name]: value });
  };

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    const result = await updatePreferences(settings);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  const skipSetup = () => {
    navigate('/dashboard');
  };

  return (
    <div className="setup-container">
      <div className="setup-card">
        <h1 className="setup-title">Customize Your Experience</h1>
        <p className="setup-subtitle">
          Let's set up your accessibility preferences for the best learning experience
        </p>

        <div className="progress-bar">
          <div className="progress-step" data-active={step >= 1}>1</div>
          <div className="progress-line" data-active={step >= 2}></div>
          <div className="progress-step" data-active={step >= 2}>2</div>
          <div className="progress-line" data-active={step >= 3}></div>
          <div className="progress-step" data-active={step >= 3}>3</div>
        </div>

        <div className="setup-content">
          {step === 1 && (
            <div className="step-content">
              <h2>Visual Settings</h2>
              <p className="step-description">
                Adjust how text and content appear on your screen
              </p>

              <div className="setting-group">
                <label>Text Size</label>
                <div className="button-group">
                  {['small', 'medium', 'large', 'extra-large'].map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`option-btn ${settings.fontSize === size ? 'active' : ''}`}
                      onClick={() => handleChange('fontSize', size)}
                    >
                      {size.charAt(0).toUpperCase() + size.slice(1).replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="setting-group">
                <label>Color Theme</label>
                <div className="button-group">
                  {[
                    { value: 'default', label: 'Default' },
                    { value: 'high-contrast', label: 'High Contrast' },
                    { value: 'dark', label: 'Dark' },
                    { value: 'yellow-black', label: 'Yellow on Black' },
                  ].map((theme) => (
                    <button
                      key={theme.value}
                      type="button"
                      className={`option-btn ${settings.contrastTheme === theme.value ? 'active' : ''}`}
                      onClick={() => handleChange('contrastTheme', theme.value)}
                    >
                      {theme.label}
                    </button>
                  ))}
                </div>
              </div>

              {user?.learningCondition === 'dyslexia' && (
                <>
                  <div className="setting-group">
                    <label>Font Style</label>
                    <div className="button-group">
                      {[
                        { value: 'opendyslexic', label: 'OpenDyslexic' },
                        { value: 'arial', label: 'Arial' },
                        { value: 'comic-sans', label: 'Comic Sans' },
                      ].map((font) => (
                        <button
                          key={font.value}
                          type="button"
                          className={`option-btn ${settings.fontFamily === font.value ? 'active' : ''}`}
                          onClick={() => handleChange('fontFamily', font.value)}
                        >
                          {font.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="setting-group">
                    <label>Letter Spacing</label>
                    <div className="button-group">
                      {['normal', 'wide', 'extra-wide'].map((spacing) => (
                        <button
                          key={spacing}
                          type="button"
                          className={`option-btn ${settings.letterSpacing === spacing ? 'active' : ''}`}
                          onClick={() => handleChange('letterSpacing', spacing)}
                        >
                          {spacing.charAt(0).toUpperCase() + spacing.slice(1).replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="step-content">
              <h2>Learning Preferences</h2>
              <p className="step-description">
                Set your preferences for learning sessions
              </p>

              {user?.learningCondition === 'adhd' && (
                <div className="setting-group">
                  <label>Learning Pace</label>
                  <div className="button-group">
                    {['slow', 'normal', 'fast'].map((pace) => (
                      <button
                        key={pace}
                        type="button"
                        className={`option-btn ${settings.learningPace === pace ? 'active' : ''}`}
                        onClick={() => handleChange('learningPace', pace)}
                      >
                        {pace.charAt(0).toUpperCase() + pace.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="setting-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.enableTextToSpeech}
                    onChange={(e) => handleChange('enableTextToSpeech', e.target.checked)}
                  />
                  <span>Enable text-to-speech</span>
                </label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-content">
              <h2>Focus & Environment</h2>
              <p className="step-description">
                Optimize your learning environment to your needs
              </p>

              {user?.learningCondition === 'autism' && (
                <div className="setting-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.distractionFreeMode}
                      onChange={(e) => handleChange('distractionFreeMode', e.target.checked)}
                    />
                    <span>Enable distraction-free mode</span>
                  </label>
                  <p className="help-text">Removes unnecessary UI elements</p>
                </div>
              )}

              {(user?.learningCondition === 'autism') && (
                <>
                  <div className="setting-group checkbox">
                    <label>
                      <input
                        type="checkbox"
                        checked={settings.reduceAnimations}
                        onChange={(e) => handleChange('reduceAnimations', e.target.checked)}
                      />
                      <span>Reduce animations</span>
                    </label>
                    <p className="help-text">Minimizes moving elements</p>
                  </div>

                  <div className="setting-group checkbox">
                    <label>
                      <input
                        type="checkbox"
                        checked={settings.simplifiedLayout}
                        onChange={(e) => handleChange('simplifiedLayout', e.target.checked)}
                      />
                      <span>Use simplified layout</span>
                    </label>
                    <p className="help-text">Cleaner, more predictable interface</p>
                  </div>
                </>
              )}

              <div className="setting-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.soundEffects}
                    onChange={(e) => handleChange('soundEffects', e.target.checked)}
                  />
                  <span>Enable sound effects</span>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="setup-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={skipSetup}
          >
            Skip for Now
          </button>

          <div className="action-buttons">
            {step > 1 && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={prevStep}
              >
                Back
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={nextStep}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
              >
                Save & Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilitySetup;
