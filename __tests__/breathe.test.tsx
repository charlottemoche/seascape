import { supabase } from '@/lib/supabase';
import { updateStreak } from '@/lib/streakService';
import { Alert } from 'react-native';

jest.mock('@/lib/supabase');
jest.mock('@/lib/streakService');

beforeEach(() => {
  jest.clearAllMocks();

  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  jest.spyOn(console, 'info').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

interface User {
  id: string;
}

const handleBreathComplete = async (duration: number, user: User | undefined) => {
  if (!user) return;

  const { error } = await supabase.from('breaths').insert({
    user_id: user.id,
    duration,
  });

  if (error) {
    Alert.alert('Error saving session');
    console.error(error);
  } else {
    console.info('Breathing session saved!');
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    await updateStreak(user.id, 'breath', timezone);
  }
};

describe('handleBreathComplete', () => {
  const user = { id: 'user123' };
  const duration = 120;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls supabase insert and updateStreak on success', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockResolvedValue({ error: null }),
    });
    (updateStreak as jest.Mock).mockResolvedValue(undefined);

    await handleBreathComplete(duration, user);

    expect(supabase.from).toHaveBeenCalledWith('breaths');
    expect(supabase.from('breaths').insert).toHaveBeenCalledWith({
      user_id: user.id,
      duration,
    });
    expect(updateStreak).toHaveBeenCalledWith(user.id, 'breath', 'America/New_York');
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('shows alert on insert error', async () => {
    const error = { message: 'DB error' };
    (supabase.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockResolvedValue({ error }),
    });

    await handleBreathComplete(duration, user);

    expect(Alert.alert).toHaveBeenCalledWith('Error saving session');
    expect(updateStreak).not.toHaveBeenCalled();
  });
});