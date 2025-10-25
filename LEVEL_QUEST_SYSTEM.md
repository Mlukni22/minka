# Level & Daily Quest System Documentation

## Overview

The Level & Daily Quest System is a gamification feature that rewards users with XP (experience points) for completing various learning activities and provides daily quests to encourage consistent engagement with the app.

## Features Implemented

### 1. Level System

#### Core Components
- **Level Calculation**: Uses an exponential formula (100 * level^1.5) to determine XP required for each level
- **XP Tracking**: Tracks total XP earned, current level, and progress toward next level
- **Level Titles**: Assigns titles based on level milestones (e.g., "Beginner", "Eager Learner", "German Master")
- **XP History**: Maintains a log of the last 50 XP gains with timestamps and reasons

#### Files
- `src/lib/level-system.ts` - Core level system logic
- `src/components/level-display.tsx` - UI components for level display

#### XP Rewards

| Action | XP Reward |
|--------|-----------|
| Complete Scene | 10 XP |
| Complete Exercise (Correct) | 15 XP |
| Complete Exercise (Wrong) | 5 XP |
| Complete Chapter | 50 XP |
| Complete Episode | 100 XP |
| Review Flashcard (Correct) | 5 XP |
| Review Flashcard (Wrong) | 2 XP |
| Add Word to Flashcards | 3 XP |
| Daily Streak | 20 XP |
| Complete Daily Quest | 30 XP |
| Grammar Lesson Complete | 25 XP |
| Perfect Chapter (All Exercises Correct) | 75 XP |

#### Level Titles

| Level Range | Title |
|-------------|-------|
| 1-4 | Beginner |
| 5-9 | Eager Learner |
| 10-14 | Dedicated Student |
| 15-19 | Intermediate Speaker |
| 20-29 | Advanced Student |
| 30-39 | Fluent Learner |
| 40-49 | Expert Speaker |
| 50+ | German Master |

### 2. Daily Quest System

#### Core Components
- **Quest Generation**: Randomly selects 3 quests each day from a pool of quest templates
- **Quest Reset**: Automatically resets at midnight local time
- **Progress Tracking**: Tracks quest progress and completion status
- **Quest Types**: Supports 6 different quest types

#### Files
- `src/lib/daily-quests.ts` - Core daily quest logic
- `src/components/daily-quests.tsx` - UI components for quest display

#### Quest Types

| Quest Type | Title | Description | XP Reward |
|------------|-------|-------------|-----------|
| `complete_chapters` | Chapter Explorer | Complete 1 chapter | 30 XP |
| `review_flashcards` | Flashcard Master | Review 10 flashcards | 25 XP |
| `complete_exercises` | Exercise Champion | Complete 5 exercises | 20 XP |
| `study_minutes` | Dedicated Student | Study for 15 minutes | 35 XP |
| `add_words` | Vocabulary Collector | Add 5 words to flashcards | 15 XP |
| `perfect_exercises` | Perfect Practice | Get 3 exercises perfect | 40 XP |

### 3. UI Components

#### Level Display
- **Compact Mode**: Shows level badge, progress bar, and XP in a condensed format
- **Full Mode**: Displays level, title, detailed progress, and total XP
- Located in: `src/components/level-display.tsx`

#### Daily Quests Panel
- **Compact Mode**: Shows quest count and progress bars
- **Full Mode**: Displays all quest details with progress tracking
- Located in: `src/components/daily-quests.tsx`

#### Notifications
- **XP Notification**: Toast notification when XP is earned
- **Level Up Notification**: Full-screen modal when leveling up
- **Quest Completion Notification**: Toast notification when a quest is completed

#### Level & Quests Page
- Dedicated profile page showing:
  - Full level display
  - Daily quests panel
  - Recent XP activity log (last 20 activities)
  - Level milestones visualization
- Located in: `src/components/profile/level-quests-page.tsx`

### 4. Integration Points

#### Main App (`src/app/page.tsx`)
- Helper functions `awardXP()` and `updateQuestProgress()` centralize XP/quest logic
- Notifications displayed at app level using AnimatePresence
- Level and quest displays shown on home page (for logged-in users)

#### Story Reader (`src/components/story-reader.tsx`)
- Awards XP for each exercise completed (15 XP correct, 5 XP wrong)
- Updates `complete_exercises` quest progress
- Updates `perfect_exercises` quest when all exercises are correct

