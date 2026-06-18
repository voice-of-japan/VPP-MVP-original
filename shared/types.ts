export type Intent = 'yes' | 'observe' | 'no'

export type AvatarId =
  | 'bear'
  | 'man'
  | 'woman'
  | 'boy'
  | 'girl'
  | 'groggy'
  | 'phone'
  | 'invisible'
  | 'box'
  | 'mask'
  | 'shadow'
  | 'flower'
  | 'statue'
  | 'military'
  | 'weep'
  | 'robot'

export type Participant = {
  id: string
  handle: string
  intent: Intent
  avatarId: AvatarId
  message?: string
  joinedAt: number
}

export type JoinRequest = {
  handle: string
  intent: Intent
  avatarId: AvatarId
  message?: string
}

export type JoinResponse =
  | { ok: true; participant: Participant }
  | { ok: false; error: 'handle_taken' | 'invalid' | 'rally_full' }

export type HandleCheckResponse = {
  available: boolean
  reason?: 'taken' | 'invalid'
}

export type StateSnapshot = {
  participants: Participant[]
  rallyId: string
  startedAt: number
}

export type WsServerMessage =
  | { type: 'snapshot'; participants: Participant[] }
  | { type: 'join'; participant: Participant }
  | { type: 'leave'; participantId: string }
  | { type: 'purged' }

export const CELL_SIZE = 50
export const MAX_HANDLE_LENGTH = 12
export const MAX_MESSAGE_LENGTH = 80
export const RALLY_CAPACITY = 2500

export const intentColors: Record<Intent, string> = {
  yes: '#3ec27a',
  observe: '#8b8f99',
  no: '#e25555',
}

export const intentLabels: Record<Intent, string> = {
  yes: 'Yes',
  observe: 'Observe',
  no: 'No',
}
