/**
 * Script to set imageUrl for words in Firestore
 * 
 * Usage:
 * 1. Update the wordImageMap below with your words and their image file names
 * 2. Make sure you have Firebase Admin SDK configured
 * 3. Run: node scripts/set-word-images.js
 */

// Map of word phrases to their image file names
const wordImageMap = {
  'die Katze': 'die-katze.png',
  'die Maus': 'die-maus.png',
  'das Haus': 'das-haus.png',
  'Milch': 'milch.png',
  'der Napf': 'der-napf.png',
  'ruhig': 'ruhig.png',
  'Vögel': 'voegel.png',
  'neu': 'neu.png',
  'Sonne': 'sonne.png',
  'Hallo': 'hallo.png',
  'mögen': 'moegen.png',
  'trinken': 'trinken.png',
  'das Bett': 'das-bett.png',
};

// Function to convert word to image filename
function wordToImageName(phrase) {
  return phrase
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/\s+/g, '-')
    .trim();
}

// Example: How to use with Firebase Admin SDK
async function setWordImages(storyId, chapterId) {
  // This is a template - you'll need to configure Firebase Admin SDK
  const admin = require('firebase-admin');
  
  // Initialize Firebase Admin (you need to set this up)
  // admin.initializeApp({
  //   credential: admin.credential.cert(serviceAccount),
  // });
  
  const db = admin.firestore();
  const wordsRef = db.collection('stories')
    .doc(storyId)
    .collection('chapters')
    .doc(chapterId)
    .collection('words');
  
  const snapshot = await wordsRef.get();
  
  for (const doc of snapshot.docs) {
    const wordData = doc.data();
    const phrase = wordData.phrase;
    
    // Check if we have a mapping, otherwise generate from phrase
    const imageName = wordImageMap[phrase] || wordToImageName(phrase);
    const imageUrl = `/images/vocabulary/${imageName}`;
    
    await doc.ref.update({
      imageUrl: imageUrl,
    });
    
    console.log(`Updated ${phrase}: ${imageUrl}`);
  }
  
  console.log('Done! All words updated.');
}

// Export for use
module.exports = { setWordImages, wordToImageName, wordImageMap };

// If running directly, you can add your story/chapter IDs here
// setWordImages('your-story-id', 'your-chapter-id');