#### Flashcard System (`src/app/flashcards/page.tsx`)
- Awards XP for each flashcard graded (5 XP correct, 2 XP wrong)
- Updates `review_flashcards` quest progress

#### Chapter Completion
- Awards 50 XP when a chapter is completed
- Updates `complete_chapters` quest progress

### 5. Data Persistence

#### Local Storage Keys
- `minka-level-data` - Stores current level, XP, and progress
- `minka-xp-history` - Stores last 50 XP gains
- `minka-daily-quests` - Stores daily quest data and last reset time

#### Future: Firebase Integration
The system is designed to be easily integrated with Firebase Firestore for cloud persistence. Key considerations:
- Level data can be stored in user document
- XP history can be a subcollection
- Daily quests can be stored with last reset timestamp

## Usage Examples

### Awarding XP
```typescript
import { LevelSystem, XP_REWARDS } from '@/lib/level-system';

// Award XP and check for level up
const result = LevelSystem.addXP(XP_REWARDS.COMPLETE_CHAPTER, 'Chapter completed!');
if (result.leveledUp) {
  console.log(`Leveled up to ${result.newLevel}!`);
}
```

### Updating Quest Progress
```typescript
import { DailyQuestSystem } from '@/lib/daily-quests';

// Update quest progress
const result = DailyQuestSystem.updateQuest('complete_chapters', 1);
if (result.questCompleted && result.quest) {
  console.log(`Quest completed: ${result.quest.title}`);
  // Award quest XP
  LevelSystem.addXP(result.quest.xpReward, `Quest: ${result.quest.title}`);
}
```

### Displaying Level Info
```typescript
import { LevelDisplay } from '@/components/level-display';

// Compact mode (for header/home page)
<LevelDisplay compact />

// Full mode (for dedicated page)
<LevelDisplay showTitle />
```

### Displaying Daily Quests
```typescript
import { DailyQuests } from '@/components/daily-quests';

// Compact mode
<DailyQuests compact />

// Full mode
<DailyQuests />
```

## Future Enhancements

### Possible Additions
1. **Weekly Challenges**: Longer-term challenges with bigger rewards
2. **Streaks**: Track consecutive days of activity
3. **Leaderboards**: Compare progress with other learners
4. **Custom Avatars**: Unlock avatar items at certain levels
5. **Level-Based Content Unlocking**: Unlock advanced content at higher levels
6. **Quest Chains**: Multi-step quests that unlock sequentially
7. **Bonus XP Events**: Double XP weekends or specific activity boosts
8. **Achievement Integration**: Tie achievements to XP rewards

### Performance Considerations
- XP history is limited to 50 items to prevent localStorage bloat
- Quest data resets daily to keep data fresh
- Consider implementing data cleanup for old quest data

### Analytics Opportunities
- Track most completed quest types
- Monitor average XP per session
- Identify level progression rates
- Analyze quest completion patterns

## Testing Checklist

- [x] XP awarded for completing chapters
- [x] XP awarded for completing exercises
- [x] XP awarded for reviewing flashcards
- [x] Daily quests update correctly
- [x] Quest completion triggers XP reward
- [x] Level up notification displays
- [x] XP notification displays
- [x] Quest completion notification displays
- [x] Daily quests reset at midnight
- [x] Level display shows correct information
- [x] Quest display shows correct progress
- [x] Level & Quests page accessible from user menu
- [ ] Data persists to Firebase (future)
- [ ] Multi-device sync (future)

## Architecture Decisions

### Why Local Storage First?
- **Simplicity**: Easy to implement and test
- **Performance**: Instant reads/writes
- **Offline Support**: Works without internet connection
- **Migration Path**: Easy to migrate to Firestore later

### Why Separate Systems?
- **Modularity**: Level and quest systems can evolve independently
- **Testability**: Easier to unit test separate systems
- **Reusability**: Systems can be used in different contexts

### Why Client-Side Processing?
- **Real-Time Feedback**: Immediate XP/quest updates
- **Reduced Latency**: No server round-trip for updates
- **Scalability**: Reduces server load

## Conclusion

The Level & Daily Quest System adds meaningful gamification to Minka, encouraging users to engage consistently with the app while providing clear feedback on their learning progress. The system is designed to be extensible, performant, and user-friendly, with a clear path toward cloud persistence in the future.

