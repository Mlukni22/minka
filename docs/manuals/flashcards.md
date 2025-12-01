# 🃏 Minka Flashcard System

A comprehensive spaced-repetition flashcard system inspired by Readlang, fully integrated with story-based learning.

## Overview

The flashcard system allows users to practice words they've saved from stories using a spaced-repetition algorithm (SM-2). Words are automatically created as flashcards when users click on them in story content, and users can review them in a dedicated practice interface.

## Data Model

### Flashcard

Stored in Firestore at: `users/{userId}/flashcards/{flashcardId}`

```typescript
interface Flashcard {
  id: string;
  userId: string;
  languageCode: string; // e.g. "de"
  frontText: string; // German word/phrase
  backText: string; // English translation
  contextSentence: string; // German sentence where word appears
  contextTranslation?: string; // Optional sentence translation
  // Links to content
  storyId?: string;
  chapterId?: string;
  storyWordId?: string;
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
```

### FlashcardSRS

Stored in Firestore at: `users/{userId}/flashcards/{flashcardId}/srs/data`

```typescript
interface FlashcardSRS {
  id: string;
  flashcardId: string;
  dueAt: Date; // When card should next appear
  intervalDays: number; // Current interval in days
  easeFactor: number; // Difficulty factor (default 2.5)
  repetitions: number; // Number of successful reviews
  lastReviewedAt: Date | null;
}
```

### FlashcardReview

Stored in Firestore at: `users/{userId}/flashcards/{flashcardId}/reviews/{reviewId}`

Tracks each review for analytics and debugging:

```typescript
interface FlashcardReview {
  id: string;
  flashcardId: string;
  userId: string;
  rating: number; // 0-3 (Again, Hard, Good, Easy)
  reviewedAt: Date;
  previousIntervalDays: number;
  newIntervalDays: number;
  previousEaseFactor: number;
  newEaseFactor: number;
}
```

### FlashcardPreferences

Stored in Firestore at: `users/{userId}/flashcardPreferences/settings`

```typescript
interface FlashcardPreferences {
  id: string;
  userId: string;
  maxNewCardsPerDay: number; // Default 15
  maxReviewsPerDay: number; // Default 100
  learningLanguageCode: string; // Default "de"
  showBackAutomatically: boolean; // Default false
  sessionGoalCards: number; // Default 20
  createdAt: Date;
  updatedAt: Date;
}
```

## API Endpoints

### GET /api/flashcards/queue

Get flashcards due for review today.

**Query Parameters:**
- `userId` (required): User ID
- `storyId` (optional): Filter to specific story
- `limit` (optional): Max cards to return (default 20)

**Response:**
```json
{
  "cards": [
    {
      "id": "flashcard-id",
      "frontText": "die Nacht",
      "backText": "night",
      "contextSentence": "Es ist Nacht.",
      "contextTranslation": "It is night.",
      "storyTitle": "Minka und die Nacht"
    }
  ],
  "stats": {
    "dueToday": 15,
    "newToday": 5,
    "remainingInSession": 10
  }
}
```

### POST /api/flashcards/review

Submit a review rating for a flashcard.

**Body:**
```json
{
  "userId": "user-id",
  "flashcardId": "flashcard-id",
  "rating": 2  // 0=Again, 1=Hard, 2=Good, 3=Easy
}
```

**Response:**
```json
{
  "success": true,
  "review": { /* FlashcardReview object */ },
  "updatedFlashcard": {
    "dueAt": "2024-01-15T10:00:00Z",
    "intervalDays": 3,
    "easeFactor": 2.5,
    "repetitions": 1
  },
  "stats": {
    "dueToday": 14,
    "newToday": 5,
    "learned": 10
  }
}
```

### GET /api/flashcards/stats

Get aggregated flashcard statistics.

**Query Parameters:**
- `userId` (required): User ID

**Response:**
```json
{
  "dueToday": 15,
  "newToday": 5,
  "learned": 10,
  "total": 50,
  "byStory": {
    "story-id-1": {
      "count": 20,
      "title": "Minka und die Nacht"
    }
  }
}
```

### POST /api/flashcards/bulk-create

Bulk create flashcards from all words in a chapter (for migration/debugging).

**Body:**
```json
{
  "userId": "user-id",
  "storyId": "story-id",
  "chapterId": "chapter-id"
}
```

