import React, { useEffect } from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '@/app/(tabs)/index';
import { MockUserProvider, ProfileProvider } from '@/__mocks__/authMocks';
import { StreakProvider, useStreaks } from '@/context/StreakContext';
import { supabase } from '@/lib/supabase';
import { advanceTo, clear } from 'jest-date-mock';
import {
  resetMockStreaks,
  incrementJournalStreak,
  incrementBreathStreak,
  getJournalStreak,
  getBreathStreak,
  getLatestDate,
  journalDates,
  breathDates,
} from '@/__mocks__/mockBackend';

jest.mock('@/lib/supabase');

const waitAFrame = () => act(() => new Promise((r) => setTimeout(r, 100)));

const TestWrapper = ({ incrementFn }: { incrementFn: () => void }) => {
  const { refreshStreaks } = useStreaks();

  useEffect(() => {
    incrementFn();
    refreshStreaks();
  }, [incrementFn, refreshStreaks]);

  return <HomeScreen />;
};

const renderWithContext = (incrementFn: () => void) =>
  render(
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

function mockStreakRpc() {
  (supabase.rpc as jest.Mock).mockImplementation(async (fnName: string) => {
    if (fnName === 'refresh_journal_streak') {
      const streak_count = getJournalStreak();
      const latest = getLatestDate(journalDates);
      return {
        data: [
          {
            streak_count,
            streak_end_date: latest ?? null,
          },
        ],
        error: null,
      };
    }

    if (fnName === 'refresh_breath_streak') {
      const streak_count = getBreathStreak();
      const latest = getLatestDate(breathDates);
      return {
        data: [
          {
            streak_count,
            streak_end_date: latest ?? null,
          },
        ],
        error: null,
      };
    }

    return { data: null, error: null };
  });
}

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
  mockStreakRpc();
});

describe('HomeScreen streak updates', () => {
  it('updates the journal streak in HomeScreen after journal entry', async () => {
    const rendered = renderWithContext(incrementJournalStreak);
    await expectStreak(rendered, 'journal-streak', '0 days');

    await waitAFrame();
    await expectStreak(rendered, 'journal-streak', '1 day');
  });

  it('updates the breath streak in HomeScreen after breath session', async () => {
    const rendered = renderWithContext(incrementBreathStreak);
    await expectStreak(rendered, 'breathing-streak', '0 days');

    await waitAFrame();
    await expectStreak(rendered, 'breathing-streak', '1 day');
  });

  it('increments the journal streak across two days', async () => {
    advanceTo(new Date(2025, 5, 15)); // June 15
    let rendered = renderWithContext(incrementJournalStreak);

    await expectStreak(rendered, 'journal-streak', '0 days');
    await waitAFrame();
    await expectStreak(rendered, 'journal-streak', '1 day');

    rendered.unmount();
    advanceTo(new Date(2025, 5, 16)); // June 16

    rendered = renderWithContext(incrementJournalStreak);
    await waitAFrame();
    await expectStreak(rendered, 'journal-streak', '2 days');
  });

  it('streak stays 2 even after journal entry deletion simulation', async () => {
    advanceTo(new Date(2025, 5, 15)); // Day 1
    let rendered = renderWithContext(incrementJournalStreak);

    await waitAFrame();
    await expectStreak(rendered, 'journal-streak', '1 day');

    rendered.unmount();

    jest
      .spyOn(require('@/__mocks__/mockBackend'), 'getJournalStreak')
      .mockReturnValue(2);

    advanceTo(new Date(2025, 5, 16));
    rendered = renderWithContext(() => { });
    await waitAFrame();
    await expectStreak(rendered, 'journal-streak', '2 days');
  });
});