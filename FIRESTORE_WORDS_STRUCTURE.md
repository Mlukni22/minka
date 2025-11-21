# Firestore Words Structure

## Current Issue

You mentioned you only have up to `chapters` in Firestore, but no `words` collection. Words need to be stored as a **subcollection** under each chapter.

## Firestore Structure

Words are stored as a **subcollection** under each chapter, not as a separate top-level collection:

```
stories/
  └── {storyId}/
      └── chapters/
          └── {chapterId}/
              └── words/          ← This is a SUBCOLLECTION
                  └── {wordId}/
                      ├── phrase: "die Katze"
                      ├── translation: "the cat"
                      ├── exampleSentence: "Die Katze ist schön."
                      ├── exampleTranslation: "The cat is beautiful."
                      ├── imageUrl: "/images/vocabulary/die-katze.png"
                      ├── imageAlt: "A cat"
                      ├── isKeyWord: true
                      ├── chapterId: "{chapterId}"
                      ├── createdAt: Timestamp
                      └── updatedAt: Timestamp
```

## How to Create Words in Firestore

### Method 1: Firebase Console (Manual)

1. Go to Firebase Console → Firestore Database
2. Navigate to: `stories` → `{your-story-id}` → `chapters` → `{chapter-id}`
3. Click on the chapter document
4. You should see a "Subcollections" section
5. Click "Start collection" or the "+" button next to "Subcollections"
6. Collection ID: `words`
7. Add your first word document:
   - Document ID: (auto-generate or use a custom ID like `word-1`)
   - Add fields:
     - `phrase` (string): "die Katze"
     - `translation` (string): "the cat"
     - `exampleSentence` (string, optional): "Die Katze ist schön."
     - `exampleTranslation` (string, optional): "The cat is beautiful."
     - `imageUrl` (string, optional): "/images/vocabulary/die-katze.png"
     - `imageAlt` (string, optional): "A cat"
     - `isKeyWord` (boolean): `true`
     - `chapterId` (string): "{chapterId}" (same as parent chapter)
     - `createdAt` (timestamp): Current timestamp
     - `updatedAt` (timestamp): Current timestamp

### Method 2: Using Firebase Admin SDK (Script)

You can create a script to bulk add words. Here's an example structure:

```javascript
const words = [
  {
    phrase: "die Katze",
    translation: "the cat",
    exampleSentence: "Die Katze ist schön.",
    exampleTranslation: "The cat is beautiful.",
    imageUrl: "/images/vocabulary/die-katze.png",
    isKeyWord: true,
    chapterId: "your-chapter-id"
  },
  {
    phrase: "die Maus",
    translation: "the mouse",
    exampleSentence: "Die Maus ist klein.",
    exampleTranslation: "The mouse is small.",
    imageUrl: "/images/vocabulary/die-maus.png",
    isKeyWord: true,
    chapterId: "your-chapter-id"
  },
  // ... more words
];

// Add to Firestore
const batch = db.batch();
words.forEach(word => {
  const wordRef = db.collection('stories')
    .doc(storyId)
    .collection('chapters')
    .doc(chapterId)
    .collection('words')
    .doc(); // Auto-generate ID
  
  batch.set(wordRef, {
    ...word,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
});

await batch.commit();
```

## Important Notes

1. **Words are a SUBCOLLECTION**, not a separate collection
2. The path is: `stories/{storyId}/chapters/{chapterId}/words/{wordId}`
3. Each word document needs at minimum:
   - `phrase` (German word/phrase)
   - `translation` (English translation)
   - `chapterId` (reference to parent chapter)
   - `isKeyWord` (boolean, defaults to true if not set)
4. Optional fields:
   - `exampleSentence`
   - `exampleTranslation`
   - `imageUrl`
   - `imageAlt`
   - `sectionId` (if linking to specific sections)

## Quick Checklist

- [ ] Navigate to the chapter document in Firestore
- [ ] Create a subcollection called `words`
- [ ] Add word documents with required fields
- [ ] Set `isKeyWord: true` for words you want to show
- [ ] Add `imageUrl` if you have images
- [ ] Refresh your app to see the words

## Example Word Document

```json
{
  "phrase": "die Katze",
  "translation": "the cat",
  "exampleSentence": "Die Katze ist schön.",
  "exampleTranslation": "The cat is beautiful.",
  "imageUrl": "/images/vocabulary/die-katze.png",
  "imageAlt": "A cat",
  "isKeyWord": true,
  "chapterId": "LutES2eARL2ppiK3KAZR",
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:00:00Z"
}
```

## Troubleshooting

**If words still don't appear:**
1. Check that the subcollection is named exactly `words` (lowercase, plural)
2. Verify the `chapterId` in each word matches the parent chapter ID
3. Check browser console for any errors
4. Make sure words have `isKeyWord: true` (or the code will show all words now)

