# 🐾 Minka - German Learning Platform

A beautiful, interactive German learning platform featuring story-based lessons, spaced repetition flashcards, and gamified progress tracking.

![Minka Logo](public/images/minka-cat.png)

## ✨ Features

- **📚 Story-Based Learning**: Interactive German stories with vocabulary integration
- **🎯 Spaced Repetition**: Smart flashcard system using SM-2 algorithm
- **📊 Progress Tracking**: Detailed analytics and streak tracking
- **🏆 Gamification**: Levels, XP, daily quests, and achievements
- **🗺️ Learning Path**: Visual roadmap with chapter progression
- **🌍 Multilingual**: Support for English and Bulgarian interfaces
- **📱 Responsive**: Works perfectly on desktop and mobile
- **🔐 Authentication**: Secure user accounts with Firebase
- **📈 Activity Heatmap**: GitHub-style contribution calendar

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ ([Download](https://nodejs.org/))
- npm (comes with Node.js)

### Installation
```bash
# Clone the repository
git clone [your-repo-url]
cd minka

# Install dependencies
npm install

# Set up environment variables
cp env-template.txt .env.local
# Edit .env.local with your Firebase configuration

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript types
```

### Project Structure
```
src/
├── app/                    # Next.js app router
│   ├── page.tsx           # Main home page
│   ├── layout.tsx         # Root layout
│   └── flashcards/        # Flashcards page
├── components/             # React components
│   ├── story-reader.tsx   # Story reading interface
│   ├── dashboard.tsx      # User dashboard
│   ├── game-roadmap.tsx   # Learning path visualization
│   └── profile/           # User profile pages
├── lib/                    # Utility libraries
│   ├── firebase.ts        # Firebase configuration
│   ├── auth.ts            # Authentication logic
│   ├── story-engine.ts    # Story data management
│   └── flashcard-system.ts # Spaced repetition system
└── types/                  # TypeScript definitions
```

## 🔐 Firebase Setup

1. **Create Project**: Go to [Firebase Console](https://console.firebase.google.com/)
2. **Enable Authentication**: Email/Password + Google Sign-in
3. **Enable Firestore**: Database for user data
4. **Get Config**: Copy configuration to `.env.local`

See [SETUP.md](SETUP.md) for detailed instructions.

## 🎨 Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **State Management**: React Context + Hooks

## 📱 Features Overview

### Story Learning
- Interactive German stories with vocabulary highlights
- Click-to-add flashcards from story context
- Grammar lessons integrated with each chapter
- Audio support for pronunciation

### Flashcard System
- Bidirectional cards (German ↔ English)
- Cloze deletion with example sentences
- Spaced repetition using SM-2 algorithm
- Typo tolerance and fuzzy matching

### Progress Tracking
- Chapter completion tracking
- Vocabulary mastery statistics
- Learning streak visualization
- Activity heatmap calendar

### Gamification
- Level system with XP rewards
- Daily quests and achievements
- Streak tracking and rewards
- Progress visualization

## 🎯 User Experience

### New Users
- Welcome page with "Start Your Journey" button
- Guided first chapter experience
- Easy sign-up process

### Returning Users
- Personalized dashboard with progress stats
- Continue where you left off
- Quick access to flashcards and lessons

## 🛠️ Customization

### Adding New Stories
1. Add story data to `src/lib/story-engine.ts`
2. Include vocabulary with articles and plurals
3. Add grammar lessons to `src/data/grammar-lessons.ts`

### Styling
- Global styles in `src/app/globals.css`
- CSS variables for consistent theming
- Tailwind classes for component styling

### Translations
- Add new languages in `src/lib/i18n.ts`
- Use `useLanguage` hook in components
- Update translation interfaces

## 📊 Performance

- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Built-in Next.js analyzer
- **Lazy Loading**: Components loaded on demand

## 🧪 Testing

- **TypeScript**: Compile-time type checking
- **ESLint**: Code quality and consistency
- **Manual Testing**: Browser testing on multiple devices
- **Firebase**: Test authentication and data persistence

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Other Platforms
- **Netlify**: Static site deployment
- **Firebase Hosting**: Integrated with Firebase
- **Docker**: Containerized deployment

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

### Code Standards
- Use TypeScript for all new code
- Follow existing naming conventions
- Add comments for complex logic
- Test on mobile devices

## 📞 Support

- **Documentation**: Check [SETUP.md](SETUP.md) for setup issues
- **Issues**: Report bugs via GitHub Issues
- **Questions**: Contact the maintainer

## 📄 License

This project is licensed under the MIT License.

---

**Made with ❤️ for German learners everywhere! 🇩🇪**