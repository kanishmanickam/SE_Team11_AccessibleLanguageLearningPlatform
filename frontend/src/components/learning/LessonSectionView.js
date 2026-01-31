import React, { useEffect, useMemo, useRef, useState } from 'react';
import InteractionCard from './InteractionCard';
import VisualLesson from './VisualLesson';

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const LessonSectionView = ({ section, isReplay, useLocalSubmission }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeInteractionIndex, setActiveInteractionIndex] = useState(0);

  const sectionKey = useMemo(() => section?._id ?? section?.id ?? null, [section?._id, section?.id]);

  const paragraphs = useMemo(() => {
    if (!section?.textContent) return [];
    const results = [];
    const regex = /[^\n]+/g;
    let match;
    while ((match = regex.exec(section.textContent)) !== null) {
      const raw = match[0];
      const trimmed = raw.trim();
      if (!trimmed) continue;
      const leadingWhitespace = raw.search(/\S/);
      const startIndex = match.index + (leadingWhitespace >= 0 ? leadingWhitespace : 0);
      results.push({ text: trimmed, startIndex });
    }
    return results;
  }, [section?.textContent]);

  const interactions = useMemo(() => {
    if (!section?.interactions) return [];
    return [...section.interactions].sort((a, b) => (a.position || 0) - (b.position || 0));
  }, [section?.interactions]);

  const currentInteraction = interactions[activeInteractionIndex];

  useEffect(() => {
    setActiveInteractionIndex(0);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [sectionKey]);

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
  }, [section?.audioUrl]);

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
    } catch (error) {
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

  if (!section) return null;

  return (
    <div className="lesson-section">
      <header className="lesson-section-header">
        <div>
          <p className="lesson-section-label">Section</p>
          <h2>{section.title}</h2>
        </div>
        {isReplay && <span className="replay-pill">Replaying</span>}
      </header>

      <div className="lesson-section-body">
        <div className="lesson-section-text">
          {paragraphs.length > 0 ? (
            <VisualLesson
              paragraphs={paragraphs}
              highlights={section.highlights || []}
              visualAids={section.visualAids || section.visuals || []}
            />
          ) : (
            <p>No text content available.</p>
          )}

          {currentInteraction && (
            <InteractionCard
              lessonId={section.lessonId || section.id}
              interaction={currentInteraction}
              readOnly={isReplay}
              useLocalSubmission={useLocalSubmission}
              onContinue={handleContinue}
            />
          )}
        </div>

        <aside className="lesson-section-side">
          <div className="lesson-audio fx-card" aria-label="Lesson audio">
            <div className="lesson-audio-header">
              <h3>Audio Narration</h3>
              <span className="lesson-audio-time">{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>
            {section.audioUrl ? (
              <>
                <audio ref={audioRef} src={section.audioUrl} preload="metadata" />
                <div className="lesson-audio-controls">
                  <button
                    type="button"
                    className="audio-toggle fx-pressable fx-focus"
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
              <p className="lesson-muted">Audio narration is not available for this section.</p>
            )}
          </div>

          <div className="lesson-visuals fx-card" aria-label="Lesson visuals">
            <h3>Visual Aids</h3>
            {(section.visuals || []).length > 0 ? (
              <div className="visuals-grid">
                {(section.visuals || []).map((visual, index) => (
                  <figure key={`${section.id}-v-${index}`}>
                    {visual.imageUrl ? (
                      <img src={visual.imageUrl} alt={visual.altText} loading="lazy" />
                    ) : visual.iconUrl ? (
                      <img src={visual.iconUrl} alt={visual.description || 'Visual aid'} loading="lazy" />
                    ) : (
                      <div className="visual-placeholder" aria-hidden="true">🧩</div>
                    )}
                    <figcaption>{visual.relatedPhrase || visual.description}</figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <p className="lesson-muted">No visuals for this section.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default LessonSectionView;
