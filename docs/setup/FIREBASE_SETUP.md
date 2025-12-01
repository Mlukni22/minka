# 🔥 Firebase Authentication Setup Guide

This guide will walk you through setting up Firebase authentication for your Minka app.

---

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or select an existing project
3. Enter project name (e.g., "minka-language-app")
4. (Optional) Enable Google Analytics
5. Click **"Create project"**

---

## Step 2: Register Your Web App

1. In your Firebase project dashboard, click the **Web icon** (`</>`) to add a web app
2. Enter an app nickname (e.g., "Minka Web App")
3. (Optional) Check "Also set up Firebase Hosting" if you want to host on Firebase
4. Click **"Register app"**
5. **Copy the configuration object** - you'll need these values in the next step

The config will look like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

---

## Step 3: Configure Environment Variables

1. In your project root (`C:\Users\Lenovo 6\minka`), create a file named **`.env.local`**
2. Add your Firebase configuration values:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

3. **Save the file**

> ⚠️ **Important:** Never commit `.env.local` to Git. It's already in `.gitignore`.

---

## Step 4: Enable Authentication Methods

### Email/Password Authentication

1. In Firebase Console, go to **"Authentication"** in the left sidebar
2. Click **"Get started"** if this is your first time
3. Go to the **"Sign-in method"** tab
4. Click on **"Email/Password"**
5. **Enable** the toggle for Email/Password
6. Click **"Save"**

### Google Sign-In (Optional but Recommended)

1. Still in the **"Sign-in method"** tab
2. Click on **"Google"**
3. **Enable** the toggle
4. Enter your project support email
5. Click **"Save"**

---

## Step 5: Set Up Firestore Database

1. In Firebase Console, go to **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
   - You can set up security rules later for production
4. Select a Cloud Firestore location (choose closest to your users)
5. Click **"Enable"**

### Set Up Firestore Security Rules (Important for Production!)

For development, you can use test mode rules. For production, replace with these rules:

1. Go to **"Firestore Database"** > **"Rules"** tab
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Users can read/write their own flashcards
      match /flashcards/{flashcardId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Users can only read/write their own progression
    match /progressions/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click **"Publish"**

---

## Step 6: Test the Setup

1. **Restart your development server** (important for env variables to load):
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

3. Click **"Sign In"** in the top right corner

4. Try creating a new account:
   - Click "Sign up"
   - Enter your name, email, and password
   - Click "Create Account"

5. You should be signed in! Your user info will appear in the top right.

6. Check Firebase Console > Authentication > Users to see your new user!

---

## Step 7: Verify Firestore Data

1. Sign in to your app
2. Complete some lessons/chapters
3. Go to Firebase Console > Firestore Database
4. You should see collections:
   - `users` - User profiles and progress
   - `progressions` - Episode progression data
   - `users/{userId}/flashcards` - User's flashcards

---

## Troubleshooting

### "Firebase not defined" or "app not initialized" errors

**Solution:** Make sure you've created `.env.local` with your Firebase config and **restarted the dev server**.

### "Firebase: Error (auth/unauthorized-domain)"

**Solution:** 
1. Go to Firebase Console > Authentication > Settings > Authorized domains
2. Add `localhost` and your production domain

### "Missing or insufficient permissions" in Firestore

**Solution:** 
1. Check that you're signed in
2. Verify Firestore security rules allow access
3. For development, you can temporarily use test mode rules

### Sign-in page doesn't open

**Solution:** 
1. Check browser console for errors
2. Verify all Firebase config values are correct
3. Make sure you've enabled Email/Password authentication in Firebase Console

---

## Features Now Available ✨

With Firebase authentication set up, your users can now:

- ✅ **Sign up** with email/password or Google
- ✅ **Sign in** and sign out
- ✅ **Sync progress** across devices
- ✅ **Save flashcards** to their personal account
- ✅ **Track learning** with cloud-saved data
- ✅ **Reset password** via email

---

## Next Steps

### For Production Deployment

1. **Update Firestore Rules** to production-ready rules (see Step 5)
2. **Add authorized domains** in Firebase Console (your deployment URL)
3. **Set up Firebase Hosting** or deploy to Vercel
4. **Configure environment variables** on your hosting platform
5. **Enable email verification** (optional):
   ```typescript
   import { sendEmailVerification } from 'firebase/auth';
   await sendEmailVerification(user);
   ```

### Additional Features to Implement

- [ ] Email verification requirement
- [ ] Password strength indicator
- [ ] Remember me / persistent sessions
- [ ] Account deletion
- [ ] Profile picture upload (using Firebase Storage)
- [ ] Social auth (Facebook, Apple, etc.)

---

## Security Best Practices

1. **Never commit** `.env.local` to Git
2. **Use strong Firestore rules** in production
3. **Enable email verification** for new accounts
4. **Set up password reset** flow (already implemented!)
5. **Monitor Authentication logs** in Firebase Console
6. **Set up App Check** to prevent abuse (advanced)

---

## Support

If you encounter any issues:

1. Check the [Firebase Documentation](https://firebase.google.com/docs)
2. Review the Firebase Console error logs
3. Check browser console for detailed error messages
4. Verify all environment variables are set correctly

---

**🎉 Congratulations!** Your Minka app now has full authentication with cloud sync!

Users can learn German on any device, and their progress will be automatically saved and synced across all their devices.

