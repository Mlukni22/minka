# Streak Widget Feature

## Overview

The Streak Widget is a highly visible, interactive component that displays the user's learning streak with a fire emoji (🔥) and provides detailed progress information on hover. It's designed to motivate consistent daily engagement with the app.

## Visual Design

### Main Display
- **Location**: Header navigation bar (right side, between nav links and user menu)
- **Icon**: Animated fire emoji (🔥) with subtle rotation
- **Badge**: Rounded container with gradient background (orange to red)
- **Streak Number**: Large, bold display of current streak days
- **Glow Effect**: Animated pulsing glow effect behind the icon
- **Completion Indicator**: Green checkmark appears when all daily quests are completed

### Animations
1. **Fire Emoji**: Gentle rotation animation (-5° to 5°)
2. **Background Glow**: Pulsing scale and opacity animation
3. **Hover Scale**: Grows slightly (1.1x) on hover
4. **Tap Scale**: Shrinks slightly (0.95x) on click

## Hover Tooltip

When users hover over the streak widget, a detailed card appears showing:

### Header Section
- Fire icon + "X-Day Streak!" title
- "Keep learning every day" subtitle
- Gradient background (orange to red)

### Today's Goals Section
- **Daily Quests Progress**
  - Shows completed quests vs. total (e.g., "2 / 3")
  - Animated progress bar (blue to purple gradient)
  - Updates in real-time as quests are completed

### Streak Stats Section
Two stat boxes displayed side-by-side:

1. **Current Streak** 🔥
   - Shows current consecutive days
   - Updates daily when user completes activities

2. **Best Streak** ⭐
   - Shows the highest streak ever achieved
   - Persists across sessions
   - Cannot decrease (only increases when current surpasses it)

### Motivation Message
Dynamic messages based on streak progress:

| Condition | Message |
|-----------|---------|
| All quests completed | "🎉 All goals completed! Amazing work today!" |
| Streak = 0 | "Start your streak today! Complete a quest to begin." |
| Streak < 7 | "Great start! Keep it up! X more days to reach 1 week." |
| Streak < 30 | "You're on fire! 🔥 X days to reach 1 month." |
| Streak >= 30 | "Incredible dedication! 🏆 You're a learning champion!" |

### Footer
- Shows time until daily reset (e.g., "Resets in 5h 23m")
- Countdown updates every minute

## Streak Logic

### Streak Calculation

