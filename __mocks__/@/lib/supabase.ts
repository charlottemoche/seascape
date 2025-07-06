let entryIdCounter = 1;

export const supabase = {
  from: jest.fn((table: string) => {
    const base = {
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      then: jest.fn(),
    };

    if (table === 'user_streaks') {
      return {
        ...base,
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() =>
              Promise.resolve({
                data: {
                  last_journal: '2025-06-16',
                  journal_streak: 2,
                  last_breathe: '2025-06-14',
                  breath_streak: 1,
                },
                error: null,
              })
            ),
          })),
        })),
      };
    }

    if (table === 'journal_entries') {
      return {
        ...base,
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() =>
              Promise.resolve({
                data: [{ id: entryIdCounter++, entry: 'mocked entry' }],
                error: null,
              })
            ),
          })),
        })),
      };
    }

    if (table === 'breaths') {
      return {
        ...base,
        insert: jest.fn(() =>
          Promise.resolve({ data: { id: 123 }, error: null })
        ),
      };
    }

    return base;
  }),

  rpc: jest.fn((fn, _params) => {
    if (fn === 'bump_streak') {
      return Promise.resolve({
        data: [
          {
            journal_streak: 2,
            breath_streak: 0,
            last_active: '2025-06-16',
          },
        ],
        error: null,
      });
    }
    return Promise.resolve({ data: null, error: null });
  }),

  auth: {
    getSession: jest.fn().mockResolvedValue({
      data: { session: { user: { id: 'test-user' } } },
    }),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } },
    })),
  },
};