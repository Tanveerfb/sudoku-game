'use client';

import { useSudokuStore } from '@/store/sudokuStore';
import { Button } from '@/components/ui/button';
import { RulesModal } from '@/components/RulesModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Difficulty } from '@/lib/sudoku';
import { Lightbulb } from 'lucide-react';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function GameControls() {
  const { difficulty, mistakes, timer, gameStatus, hintsRemaining, startGame, useHint } =
    useSudokuStore();

  const isPlaying = gameStatus === 'playing';

  return (
    <div className="flex flex-col gap-2 w-full" style={{ maxWidth: 'min(90vw, 450px)' }}>
      {/* Row 1: Actions */}
      <div className="flex items-center gap-2">
        <Select
          value={difficulty}
          onValueChange={(val) => startGame(val as Difficulty)}
        >
          <SelectTrigger className="w-28 shadow-none border-gray-300 dark:border-gray-600">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="shadow-none border-gray-300 dark:border-gray-600">
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => startGame(difficulty)} variant="default" className="shadow-none">
          New Game
        </Button>
        <RulesModal />
      </div>

      {/* Row 2: Stats */}
      <div className="flex items-center gap-3">
        {/* Mistakes counter */}
        <div
          className="flex items-center gap-1"
          title={`${mistakes} mistake${mistakes !== 1 ? 's' : ''}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={mistakes > 0 ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}
          >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{mistakes}</span>
        </div>

        <div className="flex-1" />

        {/* Hint button */}
        <button
          onClick={() => {
            if (isPlaying && hintsRemaining > 0) useHint();
          }}
          disabled={!isPlaying || hintsRemaining <= 0}
          title={`${hintsRemaining} hint${hintsRemaining !== 1 ? 's' : ''} left`}
          className={
            'flex items-center gap-1 px-2 py-1 text-xs font-medium border rounded transition-colors ' +
            (isPlaying && hintsRemaining > 0
              ? 'border-amber-400 bg-amber-50 text-amber-700 hover:bg-amber-100 cursor-pointer dark:border-amber-500/50 dark:bg-amber-950/40 dark:text-amber-400 dark:hover:bg-amber-950/70'
              : 'border-gray-200 bg-white text-gray-300 cursor-not-allowed dark:border-gray-700 dark:bg-gray-900 dark:text-gray-600')
          }
        >
          <Lightbulb size={13} />
          <span>{hintsRemaining}</span>
        </button>

        {/* Timer */}
        <div className="flex items-center gap-1 text-sm font-mono font-medium text-gray-700 dark:text-gray-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {gameStatus === 'idle' ? '00:00' : formatTime(timer)}
        </div>
      </div>
    </div>
  );
}
