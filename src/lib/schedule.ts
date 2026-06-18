// Rally schedule per the Terms of Service (U.S. Eastern Time):
//   Check-in opens 10:00 AM · Rally 6:00 PM – 8:00 PM
// Eastern Time is computed via the IANA zone so DST (EST/EDT) is handled
// automatically.

export type RallyPhase = 'before' | 'checkin' | 'live' | 'ended'

const CHECKIN_START_SEC = 10 * 3600 // 10:00
const RALLY_START_SEC = 18 * 3600 // 18:00
const RALLY_END_SEC = 20 * 3600 // 20:00
const DAY_SEC = 24 * 3600

export const SCHEDULE_LABELS = {
  checkinStart: '10:00 AM',
  rallyStart: '6:00 PM',
  rallyEnd: '8:00 PM',
  tz: 'ET',
} as const

const VALID_PHASES: RallyPhase[] = ['before', 'checkin', 'live', 'ended']

/** Seconds since midnight in U.S. Eastern Time. */
function easternSecondsOfDay(now: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(now)
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? '0')
  let hour = get('hour')
  if (hour === 24) hour = 0 // some engines emit 24 at midnight
  return hour * 3600 + get('minute') * 60 + get('second')
}

export type ScheduleState = {
  phase: RallyPhase
  /** Seconds until the next phase boundary. */
  secondsToNext: number
  /** True when the rally accepts participants (check-in or live). */
  isOpen: boolean
}

export function computeSchedule(now: Date = new Date()): ScheduleState {
  const s = easternSecondsOfDay(now)

  let phase: RallyPhase
  let secondsToNext: number

  if (s < CHECKIN_START_SEC) {
    phase = 'before'
    secondsToNext = CHECKIN_START_SEC - s
  } else if (s < RALLY_START_SEC) {
    phase = 'checkin'
    secondsToNext = RALLY_START_SEC - s
  } else if (s < RALLY_END_SEC) {
    phase = 'live'
    secondsToNext = RALLY_END_SEC - s
  } else {
    phase = 'ended'
    secondsToNext = DAY_SEC - s + CHECKIN_START_SEC // until next day's check-in
  }

  return {
    phase,
    secondsToNext,
    isOpen: phase === 'checkin' || phase === 'live',
  }
}

/** Demo override via `?phase=before|checkin|live|ended` in the URL. */
export function getPhaseOverride(): RallyPhase | null {
  if (typeof window === 'undefined') return null
  const value = new URLSearchParams(window.location.search).get('phase')
  return value && (VALID_PHASES as string[]).includes(value)
    ? (value as RallyPhase)
    : null
}

/** Compact human countdown, e.g. "3h 24m", "24m 10s", "9s". */
export function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${sec}s`
  return `${sec}s`
}
