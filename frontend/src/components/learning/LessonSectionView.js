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

const LessonSectionView = ({ section, isReplay, useLocalSubmission }) => {
  const { user } = useAuth();
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeInteractionIndex, setActiveInteractionIndex] = useState(0);

  // New states for Accessibility Features (3.1, 3.5, 3.6)
  const [playbackRate, setPlaybackRate] = useState(0.85); // Default slow for easier understanding
  const [activeWord, setActiveWord] = useState(''); // For visual highlighting
  const [isUsingTTS, setIsUsingTTS] = useState(false);

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
    setActiveWord('');
    setIsUsingTTS(false);
    window.speechSynthesis.cancel();
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
      setActiveWord('');
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

  useEffect(() => {
    if (audioRef.current && !isUsingTTS) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate, isUsingTTS]);

  // Audio Playback Handling (Backend -> Browser Fallback)
  const API_BASE_URL = 'http://localhost:5002';

  const speakText = async (text) => {
    // 1. Stop existing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis.cancel();

    setIsPlaying(false);
    setIsUsingTTS(false);

    // 2. Try Backend TTS first (Reliable on all OS)
    try {
      const response = await fetch(`${API_BASE_URL}/api/tts/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, speed: playbackRate })
      });

      if (!response.ok) throw new Error('Backend TTS failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.playbackRate = playbackRate;

      // Setup Backend Audio Handlers
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
        setActiveWord('');
      };

      // Note: Backend TTS (mp3) doesn't support word-level timestamps easily.
      // We will highlight the whole section or simulate? 
      // For now, we rely on the visual "text is being read" indicator and isPlaying state.

      audioRef.current = audio;
      audio.play();

    } catch (err) {
      console.warn("Backend TTS failed, falling back to Browser:", err);
      // 3. Fallback to Browser TTS
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = playbackRate;

      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          const charIndex = event.charIndex;
          const textBefore = text.slice(charIndex);
          const firstSpace = textBefore.search(/\s/);
          const word = firstSpace === -1 ? textBefore : textBefore.slice(0, firstSpace);
          setActiveWord(word.replace(/[.,!?;:()"]/g, ''));
        }
      };

      utterance.onstart = () => {
        setIsPlaying(true);
        setIsUsingTTS(true);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setIsUsingTTS(false);
        setActiveWord('');
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleToggleAudio = async () => {
    if (section?.audioUrl) {
      // Use Backend/File Audio
      if (!audioRef.current) return;
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        return;
      }
      try {
        audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        setIsPlaying(false);
      }
    } else {
      // Use TTS Fallback
      if (isPlaying || window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        setIsUsingTTS(false);
      } else {
        // Read content
        speakText(section.textContent || section.title || "No text content");
      }
    }
  };

  const handleReplay = () => {
    if (section?.audioUrl) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      speakText(section.textContent);
    }
  };

  const handleSeek = (event) => {
    if (isUsingTTS) return; // Cannot seek easily in TTS
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
              activeWord={activeWord}
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
              enableSpeech={true}
            />
          )}
        </div>

        <aside className="lesson-section-side">
          <div className="lesson-audio fx-card" aria-label="Lesson audio">
            <div className="lesson-audio-header">
              <h3>Audio Learning</h3>
              {!isUsingTTS && <span className="lesson-audio-time">{formatTime(currentTime)} / {formatTime(duration)}</span>}
            </div>

            {section.audioUrl && <audio ref={audioRef} src={section.audioUrl} preload="metadata" />}

            <div className="lesson-audio-controls" style={{ flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                <button
                  type="button"
                  className="audio-toggle fx-pressable fx-focus"
                  onClick={handleToggleAudio}
                  aria-pressed={isPlaying}
                  style={{ flex: 1 }}
                >
                  {isPlaying ? '⏸ Pause' : '▶ Play Audio'}
                </button>

                <button
                  type="button"
                  className="audio-toggle fx-pressable fx-focus"
                  onClick={handleReplay}
                  title="Replay Audio"
                >
                  🔄 Replay
                </button>
              </div>

              {!isUsingTTS && section.audioUrl && (
                <input
                  className="audio-seek"
                  type="range"
                  min="0"
                  max={duration || 0}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  disabled={!duration}
                  aria-label="Seek audio"
                />
              )}

              {/* Speed Control (Task 3.1 & 3.5) */}
              <div className="audio-speed-control" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                <span>Speed:</span>
                <button
                  onClick={() => setPlaybackRate(0.7)}
                  style={{ fontWeight: playbackRate === 0.7 ? 'bold' : 'normal', textDecoration: playbackRate === 0.7 ? 'underline' : 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
                >Slow (0.7x)</button>
                |
                <button
                  onClick={() => setPlaybackRate(1.0)}
                  style={{ fontWeight: playbackRate === 1.0 ? 'bold' : 'normal', textDecoration: playbackRate === 1.0 ? 'underline' : 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
                >Normal (1.0x)</button>
              </div>
            </div>

            {/* Visual Support Note */}
            <p className="lesson-muted" style={{ marginTop: '8px', fontSize: '0.8rem' }}>
              {isPlaying ? "📖 Text is being read aloud..." : "Press play to listen."}
            </p>
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