**Increment Conditions**:
- User completes any activity (chapter, exercise, flashcard session)
- Activity is completed on a consecutive day
- Only increments once per day (subsequent activities on same day don't increase streak)

**Streak Broken**:
- More than 1 day passes without activity
- Streak resets to 0 (not to 1)
- Best streak is preserved

**Streak Reset**:
- Happens at midnight local time
- Daily quests also reset at the same time

### State Management

#### UserProgressionState Fields
```typescript
{
  streak: number;              // Current consecutive days
  lastActivityDate?: string;   // ISO date of last activity (YYYY-MM-DD)
  bestStreak?: number;         // Highest streak achieved
}
```

### Core Functions

#### 1. Update Streak
```typescript
ProgressionSystem.updateStreak(
  progressionState: UserProgressionState
): UserProgressionState
```

**Logic**:
1. Gets today's date (ISO format: YYYY-MM-DD)
2. Compares with `lastActivityDate`
3. If same day → no change
4. If consecutive day (diff = 1) → increment streak
5. If gap > 1 day → reset to 1
6. Updates `bestStreak` if current exceeds it

#### 2. Check Streak Status
```typescript
ProgressionSystem.checkStreakStatus(
  progressionState: UserProgressionState
): { isBroken: boolean; daysInactive: number }
```

**Returns**:
- `isBroken`: true if more than 1 day has passed
- `daysInactive`: number of days since last activity

Used on app load to reset broken streaks.

### Integration Points

#### On Chapter Completion
```typescript
const handleChapterComplete = async () => {
  // ... existing logic
  
  // Update streak
  if (progressionState) {
    const updatedState = ProgressionSystem.updateStreak(progressionState);
    setProgressionState(updatedState);
  }
};
```

#### On App Load
```typescript
const loadLocalData = () => {
  const savedProgression = ProgressionSystem.loadFromLocalStorage();
  if (savedProgression) {
    const streakStatus = ProgressionSystem.checkStreakStatus(savedProgression);
    if (streakStatus.isBroken && savedProgression.streak > 0) {
      // Reset broken streak
      const updatedState = { ...savedProgression, streak: 0 };
      setProgressionState(updatedState);
    }
  }
};
```

## User Experience

### First-Time Users
- Streak starts at 0
- Widget still displays with encouraging message
- First activity sets streak to 1

### Returning Users (Same Day)
- Streak number remains unchanged
- Can still see progress and daily goals
- Hover tooltip shows quest completion status

### Returning Users (Next Day)
- Streak increments to next number
- Confetti or celebration animation could be added (future enhancement)
- Best streak updates if new record achieved

### Users with Broken Streak
- Streak resets to 0 on app load
- Best streak preserved for reference
- Encouraging message to restart

## Data Persistence

### Local Storage
All streak data stored in `minka-progression` localStorage key:

```json
{
  "streak": 5,
  "lastActivityDate": "2025-10-25",
  "bestStreak": 12,
  // ... other progression fields
}
```

### Firebase Integration (Future)
Streak data will sync to Firestore in user's progression document:

```typescript
{
  userId: "user123",
  progression: {
    streak: 5,
    lastActivityDate: "2025-10-25",
    bestStreak: 12
  }
}
```

**Important**: Server timestamp should be used to prevent timezone manipulation.

## Gamification Integration

### XP Rewards
- Could award bonus XP for streak milestones (future)
- Example: +50 XP for 7-day streak, +100 XP for 30-day streak

### Daily Quest Integration
- Widget shows daily quest completion status
- Green checkmark appears when all quests done
- Completing quests contributes to maintaining streak

### Achievements (Future)
Potential streak-based achievements:
- 🔥 "Hot Streak" - 7-day streak
- 🚀 "Unstoppable" - 30-day streak
- 💎 "Diamond Learner" - 100-day streak
- 👑 "Legend" - 365-day streak

## Accessibility

### Visual
- High contrast colors (orange/red on white)
- Clear, large text for streak number
- Icon + text combination (not icon-only)

### Hover Behavior
- Tooltip appears on hover with 200ms delay
- Smooth animation for tooltip appearance
- Click also toggles tooltip (mobile-friendly)

### Screen Readers
- Semantic HTML structure
- ARIA labels for interactive elements
- Descriptive text for streak status

## Technical Implementation

### Files Created
- `src/components/streak-widget.tsx` - Main widget component

### Files Modified
- `src/app/page.tsx` - Integration into header, streak update logic
- `src/lib/progression.ts` - Streak management functions

### Component Structure
```
StreakWidget
├── Main Icon Container
│   ├── Animated Glow Effect
│   ├── Badge Container
│   │   ├── Fire Emoji (animated)
│   │   ├── Streak Number
│   │   └── Completion Indicator
├── Hover Tooltip (AnimatePresence)
    ├── Header Section
    ├── Today's Goals
    │   └── Quest Progress
    ├── Streak Stats
    │   ├── Current Streak
    │   └── Best Streak
    ├── Motivation Message
    └── Reset Timer
```

### Performance Considerations
- Tooltip only renders when hovered (AnimatePresence)
- Animations use CSS transforms (GPU-accelerated)
- Date calculations cached (not recalculated on every render)
- Quest stats fetched once on mount, then updated via props

## Mobile Responsiveness

### Adjustments for Small Screens
- Streak widget remains visible on mobile
- Slightly smaller badge on mobile (<768px)
- Tooltip adjusts position to stay on screen
- Touch-friendly hit areas (minimum 44px)

### Tablet View
- Full-size widget display
- Tooltip appears below widget
- All features fully functional

## Future Enhancements

### Potential Features
1. **Streak Freeze**: Allow users to "freeze" streak for 1 day (premium feature)
2. **Streak Recovery**: Grace period of a few hours after midnight
3. **Social Sharing**: Share streak milestones on social media
4. **Streak Leaderboard**: Compare with friends or global users
5. **Custom Streak Goals**: Set personal streak targets
6. **Streak Reminders**: Notifications before streak expires
7. **Streak Rewards**: Unlock special content at milestones
8. **Streak History Graph**: Visualize streak progression over time

### Analytics Opportunities
- Track average streak length per user cohort
- Identify optimal notification timing for retention
- Measure correlation between streaks and completion rates
- A/B test different motivation messages

## Testing Checklist

- [x] Streak increments when activity completed on consecutive day
- [x] Streak stays same when multiple activities completed same day
- [x] Streak resets when gap > 1 day
- [x] Best streak updates when current exceeds it
- [x] Best streak never decreases
- [x] Widget displays correctly in header
- [x] Hover tooltip appears with smooth animation
- [x] Daily quest progress updates in real-time
- [x] Motivation messages display correctly for each condition
- [x] Reset timer shows correct time until midnight
- [x] Green checkmark appears when all quests completed
- [x] No linter errors
- [ ] Works across midnight boundary (time-based test)
- [ ] Timezone handling (if using server time)
- [ ] Firebase sync (future)

## Known Limitations

1. **Timezone Issues**: Currently uses local device time
   - Could be manipulated by changing device timezone
   - Server-side validation recommended for production

2. **Midnight Edge Case**: If user is active across midnight boundary, streak logic may need special handling

3. **Offline Support**: Streak updates require online connection for Firebase sync (future)

## Conclusion

The Streak Widget is a powerful engagement tool that provides immediate visual feedback on user consistency. By combining clear visual design, real-time progress tracking, and motivational messaging, it encourages users to maintain daily learning habits. The hover tooltip provides deeper insights without cluttering the main interface, making it both functional and aesthetically pleasing.

