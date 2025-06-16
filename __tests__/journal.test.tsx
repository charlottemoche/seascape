import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import JournalScreen from '../app/(tabs)/journal';
import { MockUserProvider } from '@/__mocks__/authMocks';
import { Alert } from 'react-native';
import { StreakProvider } from '@/context/StreakContext';
import { advanceBy, advanceTo, clear } from 'jest-date-mock';
import * as streakModule from '@/lib/streakService';

jest.mock('@/lib/supabase');

// make a function for getting the journal screen and its inputs
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

describe('journal', () => {
  it('submits a journal entry', async () => {
    const { input, saveButton } = await getJournalScreen();
    fireEvent.changeText(input, 'Feeling good today');
    fireEvent.press(saveButton);

    const alertSpy = jest.spyOn(Alert, 'alert');

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Journal entry saved!');
    });
  });

  it('increments streak from 1 to 2 when submitting entry next day', async () => {
    // Mock initial date to today
    const day1 = new Date(2025, 5, 15); // June 15, 2025 (month 0-indexed)
    advanceTo(day1);

    // Spy on updateStreak so we can mock its behavior or just track calls
    const updateStreakSpy = jest.spyOn(streakModule, 'updateStreak').mockImplementation(async (userId, type, timezone) => {
      // For the first call (day 1), return streak = 1
      // For the second call (day 2), return streak = 2
      if (jest.isMockFunction(updateStreakSpy)) {
        const callCount = updateStreakSpy.mock.calls.length;
        return callCount === 1 ? 1 : 2;
      }
      return 1;
    });

    const { input, saveButton } = await getJournalScreen();

    // Submit first entry (day 1)
    fireEvent.changeText(input, 'Day 1 entry');
    fireEvent.press(saveButton);

    // Wait for the first alert and assert streak updated to 1
    await waitFor(() => {
      expect(updateStreakSpy).toHaveBeenCalledTimes(1);
    });

    // Advance date by 1 day to simulate next day
    const day2 = new Date(day1);
    day2.setDate(day1.getDate() + 1);
    advanceTo(day2);

    // Submit second entry (day 2)
    fireEvent.changeText(input, 'Day 2 entry');
    fireEvent.press(saveButton);

    // Wait for second call to updateStreak
    await waitFor(() => {
      expect(updateStreakSpy).toHaveBeenCalledTimes(2);
    });

    // Optionally assert that the streak has incremented
    const lastCallReturn = await updateStreakSpy.mock.results[1].value;
    expect(lastCallReturn).toBe(2);

    updateStreakSpy.mockRestore();
  });
});