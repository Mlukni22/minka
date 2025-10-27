import { useState } from 'react';

export type AppState = 
  | 'home' 
  | 'story' 
  | 'vocabulary' 
  | 'progress' 
  | 'grammar' 
  | 'grammar-library' 
  | 'episodes' 
  | 'reader' 
  | 'dashboard' 
  | 'roadmap' 
  | 'profile-progress' 
  | 'profile-achievements' 
  | 'profile-flashcards' 
  | 'profile-settings' 
  | 'profile-level' 
  | 'about';

export function useAppState() {
  const [currentState, setCurrentState] = useState<AppState>('home');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const navigateTo = (state: AppState) => {
    setCurrentState(state);
  };

  const navigateBack = () => {
    setCurrentState('home');
  };

  return {
    currentState,
    showAuthModal,
    setCurrentState,
    setShowAuthModal,
    navigateTo,
    navigateBack
  };
}


