import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import ProfileSettings from '../ProfileSettings';
import './AutismView.css';

const AutismView = () => {
  const { user, logout } = useAuth();
  const { preferences } = usePreferences();
  const [currentStep, setCurrentStep] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();

  const lessons = [
    { 
      id: 1, 
      title: 'Greetings', 
      icon: '👋',
      steps: 3,
      description: 'Learn basic greetings',
      apiId: 'lesson-greetings',
    },
    { 
      id: 2, 
      title: 'Basic Words', 
      icon: '📝',
      steps: 3,
      description: 'Learn common words',
      apiId: 'lesson-vocabulary',
    },
    { 
      id: 3, 
      title: 'Numbers', 
      icon: '🔢',
      steps: 3,
      description: 'Learn to count',
      apiId: 'lesson-numbers',
    },
  ];

  const handleStartLesson = (lesson) => {
    navigate(`/lessons/${lesson.apiId}`);
  };

  const dailyRoutine = [
    { id: 1, task: 'Start Learning', done: false, icon: '📚' },
    { id: 2, task: 'Complete 1 Lesson', done: false, icon: '✓' },
    { id: 3, task: 'Review Words', done: false, icon: '🔄' },
    { id: 4, task: 'Finish Session', done: false, icon: '🎉' },
  ];

  return (
    <div className="autism-view">
      {/* Simple Header */}
      <header className="simple-header">
        <div className="header-left">
          <h1>Learning Center</h1>
          <p className="header-subtitle">Step-by-step progress</p>
        </div>
        <div className="header-actions">
          <button onClick={() => setShowSettings(true)} className="btn-exit" title="Settings">
            ⚙️
          </button>
          <button onClick={logout} className="btn-exit">
            Exit
          </button>
        </div>
      </header>

      {showSettings && (
        <ProfileSettings onClose={() => setShowSettings(false)} />
      )}

      {/* Main Layout */}
      <div className="main-layout">
        {/* Sidebar - Daily Routine */}
        <aside className="sidebar">
          <div className="routine-card">
            <h3>Today's Plan</h3>
            <div className="routine-list">
              {dailyRoutine.map((item, index) => (
                <div 
                  key={item.id} 
                  className={`routine-item ${currentStep > index ? 'completed' : ''} ${currentStep === index + 1 ? 'active' : ''}`}
                >
                  <span className="routine-icon">{item.icon}</span>
                  <span className="routine-text">{item.task}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="content-area">
          {/* Welcome Card */}
          <div className="welcome-card">
            <h2>Hello, {user?.name}</h2>
            <p>Choose a lesson below to start learning</p>
          </div>

          {/* Progress Indicator */}
          <div className="progress-section">
            <h3>Your Progress</h3>
            <div className="progress-visual">
              <div className="progress-circle">
                <div className="circle-inner">
                  <span className="progress-number">0</span>
                  <span className="progress-label">Lessons</span>
                </div>
              </div>
              <div className="progress-circle">
                <div className="circle-inner">
                  <span className="progress-number">0</span>
                  <span className="progress-label">Words</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lessons - Simple Grid */}
          <div className="lessons-container">
            <h3>Available Lessons</h3>
            <div className="lessons-simple-grid">
              {lessons.map((lesson) => (
                <div key={lesson.id} className="lesson-simple-card">
                  <div className="lesson-top">
                    <span className="lesson-large-icon">{lesson.icon}</span>
                  </div>
                  <div className="lesson-body">
                    <h4>{lesson.title}</h4>
                    <p>{lesson.description}</p>
                    <div className="lesson-steps">
                      {Array.from({ length: lesson.steps }, (_, i) => (
                        <span key={i} className="step-dot"></span>
                      ))}
                    </div>
                  </div>
                  <button className="btn-lesson-start" onClick={() => handleStartLesson(lesson)}>
                    Start Lesson
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Simple Help Section */}
          <div className="help-section">
            <div className="help-card">
              <span className="help-icon">ℹ️</span>
              <div className="help-text">
                <h4>Need Help?</h4>
                <p>Click on any lesson to begin. Follow the steps one at a time.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AutismView;
