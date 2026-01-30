import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import ProfileSettings from '../ProfileSettings';
import './DyslexiaView.css';

const DyslexiaView = () => {
  const { user, logout } = useAuth();
  const [showSettings, setShowSettings] = useState(false);

  const lessons = [
    { id: 1, title: 'Greetings & Introductions', level: 'Beginner', progress: 0 },
    { id: 2, title: 'Basic Vocabulary', level: 'Beginner', progress: 0 },
    { id: 3, title: 'Numbers & Colors', level: 'Beginner', progress: 0 },
  ];

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
                <button className="btn btn-primary btn-block">Start Learning</button>
              </div>
            ))}
          </div>
        </div>

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
