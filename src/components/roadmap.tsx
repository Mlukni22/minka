import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Story } from "@/types";
import { UserProgressionState } from "@/lib/progression";
import { Key, BookOpen } from "lucide-react";
import { Button, Card } from "@/components/layout";

/** ---------------- Types ---------------- */
type ChapterData = {
  num: number;
  id: string;
  title: string;
  plot: string;
  subparts: Array<{ title: string; grammar: string; completed: boolean }>;
};

/** ---------------- Props ---------------- */
interface RoadmapProps {
  stories: Story[];
  progressionState: UserProgressionState;
  onSelectEpisode: (episodeId: string) => void;
  onBack: () => void;
}

/** ---------------- Main Component ---------------- */
export function Roadmap({ stories, progressionState, onSelectEpisode, onBack }: RoadmapProps) {
  // Convert stories to chapter format with subparts (starting from Chapter 0)
  const chapters: ChapterData[] = useMemo(() => {
    return stories.map((story, idx) => {
      const progress = progressionState.episodeProgress[story.id];
      const subparts = [
        ...story.chapters.slice(0, 3).map((ch, chIdx) => ({
          title: `${idx}.${chIdx + 1} – ${ch.title}`,
          grammar: ch.vocabulary.slice(0, 3).map(v => v.german).join(", ") || "Vocabulary",
          completed: progress ? progress.chaptersCompleted > chIdx : false,
        })),
        {
          title: "Grammar Focus",
          grammar: `Review & practice for ${story.title}`,
          completed: progress?.completed || false,
        }
      ];

      return {
        num: idx, // Start from 0
        id: story.id,
        title: story.title,
        plot: story.description || `Chapter ${idx} of Minka's adventure`,
        subparts,
      };
    });
  }, [stories, progressionState]);

  const [currentChapter, setCurrentChapter] = useState(0);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#F8F5F0] via-[#E8DDF2] to-[#CFE7E4] text-[#4B3F72]">
      <MagicalVillageBackground />
      
      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-10 px-6 py-12">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="text-[#7B6AF5] hover:text-[#6B5AE5] font-semibold flex items-center gap-2"
          >
            ← Back to Home
          </button>
        </div>

        <h1 className="text-center text-4xl font-bold mb-6">
          Minka – Your Learning Journey
        </h1>

        {/* Curved progress line with chapter nodes */}
        <motion.svg viewBox="0 0 1400 700" className="w-full h-[650px]">
          <defs>
            <linearGradient id="magicalPath" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#E8DDF2" />
              <stop offset="100%" stopColor="#D9EDE6" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <motion.path
            d="M80,580 C250,500 400,380 580,400 C760,420 900,300 1050,330 C1200,360 1280,260 1320,290"
            fill="none"
            stroke="url(#magicalPath)"
            strokeWidth="16"
            strokeLinecap="round"
            filter="url(#glow)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />

          {chapters.map((chapter, i) => {
            const progress = progressionState.episodeProgress[chapter.id];
            const isCompleted = progress?.completed || false;
            const chaptersCompleted = progress?.chaptersCompleted || 0;
            
            return (
              <ChapterNode
                key={i}
                x={120 + i * 200}
                y={580 - i * 50}
                active={i === currentChapter}
                completed={isCompleted}
                progress={chaptersCompleted}
                onClick={() => {
                  setCurrentChapter(i);
                  // Directly start the chapter when clicking the node
                  onSelectEpisode(chapter.id);
                }}
                label={`Ch ${chapter.num}`}
              />
            );
          })}
        </motion.svg>

        <ChapterCard 
          chapter={chapters[currentChapter]} 
          onStart={() => onSelectEpisode(chapters[currentChapter].id)}
        />
      </main>
    </div>
  );
}

/** ---------------- Chapter Node ---------------- */
function ChapterNode({ 
  x, 
  y, 
  label, 
  active, 
  completed,
  progress,
  onClick 
}: { 
  x: number; 
  y: number; 
  label: string; 
  active: boolean;
  completed: boolean;
  progress: number;
  onClick: () => void;
}) {
  return (
    <g transform={`translate(${x}, ${y})`} style={{ cursor: 'pointer' }}>
      {/* Outer glow ring for active state */}
      {active && (
        <motion.circle
          r={42}
          cx={0}
          cy={0}
          fill="none"
          stroke="#E8DDF2"
          strokeWidth={3}
          opacity={0.5}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.5 }}
          transition={{ duration: 0.5 }}
        />
      )}
      
      {/* Main circle - Always clickable */}
      <motion.circle
        r={35}
        cx={0}
        cy={0}
        fill={completed ? "#D9EDE6" : active ? "#FCE0D8" : "#ffffff"}
        stroke={completed ? "#41AD83" : active ? "#E8DDF2" : "#D9EDE6"}
        strokeWidth={6}
        onClick={onClick}
        whileHover={{ scale: 1.15, strokeWidth: 8 }}
        whileTap={{ scale: 0.95 }}
        style={{ cursor: 'pointer' }}
        transition={{ duration: 0.2 }}
      />
      
      {/* Completion checkmark */}
      {completed && (
        <text
          x={0}
          y={5}
          textAnchor="middle"
          fontSize="24"
          fill="#41AD83"
          fontWeight="bold"
        >
          ✓
        </text>
      )}
      
      {/* Label text inside circle (only if not completed) */}
      {!completed && (
        <foreignObject x={-30} y={-12} width={60} height={24}>
          <div className="text-sm text-[#4B3F72] text-center font-bold drop-shadow-sm">
            {label}
          </div>
        </foreignObject>
      )}
      
      {/* Progress indicator below circle */}
      <foreignObject x={-40} y={45} width={80} height={30}>
        <div className="text-xs text-[#4B3F72] text-center font-semibold drop-shadow-sm">
          {completed ? (
            <span className="text-[#41AD83]">✓ Click to replay</span>
          ) : progress > 0 ? (
            <span className="text-[#7B6AF5]">{progress} done</span>
          ) : (
            <span className="opacity-80">Click to learn</span>
          )}
        </div>
      </foreignObject>
      
      {/* Minka avatar above active chapter */}
      {active && (
        <g transform="translate(-14, -80)">
          <MinkaAvatar />
        </g>
      )}
    </g>
  );
}

