let entryIdCounter = 1;

export const supabase = {
  from: jest.fn((table) => {
    const base = {
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      then: jest.fn(),
    };

    if (table === 'streaks') {
      return {
        ...base,
        select: jest.fn((columns) => {
          if (columns.includes('did_journal') || columns.includes('did_breathe')) {
            return {
              eq: jest.fn().mockReturnThis(),
              order: jest.fn().mockReturnThis(),
              then: (resolve: (value: { data: { date: string; did_journal: boolean; did_breathe: boolean; }[]; error: null }) => void) => {
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
              Promise.resolve({
                data: [{ id: entryIdCounter++, entry: 'mocked entry' }],
                error: null,
              })
            ),
          })),
        })),
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            gte: jest.fn(() => ({
              order: jest.fn(() => ({
                range: jest.fn(() =>
                  Promise.resolve({
                    data: [
                      { created_at: '2025-06-01', feeling: ['Happy', 'Calm'] },
                      { created_at: '2025-06-02', feeling: ['Sad'] },
                    ],
                    error: null,
                  })
                ),
              })),
            })),
            order: jest.fn(() => ({
              range: jest.fn(() =>
                Promise.resolve({
                  data: [
                    { created_at: '2025-06-01', feeling: ['Happy', 'Calm'] },
                    { created_at: '2025-06-02', feeling: ['Sad'] },
                  ],
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