import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import ProfileSettings from '../ProfileSettings';
import InteractiveLesson from './InteractiveLesson';
import { getLessonById } from '../../services/lessonService';
import './ADHDView.css';

const ADHDView = () => {
  const { user, logout } = useAuth();
  const { preferences } = usePreferences();
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeLesson, setActiveLesson] = useState(null);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonError, setLessonError] = useState('');

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
    { id: 1, title: 'Greetings', duration: '5 min', icon: '👋', apiId: 'lesson-greetings' },
    { id: 2, title: 'Basic Words', duration: '5 min', icon: '📝', apiId: 'lesson-vocabulary' },
    { id: 3, title: 'Numbers', duration: '5 min', icon: '🔢', apiId: 'lesson-numbers' },
  ];

  const lessonFallbacks = {
    'lesson-greetings': {
      title: 'Greetings',
      textContent:
        'Start with quick greetings.\\n\\nSay “Hello” and “Hi” clearly.\\n\\nRepeat each greeting twice.',
      audioUrl: '',
      visuals: [
        { iconUrl: '/visuals/wave.svg', description: 'Wave to say hello.' },
        { iconUrl: '/visuals/speech.svg', description: 'Speak with a friendly tone.' },
      ],
      interactions: [
        {
          id: 'greet-1',
          type: 'true_false',
          question: 'Is “Hi” a greeting?',
          correctAnswer: 'True',
          feedback: {
            correct: 'Yes! “Hi” is a greeting.',
            incorrect: 'Not quite. “Hi” is a greeting.',
          },
          position: 0,
        },
      ],
    },
    'lesson-vocabulary': {
      title: 'Basic Words',
      textContent:
        'Choose five common objects around you.\\n\\nName each one out loud.\\n\\nRepeat after a short pause.',
      audioUrl: '',
      visuals: [
        { iconUrl: '/visuals/speech.svg', description: 'Say each word slowly.' },
        { iconUrl: '/visuals/sun.svg', description: 'Stay focused with bright cues.' },
      ],
      interactions: [
        {
          id: 'vocab-1',
          type: 'multiple_choice',
          question: 'Pick the word that names a fruit.',
          options: ['Apple', 'Chair', 'Cloud'],
          correctAnswer: 'Apple',
          feedback: {
            correct: 'Correct! Apple is a fruit.',
            incorrect: 'Try again. Apple is the fruit.',
          },
          position: 1,
        },
      ],
    },
    'lesson-numbers': {
      title: 'Numbers',
      textContent:
        'Count from one to five.\\n\\nClap once per number.\\n\\nTry saying the numbers faster.',
      audioUrl: '',
      visuals: [
        { iconUrl: '/visuals/sun.svg', description: 'Use visual patterns to count.' },
        { iconUrl: '/visuals/wave.svg', description: 'Move your fingers as you count.' },
      ],
      interactions: [
        {
          id: 'numbers-1',
          type: 'click',
          question: 'Click the number 4.',
          options: ['2', '4', '5'],
          correctAnswer: '4',
          feedback: {
            correct: 'Nice! 4 is correct.',
            incorrect: 'Almost. Look for 4.',
          },
          position: 0,
        },
      ],
    },
  };

  const handleStartLesson = async (lesson) => {
    setLessonLoading(true);
    setLessonError('');
    try {
      const data = await getLessonById(lesson.apiId);
      setActiveLesson(data);
    } catch (error) {
      setActiveLesson({ ...lessonFallbacks[lesson.apiId], _id: lesson.apiId });
      setLessonError('Live lesson data is unavailable. Showing a sample lesson instead.');
    } finally {
      setLessonLoading(false);
    }
  };

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
                      <button className="btn-lesson" onClick={() => handleStartLesson(lesson)}>
                        Start
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <InteractiveLesson
                lesson={activeLesson}
                isLoading={lessonLoading}
                error={lessonError}
                onClose={() => {
                  setActiveLesson(null);
                  setLessonError('');
                }}
              />
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
