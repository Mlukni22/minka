# 🚀 Quick Test Guide

## Step 1: Start the Development Server

```bash
npm run dev
```

Wait for: `✓ Ready in X seconds` and `○ Local: http://localhost:3000`

## Step 2: Check Firebase Setup

Make sure you have `.env.local` with Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

**If you don't have Firebase set up yet:**
- See `FIREBASE_SETUP.md` or `QUICK_START_AUTH.md`
- Or skip Firebase for now and test the UI (auth won't work but you can see the pages)

## Step 3: Test the Flow

### Option A: Test Authentication Flow

1. **Sign Up**
   - Go to: `http://localhost:3000/auth/signup`
   - Fill in the form
   - Click "Sign Up"
   - **Expected**: Redirects to `/onboarding`

2. **Onboarding**
   - Select German level (e.g., "A1")
   - Select daily goal (e.g., "15 min")
   - Click through to finish
   - **Expected**: Redirects to `/dashboard`

3. **Dashboard**
   - Should see your name in greeting
   - Should see XP progress bar
   - Should see "Try for free" button

4. **Sign Out & Sign In**
   - Sign out (if there's a menu)
   - Go to: `http://localhost:3000/auth/login`
   - Sign in with same credentials
   - **Expected**: Goes to dashboard (skips onboarding if completed)

### Option B: Test Pages Without Auth (UI Only)

If Firebase isn't set up, you can still check the UI:

1. **Landing Page**: `http://localhost:3000/`
2. **Sign Up Page**: `http://localhost:3000/auth/signup`
3. **Login Page**: `http://localhost:3000/auth/login`
4. **Onboarding Page**: `http://localhost:3000/onboarding` (will redirect if not logged in)
5. **Dashboard**: `http://localhost:3000/dashboard` (will redirect if not logged in)

## Step 4: Check for Errors

Open browser DevTools (F12):

1. **Console Tab**
   - Should have no red errors
   - Warnings are usually OK

2. **Network Tab**
   - Check if Firebase requests are working
   - Look for failed requests (red)

## Step 5: Verify Data in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Firestore Database**
4. Check `users` collection:
   - Should see your user document
   - Should have: `email`, `displayName`, `germanLevel`, `onboardingCompleted: true`

## Common Issues

### ❌ "Firebase auth is not initialized"
**Fix**: Check `.env.local` has all Firebase variables, then restart server

### ❌ Redirects to login even after signing up
**Fix**: Check browser console for errors, verify Firebase config

### ❌ Onboarding doesn't save
**Fix**: Check Firestore security rules allow writes

### ❌ Page shows "Loading..." forever
**Fix**: Check browser console for errors, verify Firebase is initialized

## What Should Work Right Now

✅ Sign up page loads  
✅ Login page loads  
✅ Onboarding flow (UI)  
✅ Dashboard UI displays  
✅ Auth state management  
✅ User data saves to Firestore  
✅ Redirects work (login → onboarding → dashboard)

## What's Not Ready Yet

🚧 Stories library (`/stories`)  
🚧 Story reader (`/stories/[id]`)  
🚧 Flashcard review (`/review`)  
🚧 Real progress tracking  
🚧 Profile page  
🚧 Seed data

---

**Next Steps**: Once auth works, we'll add the stories module!

