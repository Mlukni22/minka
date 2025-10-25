# 👨‍💻 Developer Onboarding Guide

Welcome to the Minka German Learning Platform! This guide will help you get started as a frontend developer.

## 🎯 What You'll Be Working On

The Minka platform is a comprehensive German learning application with:

- **Interactive Stories**: German lessons with clickable vocabulary
- **Smart Flashcards**: Spaced repetition system with cloze deletion
- **Progress Tracking**: Detailed analytics and streak visualization
- **Gamification**: Levels, XP, daily quests, and achievements
- **User Dashboard**: Personalized learning hub
- **Activity Heatmap**: GitHub-style contribution calendar

## 🛠️ Development Environment

### Required Software
- **Node.js 18+**: [Download here](https://nodejs.org/)
- **VS Code**: [Download here](https://code.visualstudio.com/)
- **Git**: [Download here](https://git-scm.com/)

### Recommended VS Code Extensions
```
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- TypeScript Importer
- Prettier - Code formatter
- ESLint
- Auto Rename Tag
- Bracket Pair Colorizer
- GitLens
```

## 🚀 Getting Started

### 1. Clone and Setup
```bash
git clone [repository-url]
cd minka
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp env-template.txt .env.local

# Edit .env.local with Firebase configuration
# See FIREBASE_SETUP_GUIDE.md for details
```

### 3. Start Development
```bash
npm run dev
# Open http://localhost:3000
```

## 📁 Key Files to Understand

### Core Application Files
- **`src/app/page.tsx`**: Main application logic and routing
- **`src/app/layout.tsx`**: Root layout with providers
- **`src/app/globals.css`**: Global styles and CSS variables

### Important Components
- **`src/components/story-reader.tsx`**: Story reading interface
- **`src/components/dashboard.tsx`**: User dashboard
- **`src/components/game-roadmap.tsx`**: Learning path visualization
- **`src/components/heatmap-calendar.tsx`**: Activity calendar
- **`src/components/flashcards/page.tsx`**: Flashcard system

### Data and Logic
- **`src/lib/story-engine.ts`**: Story data and management
- **`src/lib/flashcard-system.ts`**: Spaced repetition logic
- **`src/lib/firebase.ts`**: Firebase configuration
- **`src/lib/auth.ts`**: Authentication logic

## 🎨 Styling System

### CSS Variables (in globals.css)
```css
:root {
  --lav-100: #F7F5FF;    /* Light lavender */
  --lav-400: #BCA6FF;    /* Medium lavender */
  --lav-600: #7B6AF5;    /* Dark lavender */
  --mint-100: #E7F7E8;   /* Light mint */
  --mint-500: #9AD8BA;   /* Medium mint */
  --mint-600: #7ED321;   /* Dark mint */
}
```

### Common CSS Classes
```css
.btn-primary     /* Primary action buttons */
.btn-secondary   /* Secondary action buttons */
.home-chip       /* Small navigation chips */
.world-card      /* Main content cards */
header-card      /* Header sections */
```

### Tailwind Usage
- Use Tailwind classes for styling
- Follow existing color scheme
- Maintain responsive design (mobile-first)
- Use Framer Motion for animations

## 🔧 Development Patterns

### Component Structure
```typescript
'use client'; // For client-side components

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IconName } from 'lucide-react';

interface ComponentProps {
  // Define props here
}

export function ComponentName({ prop1, prop2 }: ComponentProps) {
  const [state, setState] = useState();
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="your-classes"
    >
      {/* Component content */}
    </motion.div>
  );
}
```

### State Management
- Use React hooks (`useState`, `useEffect`, `useMemo`)
- Context API for global state (`LanguageContext`)
- LocalStorage for persistence
- Firebase for user data

### TypeScript Usage
- Define interfaces for all props and data structures
- Use existing types from `src/types/index.ts`
- Add new types as needed
- Always use TypeScript for new code

## 🎯 Common Tasks

### Adding a New Component
1. Create file in appropriate directory
2. Define TypeScript interface for props
3. Use existing styling patterns
4. Add animations with Framer Motion
5. Test on mobile devices

### Modifying Styles
1. Check `globals.css` for existing variables
2. Use Tailwind classes when possible
3. Add custom CSS if needed
4. Maintain responsive design
5. Test on different screen sizes

### Working with Data
1. Check `src/lib/` for existing data structures
2. Use TypeScript interfaces
3. Handle loading and error states
4. Test data persistence

## 🧪 Testing Your Changes

### Manual Testing Checklist
- [ ] Component renders correctly
- [ ] Responsive on mobile devices
- [ ] Animations work smoothly
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Accessibility features work
- [ ] Performance is acceptable

### Browser Testing
- **Chrome**: Primary development browser
- **Firefox**: Cross-browser compatibility
- **Safari**: iOS compatibility
- **Mobile**: Test on actual devices

## 🚨 Common Issues and Solutions

### TypeScript Errors
```bash
# Check for type errors
npm run type-check

# Common fixes:
# - Add missing imports
# - Define proper interfaces
# - Use correct type annotations
```

### Styling Issues
```bash
# Check Tailwind classes
# Verify CSS variables are defined
# Test responsive breakpoints
# Check for CSS conflicts
```

### Firebase Issues
```bash
# Verify .env.local exists
# Check Firebase configuration
# Test authentication flow
# Verify Firestore rules
```

## 📚 Learning Resources

### React and Next.js
- [React Documentation](https://react.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Styling and Animation
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)

### Firebase
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Rules](https://firebase.google.com/docs/firestore/security/get-started)

## 🤝 Collaboration Guidelines

### Code Standards
- Use TypeScript for all new code
- Follow existing naming conventions
- Add comments for complex logic
- Use Prettier for code formatting
- Run ESLint before committing

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Add: your feature description"

# Push to remote
git push origin feature/your-feature-name

# Create pull request
```

### Communication
- Ask questions when stuck
- Share progress regularly
- Test changes thoroughly
- Document complex features

## 🎉 Your First Task

To get familiar with the codebase, try this simple task:

1. **Find** the home page (`src/app/page.tsx`)
2. **Locate** the "Start Your Journey" button
3. **Change** the button text to "Begin Learning"
4. **Test** the change in the browser
5. **Commit** your change

This will help you understand:
- File structure
- Component organization
- Styling system
- Development workflow

## 📞 Getting Help

- **Documentation**: Check existing guides and README files
- **Code Examples**: Look at existing components for patterns
- **Team Communication**: Ask questions via your preferred channel
- **Issue Tracking**: Use GitHub Issues for bugs and features

---

**Welcome to the team! Happy coding! 🚀**
