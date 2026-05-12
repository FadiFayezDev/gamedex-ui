export function logError(error: Error, context: string, details?: unknown) {
  console.error(`[${context}]`, error, details)

  // Hook your production reporter here, e.g.:
  // Sentry.captureException(error, { extra: { context, details } })
}
