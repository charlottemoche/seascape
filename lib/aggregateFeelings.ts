import type { JournalEntryDecrypted } from '@/types/Journal';

const feelingCategories = {
  positive: ['Happy', 'Pleasant', 'Joyful', 'Excited', 'Grateful', 'Hopeful', 'Content'],
  neutral: ['Calm', 'Indifferent', 'Tired'],
  negative: ['Sad', 'Frustrated', 'Anxious', 'Angry', 'Stressed', 'Lonely'],
};

export type MoodDay = {
  date: string;
  mood: 'positive' | 'neutral' | 'negative' | 'none';
  counts: {
    positive: number;
    neutral: number;
    negative: number;
  };
};

export function getMoodByDay(entries: JournalEntryDecrypted[]): MoodDay[] {
  const countsByDay = new Map<
    string,
    { positive: number; neutral: number; negative: number }
  >();

  for (const entry of entries) {
    const date = entry.created_at.slice(0, 10);
    if (!countsByDay.has(date)) {
      countsByDay.set(date, { positive: 0, neutral: 0, negative: 0 });
    }
    const bucket = countsByDay.get(date)!;

    for (const f of entry.feeling) {
      if (feelingCategories.positive.includes(f)) bucket.positive++;
      else if (feelingCategories.neutral.includes(f)) bucket.neutral++;
      else if (feelingCategories.negative.includes(f)) bucket.negative++;
    }
  }

  const days: MoodDay[] = [];

  countsByDay.forEach((counts, date) => {
    const max = Math.max(counts.positive, counts.neutral, counts.negative);
    let mood: MoodDay['mood'] = 'none';

    if (max > 0) {
      const ties: MoodDay['mood'][] = [];
      if (counts.positive === max) ties.push('positive');
      if (counts.neutral === max) ties.push('neutral');
      if (counts.negative === max) ties.push('negative');

      if (ties.includes('positive')) mood = 'positive';
      else if (ties.includes('neutral')) mood = 'neutral';
      else mood = 'negative';
    }

    days.push({ date, mood, counts });
  });

  return days;
}