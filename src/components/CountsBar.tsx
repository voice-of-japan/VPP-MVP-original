import type { Intent, Participant } from '../types'
import { intentLabels } from '../types'

type Props = {
  participants: Participant[]
}

const segmentColor: Record<Intent, string> = {
  yes: 'bg-yes',
  observe: 'bg-observe',
  no: 'bg-no',
}

function CountsBar({ participants }: Props) {
  const counts: Record<Intent, number> = { yes: 0, observe: 0, no: 0 }
  for (const p of participants) counts[p.intent]++

  const total = participants.length || 1

  return (
    <div
      className="flex w-full flex-col gap-2 border-t border-border bg-background/85 px-4 pb-4 pt-3 backdrop-blur-md sm:px-6"
      aria-label="Live participation counts"
    >
      {/* Tall proportion bar with the Yes / Observe / No counts inside each segment. */}
      <div className="relative flex h-9 w-full overflow-hidden rounded-lg bg-white/[0.06]">
        {(['yes', 'observe', 'no'] as Intent[]).map((intent) => (
          <div
            key={intent}
            className={`flex h-full items-center justify-center overflow-hidden transition-[width] duration-[400ms] ${segmentColor[intent]}`}
            style={{ width: `${(counts[intent] / total) * 100}%` }}
          >
            <span className="whitespace-nowrap px-1.5 text-[13px] font-semibold tabular-nums text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.55)]">
              {intentLabels[intent]} {counts[intent]}
            </span>
          </div>
        ))}
      </div>

      <div className="text-right text-[12px] text-text-muted">
        Total{' '}
        <span className="font-semibold tabular-nums text-foreground">
          {participants.length}
        </span>
      </div>
    </div>
  )
}

export default CountsBar
