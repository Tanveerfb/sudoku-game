'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getLeaderboard, type LeaderboardEntry } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

const DIFFICULTY_ORDER = ['easy', 'medium', 'hard'] as const;
type Difficulty = (typeof DIFFICULTY_ORDER)[number];

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    setEntries(getLeaderboard());
  }, []);

  const byDifficulty = DIFFICULTY_ORDER.reduce<Record<Difficulty, LeaderboardEntry[]>>(
    (acc, d) => {
      acc[d] = entries
        .filter((e) => e.difficulty === d)
        // Rank by time, then fewer mistakes as the tiebreaker
        .sort((a, b) => a.time - b.time || a.mistakes - b.mistakes);
      return acc;
    },
    { easy: [], medium: [], hard: [] }
  );

  const badgeVariant: Record<Difficulty, 'default' | 'secondary' | 'destructive'> = {
    easy: 'secondary',
    medium: 'default',
    hard: 'destructive',
  };

  return (
    <main className="min-h-screen flex flex-col items-center py-8 px-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-lg flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" className="shadow-none border-gray-300 text-sm dark:border-gray-600">
              ← Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Leaderboard</h1>
        </div>

        {entries.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 dark:text-gray-600">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
            <p className="text-gray-500 text-sm font-medium dark:text-gray-400">No completed games yet</p>
            <p className="text-gray-400 text-xs dark:text-gray-500">Finish a puzzle to see your best times here</p>
            <Link href="/" className="mt-2">
              <Button variant="outline" className="shadow-none border-gray-300 text-sm dark:border-gray-600">
                Play Now
              </Button>
            </Link>
          </div>
        ) : (
          DIFFICULTY_ORDER.map((diff) => {
            const rows = byDifficulty[diff];
            if (rows.length === 0) return null;
            return (
              <Card key={diff} className="shadow-sm border border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold capitalize text-gray-900 dark:text-gray-100">
                    <Badge variant={badgeVariant[diff]} className="text-xs capitalize">
                      {diff}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase tracking-wide dark:border-gray-700 dark:text-gray-400">
                        <th className="pb-2 w-10">Rank</th>
                        <th className="pb-2">Time</th>
                        <th className="pb-2">Mistakes</th>
                        <th className="pb-2">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {rows.map((entry, idx) => (
                        <tr key={idx} className="text-gray-800 dark:text-gray-200">
                          <td className="py-2 font-mono text-gray-400 text-xs dark:text-gray-500">#{idx + 1}</td>
                          <td className="py-2 font-mono font-semibold">{formatTime(entry.time)}</td>
                          <td className="py-2">{entry.mistakes}</td>
                          <td className="py-2 text-xs text-gray-500 dark:text-gray-400">{formatDate(entry.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </main>
  );
}
