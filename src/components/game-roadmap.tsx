'use client';

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Story } from "@/types";
import { UserProgressionState } from "@/lib/progression";

/** ---------------- Types ---------------- */
type Scene = { id: string; title: string; done?: boolean };
type Chapter = {
  id: string;
  title: string;
  subtitle: string;
  world: "forest" | "village" | "library";
  scenes: Scene[];
  grammar: { id: string; title: string; done?: boolean };
  t: number; // 0..1 position along the path
  episodeNum: number;
};

/** ---------------- Props ---------------- */
interface GameRoadmapProps {
  stories: Story[];
  progressionState: UserProgressionState;
  onSelectEpisode: (episodeId: string) => void;
  onBack: () => void;
  onNavigateToFlashcards?: () => void;
}

/** ---------------- Theme ---------------- */
const theme = {
  bg: "bg-[radial-gradient(1000px_500px_at_10%_-10%,#E7F7E8_0%,transparent_60%),radial-gradient(900px_420px_at_90%_-10%,#F1ECFF_0%,transparent_60%),linear-gradient(180deg,#FFF9F3_0%,#FDFBFF_100%)]",
  chip: {
    forest: "bg-[#E7F7E8] text-[#265E40] border-[#CFE8DA]",
    village: "bg-[#FFF0DC] text-[#7C4B14] border-[#FFD8BF]",
    library: "bg-[#F1ECFF] text-[#4D3C94] border-[#E1D9FF]",
  },
  accent: { forest: "#41AD83", village: "#FFA96E", library: "#7B6AF5" },
};

/** ---------------- Sparkle Burst ---------------- */
type Spark = { id: number; x: number; y: number; hue: number };

// Counter for unique spark IDs
let sparkIdCounter = 0;

function Sparkles({ sparks }: { sparks: Spark[] }) {
  return (
    <>
      <style>{`
        @keyframes burst {
          from { transform: translate(0,0) scale(1); opacity: 1; }
          to   { transform: translate(var(--dx), var(--dy)) scale(0.2); opacity: 0; }
        }
      `}</style>
      {sparks.map((s) => {
        const dx = (Math.random() * 80 - 40).toFixed(1);
        const dy = (Math.random() * -80 - 10).toFixed(1);
        return (
          <div
            key={s.id}
            className="pointer-events-none absolute"
            style={{
              left: s.x,
              top: s.y,
              width: 6,
              height: 6,
              borderRadius: 999,
              background: `hsl(${s.hue} 90% 70%)`,
              transform: "translate(-50%,-50%)",
              animation: "burst 700ms ease-out forwards",
              // @ts-ignore
              "--dx": `${dx}px`,
              "--dy": `${dy}px`,
            }}
          />
        );
      })}
    </>
  );
}

