import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import JournalScreen from '../app/(tabs)/journal';
import { MockUserProvider } from '@/__mocks__/authMocks';
import { Alert } from 'react-native';
import { StreakProvider } from '@/context/StreakContext';

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

  it('updates the streak to 1 if it was 0', async () => {

  })
});
