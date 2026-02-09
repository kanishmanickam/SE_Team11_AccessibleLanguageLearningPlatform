import React, { useEffect, useMemo, useState } from 'react';
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
    { id: 1, title: 'Greetings', level: 'Beginner', apiId: 'lesson-greetings' },
    { id: 2, title: 'Basic Words', level: 'Beginner', apiId: 'lesson-vocabulary' },
    { id: 3, title: 'Numbers', level: 'Beginner', apiId: 'lesson-numbers' },
  ];

  const handleStartLesson = (lesson) => {
    navigate(`/lessons/${lesson.apiId}`);
  };

  useEffect(() => {
    const key = normalizeUserId(user);
    const progress = getAllLessonProgress(key);
    setLessonProgress(progress || {});
  }, [user]);

  const completedCount = useMemo(() => {
    return Object.values(lessonProgress || {}).filter((entry) => entry?.status === 'Completed').length;
  }, [lessonProgress]);

  const wordsLearned = useMemo(() => {
    // Calculate total correct answers across all lessons as words learned
    return Object.values(lessonProgress || {}).reduce((total, entry) => {
      return total + (entry?.correctCount || 0);
    }, 0);
  }, [lessonProgress]);

  return (
    <div className="dyslexia-view">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-brand">
          <h1>Language Learning</h1>
        </div>
        <div className="nav-menu">
          <span className="user-name">Hello, {user?.name}!</span>
          <button onClick={() => setShowSettings(true)} className="btn-settings" title="Settings">
            Settings
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
                <div className="stat-value">{completedCount}</div>
                <div className="stat-label">Lessons Completed</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">0</div>
                <div className="stat-label">Hours Practiced</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{wordsLearned}</div>
                <div className="stat-label">Words Learned</div>
              </div>
            </div>
          </div>
        </div>

        {/* Lessons Grid */}
        <div className="lessons-section">
          <h3>Available Lessons</h3>
          <div className="lessons-grid">
            {lessons.map((lesson) => {
              const progress = lessonProgress?.[lesson.apiId] || { status: 'Not Started', correctCount: 0 };
              const percent = Math.min(100, Math.round((progress.correctCount / 5) * 100));
              return (
                <div key={lesson.id} className="lesson-card">
                  <div className="lesson-icon">Lesson</div>
                  <h4>{lesson.title}</h4>
                  <div className="lesson-meta">
                    <span className="badge">{lesson.level}</span>
                    <span className={`status-pill status-${progress.status.replace(/\s+/g, '-').toLowerCase()}`}>
                      {progress.status}
                    </span>
                  </div>
                  <div className="lesson-progress">
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{percent}% Complete</span>
                  </div>
                  <button
                    className="btn btn-primary btn-block"
                    onClick={() => handleStartLesson(lesson)}
                  >
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
