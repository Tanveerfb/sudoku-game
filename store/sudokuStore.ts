import { create } from 'zustand';
import { toast } from 'sonner';
import {
  generatePuzzle,
  isBoardComplete,
  explainMistake,
  type Difficulty,
} from '@/lib/sudoku';
import {
  saveGame,
  loadGame,
  clearSavedGame,
  addLeaderboardEntry,
} from '@/lib/storage';

export interface ToastLogEntry {
  id: number;
  type: 'error' | 'success' | 'info';
  message: string;
  description?: string;
  atSeconds: number;
}

interface HistoryEntry {
  board: number[][];
  notes: boolean[][][];
  mistakes: number;
  selectedCell: [number, number] | null;
}

const MAX_UNDO = 3;

let toastIdCounter = 0;

function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// Snapshot the reversible parts of the current state for the undo stack
function snapshot(s: SudokuState): HistoryEntry {
  return {
    board: s.board.map((r) => [...r]),
    notes: s.notes.map((r) => r.map((c) => [...c])),
    mistakes: s.mistakes,
    selectedCell: s.selectedCell ? [...s.selectedCell] : null,
  };
}

function emptyNotes(): boolean[][][] {
  return Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => Array(10).fill(false))
  );
}

function emptyBoard(): number[][] {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

const HINTS_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 5,
  medium: 3,
  hard: 1,
};

export interface SudokuState {
  puzzle: number[][];
  solution: number[][];
  board: number[][];
  notes: boolean[][][];
  selectedCell: [number, number] | null;
  difficulty: Difficulty;
  gameStatus: 'idle' | 'playing' | 'won';
  mistakes: number;
  timer: number;
  noteMode: boolean;
  hintsRemaining: number;
  isPaused: boolean;
  hasSavedGame: boolean;
  toastLog: ToastLogEntry[];
  history: HistoryEntry[];
  undosRemaining: number;

  // Actions
  notify: (type: ToastLogEntry['type'], message: string, description?: string) => void;
  undo: () => void;
  startGame: (difficulty: Difficulty) => void;
  selectCell: (row: number, col: number) => void;
  setNumber: (num: number) => void;
  toggleNote: (num: number) => void;
  clearCell: () => void;
  tick: () => void;
  toggleNoteMode: () => void;
  useHint: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  saveCurrentGame: () => void;
  loadSavedGame: () => void;
  discardSavedGame: () => void;
}

