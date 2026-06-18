import { useMemo, useState } from 'react'
import AvatarSpotlight from '../components/AvatarSpotlight'
import CellMembersModal from '../components/CellMembersModal'
import CountsBar from '../components/CountsBar'
import CrowdGrid from '../components/CrowdGrid'
import type { ConnectionStatus } from '../hooks/useRallyConnection'
import { RALLY_LOCATION, RALLY_THEME } from '../data/termsOfService'
import type { Participant } from '../types'
import { CELL_SIZE } from '../types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import mallBg from '../assets/mall.webp'

type Props = {
  participants: Participant[]
  currentUserId: string | null
  connectionStatus: ConnectionStatus
  onLeave: () => void
  onAttend: () => void
}

// Dusk scrim over the National Mall photo: dark at the top (so the climate
// question reads), light through the middle (the monument shows), dark at the
// bottom (so the avatar crowd + counts bar read over the reflecting pool).
const scrim =
  'linear-gradient(180deg, rgba(8,6,14,0.80) 0%, rgba(8,6,14,0.32) 26%, rgba(8,6,14,0.28) 52%, rgba(8,6,14,0.74) 82%, rgba(8,6,14,0.95) 100%)'

function RallyScreen({
  participants,
  currentUserId,
  connectionStatus,
  onLeave,
  onAttend,
}: Props) {
  const [openCellIndex, setOpenCellIndex] = useState<number | null>(null)
  const [spotlightId, setSpotlightId] = useState<string | null>(null)

  // Spectators reach the rally via "View the live rally" on the cover — they
  // watch the anonymous aggregate without a participant of their own.
  const isParticipant = currentUserId !== null

  const cellParticipants = useMemo(() => {
    if (openCellIndex === null) return []
    const start = openCellIndex * CELL_SIZE
    return participants.slice(start, start + CELL_SIZE)
  }, [openCellIndex, participants])

  const spotlightParticipant =
    participants.find((p) => p.id === spotlightId) ?? null

  const isLive = connectionStatus === 'open'

  return (
    <main className="relative isolate flex h-svh flex-col overflow-hidden">
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${mallBg})` }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 -z-10"
        style={{ background: scrim }}
        aria-hidden="true"
      />

      <header className="flex items-start justify-between gap-3 px-4 pb-3 pt-6 sm:px-8 sm:pt-9">
        <div className="flex-1">
          <p className="mb-1.5 text-[11px] uppercase tracking-[0.22em] text-text-faint">
            {RALLY_LOCATION}
          </p>
          <h1 className="max-w-[760px] text-balance text-[clamp(22px,3.2vw,34px)] font-light leading-[1.18] tracking-[-0.008em] text-foreground [text-shadow:0_2px_18px_rgba(0,0,0,0.4)]">
            {RALLY_THEME}
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            <span className="font-semibold tabular-nums text-foreground">
              {participants.length.toLocaleString()}
            </span>{' '}
            {participants.length === 1 ? 'voice' : 'voices'} present
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white/[0.03] px-2.5 py-1.5 text-[11px] uppercase tracking-[0.1em] text-text-muted sm:px-3"
            title={`Connection: ${connectionStatus}`}
          >
            <span
              className={cn(
                'size-[7px] rounded-full',
                isLive
                  ? 'animate-pulse bg-yes shadow-[0_0_8px_var(--color-yes)]'
                  : 'bg-no',
              )}
            />
            <span className="hidden sm:inline">
              {isLive ? 'Live' : 'Reconnecting…'}
            </span>
          </span>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-border bg-transparent text-[13px] text-text-muted hover:bg-white/5 hover:text-foreground"
            onClick={onLeave}
          >
            {isParticipant ? 'Leave' : 'Exit'}
          </Button>
        </div>
      </header>

      {(connectionStatus === 'closed' || connectionStatus === 'error') && (
        <div className="px-4 pt-1 sm:px-8">
          <div className="mx-auto flex max-w-[1200px] items-center gap-2 rounded-lg border border-no/30 bg-no/10 px-3 py-2 text-[13px] text-text-muted">
            <span className="size-2 shrink-0 animate-pulse rounded-full bg-no" />
            Connection lost — trying to reconnect…
          </div>
        </div>
      )}

      <section className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-4 pb-[170px] pt-5 sm:px-8 sm:pb-[140px]">
        <div className="w-full max-w-[1200px]">
          {participants.length === 0 ? (
            <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
              {connectionStatus === 'connecting' ? (
                <>
                  <span className="size-6 animate-spin rounded-full border-2 border-white/15 border-t-brand" />
                  <p className="text-text-muted">Loading the rally…</p>
                </>
              ) : (
                <>
                  <p className="font-display text-2xl font-light text-foreground">
                    It’s quiet here.
                  </p>
                  <p className="text-sm text-text-muted">
                    You’re the first to arrive. Others will gather soon.
                  </p>
                </>
              )}
            </div>
          ) : (
            <CrowdGrid
              participants={participants}
              currentUserId={currentUserId}
              onCellOpen={(index) => setOpenCellIndex(index)}
              onPersonOpen={(id) => setSpotlightId(id)}
            />
          )}
        </div>
      </section>

      <footer className="fixed inset-x-0 bottom-0 z-10">
        {!isParticipant && (
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-t border-border bg-background/90 px-4 py-2.5 text-[13px] text-text-muted backdrop-blur-md">
            <span>You’re viewing the rally as a guest.</span>
            <Button
              size="sm"
              className="rounded-full bg-brand text-[13px] font-semibold text-primary-foreground hover:bg-brand-strong"
              onClick={onAttend}
            >
              Add your voice
            </Button>
          </div>
        )}
        <CountsBar participants={participants} />
      </footer>

      <CellMembersModal
        open={openCellIndex !== null}
        cellIndex={openCellIndex ?? 0}
        participants={cellParticipants}
        currentUserId={currentUserId}
        onClose={() => setOpenCellIndex(null)}
        onSelectMember={(id) => setSpotlightId(id)}
      />

      <AvatarSpotlight
        participant={spotlightParticipant}
        onClose={() => setSpotlightId(null)}
      />
    </main>
  )
}

export default RallyScreen
