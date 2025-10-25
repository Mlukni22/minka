# Words Tracking Feature

## Overview

The Words Tracking feature adds two new metrics to the progress system: **Words Learned** and **Words Read**. These metrics provide users with detailed insights into their vocabulary acquisition and reading progress.

## Features Implemented

### 1. Words Learned

**Definition**: Tracks the number of unique words added to flashcards.

**How it works**:
- Increments when a user clicks on an interactive vocabulary word in a story and adds it to flashcards
- Automatically updates the `add_words` daily quest
- Awards 3 XP for each word added
- Displayed in the "My Progress" page

**Implementation**:
- `ProgressionSystem.incrementWordsLearned()` - Increments the counter
- Callback passed through `StoryReader` component
- Integrated with the interactive vocabulary system

### 2. Words Read

**Definition**: Tracks the total number of words encountered while reading stories.

**How it works**:
- Automatically counts all words in each scene when the user advances to the next scene
- Counts both German and translated text
- Cumulative across all chapters and episodes
- Displayed in the "My Progress" page

**Implementation**:
- `ProgressionSystem.incrementWordsRead()` - Adds to the counter
- `countWordsInScene()` helper function in StoryReader
- Automatically tracked on scene navigation

## User Interface

### Progress Page Updates

The progress page now displays 6 stat cards (previously 4):

| Icon | Metric | Description |
|------|--------|-------------|
| 🔥 | Current Streak | Days of consecutive learning |
| ⭐ | Total XP | Total experience points earned |
| 🧠 | **Words Learned** | Unique words added to flashcards |
| 👁️ | **Words Read** | Total words encountered in stories |
| 📖 | Episodes | Completed/Total episodes |
| ⏱️ | Study Time | Estimated study time in minutes |

### Visual Design

- **Words Learned**: Blue gradient card (from `#D4F0FF` to `#9AD8FF`) with Brain icon
- **Words Read**: Pink gradient card (from `#FFE9F5` to `#FFB8D9`) with Eye icon
- Responsive grid layout: 2 columns on mobile, 3 on tablet, 6 on desktop

## Technical Implementation

### Data Structure

#### UserProgressionState Interface
```typescript
export interface UserProgressionState {
  currentEpisode: string;
  episodeProgress: Record<string, EpisodeProgress>;
  totalXP: number;
  streak: number;
  wordsLearned?: number; // NEW
  wordsRead?: number;    // NEW
}
```

### Core Functions

#### 1. Increment Words Learned
```typescript
ProgressionSystem.incrementWordsLearned(
  progressionState: UserProgressionState,
  count: number = 1
): UserProgressionState
```

#### 2. Increment Words Read
```typescript
ProgressionSystem.incrementWordsRead(
  progressionState: UserProgressionState,
  count: number
): UserProgressionState
```

#### 3. Get Words Statistics
```typescript
ProgressionSystem.getWordsStats(
  progressionState: UserProgressionState
): { wordsLearned: number; wordsRead: number }
```

### Integration Points

#### Story Reader Component

**Props Added**:
- `onWordsRead?: (count: number) => void`
- `onWordLearned?: () => void`

**When Words are Tracked**:
1. **Words Read**: Tracked in `handleNextScene()` when user advances to next scene
2. **Words Learned**: Tracked in `handleWordClick()` when user clicks on interactive vocabulary

#### Main App (page.tsx)

**Helper Functions**:
```typescript
// Track words read
const handleWordsRead = (count: number) => {
  if (progressionState) {
    const updatedState = ProgressionSystem.incrementWordsRead(progressionState, count);
    setProgressionState(updatedState);
  }
};

// Track words learned
const handleWordLearned = () => {
  if (progressionState) {
    const updatedState = ProgressionSystem.incrementWordsLearned(progressionState, 1);
    setProgressionState(updatedState);
    updateQuestProgress('add_words');
  }
};
```

### Word Counting Algorithm

```typescript
const countWordsInScene = (sceneText: string): number => {
  // Split by whitespace and filter empty strings
  return sceneText.split(/\s+/).filter((word: string) => word.trim().length > 0).length;
};
```

**What is counted**:
- All text in the scene (narrator and dialogue)
- Both German and English text (in bilingual content)
- Punctuation is included as part of words

**What is NOT counted**:
- Empty strings or whitespace-only tokens
- Scene navigation UI text
- Button labels or system text

## Data Persistence

### Local Storage

Both metrics are stored in the `minka-progression` localStorage key as part of the UserProgressionState:

