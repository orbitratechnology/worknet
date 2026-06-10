import { useAuth } from '@/context/auth';
import { useAuthGate } from '@/context/auth-gate';
import { useCallback } from 'react';

export function useRequireAuth() {
  const { user } = useAuth();
  const { openSignInSheet } = useAuthGate();

  const requireAuth = useCallback(
    (message = 'Sign in to continue') => {
      if (user) {
        return true;
      }
      openSignInSheet(message);
      return false;
    },
    [user, openSignInSheet],
  );

  return { user, requireAuth, isAuthenticated: !!user };
}
