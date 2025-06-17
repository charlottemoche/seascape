let entryIdCounter = 1;

export const supabase = {
  from: jest.fn((table) => {
    const base = {
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    };

    if (table === 'streaks') {
      return {
        ...base,
        select: jest.fn((columns) => {
          if (columns.includes('did_journal') || columns.includes('did_breathe')) {
            return {
              eq: jest.fn().mockReturnThis(),
              order: jest.fn().mockReturnThis(),
              then: (resolve: (result: { data: any[]; error: null }) => void) => {
                resolve({
                  data: [
                    { date: '2025-06-16', did_journal: true, did_breathe: false },
                    { date: '2025-06-15', did_journal: true, did_breathe: false },
                  ],
                  error: null,
                });
              },
            };
          }

          return {
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() =>
                  Promise.resolve({
                    data: {
                      date: '2025-06-16',
                      did_journal: true,
                      did_breathe: false,
                      streak_length: 2,
                      journal_streak: 2,
                      breath_streak: 0,
                      last_active: '2025-06-16',
                    },
                    error: null,
                  })
                ),
              })),
            })),
          };
        }),
      };
    }

    if (table === 'breaths') {
      return {
        ...base,
        insert: jest.fn(() => Promise.resolve({ data: { id: 123 }, error: null })),
      };
    }

    if (table === 'journal_entries') {
      return {
        ...base,
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() =>
              Promise.resolve({ data: { id: entryIdCounter++ }, error: null })
            ),
          })),
        })),
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              range: jest.fn(() =>
                Promise.resolve({
                  data: [],
                  error: null,
                })
              ),
            })),
          })),
        })),
      };
    }

    return base;
  }),

  rpc: jest.fn((fn, _params) => {
    if (fn === 'update_streak') {
      return Promise.resolve({
        data: [
          {
            streak_length: 2,
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