```json
{
  "currentEpisode": "episode-0-hallo",
  "episodeProgress": { ... },
  "totalXP": 150,
  "streak": 7,
  "wordsLearned": 25,
  "wordsRead": 1243
}
```

### Future: Firebase Integration

When implementing cloud persistence, these fields will be stored in the user's progression document in Firestore:

```typescript
// Firestore document structure
{
  userId: "user123",
  progression: {
    wordsLearned: 25,
    wordsRead: 1243,
    // ... other fields
  }
}
```

## Gamification Integration

### XP Rewards
- **Word Learned**: +3 XP when adding a word to flashcards

### Daily Quests
- **Vocabulary Collector Quest**: Add 5 words to flashcards (15 XP reward)
- Progress tracked automatically via `add_words` quest type

### Notifications
- XP notification displays when a word is added
- Toast notification confirms word added to flashcards

## Fallback Behavior

### Words Learned
If `wordsLearned` is not tracked or is 0, the system falls back to counting unique flashcards:

```typescript
wordsLearned: Math.max(wordStats.wordsLearned, flashcardCount)
```

This ensures accurate display even for users who started before this feature was implemented.

### Words Read
Defaults to 0 if not yet tracked.

## Files Modified

### Core System
- `src/lib/progression.ts` - Added tracking fields and helper functions

### UI Components
- `src/components/profile/progress-page.tsx` - Added stat cards and display logic
- `src/components/story-reader.tsx` - Added word counting and tracking callbacks

### Main App
- `src/app/page.tsx` - Added helper functions and prop passing

## Usage Examples

### Displaying Stats in Progress Page
```typescript
const stats = useMemo(() => {
  const wordStats = ProgressionSystem.getWordsStats(progressionState);
  const flashcards = FlashcardSystem.loadFlashcards();
  
  return {
    wordsLearned: Math.max(wordStats.wordsLearned, flashcards.length),
    wordsRead: wordStats.wordsRead,
  };
}, [progressionState]);
```

### Tracking in Story Reader
```typescript
<StoryReader
  story={selectedStory}
  onWordsRead={handleWordsRead}
  onWordLearned={handleWordLearned}
  // ... other props
/>
```

## Analytics Opportunities

### Possible Insights
- **Reading Speed**: Words read per session / study time
- **Vocabulary Efficiency**: Words learned / words read ratio
- **Learning Patterns**: Which chapters generate most vocabulary learning
- **Engagement**: Correlation between words read and retention
- **Progress Milestones**: Celebrate 100, 500, 1000 words learned

### Future Enhancements
1. **Reading Speed Calculator**: Display estimated WPM (words per minute)
2. **Vocabulary Growth Chart**: Graph of words learned over time
3. **Reading Goals**: Set daily/weekly word reading targets
4. **Vocabulary Retention**: Track which learned words are reviewed most
5. **Comparative Stats**: Compare progress with average learners
6. **Milestone Achievements**: Unlock badges at word milestones (100, 500, 1000, etc.)

## Testing Checklist

- [x] Words read counter increments when navigating scenes
- [x] Words learned counter increments when adding to flashcards
- [x] Stats display correctly in progress page
- [x] Fallback to flashcard count works for words learned
- [x] Data persists to localStorage
- [x] No linter errors
- [x] Integration with XP system works
- [x] Integration with daily quest system works
- [ ] Words read tracking for multiple sessions (cumulative)
- [ ] Reset functionality clears word counters
- [ ] Firebase sync (future)

## Performance Considerations

### Optimization
- Word counting is performed only on scene navigation (not continuously)
- Simple regex split and filter for counting (O(n) complexity)
- Stats calculated once per render using `useMemo`
- No impact on story rendering performance

### Storage
- Two small integer values added to progression state
- Minimal impact on localStorage size
- No additional network requests (local-only for now)

## Accessibility

### Visual
- Clear icons (Brain, Eye) with descriptive labels
- High contrast color schemes for stat cards
- Responsive design works on all screen sizes

### Screen Readers
- Proper semantic HTML structure
- Descriptive labels for all metrics
- No icon-only content

## Conclusion

The Words Tracking feature provides valuable metrics that help users understand their learning progress more concretely. By tracking both words learned (vocabulary acquisition) and words read (exposure), users can see tangible evidence of their language learning journey, which increases motivation and engagement.

The feature is designed to be:
- **Non-intrusive**: Automatic tracking requires no user action
- **Motivating**: Visible progress encourages continued learning
- **Accurate**: Smart fallbacks ensure accurate display
- **Extensible**: Easy to add more word-based metrics in the future

