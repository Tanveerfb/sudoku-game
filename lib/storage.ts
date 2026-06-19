const SAVE_KEY = 'sudoku-save';
const LEADERBOARD_KEY = 'sudoku-leaderboard';

export interface SavedGame {
  puzzle: number[][];
  solution: number[][];
  board: number[][];
  notes: boolean[][][];
  difficulty: 'easy' | 'medium' | 'hard';
  mistakes: number;
  timer: number;
  hintsRemaining: number;
}

export interface LeaderboardEntry {
  difficulty: 'easy' | 'medium' | 'hard';
  time: number; // seconds
  mistakes: number;
  date: string; // ISO string
}

export function saveGame(state: SavedGame): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable (SSR or private browsing)
  }
}

export function loadGame(): SavedGame | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedGame;
  } catch {
    return null;
  }
}

export function clearSavedGame(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // ignore
  }
}

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LeaderboardEntry[];
  } catch {
    return [];
  }
}

export function addLeaderboardEntry(entry: LeaderboardEntry): void {
  try {
    const all = getLeaderboard();
    all.push(entry);

    // Keep top 5 per difficulty sorted by time ascending
    const filtered: LeaderboardEntry[] = [];
    for (const diff of ['easy', 'medium', 'hard'] as const) {
      const byDiff = all
        .filter((e) => e.difficulty === diff)
        // Rank by time, then fewer mistakes as the tiebreaker
        .sort((a, b) => a.time - b.time || a.mistakes - b.mistakes)
        .slice(0, 5);
      filtered.push(...byDiff);
    }

    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(filtered));
  } catch {
    // ignore
  }
}
