import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import JournalScreen from '../app/(tabs)/journal';
import { UserProvider } from '@/context/UserContext';
import { Alert } from 'react-native';

jest.mock('@/lib/supabase');

describe('journal', () => {
  it('submits a journal entry', async () => {
    const { getByText, getByPlaceholderText } = render(
      <UserProvider>
        <JournalScreen />
      </UserProvider>
    );

    // Wait for the input to show up
    const input = await waitFor(() => getByPlaceholderText('Write your thoughts here...'));
    fireEvent.changeText(input, 'Feeling good today');

    const saveButton = getByText('Save Entry');
    fireEvent.press(saveButton);

    const alertSpy = jest.spyOn(Alert, 'alert');

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Journal entry saved!');
    });
  });
});