# 🧠 Spaced Repetition Module (SM-2 Algorithm)

A complete, production-ready spaced repetition system for flashcards using the SM-2 algorithm. This module provides the core algorithm, database schema, REST API, scheduler, and React frontend components.

## 📋 Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Algorithm Details](#algorithm-details)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Usage Examples](#usage-examples)
- [Testing](#testing)
- [Scheduler](#scheduler)
- [Frontend Integration](#frontend-integration)
- [Advanced Features (TODOs)](#advanced-features-todos)

## ✨ Features

- ✅ **SM-2 Algorithm**: Industry-standard spaced repetition algorithm
- ✅ **Leech Detection**: Automatically identifies difficult cards
- ✅ **Quality Scale 0-5**: Granular performance tracking
- ✅ **Flexible Intervals**: Smart scheduling with configurable caps
- ✅ **Multi-user Support**: User-scoped cards and reviews
- ✅ **REST API**: Full Express.js API with all CRUD operations
- ✅ **Database Support**: Prisma with SQLite (dev) and PostgreSQL (production)
- ✅ **Unit Tests**: Comprehensive Jest test suite
- ✅ **Scheduler**: Cron-ready worker for due card notifications
- ✅ **React Component**: Ready-to-use review panel component

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

Create a `.env` file in the project root:

```env
DATABASE_URL="file:./dev.db"
# For PostgreSQL:
# DATABASE_URL="postgresql://user:password@localhost:5432/sr_module?schema=public"
```

Generate Prisma client and create database:

```bash
npm run sr:db:generate
npm run sr:db:push
```

### 3. Seed Sample Data (Optional)

```bash
npm run sr:db:seed
```

### 4. Start the API Server

```bash
npm run sr:dev
```

The API will be available at `http://localhost:3001`

### 5. Run Tests

```bash
npm run sr:test
```

## 📊 Algorithm Details

### SM-2 Algorithm Rules

The implementation follows the SM-2 algorithm with these specific rules:

#### Quality Scale
- **0**: Totally forgot
- **1**: Very hard (incorrect after long delay)
- **2**: Hard (correct but difficult)
- **3**: Good (correct response)
- **4**: Easy (correct with ease)
- **5**: Perfect (effortless recall)

#### Interval Calculation

**First Review (reps = 1):**
- If `quality >= 3`: `intervalDays = 1`

**Second Review (reps = 2):**
- If `quality >= 3`: `intervalDays = 6`

**Subsequent Reviews (reps > 2):**
- `intervalDays = round(previousIntervalDays * easeFactor)`

**On Failure (quality < 3):**
- Reset `reps = 0`
- Set `intervalDays = 1`
- Optionally decrease EF by 0.02 (minimum 1.3)

#### Ease Factor (EF) Update

```
EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
EF' = max(EF', 1.3)
```

Where `q` is the quality rating (0-5).

#### Constraints
- Minimum `intervalDays`: 1 day
- Maximum `intervalDays`: 3650 days (10 years)
- Minimum `easeFactor`: 1.3
- Initial `easeFactor`: 2.5

### Leech Detection

A card is marked as a leech if:
- More than **8 failures** within the last **30 reviews**, OR
- More than **12 total failures**

Leeches can be reset using the `resetLeech` function or API endpoint.

## 🔌 API Reference

All endpoints are prefixed with the base URL (default: `http://localhost:3001`).

### POST /cards

Create a new flashcard.

**Request Body:**
```json
{
  "front": "Das Haus",
  "back": "The house",
  "tags": ["A1", "house"],
  "userId": "user-123"
}
```

**Response:**
```json
{
  "id": "card_123",
  "front": "Das Haus",
  "back": "The house",
  "easeFactor": 2.5,
  "intervalDays": 0,
  "reps": 0,
  "nextReview": "2025-11-25T09:00:00Z",
  "totalReviews": 0,
  "totalFails": 0,
  "isLeech": false,
  "tags": ["A1", "house"],
  "userId": "user-123"
}
```

### GET /cards

Get all cards (optionally filtered by userId).

**Query Parameters:**
- `userId` (optional): Filter cards by user ID

**Response:** Array of card objects

### GET /cards/due

Get cards due for review on or before a specific date.

**Query Parameters:**
- `date` (optional, ISO 8601): Date to check (defaults to now)
- `userId` (optional): Filter by user ID

**Example:**
```bash
curl "http://localhost:3001/cards/due?date=2025-11-24T09:00:00Z&userId=user-123"
```

### GET /cards/:id

Get a specific card by ID.

**Response:** Card object

### POST /cards/:id/review

Record a review for a card.

**Request Body:**
```json
{
  "quality": 5,
  "userId": "user-123"
}
```

**Response:**
```json
{
  "card": { /* updated card object */ },
  "review": {
    "id": "review_123",
    "cardId": "card_123",
    "quality": 5,
    "timestamp": "2025-11-24T09:00:00Z",
    "intervalDays": 1,
    "easeFactor": 2.6,
    "reps": 1
  }
}
```

### POST /cards/:id/reset-leech

Reset leech status for a card.

**Response:** Updated card object

### GET /cards/:id/reviews

Get review history for a card.

**Query Parameters:**
- `limit` (optional): Maximum number of reviews to return (default: 50)

## 💾 Database Schema

### Cards Table

```prisma
model Card {
  id                String   @id @default(uuid())
  front             String
  back              String
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  // SRS fields
  easeFactor        Float    @default(2.5)
  intervalDays      Int      @default(0)
  lastIntervalDays  Int      @default(0)
  reps              Int      @default(0)
  nextReview        DateTime
  
  // Statistics
  totalReviews      Int      @default(0)
  totalFails        Int      @default(0)
  consecutiveFails  Int      @default(0)
  
  // Leech detection
  isLeech           Boolean  @default(false)
  leechNotes        String?
  
  // Metadata
  tags              String?  // JSON array
  userId            String?
  
  reviews           Review[]
}
```

### Reviews Table

```prisma
model Review {
  id            String   @id @default(uuid())
  cardId        String
  userId        String?
  quality       Int      // 0-5
  timestamp     DateTime @default(now())
  intervalDays  Int
  easeFactor    Float
  reps          Int
  
  card          Card     @relation(...)
}
```

## 📝 Usage Examples

### Using the Algorithm Directly

```typescript
import { createCard, recordReview, getDueCards } from './sr-module/srAlgorithm';

// Create a card
const card = createCard({
  front: 'Das Haus',
  back: 'The house',
  tags: ['A1', 'house'],
});

// Record a review
const result = recordReview(card, 5); // Quality 5 (perfect)
console.log(`Next review in ${result.intervalDays} days`);

// Get due cards
const dueCards = getDueCards([card], new Date().toISOString());
```

### Using the API (cURL)

```bash
# Create a card
curl -X POST http://localhost:3001/cards \
  -H "Content-Type: application/json" \
  -d '{
    "front": "Das Haus",
    "back": "The house",
    "tags": ["A1", "house"],
    "userId": "user-123"
  }'

# Get due cards
curl "http://localhost:3001/cards/due?userId=user-123"

# Review a card
curl -X POST http://localhost:3001/cards/CARD_ID/review \
  -H "Content-Type: application/json" \
  -d '{
    "quality": 5,
    "userId": "user-123"
  }'
```

### Using the API (JavaScript/TypeScript)

```typescript
const API_URL = 'http://localhost:3001';
const userId = 'user-123';

// Create a card
const createCard = async () => {
  const response = await fetch(`${API_URL}/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      front: 'Das Haus',
      back: 'The house',
      tags: ['A1', 'house'],
      userId,
    }),
  });
  return response.json();
};

