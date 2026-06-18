import { useEffect } from 'react'
import Avatar from '../components/Avatar'
import type { Participant } from '../types'
import { intentColors } from '../types'

type Props = {
  participant: Participant
  onEntered: () => void
}

const HOLD_MS = 2000

function EnteringScreen({ participant, onEntered }: Props) {
  useEffect(() => {
    const t = window.setTimeout(onEntered, HOLD_MS)
    return () => window.clearTimeout(t)
  }, [onEntered])

  const color = intentColors[participant.intent]

  return (
    <main className="relative isolate flex flex-1 items-center justify-center overflow-hidden px-6 py-12">
      <div
        className="absolute inset-0 -z-20"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, rgba(246,196,83,0.06) 0%, transparent 60%), linear-gradient(180deg, #0b0d12 0%, #161826 100%)',
        }}
        aria-hidden="true"
      />

      <div className="flex animate-rise flex-col items-center gap-[22px] text-center">
        <div
          className="min-w-[160px] rounded-xl border-2 bg-white/[0.02] px-6 py-2.5"
          style={{ borderColor: color, boxShadow: `0 0 32px ${color}40` }}
        >
          <span className="text-base font-medium tracking-[0.04em] text-foreground">
            {participant.handle}
          </span>
        </div>

        <div className="animate-pop p-3.5">
          <Avatar
            avatarId={participant.avatarId}
            intent={participant.intent}
            size="xl"
            animated
            ring
          />
        </div>

        <p className="animate-fade-up font-display text-[clamp(20px,2.4vw,28px)] font-light tracking-[0.01em] text-text-muted [animation-delay:400ms]">
          You are here.
        </p>
      </div>
    </main>
  )
}

export default EnteringScreen
