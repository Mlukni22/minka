# 🧪 Testing Guide - Minka MVP

This guide will help you test the MVP features we've built.

## Prerequisites

1. **Firebase Setup** (if not already done)
   - See `FIREBASE_SETUP.md` or `QUICK_START_AUTH.md` for setup instructions
   - You need Firebase config in `.env.local`

2. **Development Server Running**
   ```bash
   npm run dev
   ```

## Step-by-Step Testing

### 1. Test Authentication Flow

#### Sign Up
1. Go to `http://localhost:3000/auth/signup`
2. Fill in:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "test123" (at least 6 characters)
   - Confirm Password: "test123"
3. Click "Sign Up"
4. **Expected**: Redirects to `/onboarding`

#### Onboarding
1. You should see the welcome screen
2. Click "Next"
3. Select a German level (e.g., "A1")
4. Click "Next"
5. Select daily goal (e.g., "15 min")
6. Click "Next"
7. Click "Go to Dashboard"
8. **Expected**: Redirects to `/dashboard` with onboarding completed

#### Sign In
1. Go to `http://localhost:3000/auth/login`
2. Enter your email and password
3. Click "Sign In"
4. **Expected**: Redirects to `/dashboard`

### 2. Test Dashboard

1. Go to `http://localhost:3000/dashboard`
2. **Expected**: You should see:
   - Header with logo and user info
   - Greeting: "Hallo, [Your Name] 👋"
   - XP progress bar
   - Arc navigation
   - Wavy path with nodes
   - "You have X words to review" section
   - Summary cards
   - "Try for free" button
   - Floating toolbar at bottom

### 3. Check Console for Errors

Open browser DevTools (F12) and check:
- **Console tab**: Should have no red errors
- **Network tab**: Check Firebase requests are working

### 4. Check Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Check **Firestore Database**:
   - Should see `users` collection with your user document
   - User document should have:
     - `email`
     - `displayName`
     - `germanLevel`
     - `dailyGoalMinutes`
     - `onboardingCompleted: true`
     - `totalXP: 0`
     - `wordsLearned: 0`
     - `storiesCompleted: 0`

## Common Issues & Solutions

### Issue: "Firebase auth is not initialized"
**Solution**: 
- Check `.env.local` has all Firebase config variables
- Restart dev server: `npm run dev`

### Issue: "Firestore not initialized"
**Solution**:
- Make sure Firestore is enabled in Firebase Console
- Check Firebase config in `.env.local`

### Issue: Redirects to login when already signed in
**Solution**:
- Check browser console for errors
- Verify Firebase config is correct
- Clear browser cache and try again

### Issue: Onboarding doesn't save
**Solution**:
- Check browser console for errors
- Verify Firestore security rules allow writes
- Check network tab for failed requests

## What's Working vs. What's Not Yet

### ✅ Working Now:
- Authentication (sign up, sign in, sign out)
- Onboarding flow (level selection, goal setting)
- Dashboard UI (visual layout)
- User data storage in Firestore
- Auth state management

### 🚧 Not Yet Implemented (Next Steps):
- Stories library page
- Story reader with inline translations
- Flashcard review session
- Progress tracking (XP, words learned)
- Profile page
- Seed data (sample stories)

## Quick Test Checklist

- [ ] Can sign up with email/password
- [ ] Can complete onboarding flow
- [ ] Dashboard loads after onboarding
- [ ] User data appears in Firebase Console
- [ ] Can sign out and sign back in
- [ ] Onboarding redirects if already completed
- [ ] No console errors

## Next: Adding Stories

Once authentication and onboarding work, we'll add:
1. Stories library (`/stories`)
2. Story reader (`/stories/[id]`)
3. Flashcard review (`/review`)
4. Seed data with sample stories

---

**Need Help?** Check the browser console for specific error messages and share them for debugging.

