# Firestore Security Rules Setup Guide

## Problem
You're seeing the error: **"Missing or insufficient permissions"** when trying to access Firestore.

This happens because Firestore security rules need to be configured to allow your app to read/write data.

## Solution

### Option 1: Quick Fix (Development Only - NOT for Production!)

If you're in development and want to quickly test, you can temporarily use permissive rules:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database** → **Rules** tab
4. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

5. Click **Publish**

⚠️ **WARNING**: These rules allow anyone to read/write your entire database. Only use this for development!

---

### Option 2: Proper Security Rules (Recommended)

Use the rules file provided in `firestore.rules` which includes:

- ✅ Authenticated users can read/write their own user data
- ✅ Public read access to stories (content is public)
- ✅ Authenticated users can write to stories
- ✅ Authenticated users can read/write dictionary cache
- ✅ Users can only access their own flashcards and progress

#### To Deploy:

**Method 1: Using Firebase CLI**

1. Install Firebase CLI (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project (if not already done):
   ```bash
   firebase init firestore
   ```
   - Select your Firebase project
   - Use the existing `firestore.rules` file

4. Deploy the rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

**Method 2: Using Firebase Console (Manual)**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database** → **Rules** tab
4. Copy the contents of `firestore.rules` file
5. Paste into the rules editor
6. Click **Publish**

---

## Collections Used by Your App

Your app uses these Firestore collections:

### Public Collections (Readable by all)
- `stories/{storyId}` - Story content
- `stories/{storyId}/chapters/{chapterId}` - Chapter content
- `stories/{storyId}/chapters/{chapterId}/blocks` - Story blocks
- `stories/{storyId}/chapters/{chapterId}/words` - Vocabulary words
- `stories/{storyId}/chapters/{chapterId}/exercises` - Exercises
- `story_words` - Flat word collection

### Authenticated Collections (User-specific)
- `users/{userId}` - User profile
- `users/{userId}/flashcards` - User's flashcards
- `users/{userId}/storyProgress` - Story progress
- `users/{userId}/chapterProgress` - Chapter progress
- `users/{userId}/exerciseAttempts` - Exercise attempts
- `dictionaryCache/{word}` - Translation cache

---

## Testing the Rules

After deploying rules, test your app:

1. **If not authenticated**: You should be able to read stories but not write
2. **If authenticated**: You should be able to read/write your own user data
3. **Dictionary cache**: Should work for authenticated users

---

## Troubleshooting

### Still getting permission errors?

1. **Check authentication**: Make sure the user is signed in
   ```javascript
   import { getAuth } from 'firebase/auth';
   const auth = getAuth();
   console.log('User:', auth.currentUser);
   ```

2. **Check the exact error**: Look in browser console for the specific collection/document that's failing

3. **Verify rules deployed**: In Firebase Console → Firestore → Rules, check the "Last published" timestamp

4. **Test in Firebase Console**: Go to Firestore → Data, try to read/write manually

5. **Check user ID matches**: Make sure `request.auth.uid` matches the document's `userId` field

---

## Production Recommendations

For production, consider:

1. **Rate limiting**: Add rate limits to prevent abuse
2. **Field validation**: Validate data structure in rules
3. **Audit logging**: Log all writes for security
4. **IP restrictions**: Restrict access by IP if needed
5. **Time-based rules**: Add time-based access controls

Example production rule with validation:
```javascript
match /users/{userId} {
  allow read, write: if isOwner(userId) 
    && request.resource.data.keys().hasAll(['uid', 'email', 'createdAt']);
}
```

---

## Need Help?

If you're still having issues:
1. Check the browser console for the exact error message
2. Check Firebase Console → Firestore → Rules for syntax errors
3. Verify your Firebase project ID matches your `.env.local` file