**Response:**
```json
{
  "success": true,
  "created": 10,
  "skipped": 2,
  "flashcardIds": ["id1", "id2", ...]
}
```

## Spaced Repetition Algorithm (SM-2)

The scheduling algorithm is implemented in `src/lib/srs-scheduler.ts`.

### Rating System

- **0 = Again**: Total blackout, reset progress
- **1 = Hard**: Difficult, decrease ease factor
- **2 = Good**: Correct, normal progression
- **3 = Easy**: Very easy, increase ease factor

### Default Values (New Card)

- `repetitions = 0`
- `intervalDays = 0`
- `easeFactor = 2.5`
- `dueAt = now` (appears immediately)

### Update Rules

**Ease Factor Update:**
```
EF = EF + (0.1 - (3 - q) * (0.08 + (3 - q) * 0.02))
if (EF < 1.3) EF = 1.3
```

Where `q` is the rating (0-3).

**Interval Calculation:**

- If rating < 2 (Again/Hard):
  - `repetitions = 0`
  - `intervalDays = 1` (review next day)

- If rating >= 2 (Good/Easy):
  - `repetitions = repetitions + 1`
  - If `repetitions === 1`: `intervalDays = 1`
  - Else if `repetitions === 2`: `intervalDays = 3`
  - Else: `intervalDays = round(intervalDays * easeFactor)`

**Next Due Date:**
```
dueAt = now + intervalDays
```

## Frontend Components

### Practice Page (`/practice`)

Located at: `src/app/practice/page.tsx`

**Features:**
- One card at a time display
- Shows front (German word + context sentence)
- Reveal button to show back (translation)
- Four rating buttons (Again, Hard, Good, Easy)
- Keyboard shortcuts:
  - `Space`/`Enter`: Toggle reveal
  - `1-4`: Rate card (Again, Hard, Good, Easy)
- Progress bar showing session progress
- Stats display (due today, new today)
- Empty state when no cards available

**Design:**
- Clean, minimal design inspired by Readlang
- White card with subtle shadow
- Word highlighted in context sentence
- Story tag showing source story
- Responsive (centered on desktop, full-width on mobile)

## Integration Points

### Story Reader

When a user clicks a word in a story (`src/app/stories/[id]/chapters/[chapter_number]/page.tsx`):

1. Word is translated and displayed
2. Flashcard is automatically created using `createFlashcardWithContext()`
3. Context sentence is extracted from story blocks
4. Toast notification: "Word added to flashcards – review later in Practice!"

### Flashcard Creation

Located in: `src/lib/db/flashcards.ts`

- `createFlashcardWithContext()`: Creates flashcard with full context
- `flashcardExistsForStoryWord()`: Checks if flashcard already exists
- Automatically creates SRS data with default values

## Database Functions

### Core Functions (`src/lib/db/flashcards.ts`)

- `getFlashcardQueue()`: Get due + new cards for review
- `createFlashcardWithContext()`: Create flashcard with story context
- `saveFlashcardReview()`: Save review and update SRS
- `getFlashcardStats()`: Get aggregated statistics
- `getFlashcardPreferences()`: Get or create user preferences
- `flashcardExistsForStoryWord()`: Check if flashcard exists

### SRS Functions (`src/lib/srs-scheduler.ts`)

- `updateSRS()`: Calculate new SRS values based on rating
- `getDefaultSRS()`: Get default values for new card

## Navigation

- **Header**: "Practice" link added to desktop, mobile, and user menu
- **Dashboard**: Link to practice page
- **Story Reader**: Toast notification when words are added

## Testing

### Unit Tests (To Add)

- `src/lib/srs-scheduler.test.ts`: Test SM-2 algorithm
- `src/app/api/flashcards/queue.test.ts`: Test queue endpoint
- `src/app/api/flashcards/review.test.ts`: Test review endpoint

### Manual Testing Checklist

1. ✅ Click word in story → flashcard created
2. ✅ Navigate to `/practice` → see due cards
3. ✅ Review a card → moves to next card
4. ✅ Complete session → see completion message
5. ✅ Keyboard shortcuts work
6. ✅ Stats update correctly

## Future Enhancements

- [ ] Per-story filtering in practice page
- [ ] Card suspension/archival
- [ ] Review history analytics
- [ ] Custom study sessions
- [ ] Export/import flashcards
- [ ] Mobile app support