/** ---------------- Chapter Card ---------------- */
function ChapterCard({ chapter, onStart }: { chapter: ChapterData; onStart: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white/80 border-none shadow-2xl rounded-3xl backdrop-blur-lg p-8">
        <h2 className="text-2xl font-semibold mb-2">
          Chapter {chapter.num}: {chapter.title}
        </h2>
        <p className="text-[#5E548E] mb-3">{chapter.plot}</p>
        
        <div className="grid gap-3 md:grid-cols-2">
          {chapter.subparts.map((sub, i) => (
            <div 
              key={i} 
              className={`rounded-xl p-3 shadow-sm transition-all ${
                sub.completed 
                  ? 'bg-[#D9EDE6]/70 border-2 border-[#41AD83]' 
                  : 'bg-[#FCE0D8]/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-[#4B3F72]">{sub.title}</p>
                {sub.completed && (
                  <span className="text-[#41AD83] text-sm font-bold">✓</span>
                )}
              </div>
              <p className="text-sm text-[#5E548E] italic">
                Grammar: {sub.grammar}
              </p>
            </div>
          ))}
        </div>
        
        <button
          onClick={onStart}
          className="mt-5 rounded-full bg-[#D9EDE6] hover:bg-[#CBE4DC] text-[#4B3F72] px-5 py-2 font-semibold flex items-center gap-2 transition-all hover:scale-105"
        >
          <Key className="h-4 w-4" />
          {chapter.subparts.some(s => s.completed) ? 'Continue Chapter' : 'Start Chapter'}
        </button>
      </div>
    </motion.div>
  );
}

/** ---------------- Minka Avatar (SVG) ---------------- */
function MinkaAvatar() {
  return (
    <motion.g 
      initial={{ y: 4 }} 
      animate={{ y: [4, 0, 4] }} 
      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
    >
      {/* Shadow */}
      <ellipse cx="14" cy="26" rx="14" ry="4" fill="#D9EDE6" opacity="0.6" />
      
      {/* Head */}
      <circle cx="14" cy="12" r="10" fill="#FFF6EF" stroke="#E3D5C9" strokeWidth="1" />
      
      {/* Left ear */}
      <path d="M6 10 L10 4 L11 10" fill="#F3E3D9" stroke="#E3D5C9" strokeWidth="1" />
      
      {/* Right ear */}
      <path d="M22 10 L18 4 L17 10" fill="#F3E3D9" stroke="#E3D5C9" strokeWidth="1" />
      
      {/* Left eye */}
      <circle cx="11" cy="12" r="1.4" fill="#4B3F72" />
      
      {/* Right eye */}
      <circle cx="17" cy="12" r="1.4" fill="#4B3F72" />
      
      {/* Nose */}
      <circle cx="14" cy="15" r="1.2" fill="#F5A6A0" />
    </motion.g>
  );
}

/** ---------------- Magical Village Background ---------------- */
function MagicalVillageBackground() {
  return (
    <>
      {/* Sky gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#DDE6F5] via-[#F8F5F0] to-[#E8DDF2]" />

      {/* Floating sparkles */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-[#FCE0D8] opacity-70"
          style={{ 
            width: 6, 
            height: 6, 
            top: Math.random() * 800, 
            left: `${Math.random() * 100}%` 
          }}
          animate={{ 
            y: [0, -20, 0], 
            opacity: [0.5, 1, 0.5] 
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 4 + Math.random() * 3, 
            delay: i * 0.2 
          }}
        />
      ))}

      {/* Magical Dorf (village) elements */}
      <motion.div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#CFE7E4] to-transparent rounded-t-[50%]" />
      <motion.div className="absolute bottom-10 left-20 w-40 h-40 bg-[#E8DDF2] rounded-full opacity-70 blur-lg" />
      <motion.div className="absolute bottom-14 right-32 w-52 h-52 bg-[#D9EDE6] rounded-full opacity-60 blur-lg" />
      <motion.div className="absolute bottom-0 left-1/3 w-96 h-56 bg-[#F8F5F0] rounded-t-[50%] shadow-inner" />
      <motion.div className="absolute bottom-16 left-1/4 w-12 h-12 bg-[#E3D5C9] rounded-[4px] rotate-6 shadow-md" />
      <motion.div className="absolute bottom-20 right-1/4 w-16 h-16 bg-[#E8DDF2] rounded-[6px] -rotate-3 shadow-md" />
    </>
  );
}
