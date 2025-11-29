# How to Set Image URLs in Firestore

All your words are showing "Word without image" in the console, which means the `imageUrl` field is not set in Firestore.

## Quick Solution

You need to set the `imageUrl` field for each word in Firestore. Here's how:

### Step 1: Prepare Your Image Files

1. Create your icon images (64x64px to 128x128px, square format)
2. Name them according to the word (lowercase, hyphens for spaces):
   - "die Katze" → `die-katze.png`
   - "die Maus" → `die-maus.png`
   - "das Haus" → `das-haus.png`
   - "Milch" → `milch.png`
   - "der Napf" → `der-napf.png`
   - "ruhig" → `ruhig.png`
   - "Vögel" → `voegel.png` (ö → oe)
   - "neu" → `neu.png`
   - "Sonne" → `sonne.png`
   - "Hallo" → `hallo.png`
   - "mögen" → `moegen.png` (ö → oe)
   - "trinken" → `trinken.png`
   - "das Bett" → `das-bett.png`

3. Place them in: `public/images/vocabulary/`

### Step 2: Set imageUrl in Firestore

For each word document, set the `imageUrl` field:

**Firestore Path:**
```
stories/{storyId}/chapters/{chapterId}/words/{wordId}
```

**Set the `imageUrl` field to:**
```
/images/vocabulary/{word-name}.png
```

### Examples:

| Word | imageUrl |
|------|----------|
| die Katze | `/images/vocabulary/die-katze.png` |
| die Maus | `/images/vocabulary/die-maus.png` |
| das Haus | `/images/vocabulary/das-haus.png` |
| Milch | `/images/vocabulary/milch.png` |
| der Napf | `/images/vocabulary/der-napf.png` |
| ruhig | `/images/vocabulary/ruhig.png` |
| Vögel | `/images/vocabulary/voegel.png` |
| neu | `/images/vocabulary/neu.png` |
| Sonne | `/images/vocabulary/sonne.png` |
| Hallo | `/images/vocabulary/hallo.png` |
| mögen | `/images/vocabulary/moegen.png` |
| trinken | `/images/vocabulary/trinken.png` |
| das Bett | `/images/vocabulary/das-bett.png` |

### Step 3: Manual Method (Firebase Console)

1. Go to Firebase Console → Firestore Database
2. Navigate to: `stories` → `{your-story-id}` → `chapters` → `{chapter-id}` → `words`
3. Click on each word document
4. Add a new field: `imageUrl` (type: string)
5. Set the value to: `/images/vocabulary/{word-name}.png`
6. Save

### Step 4: Bulk Update (Using Firebase Admin SDK)

If you have many words, you can use a script to bulk update. See the script below.

## Special Character Conversion

When naming files, convert special characters:
- `ä` → `ae`
- `ö` → `oe`
- `ü` → `ue`
- `ß` → `ss`
- Spaces → hyphens
- Uppercase → lowercase

## Verification

After setting the imageUrl:
1. Refresh the page
2. Check browser console - you should see "Word with image: {word} Image URL: {url}"
3. Images should appear in the vocabulary panel and hover tooltips

