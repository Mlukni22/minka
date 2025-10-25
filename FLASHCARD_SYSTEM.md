# 🃏 Minka Flashcard System - Complete Guide

## ✅ What Was Built

A **professional spaced repetition flashcard system** with:

### Core Features
- ✅ **Bidirectional cards** - Every word has 2 cards (DE→EN and EN→DE)
- ✅ **Cloze format** - Fill-in-the-blank with example sentences
- ✅ **SM-2 Algorithm** - Industry-standard spaced repetition (used by Anki)
- ✅ **Auto-scheduling** - Cards appear exactly when you need to review them
- ✅ **Progress tracking** - Due, New, Learned, Total stats
- ✅ **4 difficulty levels** - Again, Hard, Good, Easy
- ✅ **Beautiful UI** - Modern, animated, responsive design

---

## 🎯 How It Works

### Bidirectional Learning
Every word creates **2 flashcards**:

1. **German → English**
   - Shows: "Hallo"
   - Cloze: "___, Lisa! Ich bin Minka."
   - Answer: "Hello"

2. **English → German**
   - Shows: "Hello"
   - Cloze: "___, Lisa! I am Minka."
   - Answer: "Hallo"

This ensures you can both **recognize** and **produce** German words!

---

## 🧠 Spaced Repetition (SM-2 Algorithm)

### How Cards Are Scheduled

**New Card (First Time):**
- Click "Good" → Review in 1 day
- Click "Easy" → Review in 3 days

**Reviewing (Subsequent Times):**
- Click "Again" → Review in 1 hour (resets progress)
- Click "Hard" → Review in ~1 day (decreases ease)
- Click "Good" → Review in 2-4 days (maintains ease)
- Click "Easy" → Review in ~1 week (increases ease)

**The Algorithm Adapts:**
- Cards you find easy → Appear less often
- Cards you struggle with → Appear more often
- Optimal timing → Review just before you forget

---

## 📊 Statistics Explained

### Due Cards 📅
- Cards scheduled for review **today**
- These are cards you've seen before
- Should be reviewed to maintain memory

### New Cards ✨
- Cards you've **never seen** before
- Limited to 8 new cards per session (configurable)
- Mixed with due cards for balanced learning

### Learned Cards 🧠
- Cards you've successfully reviewed **3+ times**
- These words are in your long-term memory
- Still need occasional review

### Total Cards 📚
- All cards in your deck (due + new + learned)
- Each word = 2 cards (DE→EN + EN→DE)

---

## 🎮 How to Use

### Starting a Session
1. Click **"Forest"** card on homepage
2. See your stats (due, new, learned, total)
3. Click **"Study new cards"** if no cards due
4. Session begins!

### Reviewing a Card
1. **Read the prompt** (the word to translate)
2. **See the cloze** (example sentence with blank)
3. **Type your answer** in the input field
4. Press **Enter** or click **"Check"**
5. See if you were correct
6. **Grade yourself** honestly:
   - **Again** - Got it wrong, review soon
   - **Hard** - Got it right but struggled
   - **Good** - Got it right comfortably
   - **Easy** - Got it right instantly

### Tips for Best Results
- ✅ **Be honest** with your grading
- ✅ **Review daily** (builds habit)
- ✅ **Don't overdo it** (8-20 cards per day is ideal)
- ✅ **Focus on understanding**, not just memorization
- ✅ **Use the cloze** to understand context

---

## 🔧 Technical Details

### File Location
```
src/app/flashcards/page.tsx
```

### Data Storage
- **LocalStorage** - Cards saved in browser
- **Key**: `minka_flashcards_v1`
- **Persists** across sessions
- **Future**: Will sync to Firestore when logged in

### Configurable Parameters

In the code, you can adjust:

```typescript
// Daily new card limit (default: 8)
const dailyNew = 8;

// Maximum due cards per session (default: 40)
const dueLimit = 40;
```

### Card Data Structure
```typescript
{
  id: "w-hallo:de-en",           // Unique ID
  wordId: "w-hallo",             // Original word ID
  dir: "de-en",                  // Direction
  prompt: "Hallo",               // Question
  answer: "Hello",               // Correct answer
  cloze: "___, Lisa! Ich bin Minka.", // Example
  next: 1704067200000,           // Next review time (ms)
  interval: 1,                   // Days until next review
  ease: 2.5,                     // Ease factor
  reps: 0,                       // Successful reviews
  lapses: 0,                     // Times failed
  new: true                      // Never reviewed
}
```

---

## 📝 Adding More Vocabulary

### Current Words (40 words = 80 cards)
- Episode 0: Greetings (12 words)
- Episode 1: Village (6 words)
- Episode 2: Lost Key (5 words)
- Episode 3: Letter (4 words)
- Episode 4: Tracks (4 words)
- Episode 5: Secret (4 words)

### To Add More Words

Edit `SEED_WORDS` in `src/app/flashcards/page.tsx`:

