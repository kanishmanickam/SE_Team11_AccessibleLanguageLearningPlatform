import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PreferencesProvider } from './context/PreferencesContext';
import Login from './components/Login';
import Register from './components/Register';
import AccessibilitySetup from './components/AccessibilitySetup';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import LessonPage from './components/learning/LessonPage';
import ProgressPage from './components/ProgressPage';

// Diagnostic Component
const SystemCheck = () => {
  const [visible, setVisible] = React.useState(true);
  const [warnings, setWarnings] = React.useState([]);

  React.useEffect(() => {
    const updateWarnings = () => {
      const currentWarnings = [];

      // Feature support checks
      if (!('speechSynthesis' in window)) {
        currentWarnings.push("Text-to-Speech not supported.");
      }
      if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        currentWarnings.push("Voice recognition not supported.");
      }

      // Voice availability check
      if (window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) {
          currentWarnings.push("Warning: No TTS voices found. Audio may be silent.");
        }
      }

      setWarnings(currentWarnings);
    };

    // Initial check
    updateWarnings();

    // Listen for voice changes
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateWarnings;
    }

    // Cleanup
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  if (warnings.length === 0 || !visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '20px', right: '20px',
      background: '#fff3cd', border: '1px solid #ffeeba',
      padding: '15px', borderRadius: '8px', zIndex: 9999,
      maxWidth: '320px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <h4 style={{ margin: 0, color: '#856404', fontSize: '14px', fontWeight: '600' }}>System Warnings</h4>
        <button
          onClick={() => setVisible(false)}
          style={{
            background: 'none', border: 'none', color: '#856404',
            cursor: 'pointer', fontSize: '16px', padding: '0 4px',
            lineHeight: 1, marginLeft: '10px', opacity: 0.6
          }}
          onMouseOver={e => e.target.style.opacity = 1}
          onMouseOut={e => e.target.style.opacity = 0.6}
        >
          ×
        </button>
      </div>
      {warnings.map((w, i) => (
        <p key={i} style={{ margin: '4px 0', fontSize: '13px', color: '#856404' }}>{w}</p>
      ))}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <PreferencesProvider>
          <SystemCheck /> {/* Render the SystemCheck component here */}
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            {/* EPIC 1.3: Preference setup wizard is gated behind authentication */}
            <Route
              path="/accessibility-setup"
              element={
                <ProtectedRoute>
                  <AccessibilitySetup />
                </ProtectedRoute>
              }
            />
            {/* EPIC 1.4-1.6: Condition-specific learning dashboards */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            {/* EPIC 1.7: Progress review requires logged-in user */}
            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <ProgressPage />
                </ProtectedRoute>
              }
            />
            {/* EPIC 1.4: Dyslexia lesson routes (route-based lessons) */}
            <Route
              path="/lessons/:lessonId"
              element={
                <ProtectedRoute>
                  <LessonPage />
                </ProtectedRoute>
              }
            />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </PreferencesProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
