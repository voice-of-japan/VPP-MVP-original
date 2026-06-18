import { avatars } from '../data/avatars'

// A gathering of avatars receding toward the horizon. Back rows are smaller and
// dimmer (depth); the front row is large and bright. Deterministic layout so
// there's no shift on render. Purely decorative.
type Row = { count: number; size: number; opacity: number }

const ROWS: Row[] = [
  { count: 22, size: 16, opacity: 0.3 },
  { count: 18, size: 24, opacity: 0.5 },
  { count: 14, size: 34, opacity: 0.72 },
  { count: 10, size: 48, opacity: 0.95 },
]

function CoverCrowd() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center justify-end gap-1 pb-6"
      aria-hidden="true"
    >
      {ROWS.map((row, ri) => (
        <div
          key={ri}
          className="flex items-end justify-center"
          style={{ gap: Math.round(row.size * 0.26) }}
        >
          {Array.from({ length: row.count }).map((_, i) => {
            const def = avatars[(i * 2 + ri * 3) % avatars.length]
            const bob = ((i + ri) % 3) - 1
            return (
              <img
                key={i}
                src={def.image}
                alt=""
                draggable={false}
                style={{
                  width: row.size,
                  height: row.size,
                  opacity: row.opacity,
                  transform: `translateY(${bob * 2}px)`,
                }}
                className="object-contain drop-shadow-[0_2px_5px_rgba(0,0,0,0.45)]"
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default CoverCrowd
