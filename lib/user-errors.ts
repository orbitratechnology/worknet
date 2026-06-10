import { getAuthErrorMessage } from '@/lib/auth-errors';
import { logger } from '@/lib/logger';

export type UserErrorContext =
  | 'auth'
  | 'review'
  | 'upload'
  | 'network'
  | 'delete'
  | 'report'
  | 'generic';

function isNetworkError(error: unknown): boolean {
  const code =
    error && typeof error === 'object' && 'code' in error
      ? String((error as { code: string }).code)
      : '';
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  return (
    code === 'auth/network-request-failed' ||
    code === 'unavailable' ||
    code === 'deadline-exceeded' ||
    message.includes('network') ||
    message.includes('offline') ||
    message.includes('connection')
  );
}

function isPermissionError(error: unknown): boolean {
  const code =
    error && typeof error === 'object' && 'code' in error
      ? String((error as { code: string }).code)
      : '';
  return code === 'permission-denied' || code === 'storage/unauthorized';
}

export function getUserFacingMessage(
  error: unknown,
  context: UserErrorContext = 'generic',
): string {
  if (!error) {
    return 'Something went wrong. Please try again.';
  }

  if (error instanceof Error && error.message === 'Sign-in cancelled') {
    return 'Sign-in cancelled';
  }

  if (context === 'auth') {
    return getAuthErrorMessage(error);
  }

  if (isNetworkError(error)) {
    return 'Connection problem. Check your internet and try again.';
  }

  if (isPermissionError(error)) {
    return 'You do not have permission to do that. Sign in and try again.';
  }

  const code =
    error && typeof error === 'object' && 'code' in error
      ? String((error as { code: string }).code)
      : '';

  switch (context) {
    case 'review':
      if (code === 'already-exists') {
        return 'You already reviewed this worker.';
      }
      return 'Could not submit your review. Please try again.';
    case 'upload':
      return 'Could not upload that photo. Try again or pick a different image.';
    case 'delete':
      if (code === 'auth/requires-recent-login') {
        return 'For your security, confirm your identity before deleting your account.';
      }
      return 'Could not delete your account. Please try again.';
    case 'report':
      return 'Could not send your report. Please try again or email admin@orbitratech.net.';
    default:
      break;
  }

  logger.error(`Unhandled ${context} error`, error);
  return 'Something went wrong. Please try again.';
}
