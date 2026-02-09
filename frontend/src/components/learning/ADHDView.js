import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import ProfileSettings from '../ProfileSettings';
import './ADHDView.css';
import ReactConfetti from 'react-confetti';
import { getSummary } from '../../services/progressService';
import api from '../../utils/api';
import {
  Bot,
  BookOpen,
  ChevronLeft,
  Dumbbell,
  Hand,
  Hash,
  Headphones,
  Lightbulb,
  Mic,
  Pause,
  Pencil,
  Play,
  Rocket,
  RotateCcw,
  Settings,
  Target,
  Timer,
} from 'lucide-react';

const ADHDView = ({ initialLessonId = null }) => {
  const { user, logout } = useAuth();
  const { preferences } = usePreferences();
  const navigate = useNavigate();
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Lesson Logic State
  const [activeLesson, setActiveLesson] = useState(null);
  const [steps, setSteps] = useState([]); // Dynamic steps array
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [currentLessonScore, setCurrentLessonScore] = useState(0);
  const [lessonPhase, setLessonPhase] = useState('idle');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [countdownValue, setCountdownValue] = useState(5);
  const [dummyUpdate, setDummyUpdate] = useState(0); // For forcing re-renders on audio state changes

  const savedCompletionRef = React.useRef(new Set());

  const saveLessonCompletion = async (lessonId) => {
    try {
      const lessonKey = `adhd-lesson-${lessonId}`;
      const res = await api.post('/users/complete-lesson', { lessonKey });

      const summaryFromBackend = res?.data?.summary;
      if (summaryFromBackend) {
        window.dispatchEvent(new CustomEvent('progress:updated', { detail: { summary: summaryFromBackend } }));
      } else {
        try {
          const s = await getSummary();
          if (s) window.dispatchEvent(new CustomEvent('progress:updated', { detail: { summary: s } }));
        } catch (e) {
          // ignore
        }
      }
    } catch (e) {
      // Non-blocking: completion should not break the lesson flow
      console.error('Error saving ADHD lesson completion', e);
    }
  };

  const exitLesson = () => {
    window.speechSynthesis.cancel();
    setActiveLesson(null);
    setLessonPhase('idle');
    setSteps([]);
    setCurrentStepIndex(0);
    setFeedback(null);
    setShowHint(false);
    setAttempts(0);
    setIsTransitioning(false);
    setIsLoading(false);
    setCountdownValue(5);
  };

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Audio handling
  // Audio handling
  const [currentAudio, setCurrentAudio] = useState(null);

  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = async (text, rate = 1) => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    window.speechSynthesis.cancel();
    setIsPlaying(false);

    try {
      const response = await fetch('/api/tts/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, speed: rate })
      });

      if (!response.ok) throw new Error('Audio generation failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      audio.playbackRate = rate;

      audio.play().catch(e => console.error("Playback failed:", e));
      setCurrentAudio(audio);
      setIsPlaying(true);

      audio.onended = () => {
        URL.revokeObjectURL(url);
        setCurrentAudio(null);
        setIsPlaying(false);
      };

      audio.onpause = () => setIsPlaying(false);
      audio.onplay = () => setIsPlaying(true);

    } catch (error) {
      console.error("Server TTS failed, falling back to browser:", error);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };



  // Ensure speed updates apply to active audio
  useEffect(() => {
    if (currentAudio) {
      currentAudio.playbackRate = playbackRate;
    }
  }, [playbackRate, currentAudio]);


  const handleSessionEnd = () => {
    setIsSessionActive(false);
    setActiveLesson(null);
    setLessonPhase('idle');
    if (preferences?.breakReminders) {
      alert('Time for a break! Take 5 minutes to rest before continuing.');
    }
  };

  useEffect(() => {
    let timer;
    if (isSessionActive && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      handleSessionEnd();
    }
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSessionActive, timeRemaining]);

  // Countdown Effect
  useEffect(() => {
    let interval;
    if (lessonPhase === 'countdown' && countdownValue > 0) {
      interval = setInterval(() => {
        setCountdownValue((prev) => prev - 1);
      }, 1000);
    } else if (lessonPhase === 'countdown' && countdownValue === 0) {
      setLessonPhase('active');
    }
    return () => clearInterval(interval);
  }, [lessonPhase, countdownValue]);

  const startSession = () => {
    const duration = (preferences?.sessionDuration || 20) * 60; // Convert to seconds
    setTimeRemaining(duration);
    setIsSessionActive(true);
    setScore(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const baseLessons = [
    {
      id: 1,
      title: 'Greetings',
      duration: '10 min',
      Icon: Hand,
      steps: [
        {
          type: 'learn',
          content: 'Hello',
          explanation: 'A common way to greet someone when you meet them.',
          visual: require('../../assets/images/greetings.png'),
          highlight: 'Hello',
          hint: 'Say this when you see a friend!'
        },
        {
          type: 'quiz',
          question: 'Which word means "Hello"?',
          options: ['Goodbye', 'Hello', 'Thanks'],
          correct: 'Hello',
          hint: 'It starts with H!'
        },
        {
          type: 'learn',
          content: 'Good Morning',
          explanation: 'Used to say hello in the early part of the day.',
          visual: null,
          highlight: 'Morning',
          hint: 'Use this before lunch.'
        },
        {
          type: 'quiz',
          question: 'When do we say "Good Morning"?',
          options: ['At night', 'In the morning', 'At lunch'],
          correct: 'In the morning',
          hint: 'Think about when you wake up.'
        }
      ]
    },
    {
      id: 2,
      title: 'Basic Words',
      duration: '10 min',
      Icon: Pencil,
      steps: [
        {
          type: 'learn',
          content: 'Apple',
          explanation: 'A round fruit that can be red or green.',
          visual: null,
          highlight: 'Apple',
          hint: 'Delicious and crunchy!'
        },
        {
          type: 'quiz',
          question: 'Which one is a fruit?',
          options: ['Car', 'Apple', 'Table'],
          correct: 'Apple',
          hint: 'It grows on a tree.'
        },
        {
          type: 'learn',
          content: 'Cat',
          explanation: 'A small animal that says "Meow".',
          visual: null,
          highlight: 'Cat',
          hint: 'A popular fluffy pet.'
        },
        {
          type: 'quiz',
          question: 'Which animal says "Meow"?',
          options: ['Dog', 'Cat', 'Bird'],
          correct: 'Cat',
          hint: 'It likes to chase mice.'
        }
      ]
    },
    {
      id: 3,
      title: 'Numbers',
      duration: '10 min',
      Icon: Hash,
      steps: [
        {
          type: 'learn',
          content: 'One (1)',
          explanation: 'The number 1. It means a single thing.',
          visual: null,
          highlight: 'One',
          hint: 'Hold up a single finger.'
        },
        {
          type: 'quiz',
          question: 'How many noses do you have?',
          options: ['One', 'Two', 'Three'],
          correct: 'One',
          hint: 'Just the one on your face!'
        },
        {
          type: 'learn',
          content: 'Two (2)',
          explanation: 'The number 2. One plus one equals two.',
          visual: null,
          highlight: 'Two',
          hint: 'Like a pair of shoes.'
        },
        {
          type: 'quiz',
          question: 'How many eyes do most people have?',
          options: ['One', 'Two', 'Ten'],
          correct: 'Two',
          hint: 'One on the left, one on the right.'
        }
      ]
    },
    {
      id: 4,
      title: 'Audio Stories',
      duration: '15 min',
      Icon: Headphones,
      isStory: true,
      steps: [
        {
          type: 'story',
          title: 'The Friendly Rabbit',
          content: 'Once upon a time, there was a rabbit named Hop. Hop loved to jump over logs. One day, he met a turtle who was very slow. Hop learned that being fast is fun, but being slow lets you see more flowers.',
          visual: null
        },
        {
          type: 'story',
          title: 'The Lost Key',
          content: 'Sam had a shiny silver key. He dropped it in the grass. A crow flew down and picked it up. Sam chased the crow to a tall tree. The crow dropped the key, and Sam caught it!',
          visual: null
        }
      ]
    }
  ];

  const handleStartLesson = async (lesson) => {
    setActiveLesson(lesson);
    setIsLoading(true);
    setLessonPhase('intro');

    let initialSteps = [...lesson.steps];

    try {
      if (lesson.isStory) {
        // Generate quizzes for each story step
        let newSteps = [];
        for (const step of initialSteps) {
          newSteps.push(step);
          if (step.type === 'story') {
            try {
              const response = await fetch('/api/ai/story-quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storyText: step.content })
              });
              const data = await response.json();
              if (data.questions) {
                newSteps.push(...data.questions);
              }
            } catch (e) {
              console.error('Error fetching story quiz', e);
              // Fallback or skip if errors
            }
          }
        }
        initialSteps = newSteps;
      } else {
        // Basic lesson - append random questions
        try {
          const response = await fetch('/api/ai/generate-questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic: lesson.title })
          });
          const data = await response.json();
          if (data.questions) {
            initialSteps.push(...data.questions);
          }
        } catch (e) {
          console.error('Error fetching generic questions', e);
        }
      }
    } catch (err) {
      console.error("AI generation failed", err);
    }

    setSteps(initialSteps);
    setCurrentStepIndex(0);
    setCurrentLessonScore(0);
    setFeedback(null);
    setShowHint(false);
    setAttempts(0);
    setIsTransitioning(false);
    setCountdownValue(5);
    setIsLoading(false);
  };

  const autoOpenedLessonRef = React.useRef(null);

  useEffect(() => {
    if (!initialLessonId) return;
    if (activeLesson) return;

    const targetId = Number(initialLessonId);
    if (!Number.isFinite(targetId)) return;
    if (autoOpenedLessonRef.current === targetId) return;

    const lesson = baseLessons.find((l) => l.id === targetId);
    if (!lesson) return;

    autoOpenedLessonRef.current = targetId;
    if (!isSessionActive) {
      startSession();
    }
    handleStartLesson(lesson);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLessonId, activeLesson]);

  const handleNextStep = () => {
    window.speechSynthesis.cancel(); // Stop audio on next
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setFeedback(null);
      setShowHint(false);
      setAttempts(0);
      setIsTransitioning(false);
    } else {
      setLessonPhase('complete');
      // Removed completion audio
    }
  }

  useEffect(() => {
    if (lessonPhase !== 'complete') return;
    if (!activeLesson?.id) return;
    if (currentLessonScore < 20) return;

    const key = `adhd-lesson-${activeLesson.id}`;
    if (savedCompletionRef.current.has(key)) return;
    savedCompletionRef.current.add(key);
    saveLessonCompletion(activeLesson.id);
  }, [lessonPhase, activeLesson, currentLessonScore]);

  const handlePreviousStep = () => {
    window.speechSynthesis.cancel();
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setFeedback(null);
      setShowHint(false);
      setAttempts(0);
      setIsTransitioning(false);
    }
  };

  const handleReplayStep = () => {
    const step = steps[currentStepIndex];
    if (step.type === 'learn') {
      // Replay text? visual only usually, but user removed Listen button.
      // Maybe this button should just reset feedback.
    } else if (step.type === 'story') {
      playAudio(step.content, playbackRate);
    }
    setFeedback(null);
  };

  const handleAnswer = (option) => {
    if (isTransitioning) return;

    const step = steps[currentStepIndex];
    if (option === step.correct) {
      setFeedback({ type: 'success', message: 'Correct! Great job!' });
      const points = 10;
      setScore(prev => prev + points);
      setCurrentLessonScore(prev => prev + points);
      // Removed audio feedback
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= 3) {
        setFeedback({ type: 'info', message: 'Moving to next question...' });
        const points = 5;
        setScore(prev => prev + points);
        setCurrentLessonScore(prev => prev + points);
        // Removed audio feedback
        setIsTransitioning(true);
        setTimeout(() => {
          handleNextStep();
        }, 1500);
      } else {
        setFeedback({ type: 'error', message: 'Not quite. Try reading the hint!' });
        // Removed audio feedback
      }
    }
  };

  // Voice Input for ADHD View
  const [isListening, setIsListening] = useState(false);
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setFeedback({ type: 'error', message: 'Voice input not supported in this browser' });
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      // setFeedback({ type: 'info', message: 'Listening...' }); // Optional, might distract
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      // Match with options
      const step = steps[currentStepIndex];
      if (step.type === 'quiz' && step.options) {
        const matchedOpt = step.options.find(opt =>
          transcript.includes(opt.toLowerCase()) || opt.toLowerCase().includes(transcript)
        );
        if (matchedOpt) {
          handleAnswer(matchedOpt);
        } else {
          setFeedback({ type: 'error', message: `Heard "${transcript}". Try saying one of the options.` });
        }
      }
    };

    recognition.onerror = () => {
      setFeedback({ type: 'error', message: 'Could not hear clearly. Try again.' });
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handlePlayStory = () => {
    const step = steps[currentStepIndex];
    if (currentAudio) {
      // Stop current audio
      currentAudio.pause();
      setCurrentAudio(null);
      // Wait 2 seconds before restarting as requested
      setTimeout(() => {
        playAudio(step.content, playbackRate);
      }, 2000);
    } else {
      playAudio(step.content, playbackRate);
    }
  };

  const currentStep = steps.length > 0 ? steps[currentStepIndex] : null;

  return (
    <div className="adhd-view">
      {/* Minimal Top Bar */}
      <header className="top-bar">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BookOpen size={22} aria-hidden="true" />
          <span>Learn</span>
        </h1>
        <div className="header-actions">
          {isSessionActive && timeRemaining !== null && (
            <div className="timer-display">
              <span className="timer-icon" aria-hidden="true"><Timer size={16} /></span>
              <span className="timer-text">{formatTime(timeRemaining)}</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => navigate('/progress')}
            className="btn-minimal"
            title="View progress"
          >
            Progress
          </button>
          <button onClick={() => setShowSettings(true)} className="btn-minimal" title="Settings">
            <Settings size={18} aria-hidden="true" />
          </button>
          <button onClick={logout} className="btn-minimal">
            Exit
          </button>
        </div>
      </header>

      {showSettings && (
        <ProfileSettings onClose={() => setShowSettings(false)} />
      )}

      <main className="focused-content">
        <div className="content-wrapper">

          {!activeLesson ? (
            /* Dashboard View */
            <>
              <div className="focus-card">
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>Hi, {user?.name}!</span>
                  <Hand size={18} aria-hidden="true" />
                </h2>
                <p>Let's focus on one lesson at a time.</p>
              </div>

              {!isSessionActive ? (
                <div className="session-start">
                  <h3>Ready to Learn?</h3>
                  <p>Click below to start a focused {preferences?.sessionDuration || 20}-minute session</p>
                  <button onClick={startSession} className="btn-start">
                    Start Session
                  </button>
                </div>
              ) : (
                <>
                  <div className="quick-stats">
                    <div className="stat-box">
                      <div className="stat-number">{baseLessons.length}</div>
                      <div className="stat-text">Lessons</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-number">{score}</div>
                      <div className="stat-text">Points Today</div>
                    </div>
                  </div>

                  <div className="lesson-focus">
                    <h3>Choose One Lesson</h3>
                    <div className="lesson-list">
                      {baseLessons.map((lesson) => (
                        <div key={lesson.id} className="lesson-item">
                          <div className="lesson-content">
                            <span className="lesson-emoji" aria-hidden="true"><lesson.Icon size={22} /></span>
                            <div className="lesson-info">
                              <h4>{lesson.title}</h4>
                              <span className="lesson-time"><Timer size={14} aria-hidden="true" /> {lesson.duration}</span>
                            </div>
                          </div>
                          <button onClick={() => handleStartLesson(lesson)} className="btn-lesson">Start</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          ) : lessonPhase === 'intro' ? (
            <div className="intro-view" style={{ textAlign: 'center', padding: '3rem', animation: 'fadeIn 0.5s ease' }}>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>{activeLesson.title}</h2>
              {isLoading && (
                <p style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <Bot size={16} aria-hidden="true" />
                  <span>Generating focused content for you...</span>
                </p>
              )}
              <div style={{ background: 'var(--accent-color-soft)', padding: '2rem', borderRadius: '15px', display: 'inline-block', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
                <p style={{ fontSize: '1.5rem', margin: 0, color: 'var(--accent-color-hover)' }}>Passing Score: <strong>20 Points</strong></p>
              </div>
              <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                Get ready! We will count down before we start.
              </p>
              <button
                onClick={() => setLessonPhase('countdown')}
                className="btn-primary"
                disabled={isLoading}
                style={{
                  padding: '1rem 3rem',
                  fontSize: '1.5rem',
                  borderRadius: '50px',
                  border: 'none',
                  background: isLoading ? 'rgba(148, 163, 184, 0.45)' : 'var(--accent-color)',
                  color: 'white',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 15px rgba(77, 134, 201, 0.28)'
                }}
              >
                {isLoading ? 'Loading...' : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                    <Rocket size={18} aria-hidden="true" />
                    <span>I'm Ready!</span>
                  </span>
                )}
              </button>
            </div>
          ) : lessonPhase === 'countdown' ? (
            <div className="countdown-view" style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh'
            }}>
              <h2 style={{ fontSize: '2rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Starting in...</h2>
              <div style={{
                fontSize: '8rem', fontWeight: 'bold', color: countdownValue <= 3 ? 'var(--error-color)' : 'var(--success-color)',
                animation: 'scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}>
                {countdownValue === 0 ? 'GO!' : countdownValue}
              </div>
            </div>
          ) : lessonPhase === 'complete' ? (
            <div className="lesson-complete-view" style={{ textAlign: 'center', padding: '3rem', animation: 'fadeIn 0.5s ease', position: 'relative', overflow: 'hidden' }}>
              {currentLessonScore >= 20 ? (
                <>
                  <ReactConfetti
                    width={windowSize.width}
                    height={windowSize.height}
                    recycle={true}
                    numberOfPieces={200}
                    gravity={0.2}
                  />
                  <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-primary)', zIndex: 10, position: 'relative' }}>Congratulations!</h2>
                  <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', zIndex: 10, position: 'relative' }}>
                    You have completed <strong>{activeLesson.title}</strong>!
                  </p>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: '1rem' }} aria-hidden="true"><Dumbbell size={64} /></div>
                  <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Don't Give Up!</h2>
                  <p style={{ fontSize: '1.5rem', color: 'var(--error-color)', fontWeight: 'bold' }}>
                    You have one more chance!!!!
                  </p>
                  <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
                    You need 20 points to pass. Let's try again!
                  </p>
                </>
              )}

              <div className="score-summary" style={{
                background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '20px', margin: '2rem auto', maxWidth: '300px',
                boxShadow: 'var(--fx-shadow-soft)', border: '1px solid var(--border-color)', zIndex: 10, position: 'relative'
              }}>
                <div style={{ fontSize: '0.9rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Lesson Score</div>
                <div style={{ fontSize: '3.5rem', fontWeight: '800', color: currentLessonScore >= 20 ? 'var(--success-color)' : 'var(--error-color)', margin: '0.5rem 0' }}>{currentLessonScore}</div>
                <div style={{ fontSize: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                  Total Points Today: <strong>{score}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                {currentLessonScore >= 20 ? (
                  <button
                    onClick={exitLesson}
                    className="btn-primary"
                    style={{
                      padding: '1rem 2rem', fontSize: '1.1rem', borderRadius: '12px', border: 'none',
                      background: 'var(--accent-color)', color: 'white', cursor: 'pointer', boxShadow: '0 4px 12px rgba(77, 134, 201, 0.22)'
                    }}
                  >
                    Return to Dashboard
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartLesson(activeLesson)}
                    className="btn-primary"
                    style={{
                      padding: '1rem 2rem', fontSize: '1.1rem', borderRadius: '12px', border: 'none',
                      background: 'var(--warning-color)', color: 'white', cursor: 'pointer', boxShadow: '0 4px 12px rgba(194, 122, 44, 0.22)'
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                      <RotateCcw size={18} aria-hidden="true" />
                      <span>Try Again</span>
                    </span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="lesson-player">
              <div className="lesson-header">
                <button onClick={exitLesson} className="btn-back">← Back</button>
                <h3>{activeLesson.title} - Step {currentStepIndex + 1}/{steps.length}</h3>
              </div>

              <div className="step-content">
                {!currentStep ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <h3>Content coming soon</h3>
                  </div>
                ) : (
                  <>
                    {currentStep.visual && (
                      <div className="step-visual">
                        <img src={currentStep.visual} alt="Lesson visual" />
                      </div>
                    )}

                    <div className="step-main">
                      {currentStep.type === 'learn' && (
                        <div className="learn-mode">
                          <h2 className={currentStep.highlight ? 'highlight-text' : ''}>
                            {currentStep.content}
                          </h2>
                          <p style={{ fontSize: '1.5rem', color: 'var(--text-primary)', fontWeight: '500', marginTop: '1rem' }}>{currentStep.explanation}</p>
                        </div>
                      )}

                      {currentStep.type === 'story' && (
                        <div className="story-mode">
                          <h2>{currentStep.title}</h2>
                          <div className="story-controls" style={{ margin: '20px 0', padding: '20px', background: '#f5f5f5', borderRadius: '10px' }}>
                            <div style={{ marginBottom: '15px' }}>
                              <label>Audio Speed: {playbackRate}x</label>
                              <input
                                type="range"
                                min="0.5"
                                max="2"
                                step="0.25"
                                value={playbackRate}
                                onChange={(e) => {
                                  const newRate = parseFloat(e.target.value);
                                  setPlaybackRate(newRate);
                                  if (currentAudio) currentAudio.playbackRate = newRate;
                                }}
                                style={{ marginLeft: '10px' }}
                              />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                              <button onClick={handlePlayStory} className="btn-audio" style={{ fontSize: '1.2rem', padding: '10px 30px' }}>
                                {currentAudio && !currentAudio.paused ? (
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                                    <RotateCcw size={18} aria-hidden="true" />
                                    <span>Restart Story</span>
                                  </span>
                                ) : (
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                                    <Play size={18} aria-hidden="true" />
                                    <span>Play Story</span>
                                  </span>
                                )}
                              </button>
                              {currentAudio && (
                                <button
                                  key={dummyUpdate} // Force re-render of button when state changes
                                  onClick={() => {
                                    if (currentAudio.paused) {
                                      currentAudio.play();
                                      setDummyUpdate(prev => prev + 1); // Force re-render
                                    } else {
                                      currentAudio.pause();
                                      setDummyUpdate(prev => prev + 1); // Force re-render
                                    }
                                  }}
                                  className="btn-audio"
                                  style={{ fontSize: '1.2rem', padding: '10px 30px', background: '#ff9800' }}
                                >
                                  {currentAudio.paused ? (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                                      <Play size={18} aria-hidden="true" />
                                      <span>Resume</span>
                                    </span>
                                  ) : (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                                      <Pause size={18} aria-hidden="true" />
                                      <span>Pause</span>
                                    </span>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                          <p
                            className={isPlaying ? 'story-text active-reading-block' : 'story-text'}
                            style={{
                              fontSize: '1.3rem',
                              lineHeight: '1.6',
                              color: 'var(--text-primary)',
                              textAlign: 'left',
                              background: isPlaying ? '#fff9c4' : 'var(--bg-primary)', // Highlight background
                              padding: '20px',
                              borderRadius: '8px',
                              transition: 'background 0.3s ease',
                              border: isPlaying ? '2px solid #fbc02d' : '1px solid transparent'
                            }}
                          >
                            {currentStep.content}
                          </p>
                        </div>
                      )}

                      {currentStep.type === 'quiz' && (
                        <div className="quiz-mode">
                          <h2>{currentStep.question}</h2>
                          <div className="options-grid">
                            {currentStep.options.map(opt => (
                              <button
                                key={opt}
                                onClick={() => handleAnswer(opt)}
                                className="btn-option"
                                disabled={feedback?.type === 'success' || isTransitioning}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>

                          <div style={{ marginTop: '20px', textAlign: 'center' }}>
                            <button
                              onClick={startListening}
                              disabled={isListening}
                              style={{
                                background: isListening ? '#ffe0b2' : 'transparent',
                                border: '2px solid #ff9800',
                                padding: '8px 20px',
                                borderRadius: '30px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                color: '#e65100',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}
                            >
                              <Mic size={16} aria-hidden="true" />
                              <span>{isListening ? 'Listening...' : 'Use Voice Answer'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="interaction-area">
                      {feedback && (
                        <div className={`feedback-message ${feedback.type}`}>
                          {feedback.message}
                        </div>
                      )}

                      <div className="controls">
                        <button onClick={handleReplayStep} className="btn-control" title="Replay">
                          <RotateCcw size={16} aria-hidden="true" />
                          <span>Replay</span>
                        </button>

                        <button
                          onClick={handlePreviousStep}
                          className="btn-control"
                          title="Previous"
                          disabled={currentStepIndex === 0 || isTransitioning}
                        >
                          <ChevronLeft size={16} aria-hidden="true" />
                          <span>Prev</span>
                        </button>

                        {currentStep.hint && attempts > 0 && (
                          <button onClick={() => setShowHint(true)} className="btn-control">
                            <Lightbulb size={16} aria-hidden="true" />
                            <span>Hint</span>
                          </button>
                        )}

                        {(currentStep.type === 'learn' || currentStep.type === 'story' || feedback?.type === 'success') && (
                          <button onClick={handleNextStep} className="btn-next">
                            Next →
                          </button>
                        )}
                      </div>

                      {showHint && currentStep.hint && (
                        <div className="hint-box">
                          <strong>Hint:</strong> {currentStep.hint}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {!activeLesson && (
            <div className="simple-tips">
              <div className="tip-item">
                <span className="tip-icon" aria-hidden="true"><Lightbulb size={16} /></span>
                <span>Take breaks every 20 minutes</span>
              </div>
              <div className="tip-item">
                <span className="tip-icon" aria-hidden="true"><Target size={16} /></span>
                <span>Focus on just one lesson at a time</span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ADHDView;
