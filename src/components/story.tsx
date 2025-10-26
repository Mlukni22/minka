'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Story, StoryChapter, StoryContent } from '@/types';
import { Card, Button } from './layout';
import { FadeIn, SlideIn } from './animations';

interface StoryCardProps {
  story: Story;
  onSelect: (storyId: string) => void;
}

export function StoryCard({ story, onSelect }: StoryCardProps) {
  const totalChapters = story.chapters.length;
  const progress = 0; // Simplified - chapters don't have completion status

  return (
    <Card className="cursor-pointer group" onClick={() => onSelect(story.id)}>
      <div className="flex flex-col h-full">
        <div className="aspect-video bg-gradient-to-br from-orange-200 to-amber-300 rounded-xl mb-4 flex items-center justify-center">
          <div className="text-6xl">🐱</div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors">
            {story.title}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {story.description}
          </p>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>{story.difficulty}</span>
              <span>{story.estimatedTime} min</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <div className="text-xs text-gray-500 text-center">
              {completedChapters}/{totalChapters} chapters completed
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

interface StoryContentProps {
  content: StoryContent;
  showTranslation?: boolean;
}

export function StoryContentItem({ content, showTranslation = false }: StoryContentProps) {
  const [showTranslationState, setShowTranslationState] = useState(showTranslation);

  const toggleTranslation = () => {
    setShowTranslationState(!showTranslationState);
  };

  return (
    <FadeIn className="mb-6">
      <Card className="relative">
        {content.image && (
          <div className="aspect-video bg-gradient-to-br from-orange-200 to-amber-300 rounded-xl mb-4 flex items-center justify-center">
            <div className="text-4xl">🖼️</div>
          </div>
        )}
        
        <div className="space-y-3">
          {content.speaker && (
            <div className="text-sm font-medium text-orange-600">
              {content.speaker}:
            </div>
          )}
          
          <div className="text-lg leading-relaxed">
            <span className="text-gray-800">{content.text}</span>
            
            {content.translation && (
              <button
                onClick={toggleTranslation}
                className="ml-2 text-orange-500 hover:text-orange-600 transition-colors"
                title="Toggle translation"
              >
                {showTranslationState ? '👁️' : '👁️‍🗨️'}
              </button>
            )}
          </div>
          
          {content.translation && showTranslationState && (
            <SlideIn direction="up" className="text-gray-600 italic border-l-4 border-orange-200 pl-4">
              {content.translation}
            </SlideIn>
          )}
        </div>
      </Card>
    </FadeIn>
  );
}

interface StoryReaderProps {
  chapter: StoryChapter;
  onComplete: () => void;
  onNext: () => void;
}

export function StoryReader({ chapter, onComplete, onNext }: StoryReaderProps) {
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  
  const currentContent = chapter.content[currentContentIndex];
  const isLastContent = currentContentIndex === chapter.content.length - 1;

  const handleNext = () => {
    if (isLastContent) {
      onComplete();
    } else {
      setCurrentContentIndex(currentContentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentContentIndex > 0) {
      setCurrentContentIndex(currentContentIndex - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{chapter.title}</h2>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTranslation(!showTranslation)}
          >
            {showTranslation ? 'Hide' : 'Show'} Translation
          </Button>
          <div className="text-sm text-gray-500">
            {currentContentIndex + 1} / {chapter.content.length}
          </div>
        </div>
      </div>

      {currentContent && (
        <StoryContentItem 
          content={currentContent} 
          showTranslation={showTranslation}
        />
      )}

      <div className="flex justify-between items-center mt-8">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentContentIndex === 0}
        >
          ← Previous
        </Button>
        
        <Button
          onClick={handleNext}
          className="px-8"
        >
          {isLastContent ? 'Complete Chapter' : 'Next →'}
        </Button>
      </div>
    </div>
  );
}
