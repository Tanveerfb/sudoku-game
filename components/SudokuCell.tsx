'use client';

import { cn } from '@/lib/utils';

interface SudokuCellProps {
  value: number;
  isOriginal: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
  isSameNumber: boolean;
  isError: boolean;
  notes: boolean[];
  onClick: () => void;
  className?: string;
}

export function SudokuCell({
  value,
  isOriginal,
  isSelected,
  isHighlighted,
  isSameNumber,
  isError,
  notes,
  onClick,
  className,
}: SudokuCellProps) {
  const hasNotes = value === 0 && notes.some((n) => n);

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative flex items-center justify-center w-full h-full cursor-pointer select-none transition-colors duration-100',
        // Background states (priority order)
        isSelected
          ? 'bg-blue-400 dark:bg-blue-600'
          : isError
          ? 'bg-red-100 dark:bg-red-950'
          : isSameNumber && value !== 0
          ? 'bg-blue-100 dark:bg-blue-900/40'
          : isHighlighted
          ? 'bg-blue-50 dark:bg-blue-950/40'
          : 'bg-white dark:bg-gray-900',
        className,
      )}
    >
      {value !== 0 ? (
        <span
          className={cn(
            'text-lg font-semibold leading-none',
            isSelected
              ? 'text-white'
              : isError
              ? 'text-red-600 dark:text-red-400'
              : isOriginal
              ? 'text-gray-900 dark:text-gray-100'
              : 'text-blue-600 dark:text-blue-400'
          )}
        >
          {value}
        </span>
      ) : hasNotes ? (
        <div className="grid grid-cols-3 gap-0 w-full h-full p-0.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <div
              key={n}
              className={cn(
                'flex items-center justify-center text-[7px] leading-none font-medium',
                notes[n]
                  ? isSelected
                    ? 'text-white'
                    : 'text-blue-500 dark:text-blue-400'
                  : 'text-transparent'
              )}
            >
              {n}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
