import { journalDates, breathDates } from '@/__mocks__/mockBackend';

function calculateStreak(dateSet: Set<string>): number {
  if (dateSet.size === 0) return 0;

  const sorted = [...dateSet].sort();
  let streak = 1;
  for (let i = sorted.length - 2; i >= 0; i--) {
    const prev = new Date(sorted[i]);
    prev.setDate(prev.getDate() + 1);
    const expected = prev.toISOString().split('T')[0];
    const actual = sorted[i + 1];
    if (expected === actual) {
      streak++;
    } else {
      streak = 1;
    }
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const mostRecent = sorted[sorted.length - 1];
  return todayStr === mostRecent ? streak : 0;
}

export const fetchStreaks = jest.fn(async (userId: string, userTimezone: string) => {
  const journalStreak = calculateStreak(journalDates);
  const breathStreak = calculateStreak(breathDates);

  const todayStr = new Date().toISOString().split('T')[0];

  return {
    success: true,
    lastActive: todayStr,
    didJournal: journalStreak > 0,
    didBreathe: breathStreak > 0,
    journalStreak,
    breathStreak,
  };
});

export const updateStreak = jest.fn(async () => ({
  success: true,
  lastActive: new Date().toISOString().split('T')[0],
}));