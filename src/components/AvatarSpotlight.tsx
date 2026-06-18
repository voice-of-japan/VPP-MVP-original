import Avatar from './Avatar'
import type { Participant } from '../types'
import { intentColors, intentLabels } from '../types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'

type Props = {
  participant: Participant | null
  onClose: () => void
}

function AvatarSpotlight({ participant, onClose }: Props) {
  const open = participant !== null
  const color = participant ? intentColors[participant.intent] : undefined

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex flex-col items-center gap-[18px] border-border bg-gradient-to-b from-[#161826] to-background px-8 pb-7 pt-9 sm:max-w-[420px]">
        {participant && (
          <>
            <DialogTitle className="sr-only">
              {participant.handle} — animated avatar
            </DialogTitle>
            <DialogDescription className="sr-only">
              {participant.handle}'s avatar and participation choice.
            </DialogDescription>

            <div
              className="min-w-[160px] rounded-xl border-2 bg-white/[0.02] px-[22px] py-2 text-center"
              style={{ borderColor: color, boxShadow: `0 0 32px ${color}33` }}
            >
              <span className="text-[15px] font-medium tracking-[0.04em] text-foreground">
                {participant.handle}
              </span>
            </div>

            <div className="p-3">
              <Avatar
                avatarId={participant.avatarId}
                intent={participant.intent}
                size="xl"
                animated
                ring
              />
            </div>

            <p
              className="text-xs font-semibold uppercase tracking-[0.16em]"
              style={{ color }}
            >
              {intentLabels[participant.intent]}
            </p>

            {participant.message && (
              <div className="relative mt-1 max-w-[320px] animate-bubble-pop rounded-[14px] bg-white/95 px-4 py-3 text-center text-sm leading-normal text-[#1a1407] before:absolute before:-top-2 before:left-1/2 before:-translate-x-1/2 before:border-x-[9px] before:border-b-[9px] before:border-x-transparent before:border-b-white/95">
                <p>{participant.message}</p>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default AvatarSpotlight