export const useSudokuStore = create<SudokuState>((set, get) => ({
  puzzle: emptyBoard(),
  solution: emptyBoard(),
  board: emptyBoard(),
  notes: emptyNotes(),
  selectedCell: null,
  difficulty: 'easy',
  gameStatus: 'idle',
  mistakes: 0,
  timer: 0,
  noteMode: false,
  hintsRemaining: 5,
  isPaused: false,
  // Always false on init to keep SSR and client markup identical.
  // The page detects a saved game in a mount effect (client-only).
  hasSavedGame: false,
  toastLog: [],
  history: [],
  undosRemaining: MAX_UNDO,

  // Show a toast and record it in the per-game activity log
  notify: (type, message, description) => {
    const fn =
      type === 'error' ? toast.error : type === 'success' ? toast.success : toast.info;
    fn(message, description ? { description } : undefined);
    set((s) => ({
      toastLog: [
        ...s.toastLog,
        { id: ++toastIdCounter, type, message, description, atSeconds: s.timer },
      ],
    }));
  },

  // Revert the last move. Restores the board, notes, and mistake count from
  // before the move — so an undo on a wrong entry also erases that mistake.
  undo: () => {
    const { history, undosRemaining, gameStatus } = get();
    if (gameStatus !== 'playing' || undosRemaining <= 0 || history.length === 0) return;

    const prev = history[history.length - 1];
    set({
      board: prev.board,
      notes: prev.notes,
      mistakes: prev.mistakes,
      selectedCell: prev.selectedCell,
      history: history.slice(0, -1),
      undosRemaining: undosRemaining - 1,
    });

    const s = get();
    saveGame({
      puzzle: s.puzzle,
      solution: s.solution,
      board: s.board,
      notes: s.notes,
      difficulty: s.difficulty,
      mistakes: s.mistakes,
      timer: s.timer,
      hintsRemaining: s.hintsRemaining,
    });
  },

  startGame: (difficulty: Difficulty) => {
    const { puzzle, solution } = generatePuzzle(difficulty);
    clearSavedGame();
    set({
      puzzle,
      solution,
      board: puzzle.map((row) => [...row]),
      notes: emptyNotes(),
      selectedCell: null,
      difficulty,
      gameStatus: 'playing',
      mistakes: 0,
      timer: 0,
      noteMode: false,
      hintsRemaining: HINTS_BY_DIFFICULTY[difficulty],
      isPaused: false,
      hasSavedGame: false,
      toastLog: [],
      history: [],
      undosRemaining: MAX_UNDO,
    });
  },

  selectCell: (row: number, col: number) => {
    set({ selectedCell: [row, col] });
  },

  setNumber: (num: number) => {
    const { selectedCell, puzzle, solution, board, notes, mistakes, gameStatus, difficulty, timer } = get();
    if (!selectedCell || gameStatus !== 'playing') return;
    const [row, col] = selectedCell;

    // Cannot overwrite original clues
    if (puzzle[row][col] !== 0) return;

    // Snapshot pre-move state for undo
    const prev = snapshot(get());

    const newBoard = board.map((r) => [...r]);
    const newNotes = notes.map((r) => r.map((c) => [...c]));

    newBoard[row][col] = num;
    // Clear notes in this cell when entering a number
    newNotes[row][col] = Array(10).fill(false);

    let newMistakes = mistakes;
    let newStatus: SudokuState['gameStatus'] = 'playing';

    if (num !== solution[row][col]) {
      newMistakes += 1;
      // Explain the mistake against the board *before* this number was placed
      const reason = explainMistake(board, row, col, num);
      get().notify(
        'error',
        reason,
        `${newMistakes} mistake${newMistakes !== 1 ? 's' : ''} so far.`
      );
    } else {
      // Check win condition
      if (isBoardComplete(newBoard, solution)) {
        newStatus = 'won';
        addLeaderboardEntry({
          difficulty,
          time: timer,
          mistakes: newMistakes,
          date: new Date().toISOString(),
        });
      }
    }

    set({
      board: newBoard,
      notes: newNotes,
      mistakes: newMistakes,
      gameStatus: newStatus,
      history: [...get().history, prev].slice(-MAX_UNDO),
    });

    // Celebrate a win in the activity log with the final stats
    if (newStatus === 'won') {
      get().notify(
        'success',
        'Puzzle solved!',
        `${formatClock(timer)} · ${newMistakes} mistake${newMistakes !== 1 ? 's' : ''}`
      );
    }

    // Persist after state update
    if (newStatus === 'playing') {
      const s = get();
      saveGame({
        puzzle: s.puzzle,
        solution: s.solution,
        board: newBoard,
        notes: newNotes,
        difficulty: s.difficulty,
        mistakes: newMistakes,
        timer: s.timer,
        hintsRemaining: s.hintsRemaining,
      });
    }
  },

  toggleNote: (num: number) => {
    const { selectedCell, puzzle, board, notes, gameStatus } = get();
    if (!selectedCell || gameStatus !== 'playing') return;
    const [row, col] = selectedCell;

    // Cannot add notes to filled cells or original clues
    if (puzzle[row][col] !== 0 || board[row][col] !== 0) return;

    const prev = snapshot(get());
    const newNotes = notes.map((r) => r.map((c) => [...c]));
    newNotes[row][col][num] = !newNotes[row][col][num];
    set({
      notes: newNotes,
      history: [...get().history, prev].slice(-MAX_UNDO),
    });

    const s = get();
    saveGame({
      puzzle: s.puzzle,
      solution: s.solution,
      board: s.board,
      notes: newNotes,
      difficulty: s.difficulty,
      mistakes: s.mistakes,
      timer: s.timer,
      hintsRemaining: s.hintsRemaining,
    });
  },

  clearCell: () => {
    const { selectedCell, puzzle, board, notes, gameStatus } = get();
    if (!selectedCell || gameStatus !== 'playing') return;
    const [row, col] = selectedCell;

    // Cannot clear original clues
    if (puzzle[row][col] !== 0) return;

    // Nothing to undo if the cell is already empty with no notes
    const hadContent = board[row][col] !== 0 || notes[row][col].some((n) => n);

    const prev = snapshot(get());
    const newBoard = board.map((r) => [...r]);
    const newNotes = notes.map((r) => r.map((c) => [...c]));
    newBoard[row][col] = 0;
    newNotes[row][col] = Array(10).fill(false);
    set({
      board: newBoard,
      notes: newNotes,
      ...(hadContent
        ? { history: [...get().history, prev].slice(-MAX_UNDO) }
        : {}),
    });

    const s = get();
    saveGame({
      puzzle: s.puzzle,
      solution: s.solution,
      board: newBoard,
      notes: newNotes,
      difficulty: s.difficulty,
      mistakes: s.mistakes,
      timer: s.timer,
      hintsRemaining: s.hintsRemaining,
    });
  },

  tick: () => {
    const { gameStatus, isPaused } = get();
    if (gameStatus === 'playing' && !isPaused) {
      set((state) => ({ timer: state.timer + 1 }));
    }
  },

  toggleNoteMode: () => {
    set((state) => ({ noteMode: !state.noteMode }));
  },

  useHint: () => {
    const { board, puzzle, solution, notes, gameStatus, hintsRemaining, difficulty, timer, mistakes } = get();
    if (gameStatus !== 'playing' || hintsRemaining <= 0) return;

    // Find all cells where board[r][c] === 0 and puzzle[r][c] === 0
    const emptyCells: [number, number][] = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0 && puzzle[r][c] === 0) {
          emptyCells.push([r, c]);
        }
      }
    }

    if (emptyCells.length === 0) return;

    // Pick a random empty cell
    const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];

    const newBoard = board.map((r) => [...r]);
    const newNotes = notes.map((r) => r.map((c) => [...c]));
    newBoard[row][col] = solution[row][col];
    newNotes[row][col] = Array(10).fill(false);

    const newHintsRemaining = hintsRemaining - 1;

    let newStatus: SudokuState['gameStatus'] = 'playing';
    if (isBoardComplete(newBoard, solution)) {
      newStatus = 'won';
      addLeaderboardEntry({
        difficulty,
        time: timer,
        mistakes,
        date: new Date().toISOString(),
      });
    }

    set({
      board: newBoard,
      notes: newNotes,
      hintsRemaining: newHintsRemaining,
      gameStatus: newStatus,
    });

    if (newStatus === 'playing') {
      const s = get();
      saveGame({
        puzzle: s.puzzle,
        solution: s.solution,
        board: newBoard,
        notes: newNotes,
        difficulty: s.difficulty,
        mistakes: s.mistakes,
        timer: s.timer,
        hintsRemaining: newHintsRemaining,
      });
    } else if (newStatus === 'won') {
      get().notify(
        'success',
        'Puzzle solved!',
        `${formatClock(timer)} · ${mistakes} mistake${mistakes !== 1 ? 's' : ''}`
      );
    }
  },

  pauseGame: () => {
    const { gameStatus } = get();
    if (gameStatus === 'playing') {
      set({ isPaused: true });
    }
  },

  resumeGame: () => {
    set({ isPaused: false });
  },

  saveCurrentGame: () => {
    const s = get();
    if (s.gameStatus !== 'playing') return;
    saveGame({
      puzzle: s.puzzle,
      solution: s.solution,
      board: s.board,
      notes: s.notes,
      difficulty: s.difficulty,
      mistakes: s.mistakes,
      timer: s.timer,
      hintsRemaining: s.hintsRemaining,
    });
    set({ hasSavedGame: true });
  },

  loadSavedGame: () => {
    const saved = loadGame();
    if (!saved) return;
    set({
      puzzle: saved.puzzle,
      solution: saved.solution,
      board: saved.board,
      notes: saved.notes,
      difficulty: saved.difficulty,
      mistakes: saved.mistakes,
      timer: saved.timer,
      hintsRemaining: saved.hintsRemaining,
      gameStatus: 'playing',
      isPaused: false,
      hasSavedGame: true,
      selectedCell: null,
      noteMode: false,
      toastLog: [],
      history: [],
      undosRemaining: MAX_UNDO,
    });
  },

  discardSavedGame: () => {
    clearSavedGame();
    set({ hasSavedGame: false });
  },
}));