// Get due cards
const getDueCards = async () => {
  const response = await fetch(`${API_URL}/cards/due?userId=${userId}`);
  return response.json();
};

// Review a card
const reviewCard = async (cardId: string, quality: number) => {
  const response = await fetch(`${API_URL}/cards/${cardId}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quality, userId }),
  });
  return response.json();
};

// Usage
(async () => {
  const card = await createCard();
  const dueCards = await getDueCards();
  
  if (dueCards.length > 0) {
    const review = await reviewCard(dueCards[0].id, 5);
    console.log('Next review:', review.card.nextReview);
  }
})();
```

### Example Review Sequence

Here's an example sequence showing how intervals change:

```typescript
// Start: EF=2.5, reps=0, interval=0
let card = createCard({ front: 'Test', back: 'Test' });

// Review 1: quality=5
let result = recordReview(card, 5);
// → reps=1, interval=1, EF≈2.6

// Review 2: quality=5
card = result.card;
card.lastIntervalDays = result.intervalDays;
result = recordReview(card, 5);
// → reps=2, interval=6, EF≈2.7

// Review 3: quality=4
card = result.card;
card.lastIntervalDays = result.intervalDays;
result = recordReview(card, 4);
// → reps=3, interval=round(6 * 2.7) = 16, EF≈2.64

// Review 4: quality=2 (failure)
card = result.card;
card.lastIntervalDays = result.intervalDays;
result = recordReview(card, 2);
// → reps=0, interval=1, totalFails=1, EF≈2.62
```

## 🧪 Testing

Run the test suite:

```bash
npm run sr:test
```

Run tests in watch mode:

```bash
npm run sr:test:watch
```

### Test Coverage

The test suite covers:
- ✅ Card creation with various configurations
- ✅ Review calculations for all quality levels
- ✅ Interval progression sequences
- ✅ Failure handling and resets
- ✅ Leech detection
- ✅ Due card filtering
- ✅ API endpoints (integration tests)
- ✅ Full workflow tests

### Example Test Sequence

The test suite includes this exact sequence:

```typescript
// Quality 5 → 5 → 4 sequence
// Start: EF=2.5, reps=0
// Review 1 (q=5): reps=1, interval=1
// Review 2 (q=5): reps=2, interval=6
// Review 3 (q=4): reps=3, interval=round(6 * EF)
```

## ⏰ Scheduler

The scheduler finds due cards and can trigger notifications.

### Basic Usage

```typescript
import { scheduleRunner } from './sr-module/scheduler';

// Run scheduler (checks all users)
await scheduleRunner();

// Run with custom callback
await scheduleRunner((dueCards, date) => {
  console.log(`Found ${dueCards.length} due cards on ${date}`);
});
```

### Cron Integration

For production, set up a cron job:

```typescript
import cron from 'node-cron';
import { scheduleRunner } from './sr-module/scheduler';

// Run hourly
cron.schedule('0 * * * *', () => {
  scheduleRunner();
});

// Run daily at 9 AM
cron.schedule('0 9 * * *', () => {
  scheduleRunner();
});
```

### Cron Configuration Examples

- **Hourly**: `0 * * * *` (at minute 0 of every hour)
- **Daily at 9 AM**: `0 9 * * *`
- **Every 6 hours**: `0 */6 * * *`
- **Every 30 minutes**: `*/30 * * * *`

## 🎨 Frontend Integration

Use the React component for a ready-made review interface:

```tsx
import ReviewPanel from '@/sr-module/frontend/ReviewPanel';

function App() {
  return (
    <ReviewPanel
      apiUrl="http://localhost:3001"
      userId="user-123"
      onReviewComplete={(card) => {
        console.log('Reviewed:', card);
      }}
    />
  );
}
```

The component provides:
- ✅ Card display with reveal functionality
- ✅ Quality rating buttons (0-5)
- ✅ Keyboard shortcuts (Space/Enter to reveal, 0-5 to rate)
- ✅ Progress tracking
- ✅ Auto-fetching of next card
- ✅ Leech warnings

## 📚 Algorithm Parameters Explained

### Ease Factor (EF)

- **Initial**: 2.5
- **Minimum**: 1.3 (hard limit)
- **Behavior**: Increases with good performance, decreases with poor performance
- **Impact**: Multiplies interval for cards you know well

### Interval Caps

- **Minimum**: 1 day (ensures cards are reviewed at least daily if failed)
- **Maximum**: 3650 days (10 years) - prevents intervals from becoming too long

### Leech Thresholds

- **Within 30 reviews**: 8+ failures
- **Total**: 12+ failures

These thresholds can be adjusted in `srAlgorithm.ts`:

```typescript
const LEECH_FAIL_THRESHOLD_30_REVIEWS = 8;
const LEECH_FAIL_THRESHOLD_TOTAL = 12;
const LEECH_REVIEW_WINDOW = 30;
```

## 🚧 Advanced Features (TODOs)

The following features are planned but not yet implemented:

- [ ] **Adaptive Scheduling**: Ebbinghaus/Weibull decay models
- [ ] **Bayesian Stability Estimation**: More accurate interval prediction
- [ ] **Per-user Personalization**: Customize EF base on individual performance
- [ ] **Anki Import/Export**: Compatibility with Anki deck format
- [ ] **Card Templates**: Support for cloze deletion, image cards, etc.
- [ ] **Statistics Dashboard**: Detailed analytics and performance metrics
- [ ] **Synchronization**: Multi-device sync support
- [ ] **Offline Mode**: Local-first architecture with sync

## 📄 License

This module is part of the Minka project.

## 🤝 Contributing

When contributing, please ensure:
- All tests pass: `npm run sr:test`
- Code follows TypeScript best practices
- New features include tests
- Documentation is updated

---

**Questions?** Check the test files for more usage examples, or explore the source code in `src/sr-module/`.


