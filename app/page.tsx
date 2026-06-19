'use client';

import { useEffect, useState } from 'react';
import { useSudokuStore } from '@/store/sudokuStore';
import { SudokuBoard } from '@/components/SudokuBoard';
import { NumberPad } from '@/components/NumberPad';
import { GameControls } from '@/components/GameControls';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function Home() {
  const {
    gameStatus,
    difficulty,
    timer,
    mistakes,
    selectedCell,
    noteMode,
    isPaused,
    startGame,
    selectCell,
    setNumber,
    toggleNote,
    clearCell,
    tick,
    toggleNoteMode,
    undo,
    pauseGame,
    resumeGame,
    loadSavedGame,
    discardSavedGame,
  } = useSudokuStore();

  // Show the "continue?" dialog only on first mount if there's a saved game
  const [showContinueDialog, setShowContinueDialog] = useState(false);

  // Load saved-game timer from storage to display in the dialog
  const [savedTimer, setSavedTimer] = useState(0);
  const [savedDifficulty, setSavedDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

  // On mount (client only): check localStorage directly for a saved game.
  // Reading here — not during render — keeps SSR/client markup identical.
  useEffect(() => {
    let raw: string | null = null;
    try {
      raw = localStorage.getItem('sudoku-save');
    } catch {
      // ignore
    }
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setSavedTimer(parsed.timer ?? 0);
        setSavedDifficulty(parsed.difficulty ?? 'easy');
      } catch {
        // ignore
      }
      setShowContinueDialog(true);
    } else {
      startGame('easy');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer tick
  useEffect(() => {
    if (gameStatus !== 'playing') return;
    const interval = setInterval(() => {
      tick();
    }, 1000);
    return () => clearInterval(interval);
  }, [gameStatus, tick]);

  // Pause on visibility change / window blur
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) pauseGame();
      else resumeGame();
    };
    const onBlur = () => pauseGame();
    const onFocus = () => resumeGame();
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
    };
  }, [pauseGame, resumeGame]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStatus !== 'playing' || isPaused) return;

      // Ctrl/Cmd + Z — undo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        undo();
        return;
      }

      // Arrow keys — move selection
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const [row, col] = selectedCell ?? [4, 4];
        let newRow = row;
        let newCol = col;
        if (e.key === 'ArrowUp') newRow = Math.max(0, row - 1);
        if (e.key === 'ArrowDown') newRow = Math.min(8, row + 1);
        if (e.key === 'ArrowLeft') newCol = Math.max(0, col - 1);
        if (e.key === 'ArrowRight') newCol = Math.min(8, col + 1);
        selectCell(newRow, newCol);
        return;
      }

      // Number keys 1-9
      if (/^[1-9]$/.test(e.key)) {
        e.preventDefault();
        const num = parseInt(e.key);
        if (noteMode) {
          toggleNote(num);
        } else {
          setNumber(num);
        }
        return;
      }

      // Delete / Backspace — clear cell
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        clearCell();
        return;
      }

      // N — toggle notes mode
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        toggleNoteMode();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStatus, isPaused, selectedCell, noteMode, setNumber, toggleNote, clearCell, selectCell, toggleNoteMode, undo]);

  const isWon = gameStatus === 'won';

  return (
    <main className="min-h-screen flex flex-col items-center justify-start py-4 px-4 bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-3 w-full" style={{ maxWidth: 'min(90vw, 450px)' }}>
        {/* Controls */}
        <GameControls />

        {/* Board wrapper — shows pause overlay when paused */}
        <div className="relative shadow-md rounded-sm">
          <SudokuBoard />
          {isPaused && gameStatus === 'playing' && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 border-2 border-gray-800 dark:bg-gray-950/90 dark:border-gray-400"
              style={{ backdropFilter: 'blur(2px)' }}
            >
              <span className="text-2xl font-bold text-gray-900 mb-3 dark:text-gray-100">Paused</span>
              <Button onClick={resumeGame} variant="default">
                Resume
              </Button>
            </div>
          )}
        </div>

        {/* Number Pad */}
        <NumberPad />

        {/* Hint text */}
        <p className="text-xs text-gray-400 text-center dark:text-gray-500">
          Arrow keys to move &bull; 1–9 to enter &bull; Delete to erase &bull; N for notes &bull; Ctrl+Z to undo
        </p>
      </div>

      {/* Continue Game Dialog */}
      <Dialog
        open={showContinueDialog}
        onOpenChange={(open) => {
          if (!open) setShowContinueDialog(false);
        }}
      >
        <DialogContent className="sm:max-w-sm shadow-none border-2 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl">Continue your game?</DialogTitle>
            <DialogDescription className="text-sm">
              You have a saved{' '}
              <span className="font-semibold capitalize text-foreground">{savedDifficulty}</span>{' '}
              game at{' '}
              <span className="font-semibold text-foreground">{formatTime(savedTimer)}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-2">
            <Button
              onClick={() => {
                loadSavedGame();
                setShowContinueDialog(false);
              }}
              className="w-full"
            >
              Continue
            </Button>
            <div className="flex gap-2">
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <Button
                  key={d}
                  variant="outline"
                  className="flex-1 capitalize shadow-none"
                  onClick={() => {
                    discardSavedGame();
                    startGame(d);
                    setShowContinueDialog(false);
                  }}
                >
                  {d}
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Win Dialog */}
      <Dialog open={isWon} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-sm shadow-none border-2 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">You Won!</DialogTitle>
            <DialogDescription className="text-base text-center">
              Puzzle solved in{' '}
              <span className="font-semibold text-foreground">{formatTime(timer)}</span>{' '}
              with{' '}
              <span className="font-semibold text-foreground">{mistakes}</span>{' '}
              mistake{mistakes !== 1 ? 's' : ''}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-2">
            <Button onClick={() => startGame(difficulty)} className="w-full">
              Play Again ({difficulty})
            </Button>
            <div className="flex gap-2">
              {(['easy', 'medium', 'hard'] as const)
                .filter((d) => d !== difficulty)
                .map((d) => (
                  <Button
                    key={d}
                    variant="outline"
                    className="flex-1 capitalize shadow-none"
                    onClick={() => startGame(d)}
                  >
                    {d}
                  </Button>
                ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
