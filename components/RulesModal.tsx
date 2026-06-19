'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function RulesModal() {
  return (
    <Dialog>
      <DialogTrigger
        render={<Button variant="outline" className="shadow-none border-gray-300 dark:border-gray-600" />}
      >
        Rules
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm shadow-none border-2 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl">How to Play Sudoku</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-gray-700 space-y-3 mt-1 dark:text-gray-300">
          <p>
            Fill the 9×9 grid so that every <strong>row</strong>,{' '}
            <strong>column</strong>, and <strong>3×3 box</strong> contains each
            digit from 1 to 9 exactly once.
          </p>
          <p>
            Cells with pre-filled numbers are clues and cannot be changed. Place
            the remaining digits by clicking a cell and then pressing a number key
            or tapping the number pad.
          </p>
          <p>
            Wrong entries are flagged and counted as <strong>mistakes</strong>,
            but they never end the game. Made a slip? Use <strong>Undo</strong>{' '}
            (up to 3 times) to take it back. Your time and mistake count are shown
            when you finish.
          </p>

          <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
            <p className="font-semibold text-gray-900 mb-2 dark:text-gray-100">Controls</p>
            <table className="w-full text-xs">
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                <tr>
                  <td className="py-1 pr-3 font-mono text-gray-500 dark:text-gray-400">↑ ↓ ← →</td>
                  <td className="py-1 text-gray-700 dark:text-gray-300">Move selection</td>
                </tr>
                <tr>
                  <td className="py-1 pr-3 font-mono text-gray-500 dark:text-gray-400">1 – 9</td>
                  <td className="py-1 text-gray-700 dark:text-gray-300">Enter a number</td>
                </tr>
                <tr>
                  <td className="py-1 pr-3 font-mono text-gray-500 dark:text-gray-400">Delete / Backspace</td>
                  <td className="py-1 text-gray-700 dark:text-gray-300">Erase the selected cell</td>
                </tr>
                <tr>
                  <td className="py-1 pr-3 font-mono text-gray-500 dark:text-gray-400">N</td>
                  <td className="py-1 text-gray-700 dark:text-gray-300">Toggle notes mode</td>
                </tr>
                <tr>
                  <td className="py-1 pr-3 font-mono text-gray-500 dark:text-gray-400">Ctrl/⌘ + Z</td>
                  <td className="py-1 text-gray-700 dark:text-gray-300">Undo last move (3 max)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500">
            In notes mode, numbers are recorded as small pencil marks to help you track possibilities.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
