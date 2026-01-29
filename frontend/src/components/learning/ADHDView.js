import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import ProfileSettings from '../ProfileSettings';
import './ADHDView.css';

const ADHDView = () => {
  const { user, logout } = useAuth();
  const { preferences } = usePreferences();
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    let timer;
    if (isSessionActive && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      handleSessionEnd();
    }
    return () => clearInterval(timer);
  }, [isSessionActive, timeRemaining]);

  const startSession = () => {
    const duration = (preferences?.sessionDuration || 20) * 60; // Convert to seconds
    setTimeRemaining(duration);
    setIsSessionActive(true);
  };

  const handleSessionEnd = () => {
    setIsSessionActive(false);
    if (preferences?.breakReminders) {
      alert('⏰ Time for a break! Take 5 minutes to rest before continuing.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const lessons = [
    { id: 1, title: 'Greetings', duration: '5 min', icon: '👋' },
    { id: 2, title: 'Basic Words', duration: '5 min', icon: '📝' },
    { id: 3, title: 'Numbers', duration: '5 min', icon: '🔢' },
  ];

  return (
    <div className="adhd-view">
      {/* Minimal Top Bar */}
      <header className="top-bar">
        <h1>📚 Learn</h1>
        <div className="header-actions">
          {isSessionActive && timeRemaining !== null && (
            <div className="timer-display">
              <span className="timer-icon">⏱️</span>
              <span className="timer-text">{formatTime(timeRemaining)}</span>
            </div>
          )}
          <button onClick={() => setShowSettings(true)} className="btn-minimal" title="Settings">
            ⚙️
          </button>
          <button onClick={logout} className="btn-minimal">
            Exit
          </button>
        </div>
      </header>

      {showSettings && (
        <ProfileSettings onClose={() => setShowSettings(false)} />
      )}

      {/* Focused Content Area */}
      <main className="focused-content">
        <div className="content-wrapper">
          {/* Welcome Message */}
          <div className="focus-card">
            <h2>Hi, {user?.name}! 👋</h2>
            <p>Let's focus on one lesson at a time.</p>
          </div>

          {/* Session Controls */}
          {!isSessionActive ? (
            <div className="session-start">
              <h3>Ready to Learn?</h3>
              <p>Click below to start a focused {preferences?.sessionDuration || 20}-minute session</p>
              <button onClick={startSession} className="btn-start">
                Start Session
              </button>
            </div>
          ) : (
            <>
              {/* Quick Stats */}
              <div className="quick-stats">
                <div className="stat-box">
                  <div className="stat-number">3</div>
                  <div className="stat-text">Lessons</div>
                </div>
                <div className="stat-box">
                  <div className="stat-number">0</div>
                  <div className="stat-text">Done Today</div>
                </div>
              </div>

              {/* Lesson Cards - One at a Time */}
              <div className="lesson-focus">
                <h3>Choose One Lesson</h3>
                <div className="lesson-list">
                  {lessons.map((lesson) => (
                    <div key={lesson.id} className="lesson-item">
                      <div className="lesson-content">
                        <span className="lesson-emoji">{lesson.icon}</span>
                        <div className="lesson-info">
                          <h4>{lesson.title}</h4>
                          <span className="lesson-time">⏱️ {lesson.duration}</span>
                        </div>
                      </div>
                      <button className="btn-lesson">Start</button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Simple Tips */}
          <div className="simple-tips">
            <div className="tip-item">
              <span className="tip-icon">💡</span>
              <span>Take breaks every 20 minutes</span>
            </div>
            <div className="tip-item">
              <span className="tip-icon">🎯</span>
              <span>Focus on just one lesson at a time</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ADHDView;
