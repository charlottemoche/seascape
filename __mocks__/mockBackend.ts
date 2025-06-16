let journalStreakValue = 0;
let breathStreakValue = 0;
let breathMinutesValue = 0;

export function resetMockStreaks() {
  journalStreakValue = 0;
  breathStreakValue = 0;
  breathMinutesValue = 0;
}

export function getJournalStreak() {
  return journalStreakValue;
}

export function getBreathStreak() {
  return breathStreakValue;
}

export function getBreathMinutes() {
  return breathMinutesValue;
}

export function incrementJournalStreak() {
  journalStreakValue += 1;
}

export function incrementBreathStreak() {
  breathStreakValue += 1;
}

export function addBreathMinutes(minutes: number) {
  breathMinutesValue += minutes;
}