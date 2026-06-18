import { useEffect, useMemo, useRef } from 'react'
import { avatarById } from '../data/avatars'
import type { Participant } from '../types'
import { CELL_SIZE, intentColors } from '../types'
import { cn } from '@/lib/utils'

type Props = {
  participants: Participant[]
  currentUserId: string | null
  onCellOpen: (cellIndex: number) => void
  onPersonOpen: (participantId: string) => void
}

// Each avatar tile in the crowd (small, static — the moving GIF plays in the
// spotlight). Its intent colour rings the avatar so the Yes/Observe/No mix is
// visible within a cell; your own tile gets a brand ring + "you" marker.
const TILE = 26

function AvatarTile({
  participant,
  mine,
  onClick,
}: {
  participant: Participant
  mine: boolean
  onClick: () => void
}) {
  const def = avatarById(participant.avatarId)
  const color = intentColors[participant.intent]
  return (
    <button
      type="button"
      onClick={onClick}
      title={`${participant.handle} — ${participant.intent}`}
      aria-label={participant.handle}
      className="relative inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full outline-none transition-transform duration-150 hover:z-10 hover:scale-150 focus-visible:z-10 focus-visible:scale-150"
      style={{
        width: TILE,
        height: TILE,
        zIndex: mine ? 5 : undefined,
        background: `radial-gradient(circle at 50% 45%, ${color}33 0%, transparent 70%)`,
        boxShadow: mine
          ? `0 0 0 2px var(--color-brand), 0 0 0 3.5px ${color}, 0 0 10px ${color}`
          : `0 0 0 1.5px ${color}`,
      }}
    >
      <img
        src={def.image}
        alt=""
        draggable={false}
        className="h-full w-full rounded-full object-cover"
      />
      {mine && (
        <span className="pointer-events-none absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-brand px-1 py-px text-[8px] font-bold uppercase leading-none tracking-[0.08em] text-[#1a1407] shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
          you
        </span>
      )}
    </button>
  )
}

function CrowdGrid({
  participants,
  currentUserId,
  onCellOpen,
  onPersonOpen,
}: Props) {
  const myIndex = currentUserId
    ? participants.findIndex((p) => p.id === currentUserId)
    : -1
  const myCellIndex = myIndex === -1 ? -1 : Math.floor(myIndex / CELL_SIZE)

  // Participants are kept in arrival order, so slicing into 50s mixes
  // Yes/Observe/No by join order within each cell — exactly the spec.
  const cells = useMemo(() => {
    const out: Participant[][] = []
    for (let i = 0; i < participants.length; i += CELL_SIZE) {
      out.push(participants.slice(i, i + CELL_SIZE))
    }
    return out
  }, [participants])

  const myCellRef = useRef<HTMLDivElement | null>(null)
  const hasScrolled = useRef(false)

  const scrollToMine = () => {
    myCellRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  // Jump to your cell the first time we know where you are.
  useEffect(() => {
    if (myCellIndex >= 0 && !hasScrolled.current && myCellRef.current) {
      myCellRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      hasScrolled.current = true
    }
  }, [myCellIndex])

  return (
    <div className="w-full">
      {myCellIndex >= 0 && (
        <div className="sticky top-0 z-20 mb-3 flex justify-center">
          <button
            type="button"
            onClick={scrollToMine}
            className="rounded-full border border-brand/50 bg-black/45 px-4 py-1.5 text-[13px] font-medium text-brand backdrop-blur-md transition-colors hover:bg-black/60"
          >
            ↑ Jump to your group · Cell{' '}
            {String(myCellIndex + 1).padStart(2, '0')}
          </button>
        </div>
      )}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(248px,1fr))] gap-3 sm:gap-4">
        {cells.map((cell, ci) => {
          const isMine = ci === myCellIndex
          return (
            <div
              key={ci}
              ref={isMine ? myCellRef : undefined}
              className={cn(
                'cv-auto rounded-xl border p-2.5 transition-colors',
                isMine
                  ? 'border-brand/70 bg-black/35 shadow-[0_0_0_1px_var(--color-brand),0_0_24px_rgba(241,210,123,0.25)] backdrop-blur-sm'
                  : 'border-white/8 bg-black/8',
              )}
            >
              <button
                type="button"
                onClick={() => onCellOpen(ci)}
                className="mb-2 flex w-full items-center justify-between gap-2 rounded-md px-0.5 text-left transition-colors hover:text-foreground"
                title="View the 50 handles in this cell"
              >
                <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted tabular-nums">
                  Cell {String(ci + 1).padStart(2, '0')}
                </span>
                {isMine ? (
                  <span className="rounded-full bg-brand px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[#1a1407]">
                    Your group
                  </span>
                ) : (
                  <span className="text-[11px] tabular-nums text-text-faint">
                    {cell.length}
                  </span>
                )}
              </button>

              <div className="flex flex-wrap content-start justify-center gap-x-1 gap-y-2 pt-1">
                {cell.map((p) => (
                  <AvatarTile
                    key={p.id}
                    participant={p}
                    mine={p.id === currentUserId}
                    onClick={() => onPersonOpen(p.id)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CrowdGrid
