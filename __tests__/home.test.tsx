import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { MockUserProvider } from '@/__mocks__/authMocks';
import { StreakProvider } from '@/context/StreakContext';
import { advanceTo, clear } from 'jest-date-mock';
import {
  resetMockStreaks,
  incrementJournalStreak,
  incrementBreathStreak,
} from '@/__mocks__/mockBackend';
import HomeScreen from '@/app/(tabs)/index';

jest.mock('@/lib/streakService');
jest.mock('@/lib/supabase');
jest.mock('@/lib/feelingsService', () => ({
  fetchFeelings: jest.fn().mockResolvedValue([]),
}));

const resetLocalState = () => {
  resetMockStreaks();
};

const addJournalDate = () => {
  incrementJournalStreak();
};

const addBreathDate = () => {
  incrementBreathStreak();
};

const renderHome = () =>
  render(
    <MockUserProvider>
      <StreakProvider>
        <NavigationContainer>
          <HomeScreen />
        </NavigationContainer>
      </StreakProvider>
    </MockUserProvider>
  );

beforeEach(() => {
  clear();
  advanceTo(new Date(2025, 6, 1));
  resetLocalState();
});

describe('HomeScreen streak updates', () => {
  it('updates the journal streak in HomeScreen after journal entry', async () => {
    addJournalDate();

    const ui = renderHome();

    await waitFor(() =>
      expect(ui.getByTestId('journal-streak')).toHaveTextContent('1 day'),
    );
  });

  it('updates the breath streak in HomeScreen after breath session', async () => {
    addBreathDate();

    const ui = renderHome();

    await waitFor(() =>
      expect(ui.getByTestId('breathing-streak')).toHaveTextContent('1 day'),
    );
  });

  it('loses the streak if a day passes without activity', async () => {
    addJournalDate();
    let ui = renderHome();

    await waitFor(() =>
      expect(ui.getByTestId('journal-streak')).toHaveTextContent('0 days'),
    );

    /* move two days forward with no entry */
    advanceTo(new Date(2025, 6, 3));

    // re-render (forces StreakContext.refreshStreaks() internally)
    ui.rerender(
      <MockUserProvider>
        <StreakProvider>
          <NavigationContainer>
            <HomeScreen />
          </NavigationContainer>
        </StreakProvider>
      </MockUserProvider>
    );

    await waitFor(() => ui.getByTestId('journal-streak'));
    expect(ui.getByTestId('journal-streak')).toHaveTextContent('0 days');
  });
});