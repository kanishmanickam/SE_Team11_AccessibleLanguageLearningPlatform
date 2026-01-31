const lessonSamples = {
  'lesson-greetings': {
    _id: 'lesson-greetings',
    title: 'Greetings',
    textContent:
      'Hello! This lesson helps you greet someone politely.\n\nSay “Hello” or “Hi” with a smile.\n\nAsk “How are you?” and respond with “I am good, thank you.”',
    audioUrl: '',
    visuals: [
      { iconUrl: '/visuals/wave.svg', description: 'Wave hello with a friendly smile.' },
      { iconUrl: '/visuals/speech.svg', description: 'Use simple greeting phrases.' },
    ],
    highlights: [
      { id: 'h1', phrase: 'Hello', emphasisType: 'background', color: '#ffe7a3', position: 0 },
      { id: 'h2', phrase: 'How are you?', emphasisType: 'underline' },
    ],
    visualAids: [
      {
        id: 'v1',
        imageUrl: '/visuals/wave.svg',
        altText: 'Waving hand icon',
        relatedPhrase: 'Hello',
        placement: 'inline',
      },
      {
        id: 'v2',
        imageUrl: '/visuals/speech.svg',
        altText: 'Speech bubble icon',
        relatedPhrase: 'How are you?',
        placement: 'below',
      },
    ],
    interactions: [
      {
        id: 'greet-1',
        type: 'true_false',
        question: 'Is “Hello” a friendly greeting?',
        correctAnswer: 'True',
        hint: 'Think about what you say when meeting someone new.',
        explanation: '“Hello” is a common, friendly way to greet someone.',
        maxAttempts: 3,
        feedback: {
          correct: 'Correct! “Hello” is a friendly greeting.',
          incorrect: 'Not quite. “Hello” is commonly used as a friendly greeting.',
        },
        position: 0,
      },
    ],
  },
  'lesson-vocabulary': {
    _id: 'lesson-vocabulary',
    title: 'Basic Words',
    textContent:
      'Let’s learn simple words for everyday items.\n\nSay the word and point to the item.\n\nRepeat each word slowly to build confidence.',
    audioUrl: '',
    visuals: [
      { iconUrl: '/visuals/speech.svg', description: 'Speak each word clearly.' },
      { iconUrl: '/visuals/sun.svg', description: 'Practice with objects around you.' },
    ],
    highlights: [
      { id: 'h3', phrase: 'simple words', emphasisType: 'bold' },
      { id: 'h4', phrase: 'Repeat', emphasisType: 'underline' },
    ],
    visualAids: [
      {
        id: 'v3',
        imageUrl: '/visuals/sun.svg',
        altText: 'Sun icon',
        relatedPhrase: 'Repeat',
        placement: 'side',
      },
    ],
    interactions: [
      {
        id: 'vocab-1',
        type: 'multiple_choice',
        question: 'Which word matches something you can sit on?',
        options: ['Chair', 'Apple', 'Rain'],
        correctAnswer: 'Chair',
        hint: 'Think of furniture you use every day.',
        explanation: 'A chair is furniture you sit on.',
        maxAttempts: 3,
        feedback: {
          correct: 'Yes! A chair is something you can sit on.',
          incorrect: 'Try again. Think of something you can sit on.',
        },
        position: 1,
      },
    ],
  },
  'lesson-numbers': {
    _id: 'lesson-numbers',
    title: 'Numbers',
    textContent:
      'Count from one to five.\n\nName a color for each number.\n\nMix numbers and colors to make learning fun.',
    audioUrl: '',
    visuals: [
      { iconUrl: '/visuals/sun.svg', description: 'Use bright colors to remember.' },
      { iconUrl: '/visuals/wave.svg', description: 'Count on your fingers as you learn.' },
    ],
    highlights: [
      { id: 'h5', phrase: 'Count from one to five', emphasisType: 'background' },
      { id: 'h6', phrase: 'colors', emphasisType: 'bold' },
    ],
    visualAids: [
      {
        id: 'v4',
        imageUrl: '/visuals/wave.svg',
        altText: 'Counting hand icon',
        relatedPhrase: 'Count',
        placement: 'inline',
      },
    ],
    interactions: [
      {
        id: 'numbers-1',
        type: 'click',
        question: 'Click the number that comes after 2.',
        options: ['1', '3', '5'],
        correctAnswer: '3',
        hint: 'Count upward: 1, 2, 3.',
        explanation: 'The number after 2 is 3.',
        maxAttempts: 3,
        feedback: {
          correct: 'Great job! 3 comes after 2.',
          incorrect: 'Not quite. Count: 1, 2, 3.',
        },
        position: 0,
      },
    ],
  },
};

export default lessonSamples;
