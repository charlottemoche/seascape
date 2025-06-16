export const supabase = {
  from: jest.fn(() => ({
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: { id: 1 }, error: null }),
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
  rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
  auth: {
    getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'test-user' } } } }),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } },
    })),
  },
};