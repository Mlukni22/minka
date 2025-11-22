/**
 * Script to add vocabulary words to a story chapter
 * 
 * Usage:
 * 1. Set STORY_ID and CHAPTER_ID below
 * 2. Run: node scripts/add-vocabulary-words.mjs
 * 
 * This script uses the API endpoint to add words.
 */

const STORY_ID = 'minka-ist-new'; // Update this
const CHAPTER_ID = '4uRM7WUDnCoxAUTnxXpZ'; // Update this
const API_URL = 'http://localhost:3000'; // Update if different

// Vocabulary words in order of appearance
const vocabularyWords = [
  { phrase: 'das Geräusch', translation: 'noise', exampleSentence: 'ein kleiner Ton' },
  { phrase: 'setzt sich (sich aufsetzen)', translation: 'sits up', exampleSentence: 'sich nach oben bewegen' },
  { phrase: 'flüstern', translation: 'to whisper', exampleSentence: 'sehr leise sprechen' },
  { phrase: 'der Körper', translation: 'body', exampleSentence: 'Mensch oder Tier' },
  { phrase: 'der Bildschirm', translation: 'screen', exampleSentence: 'das Handy-Display' },
  { phrase: 'das Icon', translation: 'app icon', exampleSentence: 'kleines Bild für eine App' },
  { phrase: 'die Form', translation: 'shape', exampleSentence: 'wie etwas aussieht' },
  { phrase: 'komisch', translation: 'strange', exampleSentence: 'nicht normal' },
  { phrase: 'installieren', translation: 'to install', exampleSentence: 'eine App auf das Handy machen' },
  { phrase: 'tippen', translation: 'to tap', exampleSentence: 'leicht auf den Bildschirm drücken' },
  { phrase: 'schwarz', translation: 'black', exampleSentence: 'sehr dunkle Farbe' },
  { phrase: 'das Level', translation: 'level', exampleSentence: 'eine Aufgabe / Stufe' },
  { phrase: 'runzeln', translation: 'to wrinkle', exampleSentence: 'die Stirn klein machen' },
  { phrase: 'die Stirn', translation: 'forehead', exampleSentence: 'über den Augen' },
  { phrase: 'miauen', translation: 'to meow', exampleSentence: 'Ton einer Katze' },
  { phrase: 'springen', translation: 'to jump', exampleSentence: 'schnell nach oben gehen' },
  { phrase: 'zweiter', translation: 'second', exampleSentence: 'Nummer zwei' },
  { phrase: 'die Wahrheit', translation: 'truth', exampleSentence: 'was echt ist' },
  { phrase: 'ausschalten', translation: 'to turn off', exampleSentence: 'ein Gerät ausmachen' },
  { phrase: 'von selbst', translation: 'by itself', exampleSentence: 'ohne Hilfe' },
  { phrase: 'plötzlich', translation: 'suddenly', exampleSentence: 'sehr schnell, ohne Plan' },
  { phrase: 'dunkel', translation: 'dark', exampleSentence: 'nicht hell' },
  { phrase: 'groß', translation: 'big', exampleSentence: 'nicht klein' },
];

async function addWords() {
  if (STORY_ID === 'YOUR_STORY_ID' || CHAPTER_ID === 'YOUR_CHAPTER_ID') {
    console.error('❌ Please update STORY_ID and CHAPTER_ID in the script!');
    process.exit(1);
  }

  console.log(`Adding ${vocabularyWords.length} words to story ${STORY_ID}, chapter ${CHAPTER_ID}...\n`);

  try {
    const response = await fetch(`${API_URL}/api/stories/${STORY_ID}/chapters/${CHAPTER_ID}/words`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ words: vocabularyWords }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Error:', result.error || result);
      process.exit(1);
    }

    console.log(`✅ Success!`);
    console.log(`   Added: ${result.added}`);
    console.log(`   Skipped (duplicates): ${result.skipped}`);
    if (result.errors && result.errors.length > 0) {
      console.log(`   Errors: ${result.errors.length}`);
      result.errors.forEach(err => console.log(`     - ${err}`));
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addWords();

