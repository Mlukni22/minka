# 🔥 Firebase Setup Guide

This guide will help you set up Firebase for the Minka learning platform.

## 📋 Prerequisites

- Google account
- Access to [Firebase Console](https://console.firebase.google.com/)

## 🚀 Step-by-Step Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Enter project name: `minka-learning` (or your preferred name)
4. Click **"Continue"**
5. **Disable** Google Analytics (optional for development)
6. Click **"Create project"**

### 2. Enable Authentication

1. In the Firebase Console, click **"Authentication"** in the left sidebar
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable **"Email/Password"**:
   - Click on "Email/Password"
   - Toggle **"Enable"**
   - Click **"Save"**
5. Enable **"Google"** (optional):
   - Click on "Google"
   - Toggle **"Enable"**
   - Select a project support email
   - Click **"Save"**

### 3. Enable Firestore Database

1. Click **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
4. Click **"Next"**
5. Select a location close to you
6. Click **"Done"**

### 4. Get Configuration Keys

1. Click the **gear icon** (⚙️) next to "Project Overview"
2. Click **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click **"Add app"** → **Web app** (</> icon)
5. Register your app:
   - App nickname: `minka-web`
   - Check **"Also set up Firebase Hosting"** (optional)
   - Click **"Register app"**
6. Copy the configuration object

### 5. Create Environment File

1. In your project root, create a file called `.env.local`
2. Copy the following template and fill in your values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 6. Test the Setup

1. Start your development server: `npm run dev`
2. Open http://localhost:3000
3. Try to sign up for a new account
4. Check if authentication works
5. Verify data is saved in Firestore

## 🔧 Firestore Security Rules (Development)

For development, you can use these permissive rules:

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

**⚠️ Warning**: These rules allow anyone to read/write your database. Use more restrictive rules for production.

## 🚨 Troubleshooting

### Common Issues:

**1. "Firebase: Error (auth/configuration-not-found)"**
- Check that `.env.local` file exists
- Verify all environment variables are set
- Restart the development server

**2. "Firebase: Error (auth/invalid-api-key)"**
- Double-check the API key in `.env.local`
- Make sure there are no extra spaces or quotes

**3. "Firebase: Error (auth/domain-not-authorized)"**
- Add `localhost:3000` to authorized domains in Firebase Console
- Go to Authentication → Settings → Authorized domains

**4. "Firestore: Missing or insufficient permissions"**
- Check Firestore security rules
- Ensure rules allow read/write for your use case

## 📱 Production Setup

### 1. Update Security Rules

Replace the test mode rules with production rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /userProgress/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 2. Add Production Domains

1. Go to Authentication → Settings
2. Add your production domain to "Authorized domains"
3. Remove `localhost:3000` if not needed

### 3. Environment Variables

Set the same environment variables in your production environment (Vercel, Netlify, etc.)

## 🔐 Security Best Practices

1. **Never commit** `.env.local` to version control
2. **Use restrictive** Firestore rules in production
3. **Enable** Firebase App Check for additional security
4. **Monitor** authentication usage in Firebase Console
5. **Regularly review** and update security rules

## 📞 Support

If you encounter issues:
1. Check the Firebase Console for error logs
2. Verify all configuration steps
3. Test with a simple Firebase app first
4. Contact Firebase support if needed

---

**Your Firebase setup is now complete! 🎉**
