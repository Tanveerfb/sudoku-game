export type Difficulty = 'easy' | 'medium' | 'hard';

// Returns true if placing `num` at (row, col) is valid given the current board state
export function isValidMove(
  board: number[][],
  row: number,
  col: number,
  num: number
): boolean {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (c !== col && board[row][c] === num) return false;
  }
  // Check column
  for (let r = 0; r < 9; r++) {
    if (r !== row && board[r][col] === num) return false;
  }
  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== row || c !== col) && board[r][c] === num) return false;
    }
  }
  return true;
}

// Explain why placing `num` at (row, col) is wrong. Returns a short,
// human-readable reason. Detects direct rule conflicts (same number in the
// row, column, or 3x3 box); otherwise the move is rule-legal but does not
// match the puzzle's unique solution.
export function explainMistake(
  board: number[][],
  row: number,
  col: number,
  num: number
): string {
  const inRow = board.some((_, c) => c !== col && board[row][c] === num);
  const inCol = board.some((_, r) => r !== row && board[r][col] === num);

  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  let inBox = false;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== row || c !== col) && board[r][c] === num) inBox = true;
    }
  }

  const places: string[] = [];
  if (inRow) places.push('row');
  if (inCol) places.push('column');
  if (inBox) places.push('3×3 box');

  if (places.length > 0) {
    const list =
      places.length === 1
        ? places[0]
        : places.slice(0, -1).join(', ') + ' and ' + places[places.length - 1];
    return `There's already a ${num} in this ${list}.`;
  }

  return `${num} doesn't fit here — it would make the puzzle unsolvable.`;
}

// Deep clone a 9x9 board
function cloneBoard(board: number[][]): number[][] {
  return board.map((row) => [...row]);
}

// Shuffle an array in place (Fisher-Yates)
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Backtracking solver — fills `board` in place, returns true if solved
function solve(board: number[][]): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of nums) {
          if (isValidMove(board, row, col, num)) {
            board[row][col] = num;
            if (solve(board)) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true; // all cells filled
}

// Count solutions — stop after 2 (used to verify uniqueness)
function countSolutions(board: number[][], limit = 2): number {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        let count = 0;
        for (let num = 1; num <= 9; num++) {
          if (isValidMove(board, row, col, num)) {
            board[row][col] = num;
            count += countSolutions(board, limit - count);
            board[row][col] = 0;
            if (count >= limit) return count;
          }
        }
        return count;
      }
    }
  }
  return 1; // fully filled = one solution
}

// Number of clues left on the puzzle per difficulty
const CLUE_COUNTS: Record<Difficulty, number> = {
  easy: 36,
  medium: 28,
  hard: 22,
};

export function generatePuzzle(difficulty: Difficulty): {
  puzzle: number[][];
  solution: number[][];
} {
  // Generate a complete solved grid
  const solution: number[][] = Array.from({ length: 9 }, () =>
    Array(9).fill(0)
  );
  solve(solution);

  // Start with the full solution and remove cells
  const puzzle = cloneBoard(solution);
  const cells = shuffle(
    Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9])
  );

  const targetClues = CLUE_COUNTS[difficulty];
  let cluesLeft = 81;

  for (const [r, c] of cells) {
    if (cluesLeft <= targetClues) break;
    const backup = puzzle[r][c];
    puzzle[r][c] = 0;

    // Verify the puzzle still has a unique solution
    const copy = cloneBoard(puzzle);
    if (countSolutions(copy) !== 1) {
      // Restore cell if removing it breaks uniqueness
      puzzle[r][c] = backup;
    } else {
      cluesLeft--;
    }
  }

  return { puzzle, solution };
}

// Returns true when every player-entered value matches the solution
export function isBoardComplete(
  board: number[][],
  solution: number[][]
): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== solution[r][c]) return false;
    }
  }
  return true;
}
