export function getAuthErrorMessage(error: any): string {
  if (!error) return 'An unknown error occurred. Please try again.';

  const errorCode = error.code || error.message;

  switch (errorCode) {
    // Login Errors
    case 'auth/invalid-email':
      return 'The email address is not valid. Please check and try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please check your email or sign up.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again or reset your password.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Please try again later or reset your password.';

    // Registration Errors
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address. Please log in instead.';
    case 'auth/weak-password':
      return 'Your password is too weak. Please use at least 8 characters with a mix of letters and numbers.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is currently disabled. Please contact support.';

    // Network/General Errors
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';
    case 'auth/internal-error':
      return 'An internal server error occurred. Please try again later.';
    case 'auth/timeout':
      return 'The request timed out. Please check your connection and try again.';

    // Account Deletion / Re-authentication
    case 'auth/requires-recent-login':
      return 'For your security, please log out and log back in before performing this action.';

    // Google Sign-In Errors
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.';
    case 'auth/auth-domain-config-required':
      return 'Auth domain configuration is required. Please contact support.';
    case 'auth/cancelled-popup-request':
      return 'The sign-in popup was closed before completing the process.';
    case 'auth/popup-blocked':
      return 'The sign-in popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/popup-closed-by-user':
      return 'The sign-in popup was closed. Please try again.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized for OAuth operations. Please contact support.';

    default:
      // Fallback to the original message if it's somewhat readable, otherwise generic
      if (typeof error.message === 'string' && error.message.length > 0) {
        // Clean up Firebase error prefix if present
        return error.message
          .replace(/^Firebase:\s*/, '')
          .replace(/\s*\(auth\/.*\)\.?$/, '');
      }
      return 'An unexpected error occurred. Please try again.';
  }
}
