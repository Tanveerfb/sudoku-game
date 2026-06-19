'use client';

import { useSudokuStore } from '@/store/sudokuStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function NumberPad() {
  const { solution, board, puzzle, selectedCell, noteMode, setNumber, clearCell, toggleNoteMode, undo, undosRemaining, history, gameStatus } =
    useSudokuStore();

  // Count how many of each number have been correctly placed
  const usedCounts = Array(10).fill(0);
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = board[r][c];
      if (v > 0 && board[r][c] === solution[r][c]) {
        usedCounts[v]++;
      }
    }
  }

  const isActive = gameStatus === 'playing';
  const selectedIsEditable =
    selectedCell != null && puzzle[selectedCell[0]][selectedCell[1]] === 0;

  return (
    <div className="flex flex-col items-center gap-3 w-full" style={{ maxWidth: 'min(90vw, 450px)' }}>
      {/* Number buttons */}
      <div className="grid grid-cols-9 gap-1 w-full">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
          const remaining = 9 - usedCounts[num];
          const depleted = remaining <= 0;
          return (
            <button
              key={num}
              onClick={() => {
                if (!isActive || !selectedIsEditable) return;
                if (noteMode) {
                  useSudokuStore.getState().toggleNote(num);
                } else {
                  setNumber(num);
                }
              }}
              disabled={!isActive || depleted}
              className={cn(
                'relative flex flex-col items-center justify-center rounded-md border-2 transition-all duration-100 font-bold',
                'aspect-square text-base',
                depleted
                  ? 'opacity-30 cursor-not-allowed border-gray-200 dark:border-gray-700'
                  : isActive
                  ? 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer active:scale-95'
                  : 'border-gray-200 dark:border-gray-700 cursor-not-allowed',
                'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100'
              )}
            >
              <span className="text-sm sm:text-base leading-none">{num}</span>
              {!depleted && (
                <span className="text-[9px] text-gray-400 dark:text-gray-500 leading-none mt-0.5">
                  {remaining}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Erase + Undo + Note Mode */}
      <div className="flex gap-2 w-full">
        <Button
          variant="outline"
          className="flex-1 gap-1"
          onClick={() => { if (isActive) clearCell(); }}
          disabled={!isActive}
        >
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
            <path d="M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z" />
            <line x1="18" x2="12" y1="9" y2="15" />
            <line x1="12" x2="18" y1="9" y2="15" />
          </svg>
          Erase
        </Button>
        <Button
          variant="outline"
          className="flex-1 gap-1"
          onClick={() => { if (isActive) undo(); }}
          disabled={!isActive || undosRemaining <= 0 || history.length === 0}
          title={`${undosRemaining} undo${undosRemaining !== 1 ? 's' : ''} left`}
        >
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
            <path d="M9 14 4 9l5-5" />
            <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
          </svg>
          Undo ({undosRemaining})
        </Button>
        <Button
          variant={noteMode ? 'default' : 'outline'}
          className="flex-1 gap-1"
          onClick={() => { if (isActive) toggleNoteMode(); }}
          disabled={!isActive}
        >
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
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
          </svg>
          Notes {noteMode ? '(On)' : '(Off)'}
        </Button>
      </div>
    </div>
  );
}
