import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllLessonProgress, normalizeUserId } from '../../services/dyslexiaProgressService';
import ProfileSettings from '../ProfileSettings';
import './DyslexiaView.css';

const DyslexiaView = () => {
  const { user, logout } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [lessonProgress, setLessonProgress] = useState({});
  const navigate = useNavigate();

  const lessons = [
    { id: 1, title: 'Greetings', level: 'Beginner', apiId: 'lesson-greetings', icon: '👋', color: '#ffd700', description: 'Learn hello, hi, and friendly phrases' },
    { id: 2, title: 'Basic Words', level: 'Beginner', apiId: 'lesson-vocabulary', icon: '📝', color: '#90caf9', description: 'Everyday objects, people, and actions' },
    { id: 3, title: 'Numbers', level: 'Beginner', apiId: 'lesson-numbers', icon: '🔢', color: '#a5d6a7', description: 'Count, match, and order numbers' },
  ];

  const handleStartLesson = (lesson) => {
    navigate(`/lessons/${lesson.apiId}`);
  };

  useEffect(() => {
    const key = normalizeUserId(user);
    if (!key) {
      setLessonProgress({});
      return;
    }
    const progress = getAllLessonProgress(key);
    setLessonProgress(progress || {});
  }, [user]);

  return (
    <div className="dyslexia-view">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-brand">
          <h1>📚 Language Learning</h1>
        </div>
        <div className="nav-menu">
          <span className="user-name">Hello, {user?.name}!</span>
          <button
            type="button"
            onClick={() => navigate('/progress')}
            className="btn-settings"
            title="View progress"
          >
            Progress
          </button>
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

        {/* Lessons Grid */}
        <div className="lessons-section">
          <h3>Available Lessons</h3>
          <div className="lessons-grid">
            {lessons.map((lesson) => {
              const progress = lessonProgress?.[lesson.apiId] || { status: 'Not Started', correctCount: 0 };
              const percent = Math.min(100, Math.round(((progress.correctCount || 0) / 5) * 100));
              const statusClass = (progress.status || 'Not Started').replace(/\s+/g, '-').toLowerCase();
              return (
                <div key={lesson.id} className="lesson-card">
                  <div className="lesson-icon" style={{ background: `linear-gradient(135deg, ${lesson.color}88, ${lesson.color})` }}>
                    <span className="lesson-icon-emoji" role="img" aria-label={lesson.title}>{lesson.icon}</span>
                  </div>
                  <h4>{lesson.title}</h4>
                  <p className="lesson-description">{lesson.description}</p>
                  <div className="lesson-meta">
                    <span className="badge">{lesson.level}</span>
                    <span className={`status-pill status-${statusClass}`}>{progress.status}</span>
                  </div>
                  <div className="lesson-progress">
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
                    </div>
                    <span className="progress-text">{percent}% Complete</span>
                  </div>
                  <button className="btn btn-primary btn-block" onClick={() => handleStartLesson(lesson)}>
                    Start Learning
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tips Section */}
        <div className="tips-section">
          <h3>Learning Tips for You</h3>
          <div className="tips-grid">
            <div className="tip-card">
              <h4>Break It Down</h4>
              <p>Focus on one lesson at a time. Small steps lead to big progress!</p>
            </div>
            <div className="tip-card">
              <h4>Use Audio</h4>
              <p>Listen to pronunciations to reinforce learning through multiple senses.</p>
            </div>
            <div className="tip-card">
              <h4>Practice Regularly</h4>
              <p>Short, frequent sessions work better than long study periods.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DyslexiaView;
