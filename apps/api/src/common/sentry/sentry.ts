import * as Sentry from '@sentry/node';

/**
 * Initialise Sentry. Safely no-ops when SENTRY_DSN is absent.
 * Call this ONCE, as the very first thing in the process, before any
 * NestJS bootstrap so handlers are installed before request flow.
 */
export function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    console.log('ℹ️  Sentry disabled (no SENTRY_DSN)');
    return { enabled: false };
  }
  try {
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV ?? 'development',
      tracesSampleRate: 0.1,   // 10% perf samples
      profilesSampleRate: 0.0, // profiling off (extra cost)
      beforeSend(event) {
        // Scrub potential PII from exceptions
        if (event.request?.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['cookie'];
        }
        return event;
      },
    });
    console.log('✅ Sentry initialised');
    return { enabled: true };
  } catch (err: any) {
    console.warn(`⚠️  Sentry init failed: ${err.message}`);
    return { enabled: false };
  }
}

export { Sentry };
