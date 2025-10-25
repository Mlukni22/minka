# Minka Learning Platform - Setup Guide

## 🚀 Quick Start

1. **Clone the repository** (if using Git)
2. **Install dependencies**: `npm install`
3. **Set up environment variables** (see Firebase Setup below)
4. **Start development server**: `npm run dev`
5. **Open browser**: http://localhost:3000

## 🔧 Prerequisites

- **Node.js** (version 18 or higher) - Download from [nodejs.org](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (optional, for version control) - Download from [git-scm.com](https://git-scm.com/)

## 🔐 Firebase Setup

### 1. Create Firebase Project
- Go to [Firebase Console](https://console.firebase.google.com/)
- Click "Create a project"
- Name it "minka-learning" (or your preferred name)
- Follow the setup wizard

### 2. Enable Authentication
- In Firebase Console, go to "Authentication" → "Sign-in method"
- Enable "Email/Password"
- Enable "Google" (optional)

### 3. Enable Firestore Database
- Go to "Firestore Database"
- Click "Create database"
- Choose "Start in test mode" (for development)
- Select a location close to you

### 4. Get Configuration Keys
- Go to "Project Settings" (gear icon)
- Scroll down to "Your apps"
- Click "Add app" → "Web" (</> icon)
- Register your app with a nickname
- Copy the configuration object

### 5. Create Environment File
Create a `.env.local` file in the project root:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 📁 Project Structure

```
minka/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── page.tsx            # Main home page
│   │   ├── layout.tsx          # Root layout
│   │   ├── globals.css         # Global styles
│   │   └── flashcards/        # Flashcards page
│   ├── components/             # React components
│   │   ├── story-reader.tsx   # Story reading component
│   │   ├── dashboard.tsx       # User dashboard
│   │   ├── game-roadmap.tsx   # Learning path
│   │   └── profile/           # User profile pages
│   ├── lib/                    # Utility libraries
│   │   ├── firebase.ts         # Firebase config
│   │   ├── auth.ts             # Authentication
│   │   └── story-engine.ts     # Story data
│   └── types/                  # TypeScript types
├── public/                     # Static assets
└── package.json                # Dependencies
```

## 🛠️ Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript types
```

## 🎨 Technology Stack

- **Framework**: Next.js 14 (React-based)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Authentication**: Firebase Auth
- **Database**: Firestore (Firebase)

## 🧪 Testing the Setup

1. **Start the server**: `npm run dev`
2. **Open browser**: http://localhost:3000
3. **Test features**:
   - Sign up for a new account
   - Sign in with existing account
   - Navigate through the story
   - Try the flashcards
   - Check the dashboard

## 🐛 Troubleshooting

### Common Issues:

**1. "Module not found" errors**
- Run `npm install` to install dependencies
- Check if you're in the correct directory

**2. Firebase connection errors**
- Verify `.env.local` file exists and has correct keys
- Check Firebase project settings
- Ensure Authentication and Firestore are enabled

**3. TypeScript errors**
- Run `npm run type-check` to see detailed errors
- Check if all imports are correct

**4. Styling issues**
- Verify Tailwind CSS is working
- Check `globals.css` for custom styles

## 📚 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)

## 🤝 Contributing

1. **Make changes** to the code
2. **Test thoroughly** in the browser
3. **Follow existing patterns** and naming conventions
4. **Use TypeScript** for all new code
5. **Test on mobile** devices for responsiveness

## 📞 Support

If you encounter issues:
1. Check this setup guide
2. Look at existing code for patterns
3. Check the browser console for errors
4. Contact the project maintainer

---

**Happy coding! 🚀**
