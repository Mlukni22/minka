# 🚀 Quick Start: Add Your First Story

This guide will help you add the first story "Minka ist neu" to your Firestore database.

## Step 1: Install Dependencies (if needed)

```bash
npm install tsx --save-dev
```

## Step 2: Check Current Stories

First, check if any stories already exist:

```bash
npm run check:stories
```

Or:

```bash
npx tsx scripts/check-stories.ts
```

## Step 3: Add the First Story

Run the seed script to add "Minka ist neu":

```bash
npm run seed:story
```

Or:

```bash
npx tsx scripts/seed-minka-ist-neu.ts
```

You should see output like:

```
🌱 Starting to seed "Minka ist neu" story...

✅ Created story: Minka ist neu
  ✅ Created chapter: Kapitel 1 – Minka ist neu
    ✅ Created 5 blocks
    ✅ Created 13 words
    ✅ Created exercise: Was ist Minka?
      ✅ Created 3 options
    ✅ Created exercise: Wie heißt die Maus?
      ✅ Created 3 options
    ✅ Created exercise: Was trinkt Minka?
      ✅ Created 3 options
    ✅ Created exercise: Wo scheint die Sonne?
      ✅ Created 3 options
    ✅ Created exercise: Mag Minka das neue Haus?
      ✅ Created 3 options

✨ Seeding complete!
📚 Story available at: /stories/minka-ist-neu
📖 Chapter available at: /stories/minka-ist-neu/chapters/1
```

## Step 4: Verify Stories

Check that the story was added:

```bash
npm run check:stories
```

You should see:

```
✅ Found 1 story/stories:

   - Minka ist neu (A1) - ID: minka-ist-neu
```

## Step 5: View the Story

1. Go to your app: `http://localhost:3000/stories`
2. You should now see "Minka ist neu" story card
3. Click on it to see the chapter list
4. Click "Start Story" to read the chapter
5. After reading, click "Start Exercises" to do the exercises

## Troubleshooting

### "No stories found" still appears

1. **Check Firebase Console**:
   - Go to Firebase Console → Firestore Database
   - Look for `stories` collection
   - Verify the document `minka-ist-neu` exists

2. **Check Environment Variables**:
   - Make sure `.env.local` has all Firebase config:
     ```
     NEXT_PUBLIC_FIREBASE_API_KEY=...
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
     NEXT_PUBLIC_FIREBASE_APP_ID=...
     ```

3. **Check Browser Console**:
   - Open browser DevTools (F12)
   - Look for errors in Console tab
   - Common issues:
     - Firebase not initialized
     - Permission denied (check Firestore rules)
     - Network errors

4. **Check Firestore Security Rules**:
   - In Firebase Console → Firestore Database → Rules
   - For development, you can use:
     ```javascript
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /stories/{document=**} {
           allow read: if true;
           allow write: if false; // Only admin can write via scripts
         }
       }
     }
     ```

5. **Clear Browser Cache**:
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Or clear cache and reload

### Seed Script Fails

1. **Missing Environment Variables**:
   - Make sure `.env.local` exists and has Firebase config
   - Run `npm run check:stories` to verify connection

2. **Firestore Not Enabled**:
   - Go to Firebase Console → Firestore Database
   - Click "Create database" if not already created

3. **Permission Issues**:
   - Check Firestore security rules allow writes
   - For testing, temporarily allow writes in test mode

### Story Appears But Chapter Won't Load

1. **Check Chapter Data**:
   - Firebase Console → `stories/minka-ist-neu/chapters`
   - Verify chapter document exists
   - Check `chapterNumber` field is `1`

2. **Check Blocks**:
   - Firebase Console → `stories/minka-ist-neu/chapters/{chapterId}/blocks`
   - Verify 5 block documents exist

3. **Check Console Errors**:
   - Open browser DevTools
   - Check for specific error messages

## Next Steps

Once the story is added:

1. ✅ Story appears in `/stories`
2. ✅ Can read chapter at `/stories/minka-ist-neu/chapters/1`
3. ✅ Can do exercises at `/stories/minka-ist-neu/chapters/1/exercises`
4. ✅ Words can be added to flashcards
5. ✅ Progress is tracked

**Need more stories?** Create additional seed scripts following the same structure, or add chapters to existing stories!

