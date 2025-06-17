import React, { useEffect, useState } from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '@/app/(tabs)/index';
import { MockUserProvider, ProfileProvider } from '@/__mocks__/authMocks';
import { StreakProvider, useStreaks } from '@/context/StreakContext';
import { advanceTo, clear } from 'jest-date-mock';
import {
  resetMockStreaks,
  incrementJournalStreak,
  incrementBreathStreak,
} from '@/__mocks__/mockBackend';

jest.mock('@/lib/supabase');

const TestWrapper = ({
  incrementFn,
  refreshSignal,
}: {
  incrementFn: () => Promise<void>;
  refreshSignal: boolean;
}) => {
  const { refreshStreaks } = useStreaks();

  useEffect(() => {
    (async () => {
      await incrementFn();
      await refreshStreaks();
    })();
  }, [incrementFn, refreshStreaks]);

  useEffect(() => {
    if (refreshSignal) {
      refreshStreaks();
    }
  }, [refreshSignal, refreshStreaks]);

  return <HomeScreen />;
};

const renderWithContext = (incrementFn: () => Promise<void>, refreshSignal: boolean) =>
  render(
    <MockUserProvider>
      <ProfileProvider>
        <StreakProvider userId="test-user">
          <NavigationContainer>
            <TestWrapper incrementFn={incrementFn} refreshSignal={refreshSignal} />
          </NavigationContainer>
        </StreakProvider>
      </ProfileProvider>
    </MockUserProvider>
  );

const expectStreak = async (
  rendered: ReturnType<typeof render>,
  testId: string,
  value: string
) => {
  await waitFor(() =>
    expect(rendered.getByTestId(testId)).toHaveTextContent(value)
  );
};

beforeEach(() => {
  resetMockStreaks();
  clear();
});

describe('HomeScreen streak updates', () => {
  it('updates the journal streak in HomeScreen after journal entry', async () => {
    const rendered = renderWithContext(incrementJournalStreak, false);
    await waitFor(() => rendered.getByTestId('journal-streak'));
    await expectStreak(rendered, 'journal-streak', '1 day');
  });

  it('updates the breath streak in HomeScreen after breath session', async () => {
    const rendered = renderWithContext(incrementBreathStreak, false);
    await waitFor(() => rendered.getByTestId('breathing-streak'));
    await expectStreak(rendered, 'breathing-streak', '1 day');
  });

  it('loses the streak if a day passes without activity', async () => {
    // Start with 1 day streak
    let refreshSignal = false;
    const rendered = renderWithContext(incrementJournalStreak, refreshSignal);
    await waitFor(() => rendered.getByTestId('journal-streak'));
    await expectStreak(rendered, 'journal-streak', '1 day');

    // Advance date WITHOUT adding new journal date
    advanceTo(new Date(2025, 5, 18, 12)); // simulate day after next

    // Trigger refresh by rerendering with updated refreshSignal
    refreshSignal = true;
    await act(async () => {
      rendered.rerender(
        <MockUserProvider>
          <ProfileProvider>
            <StreakProvider userId="test-user">
              <NavigationContainer>
                <TestWrapper incrementFn={incrementJournalStreak} refreshSignal={refreshSignal} />
              </NavigationContainer>
            </StreakProvider>
          </ProfileProvider>
        </MockUserProvider>
      );
    });

    await expectStreak(rendered, 'journal-streak', '0 days');
  });
});