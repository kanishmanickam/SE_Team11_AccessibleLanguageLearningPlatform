import React, { useEffect, useMemo, useRef, useState } from 'react';
import InteractionCard from './InteractionCard';
import VisualLesson from './VisualLesson';
import { useAuth } from '../../context/AuthContext';
import { getLessonProgress, normalizeUserId, saveLessonProgress } from '../../services/dyslexiaProgressService';

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/* Map keywords in questions/section titles to emoji illustrations */
const illustrationMap = [
  { keywords: ['hello', 'greet', 'greeting', 'hi'], emoji: '👋', label: 'Greeting', bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
  { keywords: ['how are you', 'feeling', 'fine'], emoji: '😊', label: 'Feelings', bg: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)' },
  { keywords: ['goodbye', 'bye', 'see you'], emoji: '🤗', label: 'Farewell', bg: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
  { keywords: ['reply', 'respond', 'answer'], emoji: '💬', label: 'Conversation', bg: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)' },
  { keywords: ['chair', 'sit', 'furniture'], emoji: '🪑', label: 'Furniture', bg: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)' },
  { keywords: ['apple', 'eat', 'fruit', 'food'], emoji: '🍎', label: 'Food', bg: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
  { keywords: ['book', 'read', 'reading'], emoji: '📖', label: 'Reading', bg: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
  { keywords: ['home', 'house', 'live', 'place'], emoji: '🏠', label: 'Home', bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
  { keywords: ['shoe', 'feet', 'wear'], emoji: '👟', label: 'Clothing', bg: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' },
  { keywords: ['number', 'count', 'counting'], emoji: '🔢', label: 'Numbers', bg: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)' },
  { keywords: ['after', 'next', 'order', 'sequence'], emoji: '➡️', label: 'Sequence', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)' },
  { keywords: ['three', 'star', 'items', 'set'], emoji: '⭐', label: 'Counting', bg: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
  { keywords: ['walk', 'action', 'run'], emoji: '🚶', label: 'Actions', bg: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)' },
  { keywords: ['people', 'person', 'friend'], emoji: '👫', label: 'People', bg: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)' },
  { keywords: ['sun', 'day', 'daily'], emoji: '☀️', label: 'Daily Life', bg: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
  { keywords: ['speak', 'say', 'speech', 'talk', 'phrase'], emoji: '🗣️', label: 'Speaking', bg: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)' },
  { keywords: ['true', 'false', 'yes', 'no'], emoji: '✅', label: 'True or False', bg: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' },
  { keywords: ['click', 'choose', 'pick', 'select'], emoji: '👆', label: 'Choose', bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
  { keywords: ['type', 'write', 'word'], emoji: '✏️', label: 'Writing', bg: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' },
  { keywords: ['friendly', 'polite', 'smile'], emoji: '😄', label: 'Friendly', bg: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
];

const defaultIllustration = { emoji: '📚', label: 'Learning', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' };

const getIllustration = (text) => {
  if (!text) return defaultIllustration;
  const lower = text.toLowerCase();
  for (const item of illustrationMap) {
    if (item.keywords.some((kw) => lower.includes(kw))) {
      return item;
    }
  }
  return defaultIllustration;
};

const LessonSectionView = ({ section, isReplay, useLocalSubmission }) => {
  const { user } = useAuth();
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeInteractionIndex, setActiveInteractionIndex] = useState(0);

  const sectionKey = useMemo(() => section?._id ?? section?.id ?? null, [section?._id, section?.id]);
  const lessonKey = useMemo(() => section?.lessonId ?? section?._id ?? section?.id ?? null, [section?.lessonId, section?._id, section?.id]);
  const userKey = useMemo(() => normalizeUserId(user), [user]);

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
    return [...section.interactions]
      .sort((a, b) => (a.position || 0) - (b.position || 0))
      .slice(0, 5);
  }, [section?.interactions]);

  const currentInteraction = interactions[activeInteractionIndex];

  useEffect(() => {
    setActiveInteractionIndex(0);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [sectionKey]);

  useEffect(() => {
    if (!lessonKey) return;
    const stored = getLessonProgress(userKey, lessonKey);
  }, [lessonKey, userKey]);

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
      // Ensure audio is loaded before playing
      if (audioRef.current.readyState < 2) {
        audioRef.current.load();
        // Wait for audio to be ready with timeout
        await Promise.race([
          new Promise((resolve) => {
            const onCanPlay = () => {
              audioRef.current?.removeEventListener('canplay', onCanPlay);
              audioRef.current?.removeEventListener('loadeddata', onCanPlay);
              resolve();
            };
            audioRef.current.addEventListener('canplay', onCanPlay);
            audioRef.current.addEventListener('loadeddata', onCanPlay);
          }),
          new Promise((resolve) => setTimeout(resolve, 3000)) // 3 second timeout
        ]);
      }
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.warn('Audio playback failed:', error);
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

  const handleAnswered = ({ isCorrect, interactionId }) => {
    if (!lessonKey || !interactionId) return;
    if (isReplay) return;

    const existing = getLessonProgress(userKey, lessonKey);
    const nextStatus = existing.status === 'Not Started' ? 'In Progress' : existing.status;
    const correctIds = new Set(existing.correctIds || []);
    if (isCorrect) {
      correctIds.add(interactionId);
    }
    const correctCount = Math.min(5, correctIds.size);
    const status = correctCount >= 5 ? 'Completed' : nextStatus;
    const updated = saveLessonProgress(userKey, lessonKey, {
      status,
      correctCount,
      correctIds: Array.from(correctIds),
    });
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
              lessonId={lessonKey}
              interaction={currentInteraction}
              readOnly={isReplay}
              useLocalSubmission={useLocalSubmission}
              onContinue={handleContinue}
              onAnswered={handleAnswered}
              autoAdvanceOnCorrect={!isReplay}
              enableTimer={!isReplay}
              autoPlayNarration={false}
              disableAutoSpeak={true}
            />
          )}
        </div>

        <aside className="lesson-section-side">
          {/* Hidden audio element for Replay narration button */}
          {section.audioUrl && (
            <audio ref={audioRef} src={section.audioUrl} preload="metadata" />
          )}

          {/* Dynamic illustration based on current question */}
          <div className="lesson-illustration fx-card" aria-label="Question illustration">
            <h3>Illustration</h3>
            {(() => {
              const questionText = currentInteraction?.question || section?.title || '';
              const illust = getIllustration(questionText);
              return (
                <div className="illustration-scene" style={{ background: illust.bg }}>
                  <div className="illustration-emoji-wrapper">
                    <span className="illustration-emoji" role="img" aria-label={illust.label}>
                      {illust.emoji}
                    </span>
                  </div>
                  <p className="illustration-label">{illust.label}</p>
                  <div className="illustration-sparkles" aria-hidden="true">
                    <span className="sparkle sparkle-1">✦</span>
                    <span className="sparkle sparkle-2">✧</span>
                    <span className="sparkle sparkle-3">✦</span>
                  </div>
                </div>
              );
            })()}
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
