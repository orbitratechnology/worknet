/**
 * Safe logger for production environments.
 * - In development: Logs everything (errors, warnings, info) with full details.
 * - In production: Logs only safe messages, avoiding sensitive data or stack traces.
 */

const isDev = __DEV__;

export const logger = {
  error: (message: string, error?: any) => {
    if (isDev) {
      console.error(message, error);
    } else {
      // In production, log only the message and a generic code or message from the error
      // Avoid logging the entire error object which might contain PII or stack traces
      const safeError =
        error instanceof Error ? error.message : 'Unknown error';
      // You might want to send this to a crash reporting service (e.g. Sentry, Crashlytics)
      // console.error(message, safeError);
      // For now, we will suppress it or log a sanitized version if essential
      console.log(`[Error] ${message}: ${safeError}`);
    }
  },

  warn: (message: string, data?: any) => {
    if (isDev) {
      console.warn(message, data);
    } else {
      // In production, we might want to suppress warnings or log them securely
      // console.warn(message);
    }
  },

  info: (message: string, data?: any) => {
    if (isDev) {
      console.info(message, data);
    }
  },

  debug: (message: string, data?: any) => {
    if (isDev) {
      console.debug(message, data);
    }
  },
};
