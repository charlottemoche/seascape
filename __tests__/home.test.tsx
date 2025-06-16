import React, { useEffect } from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '@/app/(tabs)/index';
import { MockUserProvider, ProfileProvider } from '@/__mocks__/authMocks';
import { StreakProvider, useStreaks } from '@/context/StreakContext';
import { supabase } from '@/lib/supabase';
import { advanceBy, advanceTo, clear } from 'jest-date-mock';

import {
  resetMockStreaks,
  incrementJournalStreak,
  incrementBreathStreak,
  getJournalStreak,
  getBreathStreak,
} from '@/__mocks__/mockBackend';

jest.mock('@/lib/supabase');

const TestWrapper = ({ incrementFn }: { incrementFn: () => void }) => {
  const { refreshStreaks } = useStreaks();

  useEffect(() => {
    incrementFn();
    refreshStreaks();
  }, [incrementFn, refreshStreaks]);

  return <HomeScreen />;
};

const renderWithContext = (incrementFn: () => void) => {
  return render(
    <MockUserProvider>
      <ProfileProvider>
        <StreakProvider userId="test-user">
          <NavigationContainer>
            <TestWrapper incrementFn={incrementFn} />
          </NavigationContainer>
        </StreakProvider>
      </ProfileProvider>
    </MockUserProvider>
  );
};

describe('HomeScreen streak updates', () => {
  beforeEach(() => {
    resetMockStreaks();

    (supabase.rpc as jest.Mock).mockImplementation(async (fnName: string) => {
      if (fnName === 'refresh_journal_streak') {
        return { data: getJournalStreak(), error: null };
      }
      if (fnName === 'refresh_breath_streak') {
        return { data: getBreathStreak(), error: null };
      }
      return { data: null, error: null };
    });
  });

  it('updates the journal streak in HomeScreen after journal entry', async () => {
    const rendered = renderWithContext(incrementJournalStreak);

    // Initially 0 days
    await waitFor(() =>
      expect(rendered.getByTestId('journal-streak')).toHaveTextContent('0 days')
    );

    // Wait for update after increment + refresh
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    // Should now show 1 day
    await waitFor(() =>
      expect(rendered.getByTestId('journal-streak')).toHaveTextContent('1 day')
    );
  });

  it('updates the breath streak in HomeScreen after breath session', async () => {
    const rendered = renderWithContext(incrementBreathStreak);

    // Initially 0 days
    await waitFor(() =>
      expect(rendered.getByTestId('breathing-streak')).toHaveTextContent('0 days')
    );

    // Wait for update after increment + refresh
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    // Should now show 1 day
    await waitFor(() =>
      expect(rendered.getByTestId('breathing-streak')).toHaveTextContent('1 day')
    );
  });

  describe('HomeScreen streak updates across days', () => {
    beforeEach(() => {
      resetMockStreaks();
      clear();

      (supabase.rpc as jest.Mock).mockImplementation(async (fnName: string) => {
        if (fnName === 'refresh_journal_streak') {
          return { data: getJournalStreak(), error: null };
        }
        if (fnName === 'refresh_breath_streak') {
          return { data: getBreathStreak(), error: null };
        }
        return { data: null, error: null };
      });
    });

    it('increments the journal streak across two days', async () => {
      // Mock today as June 15
      advanceTo(new Date(2025, 5, 15));

      // First render: submit on day 1
      let rendered = renderWithContext(incrementJournalStreak);

      await waitFor(() =>
        expect(rendered.getByTestId('journal-streak')).toHaveTextContent('0 days')
      );

      // wait for update to 1 day
      await act(async () => {
        await new Promise((r) => setTimeout(r, 100));
      });
      await waitFor(() =>
        expect(rendered.getByTestId('journal-streak')).toHaveTextContent('1 day')
      );

      rendered.unmount();

      // Advance mocked date to next day (June 16)
      advanceTo(new Date(2025, 5, 16));

      // Second render: submit on day 2
      rendered = renderWithContext(incrementJournalStreak);

      // wait for update to 2 days
      await act(async () => {
        await new Promise((r) => setTimeout(r, 100));
      });
      await waitFor(() =>
        expect(rendered.getByTestId('journal-streak')).toHaveTextContent('2 days')
      );
    });
  });
});