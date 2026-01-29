import React, { useEffect, useMemo, useRef, useState } from 'react';
import InteractionCard from './InteractionCard';
import { useTheme } from '../../context/ThemeContext';
import { themeToCssVars } from '../../utils/theme';
import './LessonDisplay.css';
import './InteractiveLesson.css';

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const InteractiveLesson = ({ lesson, isLoading, error, onClose }) => {
  const { computed } = useTheme();
  const themeVars = useMemo(() => themeToCssVars(computed), [computed]);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeInteractionIndex, setActiveInteractionIndex] = useState(0);

  const paragraphs = useMemo(() => {
    if (!lesson?.textContent) return [];
    return lesson.textContent
      .split(/\n+/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }, [lesson?.textContent]);

  const interactions = useMemo(() => {
    if (!lesson?.interactions) return [];
    return [...lesson.interactions].sort((a, b) => a.position - b.position);
  }, [lesson?.interactions]);

  const currentInteraction = interactions[activeInteractionIndex];
  const isLocalLessonId = lesson?._id ? !/^[a-fA-F0-9]{24}$/.test(lesson._id) : false;

  const visibleParagraphs = useMemo(() => {
    if (!currentInteraction) return paragraphs;
    const cutoff = Math.min(paragraphs.length, currentInteraction.position + 1);
    return paragraphs.slice(0, cutoff);
  }, [paragraphs, currentInteraction]);

  useEffect(() => {
    setActiveInteractionIndex(0);
  }, [lesson?._id]);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [lesson?.audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    const handleLoadedMetadata = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [lesson?.audioUrl]);

  const handleToggleAudio = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (playError) {
      setIsPlaying(false);
    }
  };

  const handleSeek = (event) => {
    const nextTime = Number(event.target.value);
    if (!audioRef.current || Number.isNaN(nextTime)) return;
    audioRef.current.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handleContinue = () => {
    setActiveInteractionIndex((prev) => Math.min(prev + 1, interactions.length));
  };

  if (!lesson && !isLoading && !error) {
    return null;
  }

  return (
    <section className="lesson-display" aria-live="polite" style={themeVars}>
      <header className="lesson-header">
        <div>
          <p className="lesson-eyebrow">Lesson</p>
          <h2 className="lesson-title">{lesson?.title || 'Loading lesson...'}</h2>
        </div>
        {onClose && (
          <button type="button" className="lesson-close" onClick={onClose} aria-label="Close lesson">
            ✕
          </button>
        )}
      </header>

      {isLoading && <p className="lesson-status">Loading lesson content…</p>}
      {error && <p className="lesson-status error">{error}</p>}

      {lesson && (
        <div className="lesson-body">
          <article className="lesson-text" aria-label="Lesson text content">
            {visibleParagraphs.length > 0 ? (
              visibleParagraphs.map((paragraph, index) => (
                <p key={`${lesson._id || lesson.title}-p-${index}`}>{paragraph}</p>
              ))
            ) : (
              <p>No text content available for this lesson yet.</p>
            )}

            {currentInteraction ? (
              <InteractionCard
                lessonId={lesson._id}
                interaction={currentInteraction}
                onContinue={handleContinue}
                disableContinue={activeInteractionIndex >= interactions.length - 1 && paragraphs.length === visibleParagraphs.length}
                useLocalSubmission={isLocalLessonId}
              />
            ) : (
              <p className="interaction-empty">No interactions in this lesson yet.</p>
            )}
          </article>

          <aside className="lesson-side">
            <div className="lesson-audio" aria-label="Lesson audio">
              <div className="lesson-audio-header">
                <h3>Audio Narration</h3>
                <span className="lesson-audio-time">{formatTime(currentTime)} / {formatTime(duration)}</span>
              </div>

              {lesson.audioUrl ? (
                <>
                  <audio ref={audioRef} src={lesson.audioUrl} preload="metadata" />
                  <div className="lesson-audio-controls">
                    <button
                      type="button"
                      className="audio-toggle"
                      onClick={handleToggleAudio}
                      aria-pressed={isPlaying}
                      aria-label={isPlaying ? 'Pause audio narration' : 'Play audio narration'}
                    >
                      {isPlaying ? 'Pause' : 'Play'}
                    </button>
                    <input
                      className="audio-seek"
                      type="range"
                      min="0"
                      max={duration || 0}
                      step="0.1"
                      value={currentTime}
                      onChange={handleSeek}
                      disabled={!duration}
                      aria-label="Seek audio narration"
                    />
                  </div>
                </>
              ) : (
                <p className="lesson-muted">Audio narration is not available for this lesson yet.</p>
              )}
            </div>

            <div className="lesson-visuals" aria-label="Lesson visuals">
              <h3>Visual Aids</h3>
              {lesson.visuals && lesson.visuals.length > 0 ? (
                <div className="visuals-grid">
                  {lesson.visuals.map((visual, index) => (
                    <figure key={`${lesson._id || lesson.title}-v-${index}`}>
                      {visual.iconUrl ? (
                        <img src={visual.iconUrl} alt={visual.description} loading="lazy" />
                      ) : (
                        <div className="visual-placeholder" aria-hidden="true">🧩</div>
                      )}
                      <figcaption>{visual.description}</figcaption>
                    </figure>
                  ))}
                </div>
              ) : (
                <p className="lesson-muted">No visuals are attached to this lesson yet.</p>
              )}
            </div>
          </aside>
        </div>
      )}
    </section>
  );
};

export default InteractiveLesson;
