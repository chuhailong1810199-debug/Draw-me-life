'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

interface DialogueBoxProps {
  lines: string[];
  displayedLines: number[];
  onLineDisplay: (index: number) => void;
  onSound?: (effect: 'type' | 'line_complete') => void;
  onTypingChange?: (isTyping: boolean) => void;
  completeTypingSignal?: number;
  milestoneTitle?: string;
  milestoneImage?: string;
  milestoneYear?: string;
  milestoneLocation?: string;
  footerText?: string;
}

export default function DialogueBox({
  lines,
  displayedLines,
  onLineDisplay,
  onSound,
  onTypingChange,
  completeTypingSignal = 0,
  milestoneTitle,
  milestoneImage,
  milestoneYear,
  milestoneLocation,
  footerText = '[PRESS NEXT TO CONTINUE]',
}: DialogueBoxProps) {
  const [typedText, setTypedText] = useState('');
  const [imageFailed, setImageFailed] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const completedLineKeyRef = useRef('');
  const currentLineIndex = displayedLines.length;
  const cleanLine = useMemo(() => {
    if (currentLineIndex >= lines.length) {
      return '';
    }

    return lines[currentLineIndex].replace(/^> /, '');
  }, [currentLineIndex, lines]);
  const lineKey = `${currentLineIndex}:${cleanLine}`;

  useEffect(() => {
    setTypedText('');
    completedLineKeyRef.current = '';
  }, [lineKey]);

  useEffect(() => {
    setImageFailed(false);
  }, [milestoneImage]);

  // Safety: if all lines are already displayed (e.g. after cascade), ensure isTyping=false
  useEffect(() => {
    if (currentLineIndex >= lines.length) {
      onTypingChange?.(false);
    }
  }, [currentLineIndex, lines.length, onTypingChange]);

  useEffect(() => {
    if (currentLineIndex >= lines.length) {
      onTypingChange?.(false);
      return;
    }

    onTypingChange?.(true);

    let characterIndex = 0;
    const timer = window.setInterval(() => {
      characterIndex += 1;
      const nextCharacter = cleanLine[characterIndex - 1];

      setTypedText(cleanLine.slice(0, characterIndex));

      if (nextCharacter?.trim()) {
        onSound?.('type');
      }

      if (characterIndex >= cleanLine.length) {
        window.clearInterval(timer);
        onTypingChange?.(false);

        if (completedLineKeyRef.current !== lineKey) {
          completedLineKeyRef.current = lineKey;
          onSound?.('line_complete');
          onLineDisplay(currentLineIndex);
        }
      }
    }, 24);

    return () => window.clearInterval(timer);
  }, [cleanLine, currentLineIndex, lineKey, lines.length, onLineDisplay, onSound, onTypingChange]);

  useEffect(() => {
    if (currentLineIndex >= lines.length || !cleanLine) {
      return;
    }

    if (typedText.length < cleanLine.length) {
      return;
    }

    onTypingChange?.(false);

    if (completedLineKeyRef.current !== lineKey) {
      completedLineKeyRef.current = lineKey;
      onSound?.('line_complete');
      onLineDisplay(currentLineIndex);
    }
  }, [
    cleanLine,
    currentLineIndex,
    lineKey,
    lines.length,
    onLineDisplay,
    onSound,
    onTypingChange,
    typedText,
  ]);

  useEffect(() => {
    if (currentLineIndex >= lines.length || typedText.length >= cleanLine.length) {
      return;
    }

    const timer = setTimeout(() => {
      setTypedText(cleanLine);
      onTypingChange?.(false);

      if (completedLineKeyRef.current !== lineKey) {
        completedLineKeyRef.current = lineKey;
        onSound?.('line_complete');
        onLineDisplay(currentLineIndex);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [
    cleanLine,
    currentLineIndex,
    lineKey,
    lines.length,
    onLineDisplay,
    onSound,
    onTypingChange,
    typedText,
  ]);

  useEffect(() => {
    if (!completeTypingSignal || currentLineIndex >= lines.length || !cleanLine) {
      return;
    }

    setTypedText(cleanLine);
    onTypingChange?.(false);

    if (completedLineKeyRef.current !== lineKey) {
      completedLineKeyRef.current = lineKey;
      onSound?.('line_complete');
      onLineDisplay(currentLineIndex);
    }
  }, [
    cleanLine,
    completeTypingSignal,
    currentLineIndex,
    lineKey,
    lines.length,
    onLineDisplay,
    onSound,
    onTypingChange,
  ]);

  return (
    <motion.div
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="pixel-dialogue min-w-0 rounded-lg border-4 border-amber-600 bg-slate-900/85 p-4 backdrop-blur-sm md:p-6"
      >
        <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-stretch md:gap-6">
          <motion.div
            key={milestoneImage || milestoneTitle}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 0 }}
            animate={
              shouldReduceMotion
                ? { opacity: 1 }
                : {
                    opacity: 1,
                    scale: [1, 1.025, 1],
                    y: [0, -8, 0],
                  }
            }
            whileHover={
              shouldReduceMotion
                ? undefined
                : {
                    rotateX: 1.8,
                    rotateY: -2.2,
                    scale: 1.035,
                  }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0.15, ease: 'easeOut' }
                : {
                    opacity: { duration: 0.35, ease: 'easeOut' },
                    scale: { duration: 5.2, repeat: Infinity, ease: 'easeInOut' },
                    y: { duration: 5.2, repeat: Infinity, ease: 'easeInOut' },
                    rotateX: { duration: 0.18, ease: 'easeOut' },
                    rotateY: { duration: 0.18, ease: 'easeOut' },
                  }
            }
            className="story-image-motion pixel-story-frame pixel-hover"
            aria-hidden="true"
          >
            {milestoneImage && !imageFailed ? (
              <motion.div
                className="absolute inset-0"
                animate={shouldReduceMotion ? { scale: 1 } : { scale: [1, 1.045, 1] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Image
                  src={milestoneImage}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 360px"
                  className="object-cover"
                  onError={() => setImageFailed(true)}
                />
              </motion.div>
            ) : (
              <div className="pixel-avatar" />
            )}
          </motion.div>

          <div className="min-w-0 flex-1 rounded border-2 border-amber-600/50 bg-slate-950/45 p-4">
            <div className="pixel-text-wrap min-h-[10rem] space-y-2 font-mono text-xs text-amber-200 sm:text-sm md:min-h-48 md:text-base">
              {(milestoneTitle || milestoneYear || milestoneLocation) && (
                <div className="pixel-text-wrap mb-4 border-b border-amber-600/40 pb-3">
                  {milestoneTitle && (
                    <p className="pixel-text-wrap text-sm text-amber-400 md:text-base">{milestoneTitle}</p>
                  )}
                  {(milestoneYear || milestoneLocation) && (
                    <p className="pixel-text-wrap mt-1 text-xs text-amber-600/80">
                      {[milestoneYear, milestoneLocation].filter(Boolean).join(' / ')}
                    </p>
                  )}
                </div>
              )}

              {lines.map((line, index) => {
                const cleanLine = line.replace(/^> /, '');
                const isCompleteLine = index < currentLineIndex;
                const isActiveLine = index === currentLineIndex;
                const visibleText = isCompleteLine ? cleanLine : isActiveLine ? typedText : '';
                const shouldRender = isCompleteLine || isActiveLine;
                const showCursor =
                  cleanLine === 'Health: 5/100' &&
                  (isCompleteLine || (isActiveLine && typedText.length === cleanLine.length));

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={shouldRender ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                    transition={{ duration: 0.18 }}
                    className="pixel-text-wrap relative leading-relaxed"
                  >
                    <span className="text-amber-500">{'>'}</span>
                    <span className="ml-2">{visibleText}</span>
                    {showCursor && <span className="cursor">▊</span>}
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              animate={{ opacity: displayedLines.length === lines.length ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="pixel-text-wrap mt-6 text-center text-amber-600/60 text-xs font-mono tracking-widest leading-relaxed"
            >
              {footerText}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
