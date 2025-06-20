import React, { createContext, ReactNode, useMemo } from 'react';
import { UserContext } from '@/context/UserContext';

// Mock user and profile data
export const mockUser = {
  id: 'test-user',
  email: 'test@example.com',
} as any;

export const mockProfile = {
  total_minutes: 120,
  journal_streak: 0,
  breath_streak: 0,
};

// Mock UserProvider that provides user context synchronously
export const MockUserProvider = ({ children }: { children: ReactNode }) => {
  const contextValue = useMemo(() => ({
    user: mockUser,
    setUser: () => {},
    loading: false,
    sessionChecked: true,
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