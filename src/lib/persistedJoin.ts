import type { Participant } from '../types'

// Where we remember "this device already joined the current rally." This is a
// convenience guard, not a security control: it stops accidental duplicate
// joins (refresh, second tab, "I forgot I was in") and keeps the join flow from
// reappearing once you're in. It can't stop a determined user who clears
// storage / uses incognito — that's inherent to an anonymous, no-IP system.
export const JOIN_STORAGE_KEY = 'vpp-participant'

export function loadStoredJoin(): Participant | null {
  try {
    const raw = localStorage.getItem(JOIN_STORAGE_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as Participant
    // Guard against malformed/old shapes.
    if (
      !p ||
      typeof p.id !== 'string' ||
      typeof p.handle !== 'string' ||
      typeof p.intent !== 'string' ||
      typeof p.avatarId !== 'string'
    ) {
      return null
    }
    return p
  } catch {
    return null
  }
}

export function saveStoredJoin(p: Participant): void {
  try {
    localStorage.setItem(JOIN_STORAGE_KEY, JSON.stringify(p))
  } catch {
    // Storage unavailable (private mode / quota) — non-fatal, just no guard.
  }
}

export function clearStoredJoin(): void {
  try {
    localStorage.removeItem(JOIN_STORAGE_KEY)
  } catch {
    // ignore
  }
}
