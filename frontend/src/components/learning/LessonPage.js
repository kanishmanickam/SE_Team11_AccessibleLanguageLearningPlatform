import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getLessonById } from '../../services/lessonService';
import InteractiveLesson from './InteractiveLesson';
import lessonSamples from './lessonSamples';
import './LessonPage.css';

const estimateReadingTime = (text) => {
  if (!text) return 1;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 160));
};

const LessonPage = () => {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const isLocalLessonId = useMemo(() => {
    return lessonId ? !/^[a-fA-F0-9]{24}$/.test(lessonId) : false;
  }, [lessonId]);

  useEffect(() => {
    let isMounted = true;

    const loadLesson = async () => {
      setIsLoading(true);
      setError('');

      try {
        if (isLocalLessonId && lessonSamples[lessonId]) {
          if (isMounted) {
            setLesson(lessonSamples[lessonId]);
            setIsLoading(false);
          }
          return;
        }

        const data = await getLessonById(lessonId);
        if (isMounted) {
          setLesson(data);
        }
      } catch (loadError) {
        if (isMounted) {
          if (lessonSamples[lessonId]) {
            setLesson(lessonSamples[lessonId]);
            setError('Live lesson data is unavailable. Showing a sample lesson instead.');
          } else {
            setError('Unable to load this lesson. Please try again.');
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadLesson();

    return () => {
      isMounted = false;
    };
  }, [lessonId, isLocalLessonId]);

  const readingTime = estimateReadingTime(lesson?.textContent);
  const interactionCount = lesson?.interactions?.length || 0;

  return (
    <div className="lesson-page">
      <header className="lesson-page-header">
        <div>
          <nav className="lesson-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/dashboard">Dashboard</Link>
            <span aria-hidden="true">›</span>
            <span>{lesson?.title || 'Lesson'}</span>
          </nav>
          <h1>{lesson?.title || 'Lesson'}</h1>
          <p className="lesson-subtitle">Stay focused with bite-sized steps and helpful visual cues.</p>
        </div>
          <div className="lesson-quick-stats">
            <div className="stat-card fx-card">
              <span className="stat-label">Reading time</span>
              <span className="stat-value">{readingTime} min</span>
            </div>
            <div className="stat-card fx-card">
              <span className="stat-label">Interactions</span>
              <span className="stat-value">{interactionCount}</span>
            </div>
          </div>
      </header>

      {error && <div className="lesson-alert" role="status">{error}</div>}

      <div className="lesson-page-body">
        <main>
          <InteractiveLesson lesson={lesson} isLoading={isLoading} error={error} />
        </main>
        <aside className="lesson-page-aside">
          <section className="lesson-side-card fx-card">
            <h2>Lesson focus</h2>
            <ul>
              <li>Read one paragraph at a time</li>
              <li>Use the visuals to anchor key ideas</li>
              <li>Ask for help whenever you need it</li>
            </ul>
          </section>
          <section className="lesson-side-card fx-card">
            <h2>Progress snapshot</h2>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: lesson ? '25%' : '0%' }}></div>
            </div>
            <p className="progress-text">You are just getting started. Keep going!</p>
          </section>
          <section className="lesson-side-card fx-card">
            <h2>Reminder</h2>
            <p>Take a short break after each interaction. Consistency helps retention.</p>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default LessonPage;
