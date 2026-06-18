import type { AvatarId, Intent, Participant } from '../../shared/types'
import { MAX_HANDLE_LENGTH } from '../../shared/types'

const handles = [
  'CalmRiver', 'PineSilver', 'Echo', 'NorthStar', 'GreenGale', 'Marlow',
  'OceanCalls', 'Quill', 'SilentRoot', 'AshenSky', 'Briar', 'Frost', 'Halo',
  'Inkwell', 'Juniper', 'Kestrel', 'Linden', 'Mosswood', 'Nebula', 'Orchid',
  'PalePath', 'Quartzite', 'Rowan', 'Stellar', 'Tidepool', 'Umberlin',
  'Vesper', 'Wildling', 'Xenith', 'YarrowSun', 'Zephyr', 'AnchorOak',
  'Bluefield', 'Cinder', 'Dustglow', 'Emberly', 'FernGate', 'Glade',
  'Hollow', 'Iverling', 'JadeBird', 'KitePath', 'Lichen', 'MirrorLake',
  'Nightfall', 'Oakshore', 'Plumeria', 'Quietly', 'Reedling', 'Saltwind',
  'Tundra', 'UrsaMinor', 'Veilroot', 'Willowy', 'Xylo', 'YonderBay',
  'Zinnia', 'Arcadia', 'Brindle', 'CinderTwo', 'Dewfern', 'Edgeline',
  'Firnlee', 'Gallow', 'Hush', 'Iris', 'Jovi', 'Kael', 'Lumen', 'Mavyn',
  'Nyx', 'Onyx', 'Pera', 'Quincey',
]

const sampleMessages = [
  'Listening today.',
  'Hopeful but cautious.',
  'Showing up for the future.',
  'Standing with the science.',
  'Quiet support.',
  'Still learning.',
  'Here for the next generation.',
  'One small voice.',
  'Watching the data unfold.',
  'Present, and paying attention.',
  'For my kids.',
  'The planet is worth it.',
  'Curious where this goes.',
  'Reading more before I decide.',
  'Small actions add up.',
  'Keeping an open mind.',
  'Here to understand.',
  'Change starts with showing up.',
  'Hope over fear.',
  'Every voice counts.',
  'Witnessing this together.',
  'Concerned, but hopeful.',
  'We share one planet.',
  'Here to listen and learn.',
]

const avatarIds: AvatarId[] = [
  'bear', 'man', 'woman', 'boy', 'girl', 'groggy', 'phone', 'invisible', 'box',
  'mask', 'shadow', 'flower', 'statue', 'military', 'weep', 'robot',
]

function makeRng(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 0x100000000
    return s / 0x100000000
  }
}

// Unique handle for any index — base names first, then base+suffix rounds
// (e.g. "CalmRiver", … "CalmRiver2", …), always within MAX_HANDLE_LENGTH.
function makeHandle(i: number): string {
  const base = handles[i % handles.length]
  const round = Math.floor(i / handles.length)
  if (round === 0) return base
  const suffix = String(round + 1)
  return base.slice(0, MAX_HANDLE_LENGTH - suffix.length) + suffix
}

export function generateSeedParticipants(count = 73): Participant[] {
  const rng = makeRng(20260520)
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)]

  const startTime = Date.now() - 1000 * 60 * 12
  const total = Math.max(0, count)

  return Array.from({ length: total }, (_, i): Participant => {
    const roll = rng()
    const intent: Intent = roll < 0.45 ? 'yes' : roll < 0.75 ? 'observe' : 'no'
    return {
      id: `seed-${i}`,
      handle: makeHandle(i),
      intent,
      avatarId: pick(avatarIds),
      // Every participant carries a statement so the speech bubble appears for
      // anyone in the crowd (Otoya: readable text for every participant).
      message: pick(sampleMessages),
      joinedAt: startTime + i * (1000 * 6 + Math.floor(rng() * 4000)),
    }
  })
}
