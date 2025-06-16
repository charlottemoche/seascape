import React, { useEffect } from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '@/app/(tabs)/index';
import { MockUserProvider, ProfileProvider } from '@/__mocks__/authMocks';
import { StreakProvider, useStreaks } from '@/context/StreakContext';
import { clear } from 'jest-date-mock';
import {
  resetMockStreaks,
  incrementJournalStreak,
  incrementBreathStreak,
} from '@/__mocks__/mockBackend';

jest.mock('@/lib/supabase');

const waitAFrame = () => act(() => new Promise((r) => setTimeout(r, 50)));

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
    const rendered = renderWithContext(incrementJournalStreak);
    await waitAFrame();
    await expectStreak(rendered, 'journal-streak', '1 day');
  });

  it('updates the breath streak in HomeScreen after breath session', async () => {
    const rendered = renderWithContext(incrementBreathStreak);
    await waitAFrame();
    await expectStreak(rendered, 'breathing-streak', '1 day');
  });
});