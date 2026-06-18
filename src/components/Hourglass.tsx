import { cn } from '@/lib/utils'

type Size = 'sm' | 'md' | 'lg' | 'xl'

const dimensions: Record<Size, { width: number; height: number }> = {
  sm: { width: 60, height: 90 },
  md: { width: 96, height: 144 },
  lg: { width: 180, height: 270 },
  xl: { width: 260, height: 390 },
}

type Props = {
  size?: Size
  glow?: boolean
}

// One full turn = drain (10s) → flip (1s) → drain the other way (10s) → flip.
// Calm and slow. Everything below shares this 22s SVG timeline so the flip
// always lands exactly when a bulb finishes emptying.
const DUR = '22s'
// keyTimes: start · top-empty · flipped · bottom-empty · flipped-back
const KT = '0; 0.4545; 0.5; 0.9545; 1'

const grains = [
  { cx: 40, begin: '0s' },
  { cx: 39.3, begin: '0.45s' },
  { cx: 40.7, begin: '0.9s' },
]
const GRAIN_DUR = '1.3s'

function Hourglass({ size = 'md', glow = false }: Props) {
  const { width, height } = dimensions[size]

  return (
    <div
      className="relative inline-flex"
      style={{ width, height }}
      role="img"
      aria-label="Hourglass — the rally is in progress"
    >
      <svg
        viewBox="0 0 80 120"
        className={cn(
          'h-full w-full overflow-visible',
          glow
            ? 'drop-shadow-[0_0_34px_rgba(246,196,83,0.3)]'
            : 'drop-shadow-[0_6px_18px_rgba(0,0,0,0.35)]',
        )}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="hg-sand" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f7dca0" />
            <stop offset="55%" stopColor="#f1c453" />
            <stop offset="100%" stopColor="#df8d4f" />
          </linearGradient>
          <linearGradient id="hg-frame" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(244,244,246,0.9)" />
            <stop offset="100%" stopColor="rgba(244,244,246,0.5)" />
          </linearGradient>
          <linearGradient id="hg-cap" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e6d2a0" />
            <stop offset="100%" stopColor="#b6a067" />
          </linearGradient>
          <radialGradient id="hg-glow" cx="0.5" cy="0.5" r="0.6">
            <stop offset="0%" stopColor="rgba(246,196,83,0.4)" />
            <stop offset="100%" stopColor="rgba(246,196,83,0)" />
          </radialGradient>
          <clipPath id="hg-top">
            <path d="M 15 10 L 65 10 L 43 58 L 37 58 Z" />
          </clipPath>
          <clipPath id="hg-bottom">
            <path d="M 37 58 L 43 58 L 65 110 L 15 110 Z" />
          </clipPath>
        </defs>

        {/* Whole glass turns over each time a bulb empties. */}
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 40 60; 0 40 60; 180 40 60; 180 40 60; 360 40 60"
            keyTimes={KT}
            calcMode="spline"
            keySplines="0 0 1 1; 0.45 0 0.55 1; 0 0 1 1; 0.45 0 0.55 1"
            dur={DUR}
            repeatCount="indefinite"
          />

          <ellipse cx="40" cy="104" rx="30" ry="14" fill="url(#hg-glow)" />

          <path
            d="M 15 10 L 65 10 L 43 58 L 65 110 L 15 110 L 37 58 Z"
            fill="rgba(255,255,255,0.04)"
            stroke="url(#hg-frame)"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />

          {/* top bulb sand: phase 1 drains toward the neck; phase 2 (flipped) it
              becomes the lower bulb, so the pile fills from the wide end (y=10). */}
          <g clipPath="url(#hg-top)">
            <rect x="15" width="50" fill="url(#hg-sand)">
              <animate attributeName="y" values="10;58;10;10;10" keyTimes={KT} dur={DUR} repeatCount="indefinite" />
              <animate attributeName="height" values="48;0;0;48;48" keyTimes={KT} dur={DUR} repeatCount="indefinite" />
            </rect>
          </g>

          {/* bottom bulb sand: phase 1 piles up from the wide end (y=110); phase 2
              (flipped) it becomes the upper bulb and drains toward the neck. */}
          <g clipPath="url(#hg-bottom)">
            <rect x="15" width="50" fill="url(#hg-sand)">
              <animate attributeName="y" values="110;58;58;58;110" keyTimes={KT} dur={DUR} repeatCount="indefinite" />
              <animate attributeName="height" values="0;52;52;0;0" keyTimes={KT} dur={DUR} repeatCount="indefinite" />
            </rect>
          </g>

          {/* falling sand — phase 1 (stream + grains drop into the lower bulb) */}
          <g>
            <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.4545;0.47;1" dur={DUR} repeatCount="indefinite" />
            <rect x="39.2" y="56" width="1.6" height="50" fill="url(#hg-sand)" opacity="0.45" />
            {grains.map((g, i) => (
              <circle key={i} cx={g.cx} r="1.1" fill="#f4c453">
                <animate attributeName="cy" values="58;104" dur={GRAIN_DUR} begin={g.begin} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.8;1" dur={GRAIN_DUR} begin={g.begin} repeatCount="indefinite" />
              </circle>
            ))}
          </g>

          {/* falling sand — phase 2 (glass flipped; stream + grains on the other side) */}
          <g>
            <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;0.5;0.51;0.9545;0.96;1" dur={DUR} repeatCount="indefinite" />
            <rect x="39.2" y="8" width="1.6" height="50" fill="url(#hg-sand)" opacity="0.45" />
            {grains.map((g, i) => (
              <circle key={i} cx={g.cx} r="1.1" fill="#f4c453">
                <animate attributeName="cy" values="58;16" dur={GRAIN_DUR} begin={g.begin} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.8;1" dur={GRAIN_DUR} begin={g.begin} repeatCount="indefinite" />
              </circle>
            ))}
          </g>

          {/* metal caps */}
          <rect x="11" y="5" width="58" height="5" rx="2.5" fill="url(#hg-cap)" />
          <rect x="11" y="110" width="58" height="5" rx="2.5" fill="url(#hg-cap)" />

          {/* glass shine */}
          <path d="M 22 14 L 36 52" stroke="rgba(255,255,255,0.35)" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        </g>
      </svg>
    </div>
  )
}

export default Hourglass
