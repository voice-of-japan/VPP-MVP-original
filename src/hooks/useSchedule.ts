import { useEffect, useMemo, useState } from 'react'
import {
  computeSchedule,
  getPhaseOverride,
  type RallyPhase,
  type ScheduleState,
} from '../lib/schedule'

export type UseSchedule = ScheduleState & {
  /** True when a `?phase=` URL override is forcing the phase (demo mode). */
  overridden: boolean
}

export function useSchedule(): UseSchedule {
  const override = useMemo<RallyPhase | null>(() => getPhaseOverride(), [])
  const [state, setState] = useState<ScheduleState>(() => computeSchedule())

  useEffect(() => {
    const id = window.setInterval(() => setState(computeSchedule()), 1000)
    return () => window.clearInterval(id)
  }, [])

  if (override) {
    return {
      ...state,
      phase: override,
      isOpen: override === 'checkin' || override === 'live',
      overridden: true,
    }
  }

  return { ...state, overridden: false }
}
