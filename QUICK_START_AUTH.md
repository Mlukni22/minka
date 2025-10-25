# 🚀 Quick Start: Firebase Authentication

Get Firebase authentication running in **5 minutes**!

---

## Step 1: Create Firebase Project (2 min)

1. Go to [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Name it (e.g., "minka-app")
4. Click through the setup (disable Analytics if you want faster setup)

---

## Step 2: Register Web App (1 min)

1. In your Firebase project, click the **Web icon** `</>`
2. Register app nickname: "Minka Web"
3. **Copy the config object** that appears

---

## Step 3: Add Your Config (1 min)

1. Create a file called `.env.local` in your project root
2. Paste this template and **replace with your values**:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=paste-your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

---

## Step 4: Enable Auth Methods (1 min)

1. In Firebase Console, go to **Authentication** → **Get started**
2. Go to **Sign-in method** tab
3. Enable **Email/Password** (toggle on, save)
4. Enable **Google** (toggle on, add support email, save)

---

## Step 5: Create Firestore Database (1 min)

1. In Firebase Console, go to **Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
4. Select a location (closest to you)
5. Click **"Enable"**

---

## Step 6: Run Your App! (30 sec)

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000)

---

## ✅ Test It Works

1. Click **"Sign In"** button (top right)
2. Switch to **"Sign up"** tab
3. Enter your name, email, and password
4. Click **"Create Account"**
5. You should be signed in! 🎉

Check Firebase Console → Authentication → Users to see your new user!

---

## 🎉 That's It!

Your app now has:
- ✅ User authentication
- ✅ Cloud sync
- ✅ Google Sign-In
- ✅ Password reset
- ✅ Secure data storage

**All user progress is now automatically saved to the cloud!**

---

## 🆘 Troubleshooting

### "Firebase not defined" error
**Fix:** Make sure `.env.local` exists and restart dev server (`npm run dev`)

### "Unauthorized domain" error
**Fix:** In Firebase Console → Authentication → Settings → Authorized domains → Add `localhost`

### Can't sign in with Google
**Fix:** Make sure you enabled Google in Authentication → Sign-in method

### "Permission denied" in Firestore
**Fix:** Make sure you created database in "test mode"

---

## 📖 More Info

- **Detailed setup:** See `FIREBASE_SETUP.md`
- **Feature list:** See `AUTHENTICATION_FEATURES.md`
- **Need help?** Check Firebase docs: [https://firebase.google.com/docs](https://firebase.google.com/docs)

---

**🐱 Happy learning with Minka!**

