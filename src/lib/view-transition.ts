/**
 * Utility for the View Transitions API (Safari 18+, Chrome 111+).
 * Falls back to immediate navigation when the API isn't available.
 */

export function startViewTransition(callback: () => void | Promise<void>): void {
  if (
    typeof document !== 'undefined' &&
    'startViewTransition' in document &&
    typeof (document as any).startViewTransition === 'function'
  ) {
    (document as any).startViewTransition(callback);
  } else {
    callback();
  }
}
