/**
 * Create Placeholder Audio Files
 * 
 * This script creates silent placeholder audio files so the app won't fail
 * when trying to load audio. Replace these with real audio later.
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'frontend', 'public', 'audio');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// List of all audio files needed
const audioFiles = [
  // Greetings
  'greet-1-question.mp3',
  'greet-1-explanation.mp3',
  'greet-1-correct.mp3',
  'greet-1-incorrect.mp3',
  'greet-2-question.mp3',
  'greet-2-explanation.mp3',
  'greet-2-correct.mp3',
  'greet-2-incorrect.mp3',
  'greet-3-question.mp3',
  'greet-3-explanation.mp3',
  'greet-3-correct.mp3',
  'greet-3-incorrect.mp3',
  'greet-4-question.mp3',
  'greet-4-explanation.mp3',
  'greet-4-correct.mp3',
  'greet-4-incorrect.mp3',
  'greet-5-question.mp3',
  'greet-5-explanation.mp3',
  'greet-5-correct.mp3',
  'greet-5-incorrect.mp3',
  
  // Vocabulary
  'vocab-1-question.mp3',
  'vocab-1-explanation.mp3',
  'vocab-1-correct.mp3',
  'vocab-1-incorrect.mp3',
  'vocab-2-question.mp3',
  'vocab-2-explanation.mp3',
  'vocab-2-correct.mp3',
  'vocab-2-incorrect.mp3',
  'vocab-3-question.mp3',
  'vocab-3-explanation.mp3',
  'vocab-3-correct.mp3',
  'vocab-3-incorrect.mp3',
  'vocab-4-question.mp3',
  'vocab-4-explanation.mp3',
  'vocab-4-correct.mp3',
  'vocab-4-incorrect.mp3',
  'vocab-5-question.mp3',
  'vocab-5-explanation.mp3',
  'vocab-5-correct.mp3',
  'vocab-5-incorrect.mp3',
  
  // Numbers
  'numbers-1-question.mp3',
  'numbers-1-explanation.mp3',
  'numbers-1-correct.mp3',
  'numbers-1-incorrect.mp3',
  'numbers-2-question.mp3',
  'numbers-2-explanation.mp3',
  'numbers-2-correct.mp3',
  'numbers-2-incorrect.mp3',
  'numbers-3-question.mp3',
  'numbers-3-explanation.mp3',
  'numbers-3-correct.mp3',
  'numbers-3-incorrect.mp3',
  'numbers-4-question.mp3',
  'numbers-4-explanation.mp3',
  'numbers-4-correct.mp3',
  'numbers-4-incorrect.mp3',
  'numbers-5-question.mp3',
  'numbers-5-explanation.mp3',
  'numbers-5-correct.mp3',
  'numbers-5-incorrect.mp3',
  
  // Section Narrations
  'greet-s1-narration.mp3',
  'greet-s2-narration.mp3',
  'vocab-s1-narration.mp3',
  'vocab-s2-narration.mp3',
  'vocab-s3-narration.mp3',
  'num-s1-narration.mp3',
  'num-s2-narration.mp3',
  'num-s3-narration.mp3',
];

// Minimal MP3 file (silent, ~1 second) - Base64 encoded
const SILENT_MP3_BASE64 = '/+MYxAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAA+AAAVAAASAAACJSU2MjI+Pj5LT09aWlpnaGhucHBweHl5gICAgomJko6OkpqampycnKWlpa6urra2tr+/v8fHx8/Pz9fX19/f3+fn5+/v7/f39////////wAAAE/+MYxGQAAANIAAAAANISIiIiIiJCQkJCQkpKSkpKSkqampqampra2tra2tvb29vb29zczMzMzNTU1NTU1tbW1tbW12dnZ2dnd3d3d3eHh4eHh5eXl5eXmZmZmZmamqqqqqra2tra20tLS0tLa2tra2uLi4uLi6urq6usrKysrK09PT09Pb29vb2+Pj4+Pj6+vr6+vz8/Pz8/P///////8=';

console.log('Creating placeholder audio files...\n');

let created = 0;
let skipped = 0;

audioFiles.forEach((filename) => {
  const filePath = path.join(OUTPUT_DIR, filename);
  
  if (fs.existsSync(filePath)) {
    console.log(`⊘ Skipped (exists): ${filename}`);
    skipped++;
  } else {
    const buffer = Buffer.from(SILENT_MP3_BASE64, 'base64');
    fs.writeFileSync(filePath, buffer);
    console.log(`✓ Created: ${filename}`);
    created++;
  }
});

console.log(`\n=== Complete ===`);
console.log(`✓ Created: ${created}`);
console.log(`⊘ Skipped: ${skipped}`);
console.log(`Total: ${created + skipped}`);
console.log(`\nNOTE: These are silent placeholder files.`);
console.log(`Use generate-audio-files.js to generate real audio with TTS.`);
