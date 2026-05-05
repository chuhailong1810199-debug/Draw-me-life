'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import DialogueBox from '@/components/dialogue-box';
import GameState, { type PlayerStats } from '@/components/game-state';

type SoundEffect =
  | 'type'
  | 'line_complete'
  | 'next'
  | 'back'
  | 'restart'
  | 'complete'
  | 'choice';

type Choice = {
  id: string;
  label: string;
  description: string;
  nextId: string;
  statDelta: PlayerStats;
};

type Milestone = {
  title: string;
  dialogue: string[];
  image: string;
  year?: string;
  location?: string;
};

type StoryChapter = {
  id: string;
  title: string;
  image: string;
  milestones: Milestone[];
  nextId?: string;
  choices?: Choice[];
};

type ChoiceRecord = {
  chapterId: string;
  choiceId: string;
  label: string;
};

type HistoryEntry = {
  chapterId: string;
  milestoneIndex: number;
  displayedLines: number[];
  stats: PlayerStats;
  selectedChoices: ChoiceRecord[];
};

const INITIAL_STATS: PlayerStats = {
  fitness: 5,
  intelligence: 10,
  influence: 5,
  xp: 0,
};

const STORY_CHAPTERS: Record<string, StoryChapter> = {
  origin: {
    id: 'origin',
    title: 'The Beginning - A Couch Dweller',
    image: '/story/trung-vuong.png',
    milestones: [
      {
        title: 'Trung Vuong Primary School',
        year: 'Early Years',
        location: 'Vietnam',
        image: '/story/trung-vuong.png',
        dialogue: [
          '> My journey started in Vietnam.',
          '> I studied at Trung Vuong Primary School.',
          '> Those first classrooms became the opening map.',
        ],
      },
      {
        title: 'Tran Phu Secondary School',
        year: 'Secondary School',
        location: 'Vietnam',
        image: '/story/tran-phu.png',
        dialogue: [
          '> Then I continued at Tran Phu Secondary School.',
          '> The world grew wider, one subject at a time.',
        ],
      },
      {
        title: 'Vung Tau High School',
        year: 'High School',
        location: 'Vung Tau',
        image: '/story/vung-tau-high.png',
        dialogue: [
          '> After that, I attended Vung Tau High School.',
          '> New pressure appeared. New confidence followed.',
        ],
      },
      {
        title: 'Hoa Sen University - Marketing',
        year: 'University',
        location: 'Vietnam',
        image: '/story/hoa-sen.png',
        dialogue: [
          '> I pursued Marketing at Hoa Sen University.',
          '> I learned how people think, choose, and connect.',
        ],
      },
      {
        title: '2 Years Living in Singapore',
        year: 'Next Chapter',
        location: 'Singapore',
        image: '/story/singapore.png',
        dialogue: [
          '> Later, I spent 2 years living in Singapore.',
          '> That was where everything began to change...',
          '> A fork appeared in the quest log.',
        ],
      },
    ],
    choices: [
      {
        id: 'train-body',
        label: 'A: Train the Body',
        description: 'Choose sweat, discipline, and daily reps.',
        nextId: 'fitness-quest',
        statDelta: { fitness: 20, intelligence: 2, influence: 4, xp: 120 },
      },
      {
        id: 'train-mind',
        label: 'B: Train the Mind',
        description: 'Choose papers, prompts, and late-night experiments.',
        nextId: 'ai-awakening',
        statDelta: { fitness: 4, intelligence: 22, influence: 3, xp: 130 },
      },
    ],
  },
  'fitness-quest': {
    id: 'fitness-quest',
    title: 'Chapter 1A: The Fitness Quest',
    image: '/story/me-pixel.png',
    milestones: [
      {
        title: 'The First Rep',
        year: '2019',
        image: '/story/me-pixel.png',
        dialogue: [
          '> In January 2019, I chose the harder road.',
          '> I learned to lift. I learned to run.',
        ],
      },
      {
        title: 'Fitness Level Up',
        year: '2019',
        image: '/story/me-pixel.png',
        dialogue: [
          '> The couch lost its grip one workout at a time.',
          '> Fitness Level Up!',
          '> Health: 45/100',
        ],
      },
    ],
    choices: [
      {
        id: 'share-fitness',
        label: 'A: Share the Journey',
        description: 'Turn progress into posts and help others begin.',
        nextId: 'creator-fitness',
        statDelta: { fitness: 24, intelligence: 5, influence: 22, xp: 220 },
      },
      {
        id: 'study-ai',
        label: 'B: Study AI',
        description: 'Bring the stronger body into a sharper mind arc.',
        nextId: 'ai-awakening',
        statDelta: { fitness: 10, intelligence: 20, influence: 6, xp: 180 },
      },
    ],
  },
  'ai-awakening': {
    id: 'ai-awakening',
    title: 'Chapter 1B: The AI Awakening',
    image: '/story/me-pixel.png',
    milestones: [
      {
        title: 'First AI Spark',
        image: '/story/me-pixel.png',
        dialogue: [
          '> My mind craved growth.',
          '> I discovered AI. It fascinated me.',
        ],
      },
      {
        title: 'Skill Tree Unlocked',
        image: '/story/me-pixel.png',
        dialogue: [
          '> I read papers, built projects, experimented.',
          '> Intelligence: 60/100',
          '> A new skill tree unlocked.',
        ],
      },
    ],
    choices: [
      {
        id: 'build-public',
        label: 'A: Build in Public',
        description: 'Publish experiments and let the world respond.',
        nextId: 'creator-ai',
        statDelta: { fitness: 4, intelligence: 24, influence: 24, xp: 230 },
      },
      {
        id: 'deep-study',
        label: 'B: Deep Study',
        description: 'Stay quiet, stack knowledge, and sharpen the craft.',
        nextId: 'present-scholar',
        statDelta: { fitness: 2, intelligence: 32, influence: 8, xp: 200 },
      },
    ],
  },
  'creator-fitness': {
    id: 'creator-fitness',
    title: 'Chapter 2A: Creator Arc - Fitness',
    image: '/story/me-pixel.png',
    milestones: [
      {
        title: 'Posting the Quest Log',
        image: '/story/me-pixel.png',
        dialogue: [
          '> Then came a new calling: sharing knowledge.',
          '> I started creating content about fitness and discipline.',
        ],
      },
      {
        title: 'The Party Grew',
        image: '/story/me-pixel.png',
        dialogue: [
          '> Some watched. Some listened. Some began.',
          '> Influence +40',
          '> The party grew larger.',
        ],
      },
    ],
    nextId: 'present-athlete',
  },
  'creator-ai': {
    id: 'creator-ai',
    title: 'Chapter 2B: Creator Arc - AI',
    image: '/story/me-pixel.png',
    milestones: [
      {
        title: 'Build Log Begins',
        image: '/story/me-pixel.png',
        dialogue: [
          '> I shipped experiments into the open.',
          '> Fitness taught persistence. AI gave it a laboratory.',
        ],
      },
      {
        title: 'A Beacon Online',
        image: '/story/me-pixel.png',
        dialogue: [
          '> The posts became lessons. The lessons became momentum.',
          '> Influence +45',
          '> The build log became a beacon.',
        ],
      },
    ],
    nextId: 'present-builder',
  },
  'present-athlete': {
    id: 'present-athlete',
    title: 'The Present State - Disciplined Hero',
    image: '/story/me-pixel.png',
    milestones: [
      {
        title: 'Disciplined Hero',
        image: '/story/me-pixel.png',
        dialogue: [
          '> I am no longer that couch dweller.',
          '> Fitness became the foundation.',
          '> Intelligence followed through systems and curiosity.',
          '> Influence grew from showing the work.',
          '> The journey continues...',
        ],
      },
    ],
  },
  'present-builder': {
    id: 'present-builder',
    title: 'The Present State - AI Builder',
    image: '/story/me-pixel.png',
    milestones: [
      {
        title: 'AI Builder',
        image: '/story/me-pixel.png',
        dialogue: [
          '> I am no longer that couch dweller.',
          '> Intelligence became the engine.',
          '> Fitness kept the system alive.',
          '> Influence grew from useful experiments.',
          '> The journey continues...',
        ],
      },
    ],
  },
  'present-scholar': {
    id: 'present-scholar',
    title: 'The Present State - Quiet Scholar',
    image: '/story/me-pixel.png',
    milestones: [
      {
        title: 'Quiet Scholar',
        image: '/story/me-pixel.png',
        dialogue: [
          '> I am no longer that couch dweller.',
          '> I chose depth over noise.',
          '> The skill tree is quieter, but powerful.',
          '> The next public quest waits.',
          '> The journey continues...',
        ],
      },
    ],
  },
};

