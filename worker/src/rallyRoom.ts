import type {
  JoinRequest,
  JoinResponse,
  Participant,
  WsServerMessage,
} from '../../shared/types'
import {
  MAX_HANDLE_LENGTH,
  MAX_MESSAGE_LENGTH,
  RALLY_CAPACITY,
} from '../../shared/types'
import { generateSeedParticipants } from './seed'

export interface Env {
  RALLY_ROOM: DurableObjectNamespace
  VPP_ARCHIVE: KVNamespace
  RALLY_ID: string
  SEED_ON_EMPTY?: string
  SEED_COUNT?: string
}

const STORAGE_KEYS = {
  participants: 'participants',
  startedAt: 'startedAt',
} as const

export class RallyRoom {
  private state: DurableObjectState
  private env: Env
  private participants: Participant[] = []
  private handles = new Set<string>()
  private startedAt = 0
  private loaded = false

  constructor(state: DurableObjectState, env: Env) {
    this.state = state
    this.env = env
  }

  private async load(): Promise<void> {
    if (this.loaded) return
    const stored = await this.state.storage.get<Participant[]>(
      STORAGE_KEYS.participants,
    )
    const startedAt = await this.state.storage.get<number>(
      STORAGE_KEYS.startedAt,
    )
    if (stored) {
      this.participants = stored
      for (const p of stored) this.handles.add(p.handle.toLowerCase())
    }
    if (startedAt) {
      this.startedAt = startedAt
    } else {
      this.startedAt = Date.now()
      await this.state.storage.put(STORAGE_KEYS.startedAt, this.startedAt)
    }

    if (this.participants.length === 0 && this.env.SEED_ON_EMPTY === 'true') {
      const count = Number(this.env.SEED_COUNT) || 73
      this.participants = generateSeedParticipants(count)
      for (const p of this.participants) this.handles.add(p.handle.toLowerCase())
      await this.state.storage.put(STORAGE_KEYS.participants, this.participants)
    }

    this.loaded = true
  }

  async fetch(request: Request): Promise<Response> {
    await this.load()
    const url = new URL(request.url)

    switch (url.pathname) {
      case '/state':
        return this.handleState()
      case '/join':
        if (request.method !== 'POST') return methodNotAllowed()
        return this.handleJoin(request)
      case '/leave':
        if (request.method !== 'POST') return methodNotAllowed()
        return this.handleLeave(request)
      case '/handle-check':
        return this.handleCheck(url)
      case '/ws':
        return this.handleWs(request)
      case '/purge':
        if (request.method !== 'POST') return methodNotAllowed()
        return this.handlePurge()
      default:
        return new Response('Not found', { status: 404 })
    }
  }

  // --- WebSocket Hibernation API handlers ---
  // The runtime tracks accepted sockets and only returns live ones from
  // getWebSockets(), so we never broadcast to a dead socket (which previously
  // threw "Network connection lost"). These handlers may run on a freshly
  // hydrated instance, so they load() before touching participant state.

  async webSocketMessage(): Promise<void> {
    // Clients don't send messages; nothing to handle.
  }

  async webSocketClose(ws: WebSocket): Promise<void> {
    try {
      ws.close()
    } catch {
      // already closed
    }
  }

  async webSocketError(): Promise<void> {
    // Runtime drops the socket from getWebSockets() automatically.
  }

  private handleState(): Response {
    return Response.json({
      participants: this.participants,
      rallyId: this.env.RALLY_ID,
      startedAt: this.startedAt,
    })
  }

