'use client';

import { useState } from 'react';
import { useSudokuStore } from '@/store/sudokuStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollText, OctagonX, CircleCheck, Info } from 'lucide-react';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const ICONS = {
  error: <OctagonX size={15} className="text-red-500 shrink-0 mt-0.5" />,
  success: <CircleCheck size={15} className="text-green-500 shrink-0 mt-0.5" />,
  info: <Info size={15} className="text-blue-500 shrink-0 mt-0.5" />,
} as const;

export function ActivityLog() {
  const toastLog = useSudokuStore((s) => s.toastLog);
  const [open, setOpen] = useState(false);

  // Newest first
  const entries = [...toastLog].reverse();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="relative flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors dark:text-gray-400 dark:hover:text-gray-100"
        aria-label="Activity log"
      >
        <ScrollText size={16} />
        <span>Activity</span>
        {toastLog.length > 0 && (
          <span className="ml-0.5 inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-gray-900 text-white text-[11px] font-semibold dark:bg-gray-100 dark:text-gray-900">
            {toastLog.length}
          </span>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md shadow-none border-2 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-lg">Activity log</DialogTitle>
          <DialogDescription className="text-sm">
            Alerts shown during this game.
          </DialogDescription>
        </DialogHeader>

        {entries.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <ScrollText size={32} className="text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Nothing logged yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Mistakes and alerts will appear here as you play.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2 max-h-80 overflow-y-auto -mr-2 pr-2">
            {entries.map((e) => (
              <li
                key={e.id}
                className="flex items-start gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800/50"
              >
                {ICONS[e.type]}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 leading-snug dark:text-gray-200">{e.message}</p>
                  {e.description && (
                    <p className="text-xs text-gray-500 mt-0.5 dark:text-gray-400">{e.description}</p>
                  )}
                </div>
                <span className="text-[11px] font-mono text-gray-400 shrink-0 mt-0.5 dark:text-gray-500">
                  {formatTime(e.atSeconds)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
