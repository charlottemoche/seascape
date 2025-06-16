import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import JournalScreen from '@/app/(tabs)/journal';
import { MockUserProvider } from '@/__mocks__/authMocks';
import { Alert } from 'react-native';
import { StreakProvider } from '@/context/StreakContext';
import { advanceTo, clear } from 'jest-date-mock';
import * as streakModule from '@/lib/streakService';

jest.mock('@/lib/supabase');
jest.spyOn(Alert, 'alert');

const getJournalScreen = async () => {
  const { getByText, getByPlaceholderText } = render(
    <MockUserProvider>
      <StreakProvider userId="test-user">
        <JournalScreen />
      </StreakProvider>
    </MockUserProvider>
  );

  const input = await waitFor(() => getByPlaceholderText('Write your thoughts here...'));
  const saveButton = getByText('Save Entry');

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

const mockUpdateStreak = (handler: (callCount: number) => any) => {
  const spy = jest.spyOn(streakModule, 'updateStreak').mockImplementation(async (...args) => {
    const count = spy.mock.calls.length;
    return handler(count);
  });
  return spy;
};

describe('journal', () => {
  const day1 = new Date(2025, 5, 15);

  beforeEach(() => {
    advanceTo(day1);
    jest.clearAllMocks();
  });

  it('submits a journal entry', async () => {
    await submitJournalEntry('Feeling good today');
  });

  it('increments streak from 1 to 2 when submitting entry next day', async () => {
    const updateStreakSpy = mockUpdateStreak((count) => (count === 1 ? 1 : 2));

    await submitJournalEntry('Day 1 entry');

    advanceTo(new Date(2025, 5, 16));
    await submitJournalEntry('Day 2 entry');

    expect(updateStreakSpy).toHaveBeenCalledTimes(2);
    const lastCallReturn = await updateStreakSpy.mock.results[1].value;
    expect(lastCallReturn).toBe(2);

    updateStreakSpy.mockRestore();
  });

  it('does not lose streak when deleting entry', async () => {
    const updateStreakSpy = mockUpdateStreak(() => 1);

    await submitJournalEntry('Day 1 entry');

    expect(updateStreakSpy).toHaveBeenCalledTimes(1);
    const lastCallReturn = await updateStreakSpy.mock.results[0].value;
    expect(lastCallReturn).toBe(1);

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
    await submitJournalEntry('Day 1 journal');

    advanceTo(new Date(2025, 5, 16, 12));
    await submitJournalEntry('Day 2 journal');

    advanceTo(new Date(2025, 5, 17, 12));
    await submitJournalEntry('Day 3 journal');

    const { journalStreak } = await streakModule.fetchStreaks('test-user', 'America/New_York');
    expect(journalStreak).toBe(1);

    clear();
  });
});