import React, { createContext, ReactNode, useMemo } from 'react';

// Mock user and profile data
export const mockUser = {
  id: 'test-user',
  email: 'test@example.com',
};

export const mockProfile = {
  total_minutes: 120,
  journal_streak: 0,
  breath_streak: 0,
};

// Define the shape of user context value
const UserContext = createContext({
  user: mockUser,
  setUser: () => {},
  loading: false,
});

// Mock UserProvider that provides user context synchronously
export const MockUserProvider = ({ children }: { children: ReactNode }) => {
  const contextValue = useMemo(() => ({
    user: mockUser,
    setUser: () => {},
    loading: false,
  }), []);

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
};

// Mock useRequireAuth hook returning mocked user and loading state
export const useRequireAuth = () => ({
  user: mockUser,
  loading: false,
});

// Mock useProfile hook returning mocked profile and refresh function
export const useProfile = () => ({
  profile: mockProfile,
  loading: false,
  refreshProfile: jest.fn(),
});

// Simple passthrough ProfileProvider (no async loading)
export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};