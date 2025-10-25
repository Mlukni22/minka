import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';

interface AudioPlayerProps {
  text: string;
  audioUrl?: string;
  autoPlay?: boolean;
  showText?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AudioPlayer({ 
  text, 
  audioUrl, 
  autoPlay = false, 
  showText = true,
  className = '',
  size = 'md'
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element if audioUrl is provided
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.addEventListener('ended', () => setIsPlaying(false));
      audio.addEventListener('error', () => {
        setHasError(true);
        setIsLoading(false);
      });
      audio.addEventListener('loadstart', () => setIsLoading(true));
      audio.addEventListener('canplay', () => setIsLoading(false));
      audioRef.current = audio;

      if (autoPlay) {
        playAudio();
      }

      return () => {
        audio.pause();
        audio.removeEventListener('ended', () => setIsPlaying(false));
        audio.removeEventListener('error', () => setHasError(true));
      };
    }
  }, [audioUrl, autoPlay]);

  const playAudio = async () => {
    if (audioRef.current && !hasError) {
      try {
        setIsPlaying(true);
        await audioRef.current.play();
      } catch (error) {
        console.error('Error playing audio:', error);
        setHasError(true);
        setIsPlaying(false);
      }
    } else {
      // Fallback to Web Speech API if no audio file or error
      speakText();
    }
  };

  const speakText = () => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE'; // German language
      utterance.rate = 0.8; // Slightly slower for learning
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => {
        setIsPlaying(false);
        setHasError(true);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('Speech synthesis not supported');
      setHasError(true);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const handleClick = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      playAudio();
    }
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleClick}
        disabled={isLoading}
        className={`${sizeClasses[size]} rounded-full bg-[#BCA6FF] text-white flex items-center justify-center shadow-md hover:bg-[#A794FF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        title={isPlaying ? 'Stop audio' : 'Play audio'}
      >
        {isLoading ? (
          <Loader2 className={`${iconSizes[size]} animate-spin`} />
        ) : isPlaying ? (
          <VolumeX className={iconSizes[size]} />
        ) : (
          <Volume2 className={iconSizes[size]} />
        )}
      </motion.button>
      {showText && (
        <span className="text-[#5E548E] font-medium">{text}</span>
      )}
    </div>
  );
}

interface DialogueAudioPlayerProps {
  speaker: string;
  text: string;
  audioUrl?: string;
  className?: string;
}

export function DialogueAudioPlayer({ 
  speaker, 
  text, 
  audioUrl,
  className = '' 
}: DialogueAudioPlayerProps) {
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className="flex-1">
        <div className="font-semibold text-[#4B3F72] mb-1">{speaker}:</div>
        <div className="text-[#5E548E]">{text}</div>
      </div>
      <AudioPlayer 
        text={text} 
        audioUrl={audioUrl} 
        showText={false}
        size="sm"
      />
    </div>
  );
}

interface VocabularyAudioCardProps {
  german: string;
  english: string;
  audioUrl?: string;
  example?: string;
  className?: string;
}

export function VocabularyAudioCard({ 
  german, 
  english, 
  audioUrl,
  example,
  className = '' 
}: VocabularyAudioCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r from-[#E8F6EB] to-[#FFF1E5] rounded-xl p-4 shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1">
          <div className="text-lg font-bold text-[#2F6045]">{german}</div>
          <div className="text-sm text-[#6E4D2B] italic">{english}</div>
        </div>
        <AudioPlayer 
          text={german} 
          audioUrl={audioUrl} 
          showText={false}
          size="md"
        />
      </div>
      {example && (
        <div className="mt-2 pt-2 border-t border-[#D9EDE6]">
          <div className="text-xs text-[#3E5C4A] italic">{example}</div>
        </div>
      )}
    </motion.div>
  );
}