  private async handleJoin(request: Request): Promise<Response> {
    let body: JoinRequest
    try {
      body = (await request.json()) as JoinRequest
    } catch {
      return Response.json(
        { ok: false, error: 'invalid' } satisfies JoinResponse,
        { status: 400 },
      )
    }

    const handle = (body.handle ?? '').trim()
    if (
      !handle ||
      handle.length > MAX_HANDLE_LENGTH ||
      !body.intent ||
      !body.avatarId
    ) {
      return Response.json(
        { ok: false, error: 'invalid' } satisfies JoinResponse,
        { status: 400 },
      )
    }

    if (this.participants.length >= RALLY_CAPACITY) {
      return Response.json(
        { ok: false, error: 'rally_full' } satisfies JoinResponse,
        { status: 409 },
      )
    }

    const lower = handle.toLowerCase()
    if (this.handles.has(lower)) {
      return Response.json(
        { ok: false, error: 'handle_taken' } satisfies JoinResponse,
        { status: 409 },
      )
    }

    const message = body.message?.trim()
    const participant: Participant = {
      id: crypto.randomUUID(),
      handle,
      intent: body.intent,
      avatarId: body.avatarId,
      message:
        message && message.length > 0
          ? message.slice(0, MAX_MESSAGE_LENGTH)
          : undefined,
      joinedAt: Date.now(),
    }

    this.participants.push(participant)
    this.handles.add(lower)
    await this.state.storage.put(STORAGE_KEYS.participants, this.participants)

    this.broadcast({ type: 'join', participant })

    return Response.json({
      ok: true,
      participant,
    } satisfies JoinResponse)
  }

  private async handleLeave(request: Request): Promise<Response> {
    let body: { id?: string }
    try {
      body = (await request.json()) as { id?: string }
    } catch {
      return Response.json({ ok: false }, { status: 400 })
    }
    const id = body.id
    if (!id) return Response.json({ ok: false }, { status: 400 })

    const idx = this.participants.findIndex((p) => p.id === id)
    if (idx === -1) return Response.json({ ok: true }) // already gone

    const [removed] = this.participants.splice(idx, 1)
    this.handles.delete(removed.handle.toLowerCase())
    await this.state.storage.put(STORAGE_KEYS.participants, this.participants)

    this.broadcast({ type: 'leave', participantId: id })

    return Response.json({ ok: true })
  }

  private handleCheck(url: URL): Response {
    const h = (url.searchParams.get('h') ?? '').trim()
    if (!h || h.length > MAX_HANDLE_LENGTH) {
      return Response.json({ available: false, reason: 'invalid' })
    }
    const available = !this.handles.has(h.toLowerCase())
    return Response.json({
      available,
      reason: available ? undefined : 'taken',
    })
  }

  private handleWs(request: Request): Response {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected WebSocket upgrade', { status: 426 })
    }

    const pair = new WebSocketPair()
    const client = pair[0]
    const server = pair[1]

    // Hibernation API: the runtime owns the socket lifecycle.
    this.state.acceptWebSocket(server)
    safeSend(server, { type: 'snapshot', participants: this.participants })

    return new Response(null, {
      status: 101,
      webSocket: client,
    })
  }

  private async handlePurge(): Promise<Response> {
    const totals = {
      yes: this.participants.filter((p) => p.intent === 'yes').length,
      observe: this.participants.filter((p) => p.intent === 'observe').length,
      no: this.participants.filter((p) => p.intent === 'no').length,
      total: this.participants.length,
      purgedAt: Date.now(),
    }

    const dateKey = new Date(totals.purgedAt).toISOString().slice(0, 10)
    await this.env.VPP_ARCHIVE.put(`rally:${dateKey}`, JSON.stringify(totals))

    this.broadcast({ type: 'purged' })

    for (const ws of this.state.getWebSockets()) {
      try {
        ws.close(1000, 'rally ended')
      } catch {
        // ignore
      }
    }

    this.participants = []
    this.handles.clear()
    this.startedAt = Date.now()

    await this.state.storage.deleteAll()
    await this.state.storage.put(STORAGE_KEYS.startedAt, this.startedAt)

    return Response.json({ ok: true, totals })
  }

  private broadcast(message: WsServerMessage): void {
    const payload = JSON.stringify(message)
    for (const ws of this.state.getWebSockets()) {
      try {
        ws.send(payload)
      } catch {
        try {
          ws.close()
        } catch {
          // ignore
        }
      }
    }
  }
}

function safeSend(ws: WebSocket, message: WsServerMessage): void {
  try {
    ws.send(JSON.stringify(message))
  } catch {
    // socket already gone
  }
}

function methodNotAllowed(): Response {
  return new Response('Method not allowed', { status: 405 })
}
