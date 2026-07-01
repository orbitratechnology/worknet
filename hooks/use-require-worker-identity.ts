import { useAuth } from '@/context/auth';
import { isIdentityVerified } from '@/lib/user-identity';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

/** Redirect to verification when NIC and phone are not yet verified. */
export function useRequireWorkerIdentity(): boolean {
  const router = useRouter();
  const { userProfile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!isIdentityVerified(userProfile)) {
      router.replace('/(app)/become-worker/verification');
    }
  }, [loading, userProfile, router]);

  return isIdentityVerified(userProfile);
}
