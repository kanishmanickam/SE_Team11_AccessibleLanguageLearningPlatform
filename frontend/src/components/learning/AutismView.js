import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import ProfileSettings from '../ProfileSettings';
import './AutismView.css';

const AutismView = () => {
  const { user, logout } = useAuth();
  const { preferences } = usePreferences();
  const [showSettings, setShowSettings] = useState(false);
  
  // Lesson navigation state
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [completedLessons, setCompletedLessons] = useState([]);
  
  const audioRef = useRef(null);

  // EPIC 2.1-2.7: Three complete lessons with multi-format content
  const lessons = [
    { 
      id: 1, 
      title: 'Tamil – Greetings and Introduction',
      language: 'Tamil',
      icon: '🙏',
      description: 'Learn basic Tamil greetings',
      steps: [
        {
          id: 1,
          title: 'Hello in Tamil',
          content: 'வணக்கம் (Vanakkam)',
          translation: 'Vanakkam means "Hello" in Tamil',
          highlight: 'வணக்கம்',
          image: '/images/tamil-greeting.png',
          audio: '/audio/tamil-hello.mp3',
          hint: 'Say "வணக்கம்" when you meet someone. It shows respect and warmth.',
          interaction: {
            question: 'What does வணக்கம் mean?',
            options: ['Hello', 'Goodbye', 'Thank you'],
            correct: 0
          }
        },
        {
          id: 2,
          title: 'Thank You in Tamil',
          content: 'நன்றி (Nandri)',
          translation: 'Nandri means "Thank you" in Tamil',
          highlight: 'நன்றி',
          image: '/images/tamil-thanks.png',
          audio: '/audio/tamil-thanks.mp3',
          hint: 'Say "நன்றி" to show gratitude. It\'s a polite way to thank someone.',
          interaction: {
            question: 'When do you say நன்றி?',
            options: ['To greet', 'To thank', 'To say goodbye'],
            correct: 1
          }
        },
        {
          id: 3,
          title: 'Goodbye in Tamil',
          content: 'பிரியாவிடை (Piriyavidai)',
          translation: 'Piriyavidai means "Goodbye" in Tamil',
          highlight: 'பிரியாவிடை',
          image: '/images/tamil-goodbye.png',
          audio: '/audio/tamil-goodbye.mp3',
          hint: 'Say "பிரியாவிடை" when you leave. It\'s a respectful way to say goodbye.',
          interaction: {
            question: 'What is பிரியாவிடை used for?',
            options: ['Greeting', 'Thanking', 'Saying goodbye'],
            correct: 2
          }
        }
      ]
    },
    { 
      id: 2, 
      title: 'English – Learning Alphabets',
      language: 'English',
      icon: '🔤',
      description: 'Learn English alphabet letters',
      steps: [
        {
          id: 1,
          title: 'Letter A',
          content: 'A a',
          translation: 'The letter A sounds like "ay"',
          highlight: 'A',
          image: '/images/letter-a.png',
          audio: '/audio/letter-a.mp3',
          hint: 'A is the first letter of the alphabet. Words like "Apple" start with A.',
          interaction: {
            question: 'Which word starts with A?',
            options: ['Ball', 'Apple', 'Cat'],
            correct: 1
          }
        },
        {
          id: 2,
          title: 'Letter B',
          content: 'B b',
          translation: 'The letter B sounds like "bee"',
          highlight: 'B',
          image: '/images/letter-b.png',
          audio: '/audio/letter-b.mp3',
          hint: 'B is the second letter. Words like "Ball" and "Butterfly" start with B.',
          interaction: {
            question: 'Which word starts with B?',
            options: ['Apple', 'Ball', 'Dog'],
            correct: 1
          }
        },
        {
          id: 3,
          title: 'Letter C',
          content: 'C c',
          translation: 'The letter C sounds like "see"',
          highlight: 'C',
          image: '/images/letter-c.png',
          audio: '/audio/letter-c.mp3',
          hint: 'C is the third letter. Words like "Cat" and "Car" start with C.',
          interaction: {
            question: 'Which word starts with C?',
            options: ['Cat', 'Ball', 'Apple'],
            correct: 0
          }
        }
      ]
    },
    { 
      id: 3, 
      title: 'Hindi – Learning Numbers',
      language: 'Hindi',
      icon: '🔢',
      description: 'Learn Hindi numbers 1 to 3',
      steps: [
        {
          id: 1,
          title: 'Number One',
          content: 'एक (Ek)',
          translation: 'Ek means "One" in Hindi',
          highlight: 'एक',
          image: '/images/hindi-one.png',
          audio: '/audio/hindi-one.mp3',
          hint: 'एक (Ek) is the number 1. Hold up one finger to show एक.',
          interaction: {
            question: 'What number is एक?',
            options: ['One', 'Two', 'Three'],
            correct: 0
          }
        },
        {
          id: 2,
          title: 'Number Two',
          content: 'दो (Do)',
          translation: 'Do means "Two" in Hindi',
          highlight: 'दो',
          image: '/images/hindi-two.png',
          audio: '/audio/hindi-two.mp3',
          hint: 'दो (Do) is the number 2. Hold up two fingers to show दो.',
          interaction: {
            question: 'What number is दो?',
            options: ['One', 'Two', 'Three'],
            correct: 1
          }
        },
        {
          id: 3,
          title: 'Number Three',
          content: 'तीन (Teen)',
          translation: 'Teen means "Three" in Hindi',
          highlight: 'तीन',
          image: '/images/hindi-three.png',
          audio: '/audio/hindi-three.mp3',
          hint: 'तीन (Teen) is the number 3. Hold up three fingers to show तीन.',
          interaction: {
            question: 'What number is तीन?',
            options: ['One', 'Two', 'Three'],
            correct: 2
          }
        }
      ]
    },
  ];

  // Get current step data
  const currentLesson = lessons.find(l => l.id === selectedLesson);
  const currentStep = currentLesson?.steps[currentStepIndex];
  const totalSteps = currentLesson?.steps.length || 0;

  // EPIC 2.6: Navigation handlers with replay support
  const handleNext = () => {
    setFeedback('');
    setShowHint(false);
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Mark lesson as completed
      if (!completedLessons.includes(selectedLesson)) {
        setCompletedLessons([...completedLessons, selectedLesson]);
      }
      setFeedback('🎉 Great job! You completed this lesson!');
    }
  };

  const handlePrevious = () => {
    setFeedback('');
    setShowHint(false);
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  // EPIC 2.1: Audio playback
  const handlePlayAudio = () => {
    if (audioRef.current && currentStep?.audio) {
      audioRef.current.play();
      setFeedback('🔊 Playing audio...');
      setTimeout(() => setFeedback(''), 2000);
    }
  };

  // EPIC 2.4: Hint toggle
  const handleShowHint = () => {
    setShowHint(!showHint);
  };

  // EPIC 2.3: Interactive engagement with feedback
  const handleInteraction = (optionIndex) => {
    if (currentStep?.interaction) {
      if (optionIndex === currentStep.interaction.correct) {
        setFeedback('✅ Good job! That\'s correct!');
      } else {
        setFeedback('💡 Try again! Look at the hint if you need help.');
      }
      setTimeout(() => {
        if (optionIndex === currentStep.interaction.correct) {
          setFeedback('');
        }
      }, 2000);
    }
  };

  // Start lesson
  const handleStartLesson = (lessonId) => {
    setSelectedLesson(lessonId);
    setCurrentStepIndex(0);
    setShowHint(false);
    setFeedback('');
  };

  // Return to lesson list
  const handleBackToLessons = () => {
    setSelectedLesson(null);
    setCurrentStepIndex(0);
    setShowHint(false);
    setFeedback('');
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // EPIC 1.6: Distraction-free mode when in lesson view
  if (selectedLesson && currentStep) {
    return (
      <div className="autism-view distraction-free">
        {/* EPIC 1.6: Minimal header for focus */}
        <header className="lesson-header">
          <button onClick={handleBackToLessons} className="btn-back">
            ← Back to Lessons
          </button>
          <h2 className="lesson-title">{currentLesson.title}</h2>
        </header>

        {/* EPIC 2.2 & 2.7: Consistent single-step layout */}
        <main className="lesson-content">
          <div className="lesson-step-container">
            {/* Step progress indicator */}
            <div className="step-progress">
              <span className="step-number">Step {currentStepIndex + 1} of {totalSteps}</span>
              <div className="progress-dots">
                {Array.from({ length: totalSteps }, (_, i) => (
                  <span 
                    key={i} 
                    className={`dot ${i === currentStepIndex ? 'active' : ''} ${i < currentStepIndex ? 'completed' : ''}`}
                  ></span>
                ))}
              </div>
            </div>

            {/* EPIC 2.1: Multi-format lesson display */}
            <div className="step-content-card">
              <h3 className="step-title">{currentStep.title}</h3>
              
              {/* EPIC 2.5: Visual learning aid with image */}
              <div className="step-visual">
                <img 
                  src={currentStep.image} 
                  alt={currentStep.title}
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f0f0f0" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="20" fill="%23999"%3EImage%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>

              {/* EPIC 2.5: Highlighted main content */}
              <div className="step-text">
                <p className="content-main">
                  <span className="highlight">{currentStep.highlight}</span>
                </p>
                <p className="content-translation">{currentStep.translation}</p>
              </div>

              {/* EPIC 2.1: Audio controls */}
              <div className="step-audio-section">
                <button onClick={handlePlayAudio} className="btn-audio">
                  🔊 Play Audio
                </button>
                <audio ref={audioRef} src={currentStep.audio} preload="metadata" />
              </div>

              {/* EPIC 2.3: Interactive engagement */}
              {currentStep.interaction && (
                <div className="step-interaction">
                  <p className="interaction-question">{currentStep.interaction.question}</p>
                  <div className="interaction-options">
                    {currentStep.interaction.options.map((option, index) => (
                      <button 
                        key={index}
                        onClick={() => handleInteraction(index)}
                        className="btn-option"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* EPIC 2.3: Immediate feedback */}
              {feedback && (
                <div className="feedback-message">
                  {feedback}
                </div>
              )}

              {/* EPIC 2.4: Hint section */}
              <div className="hint-section">
                <button onClick={handleShowHint} className="btn-hint">
                  💡 {showHint ? 'Hide Hint' : 'Show Hint'}
                </button>
                {showHint && (
                  <div className="hint-content">
                    {currentStep.hint}
                  </div>
                )}
              </div>
            </div>

            {/* EPIC 2.6 & 2.7: Consistent navigation in fixed position */}
            <div className="step-navigation">
              <button 
                onClick={handlePrevious} 
                disabled={currentStepIndex === 0}
                className="btn-nav btn-previous"
              >
                ← Previous
              </button>
              <button 
                onClick={handleNext}
                className="btn-nav btn-next"
              >
                {currentStepIndex < totalSteps - 1 ? 'Next →' : 'Complete Lesson ✓'}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // EPIC 1.6: Lesson selection view (simplified layout)
  return (
    <div className="autism-view">
      {/* Simple Header */}
      <header className="simple-header">
        <div className="header-left">
          <h1>Learning Center</h1>
          <p className="header-subtitle">Choose your lesson</p>
        </div>
        <div className="header-actions">
          <button onClick={() => setShowSettings(true)} className="btn-settings" title="Settings">
            ⚙️
          </button>
          <button onClick={logout} className="btn-exit">
            Exit
          </button>
        </div>
      </header>

      {showSettings && (
        <ProfileSettings onClose={() => setShowSettings(false)} />
      )}

      {/* Main Content */}
      <main className="content-area-simple">
        {/* Welcome Card */}
        <div className="welcome-card">
          <h2>Hello, {user?.name} 👋</h2>
          <p>Select a lesson below to begin learning</p>
        </div>

        {/* Progress indicator */}
        {completedLessons.length > 0 && (
          <div className="progress-badge">
            🎉 You completed {completedLessons.length} lesson{completedLessons.length > 1 ? 's' : ''}!
          </div>
        )}

        {/* Lessons - Simple Grid */}
        <div className="lessons-container">
          <div className="lessons-simple-grid">
            {lessons.map((lesson) => (
              <div key={lesson.id} className={`lesson-simple-card ${completedLessons.includes(lesson.id) ? 'completed' : ''}`}>
                <div className="lesson-top">
                  <span className="lesson-large-icon">{lesson.icon}</span>
                </div>
                <div className="lesson-body">
                  <h4>{lesson.title}</h4>
                  <p>{lesson.description}</p>
                  <div className="lesson-meta">
                    <span className="lesson-steps-count">{lesson.steps.length} steps</span>
                    {completedLessons.includes(lesson.id) && (
                      <span className="completion-badge">✓ Completed</span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => handleStartLesson(lesson.id)}
                  className="btn-lesson-start"
                >
                  {completedLessons.includes(lesson.id) ? 'Review Lesson' : 'Start Lesson'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Simple Help Section */}
        <div className="help-section">
          <div className="help-card">
            <span className="help-icon">ℹ️</span>
            <div className="help-text">
              <h4>How it works</h4>
              <p>Click "Start Lesson" to begin. Follow each step carefully. Use hints if you need help.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AutismView;