const clampStat = (value: number) => Math.max(0, Math.min(value, 100));

const applyStatDelta = (stats: PlayerStats, delta: PlayerStats): PlayerStats => ({
  fitness: clampStat(stats.fitness + delta.fitness),
  intelligence: clampStat(stats.intelligence + delta.intelligence),
  influence: clampStat(stats.influence + delta.influence),
  xp: Math.max(0, stats.xp + delta.xp),
});

export default function Home() {
  const [currentChapterId, setCurrentChapterId] = useState('origin');
  const [currentMilestoneIndex, setCurrentMilestoneIndex] = useState(0);
  const [displayedLines, setDisplayedLines] = useState<number[]>([]);
  const [stats, setStats] = useState<PlayerStats>(INITIAL_STATS);
  const [selectedChoices, setSelectedChoices] = useState<ChoiceRecord[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [choiceFeedback, setChoiceFeedback] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [completeTypingSignal, setCompleteTypingSignal] = useState(0);

  const chapter = STORY_CHAPTERS[currentChapterId];
  const milestone = chapter.milestones[currentMilestoneIndex];
  const canAdvanceMilestone = displayedLines.length === milestone.dialogue.length;
  const isLastMilestone = currentMilestoneIndex === chapter.milestones.length - 1;
  const isChapterComplete = canAdvanceMilestone && isLastMilestone;
  const hasChoices = Boolean(chapter.choices?.length);
  const canUseNext = isChapterComplete && !hasChoices;
  const progressPercentage = Math.min(((history.length + 1) / 4) * 100, 100);
  const milestoneProgressPercentage =
    ((currentMilestoneIndex + Number(canAdvanceMilestone)) / chapter.milestones.length) * 100;

  const triggerSound = useCallback((effect: SoundEffect) => {
    window.dispatchEvent(
      new CustomEvent('pixel-story:sound', {
        detail: { effect },
      }),
    );
  }, []);

  const handleDisplayLine = useCallback((lineIndex: number) => {
    setDisplayedLines((currentLines) => {
      if (currentLines.includes(lineIndex)) {
        return currentLines;
      }

      return [...currentLines, lineIndex];
    });
  }, []);

  const completeCurrentTyping = useCallback(() => {
    setCompleteTypingSignal((currentSignal) => currentSignal + 1);
  }, []);

  const pushHistory = useCallback(() => {
    setHistory((currentHistory) => [
      ...currentHistory,
      {
        chapterId: currentChapterId,
        milestoneIndex: currentMilestoneIndex,
        displayedLines,
        stats,
        selectedChoices,
      },
    ]);
  }, [currentChapterId, currentMilestoneIndex, displayedLines, selectedChoices, stats]);

  const goToChapter = useCallback((nextId: string) => {
    setCurrentChapterId(nextId);
    setCurrentMilestoneIndex(0);
    setDisplayedLines([]);
    setIsTyping(false);
    setIsComplete(false);
  }, []);

  const handleContinueMilestone = () => {
    if (isTyping || !canAdvanceMilestone) {
      triggerSound('line_complete');
      completeCurrentTyping();
      return;
    }

    if (isLastMilestone) {
      return;
    }

    triggerSound('next');
    setCurrentMilestoneIndex((currentIndex) => currentIndex + 1);
    setDisplayedLines([]);
    setIsTyping(false);
  };

  const handleNextChapter = useCallback(() => {
    if (isTyping || !canAdvanceMilestone) {
      triggerSound('line_complete');
      completeCurrentTyping();
      return;
    }

    if (!canUseNext) {
      return;
    }

    if (chapter.nextId) {
      triggerSound('next');
      pushHistory();
      setChoiceFeedback('');
      goToChapter(chapter.nextId);
      return;
    }

    triggerSound('complete');
    setIsComplete(true);
  }, [
    canAdvanceMilestone,
    canUseNext,
    chapter.nextId,
    completeCurrentTyping,
    goToChapter,
    isTyping,
    pushHistory,
    triggerSound,
  ]);

  const handleChoice = (choice: Choice) => {
    if (!isChapterComplete) {
      return;
    }

    triggerSound('choice');
    pushHistory();
    setStats((currentStats) => applyStatDelta(currentStats, choice.statDelta));
    setSelectedChoices((currentChoices) => [
      ...currentChoices,
      {
        chapterId: chapter.id,
        choiceId: choice.id,
        label: choice.label,
      },
    ]);
    setChoiceFeedback(`Choice made: ${choice.label}`);
    goToChapter(choice.nextId);
  };

  const handlePrevChapter = () => {
    const previousEntry = history[history.length - 1];

    if (!previousEntry) {
      return;
    }

    triggerSound('back');
    setCurrentChapterId(previousEntry.chapterId);
    setCurrentMilestoneIndex(previousEntry.milestoneIndex);
    setDisplayedLines(previousEntry.displayedLines);
    setIsTyping(false);
    setStats(previousEntry.stats);
    setSelectedChoices(previousEntry.selectedChoices);
    setHistory((currentHistory) => currentHistory.slice(0, -1));
    setChoiceFeedback('');
    setIsComplete(false);
  };

  const handleRestart = () => {
    triggerSound('restart');
    setCurrentChapterId('origin');
    setCurrentMilestoneIndex(0);
    setDisplayedLines([]);
    setIsTyping(false);
    setStats(INITIAL_STATS);
    setSelectedChoices([]);
    setHistory([]);
    setChoiceFeedback('');
    setIsComplete(false);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleNextChapter();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextChapter]);

  return (
    <main className="relative block w-full min-h-[100svh] bg-gradient-to-b from-slate-950/80 via-slate-900/60 to-black/80">
      <div className="fixed inset-0 z-0 opacity-5 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="app-shell">
        <AnimatePresence initial={false}>
          {!isComplete ? (
            <motion.div
              key={`${currentChapterId}-${currentMilestoneIndex}`}
              initial={false}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="relative z-10 w-full min-w-0 space-y-6"
            >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center min-w-0"
            >
              <h1 className="pixel-text-wrap font-mono text-xl sm:text-2xl md:text-4xl font-bold text-amber-400 tracking-wider mb-2 leading-relaxed">
                ▶ {chapter.title}
              </h1>
              <p className="pixel-text-wrap font-mono text-amber-600/60 text-xs sm:text-sm leading-relaxed">
                [Path {history.length + 1} / XP {stats.xp}]
              </p>
              <p className="pixel-text-wrap font-mono text-amber-300/80 text-xs leading-relaxed">
                [Milestone {currentMilestoneIndex + 1}/{chapter.milestones.length}]
              </p>
            </motion.div>

            <GameState stats={stats} level={selectedChoices.length + 1} />

            <AnimatePresence>
              {choiceFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="pixel-panel pixel-text-wrap rounded border-2 border-amber-500 bg-slate-900/80 px-4 py-3 text-center font-mono text-xs text-amber-300"
                >
                  {choiceFeedback}
                </motion.div>
              )}
            </AnimatePresence>

            <div
              className="relative z-20 touch-manipulation"
              onClick={!canAdvanceMilestone ? handleContinueMilestone : undefined}
            >
              <DialogueBox
                key={`${currentChapterId}-${currentMilestoneIndex}`}
                lines={milestone.dialogue}
                displayedLines={displayedLines}
                onLineDisplay={handleDisplayLine}
                onSound={triggerSound}
                onTypingChange={setIsTyping}
                completeTypingSignal={completeTypingSignal}
                milestoneTitle={milestone.title}
                milestoneImage={milestone.image || chapter.image}
                milestoneYear={milestone.year}
                milestoneLocation={milestone.location}
                footerText={isLastMilestone ? '[CHOOSE OR CONTINUE]' : '[PRESS CONTINUE]'}
              />
            </div>

            <div className="space-y-2">
              <div className="pixel-panel w-full bg-slate-800/80 rounded border border-amber-600/30 overflow-hidden h-2">
                <motion.div
                  key={`${currentChapterId}-${currentMilestoneIndex}-${canAdvanceMilestone}`}
                  initial={{ width: '0%' }}
                  animate={{ width: `${milestoneProgressPercentage}%` }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-yellow-500 to-amber-300"
                />
              </div>
              <p className="pixel-text-wrap text-center font-mono text-xs text-amber-600/70">
                Milestone {currentMilestoneIndex + 1}/{chapter.milestones.length}
              </p>
            </div>

            <AnimatePresence>
              {isChapterComplete && hasChoices && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  className="grid gap-3 sm:grid-cols-2"
                >
                  {chapter.choices?.map((choice) => (
                    <motion.button
                      type="button"
                      key={choice.id}
                      onClick={() => handleChoice(choice)}
                      whileHover={{
                        scale: 1.03,
                        boxShadow: '0 0 22px rgba(251, 191, 36, 0.28)',
                      }}
                      whileTap={{ scale: 0.95 }}
                      className="action-button pixel-panel pixel-text-wrap rounded border-2 border-amber-500 bg-slate-900/85 p-4 text-left font-mono text-amber-200 transition-colors hover:bg-slate-800"
                    >
                      <span className="block text-sm text-amber-400">{choice.label}</span>
                      <span className="mt-2 block text-xs leading-relaxed text-amber-200/80">
                        {choice.description}
                      </span>
                      <span className="mt-3 block text-xs leading-relaxed text-amber-500/80">
                        +{choice.statDelta.xp} XP / FIT +{choice.statDelta.fitness} / INT +
                        {choice.statDelta.intelligence} / INF +{choice.statDelta.influence}
                      </span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div className="relative z-50 flex flex-wrap gap-3 justify-center pt-4 pointer-events-auto">
              {history.length > 0 && (
                <motion.button
                  type="button"
                  onClick={handlePrevChapter}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: '0 0 18px rgba(251, 191, 36, 0.26)',
                  }}
                  whileTap={{
                    scale: 0.94,
                    boxShadow: '0 0 10px rgba(251, 191, 36, 0.2)',
                  }}
                  className="action-button pixel-text-wrap relative z-50 px-5 sm:px-6 py-2 bg-amber-600 hover:bg-amber-500 text-slate-900 font-mono font-bold rounded border-2 border-amber-400 transition-colors shadow-[0_0_12px_rgba(245,158,11,0.16)]"
                >
                  ◀ BACK
                </motion.button>
              )}

              {(!isLastMilestone || !canAdvanceMilestone) && (
                <motion.button
                  type="button"
                  onClick={handleContinueMilestone}
                  whileHover={
                    {
                      scale: 1.07,
                      boxShadow: '0 0 22px rgba(251, 191, 36, 0.34)',
                    }
                  }
                  whileTap={{ scale: 0.93 }}
                  className="action-button pixel-text-wrap relative z-50 cursor-pointer px-5 sm:px-6 py-2 font-mono font-bold rounded border-2 transition-colors bg-amber-400 hover:bg-amber-300 text-slate-900 border-amber-200 shadow-[0_0_14px_rgba(245,158,11,0.22)]"
                >
                  CONTINUE ▶
                </motion.button>
              )}

              {!hasChoices && (
                <motion.button
                  type="button"
                  onClick={handleNextChapter}
                  whileHover={
                    {
                      scale: 1.07,
                      boxShadow: '0 0 22px rgba(251, 191, 36, 0.34)',
                    }
                  }
                  whileTap={{
                    scale: 0.93,
                    boxShadow: '0 0 12px rgba(251, 191, 36, 0.24)',
                  }}
                  className="action-button pixel-text-wrap relative z-50 px-5 sm:px-6 py-2 font-mono font-bold rounded border-2 transition-colors bg-amber-400 hover:bg-amber-300 text-slate-900 border-amber-200 cursor-pointer shadow-[0_0_14px_rgba(245,158,11,0.22)]"
                >
                  {chapter.nextId ? 'NEXT ▶' : 'FINISH ★'}
                </motion.button>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pixel-panel w-full bg-slate-800/80 rounded border border-amber-600/30 overflow-hidden h-2"
            >
              <motion.div
                key={currentChapterId}
                initial={{ width: '0%' }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300"
              />
            </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="complete"
              initial={false}
              animate={{ opacity: 1, scale: 1 }}
              className="relative z-10 w-full min-w-0 space-y-6 text-center"
            >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <h1 className="pixel-text-wrap font-mono text-3xl md:text-5xl font-bold text-amber-400 tracking-wider mb-4 leading-relaxed">
                ★ QUEST COMPLETE ★
              </h1>
              <p className="pixel-text-wrap font-mono text-amber-300 text-base sm:text-lg leading-relaxed">
                [{selectedChoices.map((choice) => choice.label.replace(/^[AB]: /, '')).join(' / ') || 'Main Path'}]
              </p>
            </motion.div>

            <div className="pixel-panel pixel-text-wrap bg-slate-800/70 border-2 border-amber-500 p-6 rounded space-y-3 font-mono text-amber-200 leading-relaxed">
              <p>Final Stats:</p>
              <p className="text-red-400">Fitness: {stats.fitness}/100</p>
              <p className="text-blue-400">Intelligence: {stats.intelligence}/100</p>
              <p className="text-green-400">Influence: {stats.influence}/100</p>
              <p className="text-amber-400">XP: {stats.xp}</p>
              <p className="text-amber-300 mt-6">The journey continues...</p>
            </div>

            <motion.button
              type="button"
              onClick={handleRestart}
              whileHover={{
                scale: 1.05,
                boxShadow: '0 0 22px rgba(251, 191, 36, 0.34)',
              }}
              whileTap={{
                scale: 0.94,
                boxShadow: '0 0 12px rgba(251, 191, 36, 0.24)',
              }}
              className="action-button pixel-text-wrap px-6 sm:px-8 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-mono font-bold rounded border-2 border-amber-300 transition-colors shadow-[0_0_14px_rgba(245,158,11,0.22)]"
            >
              RESTART ↻
            </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
