import { avatarById } from '../data/avatars'
import type { AvatarId, Intent } from '../types'
import { intentColors } from '../types'

type Size = 'sm' | 'md' | 'lg' | 'xl'

type Props = {
  avatarId: AvatarId
  intent?: Intent
  size?: Size
  animated?: boolean
  ring?: boolean
  ariaLabel?: string
}

const sizePx: Record<Size, number> = {
  sm: 28,
  md: 48,
  lg: 96,
  xl: 160,
}

function Avatar({
  avatarId,
  intent,
  size = 'md',
  animated = false,
  ring = false,
  ariaLabel,
}: Props) {
  const def = avatarById(avatarId)
  const px = sizePx[size]

  const style: React.CSSProperties = {
    width: px,
    height: px,
    background: `radial-gradient(circle at 50% 45%, ${def.accent}24 0%, transparent 70%)`,
    boxShadow: ring && intent ? `0 0 0 3px ${intentColors[intent]}` : undefined,
  }

  return (
    <span
      className="relative inline-flex shrink-0 select-none items-center justify-center rounded-full transition-transform duration-200"
      style={style}
      role="img"
      aria-label={ariaLabel ?? def.label}
    >
      <img
        src={animated ? def.gif : def.image}
        alt=""
        draggable={false}
        className="h-full w-full rounded-full object-cover"
      />
    </span>
  )
}

export default Avatar
