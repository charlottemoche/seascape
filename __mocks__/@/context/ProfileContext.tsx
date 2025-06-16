import React from 'react';
import { mockProfile } from '../../authMocks';

export const useProfile = () => ({
  profile: mockProfile,
  loading: false,
  refreshProfile: jest.fn(),
});

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;