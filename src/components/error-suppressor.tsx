'use client';

import { useEffect } from 'react';

/**
 * Suppresses Next.js RegisterClientLocalizationsError
 * This is a harmless warning when using custom i18n instead of Next.js built-in i18n
 */
export function ErrorSuppressor() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Suppress RegisterClientLocalizationsError
    const handleError = (event: ErrorEvent) => {
      if (
        event.error?.name === 'RegisterClientLocalizationsError' ||
        event.message?.includes('RegisterClientLocalizationsError') ||
        (typeof event.error === 'object' && 
         event.error !== null && 
         'message' in event.error &&
         typeof event.error.message === 'string' &&
         event.error.message.includes('translations'))
      ) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    // Suppress unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      if (
        event.reason?.name === 'RegisterClientLocalizationsError' ||
        (typeof event.reason === 'string' && event.reason.includes('RegisterClientLocalizationsError')) ||
        (typeof event.reason === 'object' &&
         event.reason !== null &&
         'message' in event.reason &&
         typeof event.reason.message === 'string' &&
         event.reason.message.includes('translations'))
      ) {
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', handleError, true);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return null;
}

