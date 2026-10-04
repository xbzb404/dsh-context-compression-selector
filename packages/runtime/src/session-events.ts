/** Public Session event-log compatibility across Harness 0.1.x releases. */

import type { Session, SessionEvent } from '@deepseek-ai/dsh-session'

/**
 * Read one immutable Session event snapshot.
 *
 * Harness rc.2 exposed `events`; Alpha 5 replaced it with the public
 * `snapshotEvents()` method. 0.2.0 keeps `snapshotEvents()` (now with default
 * `[0, seq)` range arguments) and removed the `events` accessor. This helper
 * prefers the modern public API but retains the rc.2 `events` accessor as a
 * fallback so sessions produced by older harness builds still resolve.
 */
export function sessionEvents(session: Session): readonly SessionEvent[] {
  const candidate = session as unknown as {
    snapshotEvents?: () => readonly SessionEvent[]
    events?: readonly SessionEvent[]
  }
  if (typeof candidate.snapshotEvents === 'function') {
    return candidate.snapshotEvents()
  }
  if (candidate.events !== undefined) {
    return candidate.events
  }
  throw new TypeError('Session exposes neither snapshotEvents() nor the rc.2 events accessor')
}
