# 🌱 Seed "Minka ist neu" Story

This guide explains how to add the first story "Minka ist neu" to your Firestore database using the new chapter-based structure.

## Prerequisites

1. Firebase is set up (see `FIREBASE_SETUP.md`)
2. `.env.local` has Firebase configuration
3. Firestore database is created and accessible

## Install Dependencies

If you don't have `tsx` installed (for running TypeScript files directly):

```bash
npm install tsx --save-dev
```

## Run the Seed Script

```bash
npx tsx scripts/seed-minka-ist-neu.ts
```

## What It Creates

The script will create:

### Story Document
- **ID**: `minka-ist-neu`
- **Title**: Minka ist neu
- **Level**: A1
- **Description**: Minka is a little cat who arrives at a new house. She meets Emma the mouse and discovers her new home.
- **Estimated time**: 8 minutes

### Chapter 1
- **Title**: Kapitel 1 – Minka ist neu
- **Summary**: Minka arrives at her new house and meets Emma the mouse.
- **5 text blocks** with the story content
- **13 vocabulary words** from the glossary

### Vocabulary Words
1. die Katze – cat
2. das Haus – house
3. neu – new
4. ruhig – quiet
5. das Bett – bed
6. der Napf – bowl
7. die Maus – mouse
8. Hallo – hello
9. Milch – milk
10. trinken – to drink
11. Sonne – sun
12. Vögel – birds
13. mögen – to like

### Exercises
5 multiple choice exercises:
1. What is Minka? → eine Katze
2. What is the mouse's name? → Emma
3. What does Minka drink? → Milch
4. Where does the sun shine? → im Garten
5. Does Minka like the new house? → Ja

## Firestore Structure

```
stories/
  minka-ist-neu/
    chapters/
      {chapterId}/
        blocks/
          {blockId} (5 TEXT blocks)
        words/
          {wordId} (13 words)
        exercises/
          {exerciseId} (5 exercises)
            options/
              {optionId} (3 options each)
```

## Access the Story

After seeding:

1. **Story list**: `/stories` - You should see "Minka ist neu"
2. **Chapter list**: `/stories/minka-ist-neu` - Shows the single chapter
3. **Chapter reader**: `/stories/minka-ist-neu/chapters/1` - Read the chapter
4. **Exercises**: `/stories/minka-ist-neu/chapters/1/exercises` - Complete exercises

## Verify Data

After seeding, verify in Firebase Console:

1. **`stories` collection**: Should have document `minka-ist-neu`
2. **`stories/minka-ist-neu/chapters` subcollection**: Should have 1 chapter
3. **`stories/minka-ist-neu/chapters/{id}/blocks` subcollection**: Should have 5 blocks
4. **`stories/minka-ist-neu/chapters/{id}/words` subcollection**: Should have 13 words
5. **`stories/minka-ist-neu/chapters/{id}/exercises` subcollection**: Should have 5 exercises
6. **`stories/minka-ist-neu/chapters/{id}/exercises/{id}/options` subcollection**: Each exercise should have 3 options

## Troubleshooting

### Script fails to run
- Check `.env.local` has all Firebase variables
- Verify Firestore is enabled in Firebase Console
- Check Firestore security rules allow writes
- Make sure `tsx` is installed: `npm install tsx --save-dev`

### No story appears
- Check browser console for errors
- Verify data in Firebase Console
- Clear browser cache and reload
- Check story ID matches: `minka-ist-neu`

### Chapter not loading
- Verify chapter structure in Firebase Console
- Check chapter number is `1`
- Ensure blocks are ordered correctly (orderIndex: 0-4)

### Exercises not working
- Verify exercise structure in Firebase Console
- Check options are linked correctly
- Ensure `isCorrect` is set on one option per exercise

---

**Need more stories?** You can create additional seed scripts following the same structure, or add more chapters to this story!

