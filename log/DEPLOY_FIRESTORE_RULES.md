# How to Deploy Firestore Security Rules

## Method 1: Using Firebase Console (Easiest - No Installation Required)

### Step 1: Open Firebase Console
1. Go to https://console.firebase.google.com/
2. Select your project

### Step 2: Navigate to Firestore Rules
1. Click on **"Firestore Database"** in the left sidebar
2. Click on the **"Rules"** tab at the top

### Step 3: Copy and Paste Rules
1. Open the `firestore.rules` file in your project root
2. Copy **ALL** the contents
3. Paste into the rules editor in Firebase Console
4. Click **"Publish"** button

✅ **Done!** Your rules are now deployed.

---

## Method 2: Using Firebase CLI (Recommended for Development)

### Step 1: Install Firebase CLI

**Option A: Using npm (Recommended)**
```bash
npm install -g firebase-tools
```

**Option B: Using standalone installer**
- Download from: https://firebase.tools/bin/win/instant/latest
- Or use: `npm install -g firebase-tools`

### Step 2: Login to Firebase
```bash
firebase login
```
This will open a browser window for you to authenticate.

### Step 3: Initialize Firebase in Your Project

```bash
firebase init firestore
```

When prompted:
1. **Select your Firebase project** from the list
2. **Use existing rules file?** → Select `firestore.rules` (the file we created)
3. **File firestore.rules already exists. Overwrite?** → Type `N` (No)

### Step 4: Deploy the Rules

```bash
firebase deploy --only firestore:rules
```

You should see output like:
```
✔  Deploy complete!

Firestore Rules deployed successfully
```

✅ **Done!** Your rules are now deployed.

---

## Verify Rules Are Deployed

1. Go to Firebase Console → Firestore Database → Rules
2. Check the **"Last published"** timestamp - it should show the current time
3. The rules editor should show your deployed rules

---

## Troubleshooting

### "firebase: command not found"
- Make sure Firebase CLI is installed: `npm install -g firebase-tools`
- Restart your terminal after installation
- On Windows, you may need to restart your computer

### "Error: No Firebase project found"
- Run `firebase init firestore` first
- Or manually create `.firebaserc` file:
  ```json
  {
    "projects": {
      "default": "your-project-id"
    }
  }
  ```

### "Permission denied"
- Make sure you're logged in: `firebase login`
- Make sure you have the correct permissions in Firebase Console

### Rules not updating?
- Clear browser cache
- Wait a few seconds (rules can take 10-30 seconds to propagate)
- Check Firebase Console to verify rules were published

---

## Quick Commands Reference

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize (first time only)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules

# View current project
firebase projects:list

# Switch project
firebase use <project-id>
```

---

## What Happens After Deployment?

Once rules are deployed:
- ✅ Users can read stories (public)
- ✅ Authenticated users can write to dictionary cache
- ✅ Users can only access their own data (flashcards, progress)
- ✅ Stories are readable by everyone, writable by authenticated users

Your app should now work without permission errors!


