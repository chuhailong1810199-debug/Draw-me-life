'use client';

import { motion } from 'framer-motion';

interface StoryContentProps {
  chapter: number;
  title: string;
}

export default function StoryContent({ chapter, title }: StoryContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <motion.div
        className="text-center space-y-2"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="font-mono text-3xl font-bold text-amber-400 tracking-widest">
          ▶ CHAPTER {chapter}
        </h2>
        <p className="font-mono text-amber-600">{title}</p>
      </motion.div>
    </motion.div>
  );
}
