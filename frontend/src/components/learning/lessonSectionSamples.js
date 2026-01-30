const lessonSectionSamples = {
  'lesson-greetings': [
    {
      id: 'greet-s1',
      title: 'Greeting basics',
      textContent: 'Hello! This section shows how to greet politely.',
      audioUrl: '',
      visuals: [
        { imageUrl: '/visuals/hello.svg', altText: 'Waving hand saying hello', relatedPhrase: 'Hello', placement: 'inline' },
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
      order: 0,
    },
    {
      id: 'greet-s2',
      title: 'Friendly phrases',
      textContent: 'Say “Hello” or “Hi” with a smile. Ask “How are you?”',
      audioUrl: '',
      visuals: [
        { imageUrl: '/visuals/how-are-you.svg', altText: 'Friendly question: How are you?', relatedPhrase: 'How are you?', placement: 'below' },
      ],
      interactions: [],
      order: 1,
    },
  ],
  'lesson-vocabulary': [
    {
      id: 'vocab-s1',
      title: 'Everyday objects',
      textContent: 'Let’s learn simple words for everyday items.',
      audioUrl: '',
      visuals: [
        { imageUrl: '/visuals/basic-words.svg', altText: 'Everyday objects and words', relatedPhrase: 'everyday items', placement: 'inline' },
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
          position: 0,
        },
      ],
      order: 0,
    },
    {
      id: 'vocab-s2',
      title: 'People and places',
      textContent: 'Practice words for people and places you see daily.',
      audioUrl: '',
      visuals: [
        { imageUrl: '/visuals/sun.svg', altText: 'Sun icon', relatedPhrase: 'daily', placement: 'inline' },
      ],
      interactions: [],
      order: 1,
    },
    {
      id: 'vocab-s3',
      title: 'Action words',
      textContent: 'Say simple action words like “eat”, “walk”, and “read”.',
      audioUrl: '',
      visuals: [
        { imageUrl: '/visuals/speech.svg', altText: 'Speech bubble icon', relatedPhrase: 'Say', placement: 'below' },
      ],
      interactions: [],
      order: 2,
    },
  ],
  'lesson-numbers': [
    {
      id: 'num-s1',
      title: 'Counting up',
      textContent: 'Count from one to five. Name a color for each number.',
      audioUrl: '',
      visuals: [
        { imageUrl: '/visuals/numbers.svg', altText: 'Numbers one two three', relatedPhrase: 'Count', placement: 'inline' },
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
      order: 0,
    },
    {
      id: 'num-s2',
      title: 'Number pairs',
      textContent: 'Match numbers with the correct number of objects.',
      audioUrl: '',
      visuals: [
        { imageUrl: '/visuals/sun.svg', altText: 'Bright icon for counting objects', relatedPhrase: 'numbers', placement: 'inline' },
      ],
      interactions: [],
      order: 1,
    },
    {
      id: 'num-s3',
      title: 'Counting forward',
      textContent: 'Say the next number after 1, 2, and 3.',
      audioUrl: '',
      visuals: [
        { imageUrl: '/visuals/speech.svg', altText: 'Speech bubble icon', relatedPhrase: 'Say', placement: 'below' },
      ],
      interactions: [],
      order: 2,
    },
  ],
};

export default lessonSectionSamples;
