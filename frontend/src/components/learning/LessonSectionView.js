import React, { useEffect, useMemo, useRef, useState } from 'react';
import InteractionCard from './InteractionCard';
import VisualLesson from './VisualLesson';
import { useAuth } from '../../context/AuthContext';
import { getLessonProgress, normalizeUserId, saveLessonProgress } from '../../services/dyslexiaProgressService';
import {
  Activity,
  Apple,
  Armchair,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Footprints,
  Hand,
  Hash,
  Home,
  ImageOff,
  MessageCircle,
  Mic,
  MousePointer,
  Pause,
  Pencil,
  Play,
  RotateCcw,
  Smile,
  Sparkles,
  Star,
  Sun,
  Users,
  Handshake,
} from 'lucide-react';

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/* Map keywords in questions/section titles to icon illustrations */
const illustrationMap = [
  { keywords: ['hello', 'greet', 'greeting', 'hi'], Icon: Hand, label: 'Greeting', bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
  { keywords: ['how are you', 'feeling', 'fine'], Icon: Smile, label: 'Feelings', bg: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)' },
  { keywords: ['goodbye', 'bye', 'see you'], Icon: Handshake, label: 'Farewell', bg: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
  { keywords: ['reply', 'respond', 'answer'], Icon: MessageCircle, label: 'Conversation', bg: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)' },
  { keywords: ['chair', 'sit', 'furniture'], Icon: Armchair, label: 'Furniture', bg: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)' },
  { keywords: ['apple', 'eat', 'fruit', 'food'], Icon: Apple, label: 'Food', bg: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
  { keywords: ['book', 'read', 'reading'], Icon: BookOpen, label: 'Reading', bg: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
  { keywords: ['home', 'house', 'live', 'place'], Icon: Home, label: 'Home', bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
  { keywords: ['shoe', 'feet', 'wear'], Icon: Footprints, label: 'Clothing', bg: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' },
  { keywords: ['number', 'count', 'counting'], Icon: Hash, label: 'Numbers', bg: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)' },
  { keywords: ['after', 'next', 'order', 'sequence'], Icon: ArrowRight, label: 'Sequence', bg: 'var(--accent-gradient-strong)' },
  { keywords: ['three', 'star', 'items', 'set'], Icon: Star, label: 'Counting', bg: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
  { keywords: ['walk', 'action', 'run'], Icon: Activity, label: 'Actions', bg: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)' },
  { keywords: ['people', 'person', 'friend'], Icon: Users, label: 'People', bg: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)' },
  { keywords: ['sun', 'day', 'daily'], Icon: Sun, label: 'Daily Life', bg: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
  { keywords: ['speak', 'say', 'speech', 'talk', 'phrase'], Icon: Mic, label: 'Speaking', bg: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)' },
  { keywords: ['true', 'false', 'yes', 'no'], Icon: CheckCircle2, label: 'True or False', bg: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' },
  { keywords: ['click', 'choose', 'pick', 'select'], Icon: MousePointer, label: 'Choose', bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
  { keywords: ['type', 'write', 'word'], Icon: Pencil, label: 'Writing', bg: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' },
  { keywords: ['friendly', 'polite', 'smile'], Icon: Sparkles, label: 'Friendly', bg: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
];

const defaultIllustration = { Icon: BookOpen, label: 'Learning', bg: 'var(--accent-gradient-strong)' };

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

const LessonSectionView = ({ section, isReplay, useLocalSubmission, onInteractionChange }) => {
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
  const [audioFailed, setAudioFailed] = useState(false);

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

  const sectionId = section?.id || section?._id;

  useEffect(() => {
    setActiveInteractionIndex(0);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setActiveWord('');
    setIsUsingTTS(false);
    setAudioFailed(false);
    window.speechSynthesis.cancel();
    if (onInteractionChange && sectionId) {
      onInteractionChange(sectionId, 0);
    }
  }, [sectionKey, onInteractionChange, sectionId]);

  useEffect(() => {
    if (!lessonKey) return;
    getLessonProgress(userKey, lessonKey);
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
      const response = await fetch('/api/tts/speak', {
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
    if (section?.audioUrl && !audioFailed) {
      // Use Backend/File Audio
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
        // Audio file failed to play, fall back to TTS
        setAudioFailed(true);
        speakText(section.textContent || section.title || 'No text content');
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
    if (section?.audioUrl && !audioFailed) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {
          setAudioFailed(true);
          speakText(section.textContent);
        });
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
    setActiveInteractionIndex((prev) => {
      const nextIndex = Math.min(prev + 1, interactions.length);
      if (onInteractionChange && section) {
        onInteractionChange(section.id || section._id, nextIndex);
      }
      return nextIndex;
    });
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
    saveLessonProgress(userKey, lessonKey, {
      status,
      correctCount,
      correctIds: Array.from(correctIds),
    });

    // Notify other parts of the app (Progress page) that local progress changed.
    try {
      window.dispatchEvent(new CustomEvent('progress:updated', { detail: { lessonId: lessonKey, source: 'local' } }));
    } catch (e) {
      // ignore
    }
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
              enableSpeech={false}
              autoPlayNarration={false}
              disableAutoSpeak={true}
            />
          )}

          {!currentInteraction && interactions.length > 0 && (
            <div className="fx-card" style={{ padding: 16, marginTop: 14 }}>
              <h3 style={{ marginTop: 0 }}>Section complete</h3>
              <p style={{ marginBottom: 0 }}>
                You finished the questions for this section. Use the <strong>Next</strong> button below to continue.
              </p>
            </div>
          )}
        </div>

        <aside className="lesson-section-side">
          <div className="lesson-audio fx-card" aria-label="Lesson audio">
            <div className="lesson-audio-header">
              <h3>Audio Learning</h3>
              {!isUsingTTS && <span className="lesson-audio-time">{formatTime(currentTime)} / {formatTime(duration)}</span>}
            </div>

            {section.audioUrl && <audio ref={audioRef} src={section.audioUrl} preload="metadata" onError={() => { audioRef.current = null; setAudioFailed(true); }} />}

            <div className="lesson-audio-controls" style={{ flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                <button
                  type="button"
                  className="audio-toggle fx-pressable fx-focus"
                  onClick={handleToggleAudio}
                  aria-pressed={isPlaying}
                  style={{ flex: 1 }}
                >
                  {isPlaying ? (
                    <>
                      <Pause size={16} aria-hidden="true" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play size={16} aria-hidden="true" />
                      <span>Play Audio</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="audio-toggle fx-pressable fx-focus"
                  onClick={handleReplay}
                  title="Replay Audio"
                >
                  <RotateCcw size={16} aria-hidden="true" />
                  <span>Replay</span>
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
              {isPlaying ? "Text is being read aloud..." : "Press play to listen."}
            </p>
          </div>

          {/* Dynamic illustration based on current question */}
          <div className="lesson-illustration fx-card" aria-label="Question illustration">
            <h3>Illustration</h3>
            {(() => {
              const questionText = currentInteraction?.question || section?.title || '';
              const illust = getIllustration(questionText);
              return (
                <div className="illustration-scene" style={{ background: illust.bg }}>
                  <div className="illustration-emoji-wrapper">
                    <span className="illustration-emoji" aria-label={illust.label}>
                      <illust.Icon size={52} aria-hidden="true" />
                    </span>
                  </div>
                  <p className="illustration-label">{illust.label}</p>
                  <div className="illustration-sparkles" aria-hidden="true">
                    <span className="sparkle sparkle-1"><Sparkles size={14} aria-hidden="true" /></span>
                    <span className="sparkle sparkle-2"><Sparkles size={14} aria-hidden="true" /></span>
                    <span className="sparkle sparkle-3"><Sparkles size={14} aria-hidden="true" /></span>
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
                      <div className="visual-placeholder" aria-hidden="true"><ImageOff size={20} aria-hidden="true" /></div>
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
