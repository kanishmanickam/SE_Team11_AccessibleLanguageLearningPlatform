import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProfileSettings from '../ProfileSettings';
import api from '../../utils/api';
import {
  BookOpen,
  Check,
  Hand,
  Hash,
  Info,
  Lightbulb,
  RotateCcw,
  Settings,
  Star,
  Timer,
  Volume2,
} from 'lucide-react';
import './AutismView.css';

const AutismView = ({ initialLessonId = null }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);

  // Lesson navigation state
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [completedLessons, setCompletedLessons] = useState([]);
  const [stepAnsweredCorrectly, setStepAnsweredCorrectly] = useState({});
  const [wrongAnswerCount, setWrongAnswerCount] = useState({});
  
  // Timer state for questions
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [timerActive, setTimerActive] = useState(false);
  const [questionAnswered, setQuestionAnswered] = useState(false);
  const timerIntervalRef = useRef(null);

  const audioRef = useRef(null);

  // Load completed lessons from backend on mount
  useEffect(() => {
    const fetchCompletedLessons = async () => {
      try {
        const response = await api.get('/users/completed-lessons');
        if (response.data.success) {
          // Convert backend format (e.g., "autism-lesson-1") to lesson IDs
          const lessonIds = response.data.completedLessons
            .filter(key => key.startsWith('autism-lesson-'))
            .map(key => parseInt(key.replace('autism-lesson-', '')));
          setCompletedLessons(lessonIds);
        }
      } catch (error) {
        console.error('Error fetching completed lessons:', error);
      }
    };

    fetchCompletedLessons();
  }, []);

  // EPIC 2.1-2.7: Three complete lessons with multi-format content
  const lessons = [
    {
      id: 1,
      title: 'Greetings',
      language: 'Tamil',
      Icon: Hand,
      description: 'Learn basic Tamil greetings',
      steps: [
        {
          id: 1,
          title: 'Hello in Tamil',
          content: 'வணக்கம் (Vanakkam)',
          translation: 'A common word used when meeting someone',
          highlight: 'வணக்கம்',
          image: '/images/autism-tamil-greeting.svg',
          audio: '/audio/autism-tamil-hello.mp3',
          hint: 'Say "வணக்கம்" when you meet someone. It shows respect and warmth.',
          interaction: {
            question: 'What does வணக்கம் mean?',
            options: ['Hello', 'Goodbye', 'Thank you'],
            correct: 0,
            difficulty: 'easy'
          }
        },
        {
          id: 2,
          title: 'Thank You in Tamil',
          Icon: BookOpen,
          translation: 'A polite word in Tamil',
          highlight: 'நன்றி',
          image: '/images/autism-tamil-thanks.svg',
          audio: '/audio/autism-tamil-thanks.mp3',
          hint: 'Say "நன்றி" to show gratitude. It\'s a polite way to thank someone.',
          interaction: {
            question: 'When do you say நன்றி?',
            options: ['To greet', 'To thank', 'To say goodbye'],
            correct: 1,
            difficulty: 'easy'
          }
        },
        {
          id: 3,
          title: 'How Are You in Tamil',
          content: 'எப்படி இருக்கிறீர்கள்? (Eppadi Irukkireergal?)',
          translation: 'A question to ask someone in Tamil',
          highlight: 'எப்படி இருக்கிறீர்கள்?',
          image: '/images/autism-tamil-how-are-you.svg',
          audio: '/audio/autism-tamil-how-are-you.mp3',
          hint: 'Use this to ask someone how they are doing. It shows you care.',
          interaction: {
            question: 'What does எப்படி இருக்கிறீர்கள் mean?',
            options: ['How are you?', 'Where are you?', 'What is your name?'],
            correct: 0,
            difficulty: 'easy'
          }
        },
        {
          id: 4,
          title: 'Sorry in Tamil',
          content: 'மன்னிக்கவும் (Mannikkavum)',
          translation: 'A word used when you make a mistake',
          highlight: 'மன்னிக்கவும்',
          image: '/images/autism-tamil-sorry.svg',
          audio: '/audio/autism-tamil-sorry.mp3',
          hint: 'Say this when you make a mistake or need to apologize.',
          interaction: {
            question: 'What does மன்னிக்கவும் mean?',
            options: ['Sorry', 'Thank you', 'Hello'],
            correct: 0,
            difficulty: 'easy'
          }
        },
        {
          id: 5,
          title: 'No in Tamil',
          content: 'இல்லை (Illai)',
          translation: 'Another response word in Tamil',
          highlight: 'இல்லை',
          image: '/images/autism-tamil-no.svg',
          audio: '/audio/autism-tamil-no.mp3',
          hint: 'Use இல்லை when you disagree or want to say no.',
          interaction: {
            question: 'What does இல்லை mean?',
            options: ['No', 'Yes', 'Maybe'],
            correct: 0,
            difficulty: 'easy'
          }
        },
        {
          id: 6,
          title: 'Goodbye in Tamil',
          content: 'பிரியாவிடை (Piriyavidai)',
          translation: 'A respectful parting word in Tamil',
          highlight: 'பிரியாவிடை',
          image: '/images/autism-tamil-goodbye.svg',
          audio: '/audio/autism-tamil-goodbye.mp3',
          hint: 'Say "பிரியாவிடை" when you leave. It\'s a respectful way to say goodbye.',
          interaction: {
            question: 'What is பிரியாவிடை used for?',
            options: ['Greeting', 'Thanking', 'Saying goodbye'],
            correct: 2,
            difficulty: 'medium'
          }
        },
        {
          id: 7,
          title: 'Good Morning in Tamil',
          content: 'காலை வணக்கம் (Kaalai Vanakkam)',
          translation: 'A time-specific greeting in Tamil',
          highlight: 'காலை வணக்கம்',
          image: '/images/autism-tamil-good-morning.svg',
          audio: '/audio/autism-tamil-good-morning.mp3',
          hint: 'காலை means morning. Use this greeting in the morning time.',
          interaction: {
            question: 'When do you say காலை வணக்கம்?',
            options: ['In the morning', 'At night', 'In the evening'],
            correct: 0,
            difficulty: 'medium'
          }
        },
        {
          id: 8,
          title: 'I Am Fine in Tamil',
          content: 'நான் நலமாக இருக்கிறேன் (Naan Nalamaaga Irukkiren)',
          translation: 'A common response in conversation',
          highlight: 'நான் நலமாக இருக்கிறேன்',
          image: '/images/autism-tamil-i-am-fine.svg',
          audio: '/audio/autism-tamil-i-am-fine.mp3',
          hint: 'Say this when someone asks how you are and you feel good.',
          interaction: {
            question: 'When do you say நான் நலமாக இருக்கிறேன்?',
            options: ['To say you are fine', 'To say goodbye', 'To say thank you'],
            correct: 0,
            difficulty: 'medium'
          }
        },
        {
          id: 9,
          title: 'Yes in Tamil',
          content: 'ஆம் (Aam)',
          translation: 'A response word in Tamil',
          highlight: 'ஆம்',
          image: '/images/autism-tamil-yes.svg',
          audio: '/audio/autism-tamil-yes.mp3',
          hint: 'Use ஆம் when you agree or want to say yes.',
          interaction: {
            question: 'When do you say ஆம்?',
            options: ['To agree', 'To disagree', 'To ask a question'],
            correct: 0,
            difficulty: 'medium'
          }
        },
        {
          id: 10,
          title: 'Please in Tamil',
          content: 'தயவு செய்து (Thayavu Seidhu)',
          translation: 'A word used when making requests',
          highlight: 'தயவு செய்து',
          image: '/images/autism-tamil-please.svg',
          audio: '/audio/autism-tamil-please.mp3',
          hint: 'Add this when making a request to be polite and respectful.',
          interaction: {
            question: 'Why do we use தயவு செய்து?',
            options: ['To be polite', 'To greet', 'To say goodbye'],
            correct: 0,
            difficulty: 'hard'
          }
        }
      ]
    },
    {
      id: 2,
      title: 'Basic Words',
      language: 'English',
      Icon: BookOpen,
      description: 'Learn English alphabet letters',
      steps: [
        {
          id: 1,
          title: 'Letter A',
          content: 'A',
          translation: 'This is the first letter of the alphabet',
          highlight: 'A',
          image: '/images/autism-letter-a.svg',
          audio: '/audio/letter-a.mp3',
          hint: 'A is the first letter of the alphabet. Words like "Apple" start with A.',
          interaction: {
            question: 'Which word starts with A?',
            options: ['Ball', 'Apple', 'Cat'],
            correct: 1,
            difficulty: 'easy'
          }
        },
        {
          id: 2,
          title: 'Letter B',
          content: 'B',
          translation: 'This is the second letter of the alphabet',
          highlight: 'B',
          image: '/images/autism-letter-b.svg',
          audio: '/audio/letter-b.mp3',
          hint: 'B is the second letter. Words like "Ball" start with B.',
          interaction: {
            question: 'Which word starts with B?',
            options: ['Apple', 'Ball', 'Dog'],
            correct: 1,
            difficulty: 'easy'
          }
        },
        {
          id: 3,
          title: 'Letter C',
          content: 'C',
          translation: 'This is the third letter of the alphabet',
          highlight: 'C',
          image: '/images/autism-letter-c.svg',
          audio: '/audio/letter-c.mp3',
          hint: 'C is the third letter. Words like "Cat" start with C.',
          interaction: {
            question: 'Which word starts with C?',
            options: ['Cat', 'Ball', 'Apple'],
            correct: 0,
            difficulty: 'easy'
          }
        },
        {
          id: 4,
          title: 'Letter D',
          content: 'D',
          translation: 'This is the fourth letter of the alphabet',
          highlight: 'D',
          image: '/images/autism-letter-d.svg',
          audio: '/audio/letter-d.mp3',
          hint: 'D is the fourth letter. Words like "Dog" start with D.',
          interaction: {
            question: 'Which word starts with D?',
            options: ['Dog', 'Elephant', 'Cat'],
            correct: 0,
            difficulty: 'easy'
          }
        },
        {
          id: 5,
          title: 'Letter E',
          content: 'E',
          translation: 'This is the fifth letter of the alphabet',
          highlight: 'E',
          image: '/images/autism-letter-e.svg',
          audio: '/audio/letter-e.mp3',
          hint: 'E is the fifth letter. Words like "Elephant" start with E.',
          interaction: {
            question: 'Which word starts with E?',
            options: ['Fish', 'Elephant', 'Apple'],
            correct: 1,
            difficulty: 'easy'
          }
        },
        {
          id: 6,
          title: 'Letter F',
          content: 'F',
          translation: 'This is the sixth letter of the alphabet',
          highlight: 'F',
          image: '/images/autism-letter-f.svg',
          audio: '/audio/letter-f.mp3',
          hint: 'F is the sixth letter. Words like "Fish" start with F.',
          interaction: {
            question: 'Which word starts with F?',
            options: ['Fish', 'Goat', 'Dog'],
            correct: 0,
            difficulty: 'easy'
          }
        },
        {
          id: 7,
          title: 'Letter G',
          content: 'G',
          translation: 'This is the seventh letter of the alphabet',
          highlight: 'G',
          image: '/images/autism-letter-g.svg',
          audio: '/audio/letter-g.mp3',
          hint: 'G is the seventh letter. Words like "Goat" start with G.',
          interaction: {
            question: 'Which word starts with G?',
            options: ['Hat', 'Goat', 'Fish'],
            correct: 1,
            difficulty: 'easy'
          }
        },
        {
          id: 8,
          title: 'Letter H',
          content: 'H',
          translation: 'This is the eighth letter of the alphabet',
          highlight: 'H',
          image: '/images/autism-letter-h.svg',
          audio: '/audio/letter-h.mp3',
          hint: 'H is the eighth letter. Words like "Hat" start with H.',
          interaction: {
            question: 'Which word starts with H?',
            options: ['Ice', 'Hat', 'Goat'],
            correct: 1,
            difficulty: 'easy'
          }
        },
        {
          id: 9,
          title: 'Letter I',
          content: 'I',
          translation: 'This is the ninth letter of the alphabet',
          highlight: 'I',
          image: '/images/autism-letter-i.svg',
          audio: '/audio/letter-i.mp3',
          hint: 'I is the ninth letter. Words like "Ice" start with I.',
          interaction: {
            question: 'Which word starts with I?',
            options: ['Ice', 'Jug', 'Hat'],
            correct: 0,
            difficulty: 'easy'
          }
        },
        {
          id: 10,
          title: 'Letter J',
          content: 'J',
          translation: 'This is the tenth letter of the alphabet',
          highlight: 'J',
          image: '/images/autism-letter-j.svg',
          audio: '/audio/letter-j.mp3',
          hint: 'J is the tenth letter. Words like "Jug" start with J.',
          interaction: {
            question: 'Which word starts with J?',
            options: ['Kite', 'Jug', 'Ice'],
            correct: 1,
            difficulty: 'easy'
          }
        }
      ]
    },
    {
      id: 3,
      title: 'Numbers',
      language: 'Hindi',
      Icon: Hash,
      description: 'Learn Hindi numbers 1 to 10',
      steps: [
        {
          id: 1,
          title: 'Number One',
          content: 'एक (Ek)',
          translation: 'This is how we say a number in Hindi',
          highlight: 'एक',
          image: '/images/autism-hindi-one.svg',
          audio: '/audio/hindi-one.mp3',
          hint: 'एक (Ek) is the number 1. Hold up one finger to show एक.',
          interaction: {
            question: 'What number is एक?',
            options: ['One', 'Two', 'Three'],
            correct: 0,
            difficulty: 'easy'
          }
        },
        {
          id: 2,
          title: 'Number Two',
          content: 'दो (Do)',
          translation: 'This is another number in Hindi',
          highlight: 'दो',
          image: '/images/autism-hindi-two.svg',
          audio: '/audio/hindi-two.mp3',
          hint: 'दो (Do) is the number 2. Hold up two fingers to show दो.',
          interaction: {
            question: 'What number is दो?',
            options: ['One', 'Two', 'Three'],
            correct: 1,
            difficulty: 'easy'
          }
        },
        {
          id: 3,
          title: 'Number Three',
          content: 'तीन (Teen)',
          translation: 'Learn this number in Hindi',
          highlight: 'तीन',
          image: '/images/autism-hindi-three.svg',
          audio: '/audio/hindi-three.mp3',
          hint: 'तीन (Teen) is the number 3. Hold up three fingers to show तीन.',
          interaction: {
            question: 'What number is तीन?',
            options: ['One', 'Two', 'Three'],
            correct: 2,
            difficulty: 'easy'
          }
        },
        {
          id: 4,
          title: 'Number Four',
          content: 'चार (Chaar)',
          translation: 'Continue learning Hindi numbers',
          highlight: 'चार',
          image: '/images/autism-hindi-four.svg',
          audio: '/audio/hindi-four.mp3',
          hint: 'चार (Chaar) is the number 4. Hold up four fingers to show चार.',
          interaction: {
            question: 'What number is चार?',
            options: ['Three', 'Four', 'Five'],
            correct: 1,
            difficulty: 'easy'
          }
        },
        {
          id: 5,
          title: 'Number Five',
          content: 'पाँच (Paanch)',
          translation: 'Learn the number five in Hindi',
          highlight: 'पाँच',
          image: '/images/autism-hindi-five.svg',
          audio: '/audio/hindi-five.mp3',
          hint: 'पाँच (Paanch) is the number 5. Show all five fingers on one hand.',
          interaction: {
            question: 'What number is पाँच?',
            options: ['Four', 'Five', 'Six'],
            correct: 1,
            difficulty: 'easy'
          }
        },
        {
          id: 6,
          title: 'Number Six',
          content: 'छह (Chhah)',
          translation: 'Learn the number six in Hindi',
          highlight: 'छह',
          image: '/images/autism-hindi-six.svg',
          audio: '/audio/hindi-six.mp3',
          hint: 'छह (Chhah) is the number 6. Use both hands to show six fingers.',
          interaction: {
            question: 'What number is छह?',
            options: ['Five', 'Six', 'Seven'],
            correct: 1,
            difficulty: 'easy'
          }
        },
        {
          id: 7,
          title: 'Number Seven',
          content: 'सात (Saat)',
          translation: 'Learn the number seven in Hindi',
          highlight: 'सात',
          image: '/images/autism-hindi-seven.svg',
          audio: '/audio/hindi-seven.mp3',
          hint: 'सात (Saat) is the number 7. There are seven days in a week.',
          interaction: {
            question: 'What number is सात?',
            options: ['Six', 'Seven', 'Eight'],
            correct: 1,
            difficulty: 'easy'
          }
        },
        {
          id: 8,
          title: 'Number Eight',
          content: 'आठ (Aath)',
          translation: 'Learn the number eight in Hindi',
          highlight: 'आठ',
          image: '/images/autism-hindi-eight.svg',
          audio: '/audio/hindi-eight.mp3',
          hint: 'आठ (Aath) is the number 8. Show eight fingers using both hands.',
          interaction: {
            question: 'What number is आठ?',
            options: ['Seven', 'Eight', 'Nine'],
            correct: 1,
            difficulty: 'easy'
          }
        },
        {
          id: 9,
          title: 'Number Nine',
          content: 'नौ (Nau)',
          translation: 'Learn the number nine in Hindi',
          highlight: 'नौ',
          image: '/images/autism-hindi-nine.svg',
          audio: '/audio/hindi-nine.mp3',
          hint: 'नौ (Nau) is the number 9. Show nine fingers using both hands.',
          interaction: {
            question: 'What number is नौ?',
            options: ['Eight', 'Nine', 'Ten'],
            correct: 1,
            difficulty: 'easy'
          }
        },
        {
          id: 10,
          title: 'Number Ten',
          content: 'दस (Das)',
          translation: 'Learn the number ten in Hindi',
          highlight: 'दस',
          image: '/images/autism-hindi-ten.svg',
          audio: '/audio/hindi-ten.mp3',
          hint: 'दस (Das) is the number 10. Show all ten fingers on both hands.',
          interaction: {
            question: 'What number is दस?',
            options: ['Nine', 'Ten', 'Eleven'],
            correct: 1,
            difficulty: 'easy'
          }
        }
      ]
    }
  ];

  // Get current step data
  const currentLesson = lessons.find(l => l.id === selectedLesson);
  const currentStep = currentLesson?.steps[currentStepIndex];
  const totalSteps = currentLesson?.steps.length || 0;

  // EPIC 2.6: Navigation handlers with replay support
  const handleNext = () => {
    // Check if current step has been answered correctly
    const stepKey = `${selectedLesson}-${currentStepIndex}`;

    if (!stepAnsweredCorrectly[stepKey]) {
      setFeedback('Please answer the question correctly before moving to the next step.');
      setTimeout(() => setFeedback(''), 3000);
      return;
    }

    setFeedback('');
    setShowHint(false);
    setQuestionAnswered(false); // Reset for next question
    setTimerActive(false); // Stop current timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Mark lesson as completed
      if (!completedLessons.includes(selectedLesson)) {
        setCompletedLessons([...completedLessons, selectedLesson]);
        // Save to backend
        saveLessonCompletion(selectedLesson);
      }
      setFeedback('Great job! You completed this lesson!');
    }
  };

  const handlePrevious = () => {
    setFeedback('');
    setShowHint(false);
    setQuestionAnswered(false); // Reset for previous question
    setTimerActive(false); // Stop current timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  // Save lesson completion to backend and notify progress system
  const saveLessonCompletion = async (lessonId) => {
    try {
      const lessonKey = `autism-lesson-${lessonId}`;
      const res = await api.post('/users/complete-lesson', { lessonKey });

      // If backend returned a progress summary, broadcast it to update the progress bar/dashboard
      const summary = res?.data?.summary;
      if (summary) {
        window.dispatchEvent(new CustomEvent('progress:updated', { detail: { summary } }));
      } else {
        // Fallback: try to fetch summary and dispatch
        try {
          const { getSummary } = await import('../../services/progressService');
          const s = await getSummary();
          if (s) {
            window.dispatchEvent(new CustomEvent('progress:updated', { detail: { summary: s } }));
          }
        } catch (e) {
          // ignore fallback errors
        }
      }
    } catch (error) {
      console.error('Error saving lesson completion:', error);
    }
  };

  // EPIC 2.1: Audio playback with text-to-speech fallback
  const handlePlayAudio = () => {
    if (audioRef.current && currentStep?.audio) {
      // Try to play the audio file
      audioRef.current.play().catch((error) => {
        console.log('Audio file not available, using text-to-speech fallback');
        // Fallback to browser's text-to-speech if audio file not found
        speakText(currentStep.content);
      });
      setFeedback('Playing audio...');
      setTimeout(() => setFeedback(''), 2000);
    } else if (currentStep?.content) {
      // If no audio ref, use text-to-speech directly
      speakText(currentStep.content);
      setFeedback('Playing audio...');
      setTimeout(() => setFeedback(''), 2000);
    }
  };

  const [activeWord, setActiveWord] = useState('');
  const [playbackSpeed, setPlaybackSpeed] = useState(0.8);

  // Text-to-speech fallback function
  // Audio Handling with Backend Support

  const speakText = async (text) => {
    // Cancel any existing
    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
    }

    try {
      // Try Backend TTS
      const response = await fetch('/api/tts/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, speed: playbackSpeed })
      });

      if (!response.ok) throw new Error('Backend failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.playbackRate = playbackSpeed;

      audio.onplay = () => setFeedback('Playing audio...');
      audio.onended = () => {
        setFeedback('');
        URL.revokeObjectURL(url);
      };

      audio.play();

    } catch (e) {
      // Fallback to Browser
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = playbackSpeed;

        utterance.onboundary = (event) => {
          if (event.name === 'word') {
            const charIndex = event.charIndex;
            const textBefore = text.slice(charIndex);
            const firstSpace = textBefore.search(/\s/);
            const word = firstSpace === -1 ? textBefore : textBefore.slice(0, firstSpace);
            const cleanWord = word.replace(/[.,!?;:()"]/g, '');
            setActiveWord(cleanWord);
          }
        };

        utterance.onstart = () => setFeedback('Playing audio...');
        utterance.onend = () => {
          setActiveWord('');
          setFeedback('');
        };

        window.speechSynthesis.speak(utterance);
      }
    }
  };

  // EPIC 2.4: Hint toggle
  const handleShowHint = () => {
    setShowHint(!showHint);
  };

  // Timer logic for questions based on difficulty
  const getTimeForDifficulty = useCallback((difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 20; // 20 seconds for easy questions
      case 'medium':
        return 35; // 35 seconds for medium questions
      case 'hard':
        return 50; // 50 seconds for hard questions
      default:
        return 30; // default 30 seconds
    }
  }, []);

  // Handle timeout
  const handleTimeOut = useCallback(() => {
    if (!questionAnswered) {
      setFeedback('Time\'s up! Click retry to try again.');
      setQuestionAnswered(true);
      setTimerActive(false);

      const stepKey = `${selectedLesson}-${currentStepIndex}`;
      const currentWrongCount = wrongAnswerCount[stepKey] || 0;
      const newWrongCount = currentWrongCount + 1;

      setWrongAnswerCount((prev) => ({
        ...prev,
        [stepKey]: newWrongCount,
      }));

      setTimeout(() => {
        setShowHint(true); // Show hint after timeout
      }, 1500);
    }
  }, [questionAnswered, selectedLesson, currentStepIndex, wrongAnswerCount]);

  // Start timer when step changes or has interaction
  useEffect(() => {
    if (currentStep?.interaction) {
      const difficulty = currentStep.interaction.difficulty || 'medium';
      const timeLimit = getTimeForDifficulty(difficulty);
      setTimeRemaining(timeLimit);
      setTimerActive(true);
      setQuestionAnswered(false);
      setFeedback('');
      setShowHint(false);
    } else {
      setTimerActive(false);
      setTimeRemaining(null);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [currentStepIndex, selectedLesson, currentStep?.interaction, getTimeForDifficulty]);

  // Timer countdown effect
  useEffect(() => {
    if (timerActive && timeRemaining !== null && timeRemaining > 0 && !questionAnswered) {
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setTimerActive(false);
            // Handle timeout
            handleTimeOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
      };
    }
  }, [timerActive, timeRemaining, questionAnswered, handleTimeOut]);

  // Handle retry button click
  const handleRetry = () => {
    setQuestionAnswered(false);
    setFeedback('');
    setShowHint(false);
    const difficulty = currentStep?.interaction?.difficulty || 'medium';
    const timeLimit = getTimeForDifficulty(difficulty);
    setTimeRemaining(timeLimit);
    setTimerActive(true);
  };

  // EPIC 2.3: Interactive engagement with feedback
  const handleInteraction = (optionIndex) => {
    if (currentStep?.interaction && !questionAnswered) {
      // Stop timer when answer is selected
      setTimerActive(false);
      setQuestionAnswered(true);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      const stepKey = `${selectedLesson}-${currentStepIndex}`;
      if (optionIndex === currentStep.interaction.correct) {
        setFeedback('Good job! That\'s correct!');
        // Mark this step as answered correctly
        setStepAnsweredCorrectly(prev => ({
          ...prev,
          [stepKey]: true
        }));
        // Reset wrong answer count on correct answer
        setWrongAnswerCount(prev => ({
          ...prev,
          [stepKey]: 0
        }));
      } else {
        // Increment wrong answer count
        const currentWrongCount = wrongAnswerCount[stepKey] || 0;
        const newWrongCount = currentWrongCount + 1;

        setWrongAnswerCount(prev => ({
          ...prev,
          [stepKey]: newWrongCount
        }));

        if (newWrongCount >= 2) {
          // Auto-advance to next step after 2 wrong answers
          setFeedback('Moving to the next step. Try to review this later!');
          setTimeout(() => {
            setFeedback('');
            setShowHint(false);
            if (currentStepIndex < totalSteps - 1) {
              setCurrentStepIndex(currentStepIndex + 1);
            } else {
              // Mark lesson as completed even with wrong answers
              if (!completedLessons.includes(selectedLesson)) {
                setCompletedLessons([...completedLessons, selectedLesson]);
                saveLessonCompletion(selectedLesson);
              }
              setFeedback('You completed this lesson! Review the steps you found difficult.');
            }
          }, 2000);
        } else {
          setFeedback('Try again! Look at the hint if you need help.');
        }
      }
      setTimeout(() => {
        if (optionIndex === currentStep.interaction.correct) {
          setFeedback('');
        }
      }, 2000);
    }
  };

  const renderDifficultyLabel = (difficulty) => {
    const normalized = difficulty || 'medium';
    const count = normalized === 'easy' ? 1 : normalized === 'medium' ? 2 : 3;
    const text = normalized.charAt(0).toUpperCase() + normalized.slice(1);
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }} aria-hidden="true">
          {Array.from({ length: count }).map((_, idx) => (
            <Star key={idx} size={14} />
          ))}
        </span>
        <span>{text}</span>
      </span>
    );
  };

  // Start lesson
  const handleStartLesson = (lessonId) => {
    setSelectedLesson(lessonId);
    setCurrentStepIndex(0);
    setShowHint(false);
    setFeedback('');
    setStepAnsweredCorrectly({});
    setWrongAnswerCount({});
    setQuestionAnswered(false);
    setTimerActive(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  };

  const autoOpenedLessonRef = React.useRef(null);

  useEffect(() => {
    if (!initialLessonId) return;
    if (selectedLesson) return;

    const targetId = Number(initialLessonId);
    if (!Number.isFinite(targetId)) return;
    if (autoOpenedLessonRef.current === targetId) return;

    autoOpenedLessonRef.current = targetId;
    handleStartLesson(targetId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLessonId, selectedLesson]);

  // Return to lesson list
  const handleBackToLessons = () => {
    setSelectedLesson(null);
    setCurrentStepIndex(0);
    setShowHint(false);
    setFeedback('');
    setStepAnsweredCorrectly({});
    setWrongAnswerCount({});
    setQuestionAnswered(false);
    setTimerActive(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (audio) {
        audio.pause();
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
          <button
            type="button"
            onClick={() => navigate('/progress')}
            className="btn-settings"
            title="View progress"
            style={{ marginLeft: 'auto' }}
          >
            Progress
          </button>
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
              {/* Left Column: Image, Question, and Options */}
              <div className="visual-column">
                {/* EPIC 2.5: Visual learning aid with icon/image */}
                <div className="step-visual">
                  <img src={currentStep.image} alt={currentStep.title} className="visual-image-hidden" />
                </div>

                {/* Question below image */}
                {currentStep.interaction && (
                  <div className="step-interaction-left">
                    <p className="interaction-question">{currentStep.interaction.question}</p>
                  </div>
                )}

                {/* Answer Options below question */}
                {currentStep.interaction && (
                  <div className="interaction-options">
                    {currentStep.interaction.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleInteraction(index)}
                        className="btn-option"
                        disabled={questionAnswered}
                      >
                        <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                        <span className="option-text">{option}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Right Column: Content, Timer/Retry */}
              <div className="content-column">
                {/* EPIC 2.5: Highlighted main content */}
                <div className="step-text">
                  <p className="content-main">
                    {/* Dynamic highlighting */}
                    {currentStep.content.split(' ').map((word, idx) => {
                      const cleanWord = word.replace(/[.,!?;:()"]/g, '');
                      const isActive = activeWord && cleanWord.toLowerCase() === activeWord.toLowerCase();
                      const isStaticHighlight = currentStep.highlight && word.includes(currentStep.highlight);

                      return (
                        <span
                          key={idx}
                          className={isActive ? 'highlight active-word' : (isStaticHighlight ? 'highlight' : '')}
                          style={isActive ? { backgroundColor: '#ffd700', transform: 'scale(1.1)', display: 'inline-block', transition: 'all 0.2s' } : {}}
                        >
                          {word}{' '}
                        </span>
                      );
                    })}
                  </p>
                  <p className="content-translation">{currentStep.translation}</p>
                </div>

                {/* EPIC 2.1: Audio controls */}
                <div className="step-audio-section">
                  <button onClick={handlePlayAudio} className="btn-audio">
                    <Volume2 size={18} aria-hidden="true" />
                    <span>Play Audio</span>
                  </button>
                  <audio
                    ref={audioRef}
                    src={currentStep.audio}
                    preload="none"
                    onError={() => console.log('Audio file not found, will use text-to-speech')}
                  />
                  <p className="audio-info">Click to hear the pronunciation</p>

                  <div className="audio-controls-speed" style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.9rem', alignSelf: 'center' }}>Speed:</span>
                    <button
                      onClick={() => setPlaybackSpeed(0.6)}
                      className={playbackSpeed === 0.6 ? 'btn-speed active' : 'btn-speed'}
                      style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: playbackSpeed === 0.6 ? 'var(--accent-color-soft)' : 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                    >
                      Slow
                    </button>
                    <button
                      onClick={() => setPlaybackSpeed(0.9)}
                      className={playbackSpeed === 0.9 ? 'btn-speed active' : 'btn-speed'}
                      style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: playbackSpeed === 0.9 ? 'var(--accent-color-soft)' : 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                    >
                      Normal
                    </button>
                  </div>
                </div>

                {/* Timer Display OR Retry Button in same position */}
                {currentStep.interaction && (
                  <div className="timer-retry-container">
                    {timerActive && timeRemaining !== null && !questionAnswered ? (
                      <div className={`timer-display ${timeRemaining <= 10 ? 'timer-warning' : ''}`}>
                        <div className="timer-circle">
                          <svg width="100" height="100" viewBox="0 0 120 120">
                            <circle
                              cx="60"
                              cy="60"
                              r="50"
                              fill="none"
                              stroke="#e0e0e0"
                              strokeWidth="8"
                            />
                            <circle
                              cx="60"
                              cy="60"
                              r="50"
                              fill="none"
                              stroke={timeRemaining <= 10 ? '#ff5252' : '#4CAF50'}
                              strokeWidth="8"
                              strokeDasharray={`${2 * Math.PI * 50}`}
                              strokeDashoffset={`${2 * Math.PI * 50 * (1 - timeRemaining / getTimeForDifficulty(currentStep.interaction.difficulty))}`}
                              transform="rotate(-90 60 60)"
                              style={{ transition: 'stroke-dashoffset 1s linear' }}
                            />
                          </svg>
                          <div className="timer-content">
                            <span className="timer-emoji" aria-hidden="true"><Timer size={18} /></span>
                            <span className="timer-number">{timeRemaining}</span>
                          </div>
                        </div>
                        <div className="timer-info">
                          <span className={`difficulty-badge difficulty-${currentStep.interaction.difficulty}`}>
                            {renderDifficultyLabel(currentStep.interaction.difficulty)}
                          </span>
                        </div>
                      </div>
                    ) : questionAnswered && !timerActive ? (
                      <div className="retry-section">
                        <span className={`difficulty-badge difficulty-${currentStep.interaction.difficulty}`}>
                          {renderDifficultyLabel(currentStep.interaction.difficulty)}
                        </span>
                        <button onClick={handleRetry} className="btn-retry">
                          <RotateCcw size={18} aria-hidden="true" />
                          <span>Retry Question</span>
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* EPIC 2.3: Immediate feedback */}
                {feedback && <div className="feedback-message">{feedback}</div>}

                {/* EPIC 2.4: Hint section */}
                <div className="hint-section">
                  <button onClick={handleShowHint} className="btn-hint">
                    <Lightbulb size={18} aria-hidden="true" />
                    <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
                  </button>
                  {showHint && <div className="hint-content">{currentStep.hint}</div>}
                </div>
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
                {currentStepIndex < totalSteps - 1 ? 'Next →' : (
                  <>
                    <span>Complete Lesson</span>
                    <Check size={16} aria-hidden="true" />
                  </>
                )}
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
          <button
            type="button"
            onClick={() => navigate('/progress')}
            className="btn-settings"
            title="View progress"
          >
            Progress
          </button>
          <button onClick={() => setShowSettings(true)} className="btn-settings" title="Settings">
            <Settings size={18} aria-hidden="true" />
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
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>Hello, {user?.name}</span>
            <Hand size={18} aria-hidden="true" />
          </h2>
          <p>Select a lesson below to begin learning</p>
        </div>

        {/* Lessons - Simple Grid */}
        <div className="lessons-container">
          <div className="lessons-simple-grid">
            {lessons.map((lesson) => (
              <div key={lesson.id} className={`lesson-simple-card ${completedLessons.includes(lesson.id) ? 'completed' : ''}`}>
                <div className="lesson-top">
                  <span className="lesson-large-icon" aria-hidden="true"><lesson.Icon size={40} /></span>
                  {completedLessons.includes(lesson.id) && (
                    <span className="completion-checkmark" aria-hidden="true"><Check size={18} /></span>
                  )}
                </div>
                <div className="lesson-body">
                  <h4>{lesson.title}</h4>
                  <p>{lesson.description}</p>
                  <div className="lesson-meta">
                    <span className="lesson-steps-count">{lesson.steps.length} steps</span>
                    {completedLessons.includes(lesson.id) && (
                      <span className="completion-badge"><Check size={14} aria-hidden="true" /> <span>Completed</span></span>
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
            <span className="help-icon" aria-hidden="true"><Info size={20} /></span>
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
