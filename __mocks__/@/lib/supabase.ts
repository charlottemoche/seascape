let entryIdCounter = 1;

export const supabase = {
  from: jest.fn(() => ({
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn().mockImplementation(() => {
      return Promise.resolve({
        data: { id: entryIdCounter++ },
        error: null,
      });
    }),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    range: jest.fn().mockResolvedValue({
      data: [],
      error: null,
    }),
  })),
  rpc: jest.fn((fn, params) => {
    if (fn === 'refresh_journal_streak') {
      const today = new Date().toISOString().split('T')[0];

      return Promise.resolve({
        data: [
          {
            streak_count: 1,
            streak_end_date: '2025-06-15',
          },
        ],
        error: null,
      });
    }

    if (fn === 'refresh_breath_streak') {
      return Promise.resolve({
        data: [
          {
            streak_count: 1,
            streak_end_date: '2025-06-15',
          },
        ],
        error: null,
      });
    }

    return Promise.resolve({ data: null, error: null });
  }),
  auth: {
    getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'test-user' } } } }),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } },
    })),
  },
};