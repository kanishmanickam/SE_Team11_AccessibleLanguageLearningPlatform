import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import ProfileSettings from '../ProfileSettings';
import InteractiveLesson from './InteractiveLesson';
import { getLessonById } from '../../services/lessonService';
import './DyslexiaView.css';

const DyslexiaView = () => {
  const { user, logout } = useAuth();
  const { preferences } = usePreferences();
  const [activeLesson, setActiveLesson] = useState(null);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonError, setLessonError] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const lessons = [
    { id: 1, title: 'Greetings & Introductions', level: 'Beginner', progress: 0, apiId: 'lesson-greetings' },
    { id: 2, title: 'Basic Vocabulary', level: 'Beginner', progress: 0, apiId: 'lesson-vocabulary' },
    { id: 3, title: 'Numbers & Colors', level: 'Beginner', progress: 0, apiId: 'lesson-numbers' },
  ];

  const lessonFallbacks = {
    'lesson-greetings': {
      title: 'Greetings & Introductions',
      textContent:
        'Hello! This lesson helps you greet someone politely.\\n\\nSay “Hello” or “Hi” with a smile.\\n\\nAsk “How are you?” and respond with “I am good, thank you.”',
      audioUrl: '',
      visuals: [
        { iconUrl: '/visuals/wave.svg', description: 'Wave hello with a friendly smile.' },
        { iconUrl: '/visuals/speech.svg', description: 'Use simple greeting phrases.' },
      ],
      interactions: [
        {
          id: 'greet-1',
          type: 'true_false',
          question: 'Is “Hello” a friendly greeting?',
          correctAnswer: 'True',
          feedback: {
            correct: 'Correct! “Hello” is a friendly greeting.',
            incorrect: 'Not quite. “Hello” is commonly used as a friendly greeting.',
          },
          position: 0,
        },
      ],
    },
    'lesson-vocabulary': {
      title: 'Basic Vocabulary',
      textContent:
        'Let’s learn simple words for everyday items.\\n\\nSay the word and point to the item.\\n\\nRepeat each word slowly to build confidence.',
      audioUrl: '',
      visuals: [
        { iconUrl: '/visuals/speech.svg', description: 'Speak each word clearly.' },
        { iconUrl: '/visuals/sun.svg', description: 'Practice with objects around you.' },
      ],
      interactions: [
        {
          id: 'vocab-1',
          type: 'multiple_choice',
          question: 'Which word matches something you can sit on?',
          options: ['Chair', 'Apple', 'Rain'],
          correctAnswer: 'Chair',
          feedback: {
            correct: 'Yes! A chair is something you can sit on.',
            incorrect: 'Try again. Think of something you can sit on.',
          },
          position: 1,
        },
      ],
    },
    'lesson-numbers': {
      title: 'Numbers & Colors',
      textContent:
        'Count from one to five.\\n\\nName a color for each number.\\n\\nMix numbers and colors to make learning fun.',
      audioUrl: '',
      visuals: [
        { iconUrl: '/visuals/sun.svg', description: 'Use bright colors to remember.' },
        { iconUrl: '/visuals/wave.svg', description: 'Count on your fingers as you learn.' },
      ],
      interactions: [
        {
          id: 'numbers-1',
          type: 'click',
          question: 'Click the number that comes after 2.',
          options: ['1', '3', '5'],
          correctAnswer: '3',
          feedback: {
            correct: 'Great job! 3 comes after 2.',
            incorrect: 'Not quite. Count: 1, 2, 3.',
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
    <div className="dyslexia-view">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-brand">
          <h1>📚 Language Learning</h1>
        </div>
        <div className="nav-menu">
          <span className="user-name">Hello, {user?.name}!</span>
          <button onClick={() => setShowSettings(true)} className="btn-settings" title="Settings">
            ⚙️
          </button>
          <button onClick={logout} className="btn-logout">
            Logout
          </button>
        </div>
      </nav>

      {showSettings && (
        <ProfileSettings onClose={() => setShowSettings(false)} />
      )}

      {/* Main Content */}
      <main className="main-content">
        <div className="welcome-section">
          <h2>Welcome to Your Learning Space</h2>
          <p className="subtitle">
            This space is designed specifically for learners with dyslexia, with clear fonts,
            proper spacing, and visual cues to make reading easier.
          </p>
        </div>

        {/* Progress Overview */}
        <div className="progress-card">
          <div className="card-header">
            <h3>Your Progress</h3>
          </div>
          <div className="card-body">
            <div className="progress-stats">
              <div className="stat-item">
                <div className="stat-value">0</div>
                <div className="stat-label">Lessons Completed</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">0</div>
                <div className="stat-label">Hours Practiced</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">0</div>
                <div className="stat-label">Words Learned</div>
              </div>
            </div>
          </div>
        </div>

        {/* Lessons Grid */}
        <div className="lessons-section">
          <h3>Available Lessons</h3>
          <div className="lessons-grid">
            {lessons.map((lesson) => (
              <div key={lesson.id} className="lesson-card">
                <div className="lesson-icon">📖</div>
                <h4>{lesson.title}</h4>
                <div className="lesson-meta">
                  <span className="badge">{lesson.level}</span>
                </div>
                <div className="lesson-progress">
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${lesson.progress}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{lesson.progress}% Complete</span>
                </div>
                <button
                  className="btn btn-primary btn-block"
                  onClick={() => handleStartLesson(lesson)}
                >
                  Start Learning
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

        {/* Tips Section */}
        <div className="tips-section">
          <h3>💡 Learning Tips for You</h3>
          <div className="tips-grid">
            <div className="tip-card">
              <h4>🎯 Break It Down</h4>
              <p>Focus on one lesson at a time. Small steps lead to big progress!</p>
            </div>
            <div className="tip-card">
              <h4>🔊 Use Audio</h4>
              <p>Listen to pronunciations to reinforce learning through multiple senses.</p>
            </div>
            <div className="tip-card">
              <h4>📝 Practice Regularly</h4>
              <p>Short, frequent sessions work better than long study periods.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DyslexiaView;