/** ---------------- Component ---------------- */
export default function GameRoadmap({ stories, progressionState, onSelectEpisode, onBack, onNavigateToFlashcards }: GameRoadmapProps) {
  // Arc structure: Arc 1 has 6 chapters, Arcs 2-5 have 5 chapters each
  const ARC_SIZES = [6, 5, 5, 5, 5]; // Total: 26 chapters
  
  // Convert stories to chapter format with arc organization
  const CHAPTERS: Chapter[] = useMemo(() => {
    return stories.map((story, idx) => {
      const progress = progressionState.episodeProgress[story.id];
      const world = idx % 3 === 0 ? "village" : idx % 3 === 1 ? "forest" : "library";
      
      const scenes: Scene[] = story.chapters.slice(0, 3).map((ch, chIdx) => ({
        id: ch.id,
        title: ch.title,
        done: progress ? progress.chaptersCompleted > chIdx : false,
      }));

      // Calculate arc and position within arc
      let arcIndex = 0;
      let chapterInArc = idx;
      let accumulated = 0;
      
      for (let i = 0; i < ARC_SIZES.length; i++) {
        if (chapterInArc < accumulated + ARC_SIZES[i]) {
          arcIndex = i;
          chapterInArc = chapterInArc - accumulated;
          break;
        }
        accumulated += ARC_SIZES[i];
      }

      // Distribute chapters along the path (0.05 to 0.95)
      const t = 0.05 + (idx / Math.max(stories.length - 1, 1)) * 0.9;

      return {
        id: story.id,
        title: story.title,
        subtitle: story.description || `Chapter ${idx}`,
        world,
        scenes,
        grammar: {
          id: `${story.id}-grammar`,
          title: "Grammar Review",
          done: progress?.completed || false,
        },
        t,
        episodeNum: idx,
      };
    });
  }, [stories, progressionState]);

  // path + travel
  const svgRef = useRef<SVGPathElement | null>(null);
  const [t, setT] = useState(CHAPTERS[0]?.t || 0);
  const [targetT, setTargetT] = useState(CHAPTERS[0]?.t || 0);
  const [active, setActive] = useState<Chapter>(CHAPTERS[0]);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [hasAutoNavigated, setHasAutoNavigated] = useState(false);

  const SPEED = 0.1; // easing speed (0..1)

  // animate to target
  useEffect(() => {
    let raf = 0;
    function step() {
      setT((prev) => {
        const diff = targetT - prev;
        const next = Math.abs(diff) < 0.0005 ? targetT : prev + diff * SPEED;
        return next;
      });
      raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [targetT]);

  // compute sprite position & facing angle
  const spritePos = useMemo(() => {
    const path = svgRef.current;
    if (!path) return { x: 0, y: 0, angle: 0 };
    const L = path.getTotalLength();
    const pt = path.getPointAtLength(L * t);
    const ahead = path.getPointAtLength(Math.min(L, L * t + 1));
    const angle = Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * (180 / Math.PI);
    return { x: pt.x, y: pt.y, angle };
  }, [t]);

  const isMoving = Math.abs(targetT - t) > 0.002;

  // sparkle when "arrived" at a node
  useEffect(() => {
    const near = CHAPTERS.find((c) => Math.abs(c.t - t) < 0.003 && Math.abs(c.t - targetT) < 0.01);
    if (!near) return;
    const cx = spritePos.x;
    const cy = spritePos.y - 30;
    const burst: Spark[] = Array.from({ length: 16 }).map((_, i) => ({
      id: ++sparkIdCounter, // Use incrementing counter for truly unique IDs
      x: cx,
      y: cy,
      hue: [275, 150, 35][i % 3],
    }));
    setSparks((prev) => [...prev, ...burst]);
    const timer = setTimeout(() => {
      setSparks((prev) => prev.slice(burst.length));
    }, 750);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetT, t]);

  // chapter progress helper (3 scenes + grammar)
  const chapterPct = (c: Chapter) => {
    const progress = progressionState.episodeProgress[c.id];
    const d = c.scenes.filter((s) => s.done).length + (c.grammar.done ? 1 : 0);
    return Math.round((d / 4) * 100);
  };

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    const allEpisodes = Object.values(progressionState.episodeProgress);
    const totalChapters = allEpisodes.reduce((sum, ep) => sum + ep.totalChapters, 0);
    const completedChapters = allEpisodes.reduce((sum, ep) => sum + ep.chaptersCompleted, 0);
    return totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
  }, [progressionState]);

  // Auto-advance to next incomplete chapter ONLY on initial load
  useEffect(() => {
    if (!hasAutoNavigated && CHAPTERS.length > 0) {
      // Find the first incomplete chapter
      const nextChapter = CHAPTERS.find(c => {
        const progress = progressionState.episodeProgress[c.id];
        return !progress || !progress.completed;
      });
      
      if (nextChapter) {
        // Auto-navigate to first incomplete chapter
        setTimeout(() => {
          setTargetT(nextChapter.t);
          setActive(nextChapter);
          setHasAutoNavigated(true);
        }, 500);
      } else {
        // All chapters completed, mark as navigated
        setHasAutoNavigated(true);
      }
    }
  }, [hasAutoNavigated, CHAPTERS, progressionState]);

  return (
    <div className={`min-h-screen ${theme.bg} text-[#2E3A28] relative overflow-hidden`}>
      {/* Header */}
      <header className="max-w-6xl mx-auto px-6 pt-8">
        <button
          onClick={onBack}
          className="mb-4 text-[#7B6AF5] hover:text-[#6B5AE5] font-semibold flex items-center gap-2 transition-colors"
        >
          ← Back to Home
        </button>
        <div className="text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold">Chapter Map</h1>
          <p className="text-[#637063] mt-2">Click a chapter — Minka walks to your chosen quest.</p>
          <div className="mt-4 flex justify-center gap-4 flex-wrap">
            {ARC_SIZES.map((size, arcIdx) => {
              const arcStart = ARC_SIZES.slice(0, arcIdx).reduce((sum, s) => sum + s, 0);
              const arcEnd = arcStart + size;
              const arcChapters = CHAPTERS.slice(arcStart, arcEnd);
              const completedInArc = arcChapters.filter(c => {
                const progress = progressionState.episodeProgress[c.id];
                return progress?.completed;
              }).length;
              
              return (
                <div key={arcIdx} className="text-xs bg-white/60 backdrop-blur px-3 py-2 rounded-lg border border-white shadow-sm">
                  <div className="font-bold text-[#7B6AF5]">Arc {arcIdx + 1}</div>
                  <div className="text-[#6A7A6A]">{completedInArc}/{size} chapters</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Overall Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl mx-auto mt-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-[#6A7A6A]">Overall Progress</span>
            <span className="text-sm font-bold text-[#7B6AF5]">{overallProgress}%</span>
          </div>
          <div className="bg-white/60 rounded-full h-3 border border-white shadow-sm overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 1, delay: 0.4 }}
              className="h-full bg-gradient-to-r from-[#BCA6FF] via-[#9AD8BA] to-[#FFD7BF] rounded-full"
            />
          </div>
        </motion.div>
      </header>

      {/* Map Canvas */}
      <section className="max-w-6xl mx-auto px-6 mt-6 relative">
        <div className="relative w-full h-[360px] rounded-[28px] border border-white/70 shadow-[0_20px_60px_rgba(20,12,60,.08)] overflow-hidden bg-gradient-to-br from-[#FFF9F3] via-[#F1ECFF] to-[#E7F7E8]">
          {/* SVG path + nodes */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 360" preserveAspectRatio="none">
            <defs>
              <linearGradient id="minkaPath" x1="0" y1="0" x2="1200" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#CBB8FF" />
                <stop offset="50%" stopColor="#9AD8BA" />
                <stop offset="100%" stopColor="#FFD7BF" />
              </linearGradient>
              <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <path
              ref={svgRef}
              d="M 40 300 C 280 170, 520 330, 720 210 C 920 100, 1080 300, 1160 160"
              fill="none"
              stroke="url(#minkaPath)"
              strokeWidth="14"
              strokeLinecap="round"
              opacity=".35"
            />

            {/* Chapter nodes */}
            {CHAPTERS.map((c, i) => {
              const path = svgRef.current;
              let x = 0, y = 0;
              if (path) {
                const L = path.getTotalLength();
                const p = path.getPointAtLength(L * c.t);
                x = p.x;
                y = p.y;
              }
              const isTarget = Math.abs(c.t - targetT) < 0.001;
              const pct = chapterPct(c);
              
              return (
                <g
                  key={c.id}
                  transform={`translate(${x},${y})`}
                  className="cursor-pointer"
                  onClick={() => {
                    setTargetT(c.t);
                    setActive(c);
                  }}
                >
                  {/* World icon vignette */}
                  <g transform="translate(-60, -140)">
                    <rect
                      x="0"
                      y="0"
                      width="120"
                      height="80"
                      rx="18"
                      fill={c.world === "village" ? "#FFF0DC" : c.world === "forest" ? "#E7F7E8" : "#F1ECFF"}
                      opacity="0.9"
                      stroke={c.world === "village" ? "#FFD8BF" : c.world === "forest" ? "#CFE8DA" : "#E1D9FF"}
                      strokeWidth="2"
                    />
                    {/* Try to load PNG image, fallback to emoji */}
                    <image
                      href={c.world === "village" ? "/images/world-village.png" : c.world === "forest" ? "/images/world-forest.png" : "/images/world-library.png"}
                      x="25"
                      y="10"
                      width="70"
                      height="60"
                      preserveAspectRatio="xMidYMid meet"
                      onError={(e) => {
                        // Hide image on error, fallback will show
                        (e.currentTarget as SVGImageElement).style.display = 'none';
                      }}
                    />
                    {/* Emoji fallback (always rendered but hidden if image loads) */}
                    <text
                      x="60"
                      y="50"
                      textAnchor="middle"
                      fontSize="32"
                      style={{ display: 'none' }}
                      className="emoji-fallback"
                    >
                      {c.world === "village" ? "🏡" : c.world === "forest" ? "🌲" : "📚"}
                    </text>
                  </g>

                  {/* pulse ring */}
                  <circle
                    r="26"
                    fill="none"
                    stroke={theme.accent[c.world]}
                    strokeOpacity={isTarget ? 0.35 : 0.18}
                    strokeWidth="3"
                    filter="url(#softGlow)"
                  >
                    {isTarget && (
                      <animate attributeName="r" values="22;26;22" dur="1.6s" repeatCount="indefinite" />
                    )}
                  </circle>

                  {/* node core */}
                  <circle r="18" fill="#fff" stroke="#EDE8FF" strokeWidth="4" />

                  {/* Chapter number */}
                  <text y="6" textAnchor="middle" fontSize="16" fill="#4D3C94" fontWeight="bold">
                    {i}
                  </text>

                  {/* Chapter label above */}
                  <text y="-30" textAnchor="middle" fontSize="10" fill="#8B86A6" fontWeight="600">
                    Ch {i}
                  </text>

                  {/* Progress indicator */}
                  {pct > 0 && pct < 100 && (
                    <text y="40" textAnchor="middle" fontSize="9" fill={theme.accent[c.world]} fontWeight="bold">
                      {pct}%
                    </text>
                  )}
                  {pct === 100 && (
                    <text y="40" textAnchor="middle" fontSize="14" fill="#41AD83">
                      ✓
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Sparkles */}
          <Sparkles sparks={sparks} />

          {/* Minka sprite (simplified cat avatar) */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: spritePos.x,
              top: spritePos.y,
              transform: `translate(-50%,-62%) rotate(${spritePos.angle}deg)`,
              transformOrigin: "center",
              width: 64,
              height: 64,
              filter: "drop-shadow(0 6px 12px rgba(0,0,0,.15))",
              transition: isMoving ? "none" : "transform 0.3s ease-out",
            }}
          >
            {/* Simple Minka Cat Avatar (SVG) */}
            <svg viewBox="0 0 64 64" className="w-16 h-16">
              {/* Body */}
              <ellipse cx="32" cy="48" rx="18" ry="12" fill="#FFF6EF" stroke="#E3D5C9" strokeWidth="2" />
              
              {/* Head */}
              <circle cx="32" cy="28" r="20" fill="#FFF6EF" stroke="#E3D5C9" strokeWidth="2" />
              
              {/* Left ear */}
              <path d="M 15 20 L 20 8 L 24 18" fill="#F3E3D9" stroke="#E3D5C9" strokeWidth="2" />
              
              {/* Right ear */}
              <path d="M 49 20 L 44 8 L 40 18" fill="#F3E3D9" stroke="#E3D5C9" strokeWidth="2" />
              
              {/* Left eye */}
              <circle cx="24" cy="26" r="3" fill="#4B3F72" />
              
              {/* Right eye */}
              <circle cx="40" cy="26" r="3" fill="#4B3F72" />
              
              {/* Nose */}
              <circle cx="32" cy="32" r="2.5" fill="#F5A6A0" />
              
              {/* Mouth (simple curve) */}
              <path d="M 32 32 Q 28 36, 24 34" stroke="#E3D5C9" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M 32 32 Q 36 36, 40 34" stroke="#E3D5C9" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              
              {/* Walking animation (legs) */}
              {isMoving && (
                <>
                  <motion.ellipse
                    cx="26"
                    cy="58"
                    rx="4"
                    ry="6"
                    fill="#FFF6EF"
                    stroke="#E3D5C9"
                    strokeWidth="1.5"
                    animate={{ y: [0, -2, 0] }}
                    transition={{ repeat: Infinity, duration: 0.4 }}
                  />
                  <motion.ellipse
                    cx="38"
                    cy="58"
                    rx="4"
                    ry="6"
                    fill="#FFF6EF"
                    stroke="#E3D5C9"
                    strokeWidth="1.5"
                    animate={{ y: [0, 2, 0] }}
                    transition={{ repeat: Infinity, duration: 0.4 }}
                  />
                </>
              )}
            </svg>
          </div>
        </div>
      </section>

      {/* Chapter panel */}
      <aside className="max-w-4xl mx-auto px-6 mt-6 pb-16">
        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl bg-white/70 backdrop-blur border border-white shadow-[0_20px_60px_rgba(20,12,60,.08)] p-5 md:p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              {(() => {
                // Calculate which arc this chapter belongs to
                let arcIndex = 0;
                let accumulated = 0;
                for (let i = 0; i < ARC_SIZES.length; i++) {
                  if (active.episodeNum < accumulated + ARC_SIZES[i]) {
                    arcIndex = i;
                    break;
                  }
                  accumulated += ARC_SIZES[i];
                }
                return (
                  <div className="inline-block bg-[#7B6AF5] text-white text-xs font-bold px-3 py-1 rounded-full mb-2">
                    Arc {arcIndex + 1}
                  </div>
                );
              })()}
              <h2 className="text-xl md:text-2xl font-extrabold">{active.title}</h2>
              <p className="text-[#7E7A95] text-sm mt-1">{active.subtitle}</p>
            </div>
            <span
              className={`hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-full border ${
                theme.chip[active.world]
              } text-sm font-semibold`}
            >
              {active.world === "village" ? "🏡 Village" : active.world === "forest" ? "🌲 Forest" : "📚 Library"}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-3 mt-4">
            {active.scenes.map((s, i) => (
              <div
                key={s.id}
                className="rounded-xl border border-[#EEE7FF] bg-white/90 p-3 text-left shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-[#2E3A28]">{s.title}</div>
                  <span className={`text-xs font-semibold ${s.done ? "text-[#41AD83]" : "text-[#CBB8FF]"}`}>
                    {s.done ? "✓ Done" : "• New"}
                  </span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-[#F1ECFF]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: s.done ? "100%" : "0%",
                      background: `linear-gradient(90deg, ${theme.accent[active.world]}, #CBB8FF)`,
                    }}
                  />
                </div>
              </div>
            ))}
            <div className="rounded-xl border border-[#E1D9FF] bg-[#F7F5FF] p-3 text-left shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-[#2E3A28]">{active.grammar.title}</div>
                <span className={`text-xs font-semibold ${active.grammar.done ? "text-[#41AD83]" : "text-[#CBB8FF]"}`}>
                  {active.grammar.done ? "✓ Done" : "• New"}
                </span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-[#EDEAFF]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: active.grammar.done ? "100%" : "0%",
                    background: "linear-gradient(90deg,#7B6AF5,#CBB8FF)",
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => onSelectEpisode(active.id)}
              className="rounded-2xl px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl transition-all bg-gradient-to-b from-[#BCA6FF] to-[#7B6AF5] hover:from-[#A794FF] hover:to-[#6A59E4]"
            >
              {(() => {
                const currentProgress = progressionState.episodeProgress[active.id];
                if (!currentProgress) return "Start Chapter →";
                if (currentProgress.completed) return "Replay Chapter →";
                if (currentProgress.chaptersCompleted > 0) return "Continue Chapter →";
                return "Start Chapter →";
              })()}
            </button>
            <button
              onClick={() => onNavigateToFlashcards?.()}
              className="rounded-2xl px-6 py-3 font-semibold border-2 border-[#E2DDFB] text-[#7B6AF5] bg-white/70 hover:bg-white transition-all"
            >
              Review words
            </button>
          </div>
        </motion.div>
      </aside>
    </div>
  );
}

