# Translation Guarantee System

This document explains how the system ensures **every word has a translation** and how to handle missing translations.

## Overview

The system uses a **multi-layered approach** to guarantee translations:

1. **Proactive Pre-translation** - Stories are pre-translated when loaded
2. **On-Demand Translation** - Words are translated when clicked
3. **Multiple Fallback Layers** - Multiple APIs and heuristics ensure coverage
4. **Automatic Fixes** - Missing translations are automatically resolved

## How It Works

### 1. Pre-Translation System

When a story chapter is loaded, the system automatically:

- **Tokenizes** all words in the chapter
- **Checks cache** for existing translations
- **Translates missing words** using the translation pipeline
- **Saves translations** to cache for future use

**Location:** `src/lib/translation/pre-translate-story.ts`

**API Endpoint:** `POST /api/stories/[id]/ensure-translations`

### 2. Translation Pipeline

The translation pipeline tries multiple sources in order:

1. **Local Dictionary** (`src/lib/translations.ts`)
   - Fast, offline translations for common words
   - Includes verb conjugations, prepositions, common words

2. **Lemmatization**
   - Converts conjugated verbs → infinitive (schnuppert → schnuppern)
   - Converts plural nouns → singular (Kinder → Kind)
   - Converts declined adjectives → base form

3. **External APIs** (in parallel, fastest first):
   - LibreTranslate (machine translation - fastest)
   - Yandex API
   - DictionaryAPI.dev
   - German-English Dictionary API (most comprehensive)

4. **Heuristic Fallbacks**
   - Strips common endings and retries
   - Tries variations (ß/ss)

5. **Machine Translation Fallback**
   - Final MT call if all else fails
   - Always returns a translation (even if it's the word itself)

**Location:** `src/lib/translation-service.ts`

### 3. Word Click Handler

When a user clicks a word:

1. Checks vocabulary list
2. Calls `/api/dictionary/lookup` (guaranteed translation)
3. Falls back to `getTranslationAlways()` if needed
4. Uses MT as final fallback
5. **Never returns null** - always has a translation

**Location:** `src/app/stories/[id]/chapters/[chapter_number]/page.tsx` → `handleWordClick()`

## API Endpoints

### Check Translation Status

```bash
GET /api/stories/[id]/check-translations
```

Returns translation coverage report:
```json
{
  "totalTokens": 123,
  "translatedCount": 120,
  "fallbackCount": 3,
  "missingCount": 0,
  "tokens": [...]
}
```

### Ensure All Translations

```bash
POST /api/stories/[id]/ensure-translations
Body: {
  "text": "Story text...",
  "sectionId": "chapter-id",
  "forceRefresh": false
}
```

Proactively ensures all words have translations:
```json
{
  "success": true,
  "report": {...},
  "fixedWords": ["word1", "word2"],
  "failedWords": [],
  "needsAttention": false
}
```

### Lookup Single Word

```bash
GET /api/dictionary/lookup?word=word
```

Always returns a translation:
```json
{
  "success": true,
  "data": {
    "original": "schnuppert",
    "baseForm": "schnuppern",
    "translation": "to sniff",
    "source": "api",
    "isVerb": true
  }
}
```

## Automatic Features

### 1. Background Pre-translation

When a chapter loads, the system automatically:
- Extracts all text from the chapter
- Calls `/api/stories/[id]/ensure-translations` in the background
- Doesn't block the UI (runs async)

**Location:** `src/app/stories/[id]/chapters/[chapter_number]/page.tsx` → `loadChapterData()`

### 2. Caching

All translations are cached in:
- **In-memory cache** (fast, per-session)
- **Firestore `dictionaryCache` collection** (persistent)

This ensures:
- Fast lookups for repeated words
- No redundant API calls
- Offline support for cached words

### 3. Guaranteed Translation

The `getTranslationAlways()` function:
- **Never returns null**
- **Always returns a TranslationResult**
- Uses word itself as last resort (marked as `fallback`)

## How to Handle Missing Translations

### Option 1: Automatic (Recommended)

The system handles it automatically:
- Pre-translation runs when chapters load
- Word clicks always get translations
- Missing words are automatically fixed

### Option 2: Manual Check

Check translation status:
```typescript
const response = await fetch(`/api/stories/${storyId}/ensure-translations`);
const data = await response.json();
if (data.needsAttention) {
  // Some words need attention
}
```

### Option 3: Force Refresh

Force re-translation of all words:
```typescript
await fetch(`/api/stories/${storyId}/ensure-translations`, {
  method: 'POST',
  body: JSON.stringify({
    text: chapterText,
    forceRefresh: true, // Force re-translation
  }),
});
```

### Option 4: Add to Local Dictionary

For words that should always translate correctly, add to:
`src/lib/translations.ts`

```typescript
const translations: Record<string, string> = {
  'your-word': 'translation',
  // ...
};
```

## Status Types

- **`translated`** - Word has a good translation from local dict or API
- **`fallback`** - Word has translation from MT or fallback (still usable)
- **`missing`** - Word has no translation (should never happen with current system)

## Best Practices

1. **Let the system handle it** - Pre-translation runs automatically
2. **Add common words** to `src/lib/translations.ts` for faster lookups
3. **Monitor coverage** using `/api/stories/[id]/ensure-translations` GET endpoint
4. **Force refresh** if translations seem outdated

## Troubleshooting

### Word Still Shows No Translation

1. Check if word is in local dictionary (`src/lib/translations.ts`)
2. Check browser console for errors
3. Try force refresh: `forceRefresh: true`
4. Check API status: `GET /api/stories/[id]/ensure-translations`

### Slow Translation

- Translations are cached after first lookup
- Pre-translation runs in background (doesn't block UI)
- Consider adding common words to local dictionary

### Translation Quality

- Local dictionary translations are highest quality
- API translations are good
- MT fallback is acceptable but may be less accurate
- Add better translations to local dictionary as needed

## System Architecture

```
User clicks word
    ↓
handleWordClick()
    ↓
/api/dictionary/lookup
    ↓
getTranslationAlways()
    ↓
[Local Dict] → [Lemmatize] → [APIs] → [Heuristics] → [MT] → [Word Itself]
    ↓
Always returns translation ✅
```

## Summary

✅ **Every word gets a translation** - Multiple fallback layers ensure this
✅ **Automatic pre-translation** - Stories are pre-translated when loaded
✅ **Caching** - Fast lookups for repeated words
✅ **No missing translations** - System guarantees coverage
✅ **Background processing** - Doesn't block UI

The system is designed to **never have missing translations**. If a word doesn't have a perfect translation, it will:
1. Try multiple APIs
2. Use machine translation
3. Return the word itself as a fallback (marked as `fallback`, not `missing`)

