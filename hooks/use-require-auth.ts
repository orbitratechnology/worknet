import { useAuth } from '@/context/auth';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';

export function useRequireAuth() {
  const { user } = useAuth();
  const router = useRouter();

  const requireAuth = useCallback(
    (message = 'Sign in to continue') => {
      if (user) {
        return true;
      }

      router.push({
        pathname: '/login',
        params: { message },
      });
      return false;
    },
    [router, user],
  );

  return { user, requireAuth, isAuthenticated: !!user };
}
