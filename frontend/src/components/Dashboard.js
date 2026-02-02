import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import DyslexiaView from './learning/DyslexiaView';
import ADHDView from './learning/ADHDView';
import AutismView from './learning/AutismView';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const { preferences } = usePreferences();
  const containerRef = useRef(null);

  const [summary, setSummary] = React.useState(null);
  const [summaryLoading, setSummaryLoading] = React.useState(true);
  const [summaryError, setSummaryError] = React.useState('');
  const [progressLoadedHint, setProgressLoadedHint] = React.useState(false);

  // Load progress summary once on mount and listen for updates
  useEffect(() => {
    let mounted = true;
    const loadSummary = async () => {
      setSummaryLoading(true);
      setSummaryError('');
      try {
        const { getSummary } = await import('../services/progressService');
        const data = await getSummary();
        if (!mounted) return;
        if (data && data.success) {
          setSummary(data);
          setProgressLoadedHint(true);
          // hide hint after 3s
          setTimeout(() => mounted && setProgressLoadedHint(false), 3000);
        } else {
          setSummaryError('Unable to load progress summary.');
        }
      } catch (err) {
        if (!mounted) return;
        setSummaryError('Unable to load progress summary.');
      } finally {
        mounted && setSummaryLoading(false);
      }
    };

    loadSummary();

    // refresh when progress is updated elsewhere in the app
    const onProgressUpdated = (e) => {
      // If event includes a ready summary, use it immediately
      if (e?.detail?.summary && e.detail.summary.success) {
        setSummary(e.detail.summary);
      }
      // Always fetch to ensure up-to-date state
      loadSummary();
      // retry shortly in case backend write isn't immediately visible
      setTimeout(() => loadSummary(), 600);
    };
    window.addEventListener('progress:updated', onProgressUpdated);

    return () => {
      mounted = false;
      window.removeEventListener('progress:updated', onProgressUpdated);
    };
  }, []);

  // Apply preferences to the learning container whenever preferences change
  useEffect(() => {
    if (!preferences || !containerRef.current) return;

    const container = containerRef.current;

    // Reset classes (default = motion enabled)
    container.className = 'dashboard motion-enabled';

    // Apply theme
    if (preferences.contrastTheme && preferences.contrastTheme !== 'default') {
      container.classList.add(`theme-${preferences.contrastTheme}`);
    }

    // Apply font family
    if (preferences.fontFamily && preferences.fontFamily !== 'default') {
      container.classList.add(`font-${preferences.fontFamily}`);
    }

    // Apply font size
    if (preferences.fontSize) {
      container.classList.add(`font-${preferences.fontSize}`);
    }

    // Apply letter spacing
    if (preferences.letterSpacing) {
      container.classList.add(`letter-spacing-${preferences.letterSpacing}`);
    }

    // Apply word spacing
    if (preferences.wordSpacing) {
      container.classList.add(`word-spacing-${preferences.wordSpacing}`);
    }

    // Apply line height
    if (preferences.lineHeight) {
      container.classList.add(`line-height-${preferences.lineHeight}`);
    }

    // Apply distraction-free mode (Autism only)
    if (preferences.distractionFreeMode && user?.learningCondition === 'autism') {
      container.classList.add('distraction-free');
    }

    // Apply reduced animations
    // For Autism, treat reduced animations as part of distraction-free so normal mode stays animated.
    if (preferences.reduceAnimations && preferences.distractionFreeMode && user?.learningCondition === 'autism') {
      container.classList.add('reduce-animations');
    }
  }, [preferences, user?.learningCondition]);

  // Render the appropriate learning view based on user's condition
  const renderLearningView = () => {
    switch (user?.learningCondition) {
      case 'dyslexia':
        return <DyslexiaView />;
      case 'adhd':
        return <ADHDView />;
      case 'autism':
        return <AutismView />;
      default:
        return <DyslexiaView />; // Default view
    }
  };

  const summaryPercentage = summary && summary.totalLessons ? Math.round((summary.completedCount / summary.totalLessons) * 100) : 0;

  return (
    <div
      ref={containerRef}
      className="dashboard"
      id="learning-container"
      data-user-condition={user?.learningCondition || ''}
    >
      <div className="dashboard-progress fx-card">
        <h3>Progress</h3>
        {summaryLoading ? (
          <p>Loading progress…</p>
        ) : summaryError ? (
          <div>
            <p className="is-error">{summaryError}</p>
            <button type="button" onClick={() => window.location.reload()}>Retry</button>
          </div>
        ) : (
          <div>
            <p><strong>{summary.completedCount}</strong> of <strong>{summary.totalLessons}</strong> lessons completed ({summaryPercentage}%)</p>
            <div className="progress-bar" style={{ background: '#eee', height: 10, borderRadius: 5 }}>
              <div style={{ width: `${summaryPercentage}%`, background: '#4caf50', height: '100%', borderRadius: 5 }} />
            </div>

            <p style={{ marginTop: 8 }}><strong>Completed:</strong> {summary.completedCount} • <strong>Remaining:</strong> {summary.remaining}</p>

            {summary.completedLessons && summary.completedLessons.length > 0 ? (
              <div className="completed-lessons">
                <p className="section-label">Learning history</p>
                <ol>
                  {summary.completedLessons.map((l) => (
                    <li key={l.lessonId}>
                      <Link to={`/lessons/${l.lessonId}`}>{l.title}</Link> <small>({l.completedAt ? new Date(l.completedAt).toLocaleDateString() : '—'})</small>
                    </li>
                  ))}
                </ol>
              </div>
            ) : (
              <p>No lessons completed yet. Keep going!</p>
            )}

            {progressLoadedHint && <p className="subtle">Progress loaded</p>}
          </div>
        )}
      </div>

      {renderLearningView()}
    </div>
  );
};

export default Dashboard;
