# 🐾 Minka - Story-Based German Learning App

A complete MVP for learning German through interactive stories, spaced repetition flashcards, and immersive language practice.

## 🎯 MVP Status: COMPLETE ✅

All core features are implemented and ready for testing.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Firebase

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Email/Password, Google)
3. Create Firestore Database
4. Copy Firebase config to `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

See `FIREBASE_SETUP.md` for detailed instructions.

### 3. Seed Sample Stories

```bash
npm install dotenv tsx --save-dev
npx tsx scripts/seed-data.ts
```

This creates 4 sample stories with vocabulary in Firestore.

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## 📚 Documentation

- **`QUICK_TEST.md`** - Quick testing guide (start here!)
- **`TESTING_GUIDE.md`** - Detailed testing steps
- **`MVP_COMPLETE.md`** - Complete feature list
- **`INTEGRATION_ENHANCEMENTS.md`** - Navigation and integration details
- **`SEED_DATA.md`** - How to seed stories
- **`FIREBASE_SETUP.md`** - Firebase configuration guide

## ✨ Features

### Authentication
- ✅ Email/password sign up & login
- ✅ Google Sign-In
- ✅ Password reset
- ✅ Protected routes

### Onboarding
- ✅ Multi-step flow
- ✅ German level selection (BEGINNER, A1, A2, B1_PLUS)
- ✅ Daily goal selection (5, 10, 15, 20 minutes)

### Dashboard
- ✅ Personalized greeting
- ✅ XP progress bar with level
- ✅ Current story in progress
- ✅ Words to review count
- ✅ Quick action buttons
- ✅ Stats cards

### Stories
- ✅ Stories library with filtering
- ✅ Story reader with inline translations
- ✅ Word highlighting & tooltips
- ✅ Progress tracking
- ✅ Auto-add words to flashcards

### Flashcards
- ✅ Spaced repetition (SM-2 algorithm)
- ✅ Review session with rating (Again/Hard/Good/Easy)
- ✅ Session summary
- ✅ XP rewards

### Profile
- ✅ View/edit profile
- ✅ Stats dashboard
- ✅ Account management

## 📁 Project Structure

```
src/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx         # Login page
│   │   └── signup/page.tsx        # Sign up page
│   ├── dashboard/page.tsx          # Main dashboard
│   ├── onboarding/page.tsx         # Onboarding flow
│   ├── profile/page.tsx            # User profile
│   ├── review/page.tsx             # Flashcard review
│   └── stories/
│       ├── page.tsx                # Stories library
│       └── [id]/page.tsx           # Story reader
├── components/
│   ├── Header.tsx                  # Navigation header
│   ├── LearningDashboard.tsx       # Dashboard UI
│   └── ui/button.tsx               # Button component
├── lib/
│   ├── auth.ts                     # Authentication functions
│   ├── firebase.ts                 # Firebase config
│   ├── srs-scheduler.ts            # Spaced repetition logic
│   └── db/
│       ├── flashcards.ts           # Flashcard operations
│       ├── stories.ts              # Story operations
│       ├── user.ts                 # User operations
│       └── user-progress.ts        # Progress tracking
└── types/
    ├── flashcard.ts                # Flashcard types
    ├── story.ts                    # Story types
    └── user.ts                     # User types
scripts/
└── seed-data.ts                    # Seed script
```

## 🎨 Design

- **Colors**: Pastel purple, pink, mint green
- **Typography**: Clean, rounded sans-serif
- **Layout**: Responsive, mobile-first
- **Animations**: Light, subtle (removed for performance)

## 🔒 Security

- ✅ Firestore security rules
- ✅ User-specific data isolation
- ✅ Protected routes with auth guards
- ✅ Secure password handling

## 📱 Mobile Responsive

All pages are fully responsive and optimized for mobile devices.

## 🧪 Testing

See `QUICK_TEST.md` for step-by-step testing instructions.

## 🐛 Troubleshooting

**Firebase not initialized?**
- Check `.env.local` has all variables
- Restart dev server: `npm run dev`

**Can't see stories?**
- Run seed script: `npx tsx scripts/seed-data.ts`
- Check Firestore Console

**Onboarding doesn't save?**
- Check Firestore security rules
- Check browser console for errors

## 📝 Next Steps (Post-MVP)

- Audio playback for stories
- Enhanced SRS algorithm
- Admin content management
- More stories and vocabulary
- Social features
- Mobile app (React Native)

---

**Built with**: Next.js 16, React 19, TypeScript, Tailwind CSS, Firebase (Auth + Firestore)

**Status**: ✅ MVP Complete - Ready for Testing!