```typescript
const SEED_WORDS: Word[] = [
  {
    id: "w-unique-id",           // Unique identifier
    de: "Katze",                 // German word
    en: "cat",                   // English translation
    exDe: "Die ___ ist süß.",    // German example with ___
    exEn: "The ___ is cute."     // English example with ___
  },
  // Add more...
];
```

**Tips for Examples:**
- Use `___` where the word should be blanked
- If no `___`, the system auto-blanks the word
- Keep sentences simple and contextual
- Use real sentences from your episodes

---

## 🎨 UI Components

### Card Display
- **Prompt** - Large, bold word to translate
- **Cloze** - Example sentence in rounded box
- **Input** - Type answer with Enter key support
- **Feedback** - Green (correct) or orange (incorrect)

### Grade Buttons
- **Again** (Red) - 1 hour later
- **Hard** (Orange) - ~1 day
- **Good** (Green) - 2-4 days
- **Easy** (Purple) - ~1 week

### Stats Cards
- Animated gradient backgrounds
- Icons for each stat type
- Hover effects

---

## 🚀 Future Enhancements

### Short-term
- [ ] Sync with Firestore (cloud save)
- [ ] Import words from completed episodes automatically
- [ ] Audio pronunciation on cards
- [ ] Keyboard shortcuts (1-4 for grading)

### Medium-term
- [ ] Card editor (add/edit/delete cards)
- [ ] Deck management (organize by episode/topic)
- [ ] Custom cloze creation
- [ ] Study mode options (recognition only, production only)

### Long-term
- [ ] Shared decks (community vocabulary)
- [ ] Advanced statistics (retention rates, learning curves)
- [ ] Mobile app with offline sync
- [ ] Image-based cards

---

## 🧪 Testing the Flashcard System

### Test Checklist
1. **Access**
   - [ ] Click "Forest" card on homepage
   - [ ] Flashcard page loads

2. **New Cards**
   - [ ] See stats (Due: 0, New: 80, Learned: 0, Total: 80)
   - [ ] Click "Study new cards"
   - [ ] First card appears

3. **Review Flow**
   - [ ] Type answer and press Enter
   - [ ] See if answer is correct
   - [ ] Grade buttons appear
   - [ ] Click a grade button
   - [ ] Next card appears

4. **Grading**
   - [ ] Try "Again" - card reappears soon
   - [ ] Try "Good" - card scheduled for later
   - [ ] Try "Easy" - card scheduled far away

5. **Stats Update**
   - [ ] After reviewing, stats change
   - [ ] New cards decrease
   - [ ] Learned cards increase (after 3+ reviews)

6. **Persistence**
   - [ ] Close browser
   - [ ] Reopen flashcard page
   - [ ] Progress is saved

7. **Empty State**
   - [ ] Complete all cards in queue
   - [ ] See "All caught up!" message
   - [ ] Can start new session

---

## 📈 Learning Science Behind SRS

### Why Spaced Repetition Works

**Traditional Method:**
- Cram everything at once
- Forget 80% within days
- Need to re-learn constantly

**Spaced Repetition:**
- Review at increasing intervals
- Strengthen memory each time
- Retain 90%+ long-term

### The Forgetting Curve
```
Memory
  100% ┤●
       │ ╲
       │  ╲      ← Review here!
   50% │   ●●●●●●●╲
       │           ╲
     0%└─────────────●
       Time
```

By reviewing just before you forget, you:
- Maximize retention
- Minimize study time
- Build long-term memory

---

## 💡 Best Practices

### For Learners
1. **Review daily** (even just 5-10 minutes)
2. **Be consistent** (builds habit)
3. **Don't skip** (breaks the rhythm)
4. **Be honest** with grading (helps algorithm)
5. **Use the cloze** (context is key)
6. **Say it out loud** (engages more senses)

### For Developers
1. **Don't modify card IDs** (breaks scheduling)
2. **Keep examples simple** (aids comprehension)
3. **Use real sentences** (from episodes)
4. **Test new words** before adding
5. **Balance difficulty** (mix easy and hard)

---

## 🎉 Summary

You now have a **professional flashcard system** that:

✅ Creates **2 cards per word** (bidirectional)  
✅ Uses **cloze deletion** (context-based)  
✅ Implements **SM-2 algorithm** (optimal timing)  
✅ Tracks **progress** (stats & scheduling)  
✅ Provides **beautiful UI** (modern & animated)  
✅ Saves **automatically** (localStorage)  

**Access it:** Click "Forest" on homepage → Start studying! 🌲

---

## 📚 Resources

- **SM-2 Algorithm**: [SuperMemo Wiki](https://www.supermemo.com/en/archives1990-2015/english/ol/sm2)
- **Anki Manual**: [Anki Docs](https://docs.ankiweb.net/)
- **Spaced Repetition**: [Wikipedia](https://en.wikipedia.org/wiki/Spaced_repetition)

---

**Built with ❤️ for effective German learning!**

