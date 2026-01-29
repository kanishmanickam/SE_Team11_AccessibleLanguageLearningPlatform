import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import ProfileSettings from '../ProfileSettings';
import InteractiveLesson from './InteractiveLesson';
import { getLessonById } from '../../services/lessonService';
import './AutismView.css';

const AutismView = () => {
  const { user, logout } = useAuth();
  const { preferences } = usePreferences();
  const [currentStep, setCurrentStep] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [activeLesson, setActiveLesson] = useState(null);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonError, setLessonError] = useState('');

  const lessons = [
    { 
      id: 1, 
      title: 'Lesson 1: Greetings', 
      icon: '👋',
      steps: 3,
      description: 'Learn basic greetings',
      apiId: 'lesson-greetings',
    },
    { 
      id: 2, 
      title: 'Lesson 2: Basic Words', 
      icon: '📝',
      steps: 3,
      description: 'Learn common words',
      apiId: 'lesson-vocabulary',
    },
    { 
      id: 3, 
      title: 'Lesson 3: Numbers', 
      icon: '🔢',
      steps: 3,
      description: 'Learn to count',
      apiId: 'lesson-numbers',
    },
  ];

  const lessonFallbacks = {
    'lesson-greetings': {
      title: 'Lesson 1: Greetings',
      textContent:
        'Step 1: Say “Hello.”\\n\\nStep 2: Say “Hi.”\\n\\nStep 3: Ask “How are you?”',
      audioUrl: '',
      visuals: [
        { iconUrl: '/visuals/wave.svg', description: 'Wave while greeting.' },
        { iconUrl: '/visuals/speech.svg', description: 'Use clear, short phrases.' },
      ],
      interactions: [
        {
          id: 'greet-1',
          type: 'true_false',
          question: 'Is “Hello” a greeting?',
          correctAnswer: 'True',
          hint: 'Think about a word you say when you meet someone.',
          explanation: '“Hello” is a greeting.',
          maxAttempts: 3,
          feedback: {
            correct: 'Correct! “Hello” is a greeting.',
            incorrect: 'Not quite. “Hello” is a greeting.',
          },
          position: 0,
        },
      ],
    },
    'lesson-vocabulary': {
      title: 'Lesson 2: Basic Words',
      textContent:
        'Step 1: Look at an object.\\n\\nStep 2: Say its name.\\n\\nStep 3: Repeat the word.',
      audioUrl: '',
      visuals: [
        { iconUrl: '/visuals/speech.svg', description: 'Say the word slowly.' },
        { iconUrl: '/visuals/sun.svg', description: 'Use bright examples.' },
      ],
      interactions: [
        {
          id: 'vocab-1',
          type: 'multiple_choice',
          question: 'Which word names something you can drink?',
          options: ['Water', 'Book', 'Chair'],
          correctAnswer: 'Water',
          hint: 'Think of something you drink every day.',
          explanation: 'Water is something you can drink.',
          maxAttempts: 3,
          feedback: {
            correct: 'Yes! Water is something you can drink.',
            incorrect: 'Try again. Water is the drink.',
          },
          position: 1,
        },
      ],
    },
    'lesson-numbers': {
      title: 'Lesson 3: Numbers',
      textContent:
        'Step 1: Count to three.\\n\\nStep 2: Count to five.\\n\\nStep 3: Count while pointing.',
      audioUrl: '',
      visuals: [
        { iconUrl: '/visuals/sun.svg', description: 'Visual numbers help memory.' },
        { iconUrl: '/visuals/wave.svg', description: 'Move your hand as you count.' },
      ],
      interactions: [
        {
          id: 'numbers-1',
          type: 'click',
          question: 'Click the number 1.',
          options: ['1', '3', '5'],
          correctAnswer: '1',
          hint: 'It is the first number in counting.',
          explanation: '1 is the first number.',
          maxAttempts: 3,
          feedback: {
            correct: 'Great! You selected 1.',
            incorrect: 'Not quite. Try clicking 1.',
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

          <InteractiveLesson
            lesson={activeLesson}
            isLoading={lessonLoading}
            error={lessonError}
            onClose={() => {
              setActiveLesson(null);
              setLessonError('');
            }}
          />

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
