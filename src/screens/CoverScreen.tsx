import { useState } from 'react'
import TermsOfServiceModal from '../components/TermsOfServiceModal'
import { RALLY_LOCATION, RALLY_THEME } from '../data/termsOfService'
import { useSchedule } from '../hooks/useSchedule'
import { SCHEDULE_LABELS, formatCountdown } from '../lib/schedule'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import coverBear from '../assets/cover-bear.webp'

type Props = {
  onAttend: () => void
  onDecline: () => void
  onViewRally: () => void
}

// Gentle scrim over the polar-bear-at-dusk photo. Kept light so the aurora and
// sunset glow stay vivid: darker at the very top (location label) and bottom
// (grounds the scene), nearly clear through the middle where the sky is already
// deep navy behind the headline. Buttons carry their own backdrop for contrast
// over the bright horizon, so we don't have to dim the whole image.
const scrim =
  'linear-gradient(180deg, rgba(6,9,18,0.48) 0%, rgba(6,9,18,0.10) 32%, rgba(6,9,18,0.16) 58%, rgba(6,9,18,0.50) 100%)'

function CoverScreen({ onAttend, onDecline, onViewRally }: Props) {
  const [termsOpen, setTermsOpen] = useState(false)
  // Time-gating per the ToS (check-in 10 AM ET, rally 6–8 PM ET). `isOpen` is
  // true during check-in or live; attending/spectating is gated to that window.
  // Append ?phase=before|checkin|live|ended to the URL to force a phase (demo).
  const { phase, secondsToNext, isOpen, overridden } = useSchedule()

  const handleAgreeAndAttend = () => {
    setTermsOpen(false)
    onAttend()
  }

  const countdown = formatCountdown(secondsToNext)
  const status = {
    before: {
      tone: 'idle' as const,
      text: `Check-in opens ${SCHEDULE_LABELS.checkinStart} ${SCHEDULE_LABELS.tz}`,
      meta: `in ${countdown}`,
    },
    checkin: {
      tone: 'open' as const,
      text: `Check-in open · rally begins ${SCHEDULE_LABELS.rallyStart} ${SCHEDULE_LABELS.tz}`,
      meta: `in ${countdown}`,
    },
    live: {
      tone: 'live' as const,
      text: `Rally is live · ends ${SCHEDULE_LABELS.rallyEnd} ${SCHEDULE_LABELS.tz}`,
      meta: `${countdown} left`,
    },
    ended: {
      tone: 'idle' as const,
      text: `Today’s rally has ended · next check-in ${SCHEDULE_LABELS.checkinStart} ${SCHEDULE_LABELS.tz}`,
      meta: `in ${countdown}`,
    },
  }[phase]

  const dotClass =
    status.tone === 'live'
      ? 'animate-pulse bg-yes shadow-[0_0_8px_var(--color-yes)]'
      : status.tone === 'open'
        ? 'bg-brand'
        : 'bg-text-faint'

  return (
    <main className="relative isolate flex flex-1 items-center justify-center overflow-hidden px-6 pb-[26vh] pt-12">
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${coverBear})` }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 -z-10"
        style={{ background: scrim }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex max-w-3xl flex-col items-center gap-[18px] text-center">
        <p className="mb-2 text-[13px] uppercase tracking-[0.22em] text-text-faint">
          {RALLY_LOCATION}
        </p>
        <h1 className="mb-2 text-balance font-display text-[clamp(32px,5.8vw,62px)] font-light leading-[1.1] tracking-[-0.012em] text-foreground [text-shadow:0_2px_28px_rgba(0,0,0,0.65)]">
          {RALLY_THEME}
        </h1>

        {/* Live schedule status + countdown to the next phase boundary. */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3.5 py-1.5 text-[13px] backdrop-blur-sm">
          <span className={cn('size-[7px] shrink-0 rounded-full', dotClass)} />
          <span className="text-foreground/90">{status.text}</span>
          <span className="text-text-faint">· {status.meta}</span>
          {overridden && <span className="text-text-faint">· demo</span>}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="rounded-full border-white/25 bg-black/20 text-[13px] uppercase tracking-[0.06em] text-text-muted backdrop-blur-sm hover:bg-black/35 hover:text-foreground"
          onClick={() => setTermsOpen(true)}
        >
          Terms of Service
        </Button>

        <div className="mt-3 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:gap-[14px]">
          <Button
            size="lg"
            disabled={!isOpen}
            title={
              isOpen
                ? undefined
                : `Check-in opens at ${SCHEDULE_LABELS.checkinStart} ${SCHEDULE_LABELS.tz}`
            }
            className="rounded-full bg-brand text-base font-semibold text-primary-foreground shadow-[0_8px_28px_rgba(0,0,0,0.45)] hover:bg-brand-strong sm:min-w-[200px]"
            onClick={onAttend}
          >
            Agree to Terms &amp; Attend
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="rounded-full border-white/30 bg-black/25 text-base font-semibold text-foreground backdrop-blur-sm hover:bg-black/40 sm:min-w-[180px]"
            onClick={onDecline}
          >
            Do Not Attend
          </Button>
        </div>

        {/* Spectate without participating — only while there's a live gathering
            (check-in or rally hours). Viewing isn't gated by the ToS. */}
        {isOpen && (
          <button
            type="button"
            onClick={onViewRally}
            className="mt-1 inline-flex items-center gap-1.5 text-[13px] text-text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            View the live rally
            <span aria-hidden="true">→</span>
          </button>
        )}
      </div>

      <TermsOfServiceModal
        open={termsOpen}
        onClose={() => setTermsOpen(false)}
        onAgreeAndAttend={isOpen ? handleAgreeAndAttend : undefined}
      />
    </main>
  )
}

export default CoverScreen
