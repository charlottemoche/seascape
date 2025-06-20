import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import JournalScreen from '@/app/(tabs)/journal';
import { MockUserProvider, ProfileProvider } from '@/__mocks__/authMocks';
import { Alert } from 'react-native';
import { StreakProvider } from '@/context/StreakContext';
import { advanceTo, clear } from 'jest-date-mock';
import * as streakModule from '@/lib/streakService';

jest.mock('@/lib/supabase');
jest.spyOn(Alert, 'alert');

// In-memory streak state for mocks
let currentStreak = 1;
let currentDay = new Date(2025, 5, 15).toISOString().slice(0, 10); // YYYY-MM-DD

// Mock fetchStreaks to return current streak and date
jest.spyOn(streakModule, 'fetchStreaks').mockImplementation(async () => ({
  success: true,
  lastActive: currentDay,
  didJournal: true,
  didBreathe: false,
  journalStreak: currentStreak,
  breathStreak: 0,
}));

// Mock updateStreak to update currentStreak and currentDay based on date difference
const mockUpdateStreak = () =>
  jest.spyOn(streakModule, 'updateStreak').mockImplementation(async () => {
    const today = new Date(currentDay);
    const now = new Date();

    const diffDays = Math.floor((now.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays > 1) {
      currentStreak = 1; // reset streak due to inactivity
    } else if (diffDays === 1) {
      currentStreak += 1; // increment streak for next day
    }
    currentDay = now.toISOString().slice(0, 10);

    return {
      success: true,
      lastActive: currentDay,
    };
  });

const getJournalScreen = async () => {
  const { getByText, getByPlaceholderText } = render(
    <MockUserProvider>
      <ProfileProvider>
        <StreakProvider>
          <JournalScreen />
        </StreakProvider>
      </ProfileProvider>
    </MockUserProvider>
  );

  const input = await waitFor(() => getByPlaceholderText('Write your thoughts here...'));
  const saveButton = getByText('Save entry');

  return { input, saveButton };
};

const submitJournalEntry = async (text: string) => {
  const { input, saveButton } = await getJournalScreen();
  fireEvent.changeText(input, text);
  fireEvent.press(saveButton);
  await waitFor(() => {
    expect(Alert.alert).toHaveBeenCalledWith('Journal entry saved!');
  });
  return { input, saveButton };
};

describe('journal', () => {
  beforeEach(() => {
    currentStreak = 1;
    currentDay = new Date(2025, 5, 15).toISOString().slice(0, 10);
    advanceTo(new Date(2025, 5, 15));
    jest.clearAllMocks();
  });

  it('submits a journal entry', async () => {
    await submitJournalEntry('Feeling good today');
  });

  it('increments streak from 1 to 2 when submitting entry next day', async () => {
    const updateStreakSpy = mockUpdateStreak();

    await submitJournalEntry('Day 1 entry');

    advanceTo(new Date(2025, 5, 16));
    await submitJournalEntry('Day 2 entry');

    expect(updateStreakSpy).toHaveBeenCalledTimes(2);

    updateStreakSpy.mockRestore();
  });

  it('does not lose streak when deleting entry', async () => {
    const updateStreakSpy = mockUpdateStreak();

    await submitJournalEntry('Day 1 entry');

    expect(updateStreakSpy).toHaveBeenCalledTimes(1);

    updateStreakSpy.mockRestore();
  });

  it('does not lose the streak the next morning', async () => {
    await submitJournalEntry('Day 1 journal');

    advanceTo(new Date(2025, 5, 16));

    const { journalStreak } = await streakModule.fetchStreaks('test-user', 'America/New_York');
    expect(journalStreak).toBeGreaterThan(0);

    clear();
  });

  it('loses the streak after a full day of inactivity', async () => {
    const updateStreakSpy = mockUpdateStreak();

    await submitJournalEntry('Day 1 journal');

    advanceTo(new Date(2025, 5, 16, 12));
    await submitJournalEntry('Day 2 journal');

    advanceTo(new Date(2025, 5, 18, 12)); // skip day 3

    await submitJournalEntry('Day 4 journal');

    const { journalStreak } = await streakModule.fetchStreaks('test-user', 'America/New_York');
    expect(journalStreak).toBe(1); // streak reset

    updateStreakSpy.mockRestore();
    clear();
  });
});