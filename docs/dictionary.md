# Dictionary Feature Documentation

## Overview

The Dictionary feature allows users to look up any German word and get translations, verb conjugations, and example sentences. It integrates with the flashcard system so users can easily add looked-up words to their study deck.

## API Endpoint

### GET /api/dictionary?word=WORD

**Query Parameters:**
- `word` (required): The German word to look up

**Response:**
```typescript
{
  word: string;
  translation: string;
  isVerb: boolean;
  verbForms?: {
    infinitive: string;
    present: string[];
    past: string[];
    perfect: string[];
    subjunctive?: string[];
  };
  examples?: string[];
  cached?: boolean;
  error?: string;
}
```

**Example Request:**
```
GET /api/dictionary?word=gehen
```

**Example Response:**
```json
{
  "word": "gehen",
  "translation": "to go",
  "isVerb": true,
  "verbForms": {
    "infinitive": "gehen",
    "present": ["gehe", "gehst", "geht", "gehen", "geht", "gehen"],
    "past": ["ging", "gingst", "ging", "gingen", "gingt", "gingen"],
    "perfect": ["bin gegangen", "bist gegangen", "ist gegangen", "sind gegangen", "seid gegangen", "sind gegangen"]
  },
  "examples": ["Ich gehe zur Schule.", "Er geht nach Hause."],
  "cached": false
}
```

## Data Source

The dictionary scrapes data from [verbformen.com](https://www.verbformen.com/), a comprehensive German verb conjugation and translation resource.

## Caching

Dictionary entries are cached in Firestore to reduce repeated requests:

- **Collection:** `dictionary_cache`
- **Cache Duration:** 90 days
- **Cache Key:** Normalized word (lowercase, trimmed)

### Cache Structure

```typescript
{
  word: string;           // Normalized (lowercase)
  translation: string;
  isVerb: boolean;
  verbForms?: VerbForms;
  examples?: string[];
  lastFetchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Frontend Component

### Dictionary Component

Located at `src/components/dictionary.tsx`

**Props:**
- `initialWord?: string` - Pre-fill the search with a word
- `onWordClick?: (word: string) => void` - Callback when a word is clicked

**Features:**
- Search input with Enter key support
- Loading states with spinner
- Error handling with user-friendly messages
- Verb conjugation table (collapsible)
- Example sentences display
- "Add to Flashcards" button (requires authentication)

### Dictionary Page

Located at `src/app/dictionary/page.tsx`

Full-page dictionary interface accessible from the navigation menu.

## Integration with Flashcards

When a user clicks "Add to Flashcards":

1. Creates a flashcard using `createFlashcardWithContext()`
2. Uses the word as `frontText`
3. Uses the translation as `backText`
4. Uses the first example sentence as `contextSentence` (if available)
5. Adds to user's flashcard queue for review

## Scraping Logic

The scraper (`src/lib/dictionary/scraper.ts`) extracts:

1. **Translation:** From "Übersetzung" section or main content
2. **Verb Forms:** From conjugation tables (Präsens, Präteritum, Perfekt)
3. **Examples:** From example sentence lists

### HTML Parsing

Uses Cheerio for server-side HTML parsing:
- Finds translation in various possible locations
- Extracts verb forms from conjugation tables
- Collects example sentences from list elements

### Error Handling

- **404 Not Found:** Returns `{ translation: "Not found", error: "Word not found" }`
- **Connection Errors:** Returns error message in response
- **Parsing Errors:** Logs error and returns partial data if available

## Extending the Parser

If verbformen.com changes their HTML structure, update the selectors in `src/lib/dictionary/scraper.ts`:

1. **Translation:** Update selectors in `scrapeVerbformen()` function
2. **Verb Forms:** Update table selectors in `extractVerbForms()` function
3. **Examples:** Update list item selectors

Common selectors to check:
- Translation: `p:contains("Übersetzung")`, `main p`, `meta[name="description"]`
- Conjugation: `table[id*="konjugation"]`, `.konjugation table`
- Examples: `ul.examples li`, `.beispiel li`

## Testing

### Manual Testing

1. **Valid Word:**
   - Search for "gehen" → Should return translation and verb forms
   - Check cache → Should be saved to database
   - Search again → Should return cached result

2. **Invalid Word:**
   - Search for "xyzabc123" → Should return "Not found" error

3. **Add to Flashcards:**
   - Search for a word
   - Click "Add to Flashcards"
   - Verify flashcard appears in practice queue

### Unit Tests (To Implement)

```typescript
// Test parsing logic
describe('Dictionary Scraper', () => {
  it('should extract translation from HTML', () => {});
  it('should extract verb forms from conjugation table', () => {});
  it('should extract example sentences', () => {});
  it('should handle 404 errors', () => {});
});

// Test API endpoint
describe('Dictionary API', () => {
  it('should return cached result if available', () => {});
  it('should scrape and cache new words', () => {});
  it('should handle errors gracefully', () => {});
});
```

## Performance Considerations

- **Caching:** Reduces external API calls
- **Async Operations:** All database and network operations are async
- **Error Boundaries:** Errors don't crash the app
- **Loading States:** Users see feedback during searches

## Future Enhancements

- [ ] Add pronunciation audio
- [ ] Support for multiple translations
- [ ] Word frequency information
- [ ] Related words suggestions
- [ ] History of searched words
- [ ] Offline support with service workers

