let journalDates = new Set<string>();
let breathDates = new Set<string>();
let breathMinutesValue = 0;

export function resetMockStreaks() {
  journalDates.clear();
  breathDates.clear();
  breathMinutesValue = 0;
}

export const incrementJournalStreak = async () => {
  const today = new Date().toISOString().split('T')[0];
  journalDates.add(today);
};

export const incrementBreathStreak = async () => {
  const today = new Date().toISOString().split('T')[0];
  breathDates.add(today);
};

export function addBreathMinutes(minutes: number) {
  breathMinutesValue += minutes;
}

export function getBreathMinutes() {
  return breathMinutesValue;
}

export function getJournalStreak() {
  return calculateStreak(journalDates);
}

export function getBreathStreak() {
  return calculateStreak(breathDates);
}

export function getLatestDate(set: Set<string>): string | null {
  if (set.size === 0) return null;
  return [...set].sort().at(-1)!;
}

export { journalDates, breathDates };

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