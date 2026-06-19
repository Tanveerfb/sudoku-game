'use client';

import { useSudokuStore } from '@/store/sudokuStore';
import { SudokuCell } from './SudokuCell';
import { cn } from '@/lib/utils';

export function SudokuBoard() {
  const { board, puzzle, solution, notes, selectedCell, gameStatus, selectCell } =
    useSudokuStore();

  const selectedRow = selectedCell ? selectedCell[0] : -1;
  const selectedCol = selectedCell ? selectedCell[1] : -1;
  const selectedValue =
    selectedCell ? board[selectedCell[0]][selectedCell[1]] : 0;

  return (
    <div
      className="border-2 border-gray-800 dark:border-gray-400"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(9, 1fr)',
        gridTemplateRows: 'repeat(9, 1fr)',
        width: 'min(90vw, 450px)',
        height: 'min(90vw, 450px)',
      }}
    >
      {board.map((row, r) =>
        row.map((cellValue, c) => {
          const isSelected = r === selectedRow && c === selectedCol;
          const isHighlighted =
            !isSelected &&
            (r === selectedRow ||
              c === selectedCol ||
              (Math.floor(r / 3) === Math.floor(selectedRow / 3) &&
                Math.floor(c / 3) === Math.floor(selectedCol / 3)));
          const isSameNumber =
            !isSelected && selectedValue !== 0 && cellValue === selectedValue;
          const isOriginal = puzzle[r][c] !== 0;
          const isError =
            !isOriginal &&
            cellValue !== 0 &&
            cellValue !== solution[r][c];

          // Thin inner lines; thick every 3rd for box borders
          const borderR = c !== 8
            ? (c + 1) % 3 === 0 ? 'border-r-2 border-r-gray-700 dark:border-r-gray-500' : 'border-r border-r-gray-300 dark:border-r-gray-700'
            : '';
          const borderB = r !== 8
            ? (r + 1) % 3 === 0 ? 'border-b-2 border-b-gray-700 dark:border-b-gray-500' : 'border-b border-b-gray-300 dark:border-b-gray-700'
            : '';

          return (
            <SudokuCell
              key={`${r}-${c}`}
              value={cellValue}
              isOriginal={isOriginal}
              isSelected={isSelected}
              isHighlighted={isHighlighted}
              isSameNumber={isSameNumber}
              isError={isError}
              notes={notes[r][c]}
              className={cn(borderR, borderB)}
              onClick={() => {
                if (gameStatus === 'playing') selectCell(r, c);
              }}
            />
          );
        })
      )}
    </div>
  );
}
