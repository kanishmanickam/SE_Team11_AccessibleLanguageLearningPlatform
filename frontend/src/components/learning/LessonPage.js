import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getLessonById } from '../../services/lessonService';
import LessonReplay from './LessonReplay';
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

  const isSample = Boolean(isLocalLessonId && lessonSamples[lessonId]);

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
  const resolvedTitle = lesson?.title || (isLoading ? 'Loading lesson…' : 'Lesson');
  const resolvedSubtitle = isLoading
    ? 'Preparing your lesson steps…'
    : `About ${readingTime} min • ${interactionCount} interactions`;

  return (
    <div className="lesson-page">
      <LessonReplay
        lessonId={lessonId}
        isSample={isSample}
        lessonTitle={resolvedTitle}
        lessonSubtitle={resolvedSubtitle}
        notice={error}
      />
    </div>
  );
};

export default LessonPage;
