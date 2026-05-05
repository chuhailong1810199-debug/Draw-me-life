'use client';

import { motion } from 'framer-motion';

export type PlayerStats = {
  fitness: number;
  intelligence: number;
  influence: number;
  xp: number;
};

interface GameStateProps {
  stats: PlayerStats;
  level: number;
}

export default function GameState({ stats, level }: GameStateProps) {
  const StatBar = ({
    label,
    value,
    color,
  }: {
    label: string;
    value: number;
    color: string;
  }) => (
    <motion.div
      key={`${label}-${value}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-1"
    >
      <div className="flex min-w-0 flex-wrap justify-between gap-1 text-xs md:text-sm font-mono">
        <span className="pixel-text-wrap text-amber-300">{label}</span>
        <motion.span
          key={value}
          initial={{ scale: 1.18 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.25 }}
          className={`pixel-text-wrap ${color}`}
        >
          {value}/100
        </motion.span>
      </div>
      <div className="w-full bg-slate-700 rounded border border-slate-600 overflow-hidden h-3">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.75, delay: 0.08, ease: 'easeOut' }}
          className={`h-full ${
            color === 'text-red-400'
              ? 'bg-red-500'
              : color === 'text-blue-400'
                ? 'bg-blue-500'
                : 'bg-green-500'
          }`}
        />
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="pixel-panel min-w-0 bg-slate-800/70 border-2 border-amber-600/50 rounded-lg p-4 space-y-3"
    >
      <div className="grid min-w-0 grid-cols-2 md:grid-cols-4 gap-3">
        <div className="text-center min-w-0">
          <p className="pixel-text-wrap text-xs font-mono text-amber-600/70 uppercase tracking-wide">Level</p>
          <motion.p
            key={level}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.3 }}
            className="text-2xl font-bold text-amber-400 font-mono"
          >
            {level}
          </motion.p>
        </div>
        <div className="text-center min-w-0">
          <p className="pixel-text-wrap text-xs font-mono text-amber-600/70 uppercase tracking-wide">XP</p>
          <motion.p
            key={stats.xp}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.3 }}
            className="text-2xl font-bold text-amber-400 font-mono"
          >
            {stats.xp}
          </motion.p>
        </div>
        <div className="col-span-2 min-w-0">
          <p className="pixel-text-wrap text-xs font-mono text-amber-600/70 uppercase tracking-wide mb-2">
            Character Stats
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        <StatBar label="Fitness" value={stats.fitness} color="text-red-400" />
        <StatBar label="Intelligence" value={stats.intelligence} color="text-blue-400" />
        <StatBar label="Influence" value={stats.influence} color="text-green-400" />
      </div>
    </motion.div>
  );
}
