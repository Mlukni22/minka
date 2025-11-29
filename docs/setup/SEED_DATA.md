# 🌱 Seed Data Guide

This guide explains how to populate your Firestore database with sample stories for testing.

## Prerequisites

1. Firebase is set up (see `FIREBASE_SETUP.md`)
2. `.env.local` has Firebase configuration
3. Firestore database is created and accessible

## Option 1: Using the Seed Script (Recommended)

### Install dependencies

```bash
npm install dotenv tsx --save-dev
```

### Run the seed script

```bash
npx tsx scripts/seed-data.ts
```

### What it creates

The script will create:
- **4 stories** with different levels (A1, A2)
- **Story sections** for each story
- **Story words** (vocabulary) linked to each section

### Stories included

1. **Der erste Schultag** (A1) - 3 sections
2. **Die verlorene Nachricht** (A2) - 2 sections  
3. **Minka in Berlin** (A1) - 2 sections
4. **Ein geheimnisvoller Brief** (A2) - 1 section

## Option 2: Manual Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Firestore Database**
4. Manually create documents using the structure in `scripts/seed-data.ts`

## Verify Data

After seeding, verify in Firebase Console:

1. **`stories` collection**: Should have 4 documents
2. **`stories/{id}/sections` subcollection**: Each story should have sections
3. **`story_words` collection**: Should have vocabulary words linked to sections

## Using the Stories

Once seeded:
1. Go to `/stories` - you should see all 4 stories
2. Click on a story - it will open the reader
3. Words are automatically added to flashcards when you read sections

## Troubleshooting

### Script fails to run
- Check `.env.local` has all Firebase variables
- Verify Firestore is enabled in Firebase Console
- Check Firestore security rules allow writes

### No stories appear
- Check browser console for errors
- Verify data in Firebase Console
- Clear browser cache and reload

### Words not adding to flashcards
- Check browser console for errors
- Verify user is authenticated
- Check Firestore security rules

---

**Need more stories?** Edit `scripts/seed-data.ts` and add more entries to the `stories` array!

