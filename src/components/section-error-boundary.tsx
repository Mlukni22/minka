'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, BookOpen, Brain, Award } from 'lucide-react';

interface SectionErrorBoundaryProps {
  children: ReactNode;
  section: 'story' | 'flashcards' | 'progress' | 'auth' | 'general';
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class SectionErrorBoundary extends Component<SectionErrorBoundaryProps, State> {
  constructor(props: SectionErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Error in ${this.props.section} section:`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onRetry?.();
  };

  getSectionIcon = () => {
    switch (this.props.section) {
      case 'story':
        return <BookOpen className="h-8 w-8 text-blue-500" />;
      case 'flashcards':
        return <Brain className="h-8 w-8 text-purple-500" />;
      case 'progress':
        return <Award className="h-8 w-8 text-green-500" />;
      default:
        return <AlertTriangle className="h-8 w-8 text-red-500" />;
    }
  };

  getSectionMessage = () => {
    switch (this.props.section) {
      case 'story':
        return {
          title: 'Story Loading Error',
          message: 'We had trouble loading the story content. Your progress is safe.'
        };
      case 'flashcards':
        return {
          title: 'Flashcard Error',
          message: 'There was an issue with the flashcard system. Your cards are saved.'
        };
      case 'progress':
        return {
          title: 'Progress Error',
          message: 'We encountered an issue loading your progress data.'
        };
      case 'auth':
        return {
          title: 'Authentication Error',
          message: 'There was a problem with the login system. Please try again.'
        };
      default:
        return {
          title: 'Something went wrong',
          message: 'We encountered an unexpected error.'
        };
    }
  };

  render() {
    if (this.state.hasError) {
      const { title, message } = this.getSectionMessage();
      
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="flex justify-center mb-4">
            {this.getSectionIcon()}
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </h3>
          
          <p className="text-gray-600 text-center mb-6 max-w-sm">
            {message}
          </p>

          <button
            onClick={this.handleRetry}
            className="px-4 py-2 bg-[#7B6AF5] text-white rounded-lg hover:bg-[#6D5B95] transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
