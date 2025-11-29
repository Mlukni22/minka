# 🌱 Seed Story via API Route (Recommended)

This is the **recommended way** to add the "Minka ist neu" story to your Firestore database. It uses a Next.js API route which runs server-side and is more reliable.

## Step 1: Start Your Dev Server

Make sure your Next.js dev server is running:

```bash
npm run dev
```

The server should be running at `http://localhost:3000`

## Step 2: Seed the Story

In a **new terminal window** (keep the dev server running), run:

```bash
npx tsx scripts/seed-via-api.ts
```

Or if you prefer to use curl or a browser:

```bash
curl -X POST http://localhost:3000/api/seed-story
```

Or simply visit in your browser:
```
http://localhost:3000/api/seed-story
```
(Note: Browser will make a GET request, so use curl or the script for POST)

## What It Does

The API route (`/api/seed-story`) will:
1. ✅ Create the story document
2. ✅ Create Chapter 1
3. ✅ Create 5 text blocks
4. ✅ Create 13 vocabulary words
5. ✅ Create 5 exercises with options

## Verify It Worked

After seeding, check your stories:

```bash
npm run check:stories
```

Or visit: `http://localhost:3000/stories`

You should see "Minka ist neu" in the stories list!

## Troubleshooting

### "Failed to seed story" error

1. **Make sure dev server is running**:
   ```bash
   npm run dev
   ```

2. **Check the server logs** for detailed error messages

3. **Check Firebase Console**:
   - Go to Firestore Database
   - Verify the `stories` collection exists
   - Check if `minka-ist-neu` document was created

### API route returns 500 error

1. Check your `.env.local` has all Firebase config variables
2. Verify Firestore is enabled in Firebase Console
3. Check Firestore security rules allow writes

### Story appears but chapter doesn't load

1. Check Firebase Console → `stories/minka-ist-neu/chapters`
2. Verify chapter document exists
3. Check `chapterNumber` field is `1`

---

**Alternative**: If the API route method doesn't work, you can also manually add the story through Firebase Console, or use the direct script method (though it may have issues with Timestamp handling).

