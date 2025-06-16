import { mockUser } from '../../../authMocks';

export const useRequireAuth = () => ({
  user: mockUser,
  loading: false,
});