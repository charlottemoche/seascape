let journalDates = new Set<string>();
let breathDates = new Set<string>();
let breathMinutesTotal = 0;

const iso = (d: Date) => d.toISOString().split('T')[0];

const calcStreak = (dates: Set<string>, today: string): number => {
  if (dates.size === 0) return 0;
  let streak = 0;
  let cursor = new Date(today + 'T00:00:00Z');
  while (dates.has(iso(cursor))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
};

export const fetchStreaks = jest.fn(async (_uid: string, _tz: string) => {
  const today = iso(new Date());
  return {
    success: true,
    lastActive: [...journalDates, ...breathDates].sort().at(-1) ?? null,
    didJournal: journalDates.has(today),
    didBreathe: breathDates.has(today),
    journalStreak: calcStreak(journalDates, today),
    breathStreak: calcStreak(breathDates, today),
  };
});

export const updateStreak = jest.fn(async () => ({ success: true }));

export function resetMockStreaks() {
  journalDates.clear();
  breathDates.clear();
  breathMinutesTotal = 0;
}

export function incrementJournal(date = iso(new Date())) {
  journalDates.add(date);
}

export function incrementBreathe(date = iso(new Date()), minutes = 0) {
  breathDates.add(date);
  breathMinutesTotal += minutes;
}

export function getJournalStreak(today = iso(new Date())) {
  return calcStreak(journalDates, today);
}

export function getBreathStreak(today = iso(new Date())) {
  return calcStreak(breathDates, today);
}

export function getLastActive() {
  const all = [...journalDates, ...breathDates];
  return all.length ? all.sort().at(-1)! : null;
}

export function getBreathMinutes() {
  return breathMinutesTotal;
}