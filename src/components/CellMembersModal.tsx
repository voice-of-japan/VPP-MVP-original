import type { Participant } from '../types'
import { intentColors } from '../types'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type Props = {
  open: boolean
  cellIndex: number
  participants: Participant[]
  currentUserId: string | null
  onClose: () => void
  onSelectMember: (participantId: string) => void
}

function CellMembersModal({
  open,
  cellIndex,
  participants,
  currentUserId,
  onClose,
  onSelectMember,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[85dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[560px]">
        <DialogHeader className="border-b border-border px-[22px] py-[18px]">
          <DialogTitle className="text-base uppercase tracking-[0.08em] tabular-nums">
            Cell #{String(cellIndex + 1).padStart(2, '0')}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Participants in this cell. Select a handle to view their avatar.
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-1.5 overflow-y-auto p-2.5 sm:grid-cols-2">
          {participants.map((p) => {
            const isSelf = p.id === currentUserId
            return (
              <button
                key={p.id}
                type="button"
                className={cn(
                  'flex items-center gap-2.5 rounded-[10px] border px-2.5 py-2 text-left text-sm text-foreground transition-[background,border-color] duration-[120ms]',
                  isSelf
                    ? 'border-brand/35 bg-brand/[0.08]'
                    : 'border-transparent hover:border-border hover:bg-white/5',
                )}
                onClick={() => onSelectMember(p.id)}
              >
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ background: intentColors[p.intent] }}
                  aria-hidden="true"
                />
                <span className="flex-1 truncate">{p.handle}</span>
                {isSelf && (
                  <span className="rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-primary-foreground">
                    You
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CellMembersModal
