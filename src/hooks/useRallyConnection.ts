import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  JoinRequest,
  JoinResponse,
  Participant,
  WsServerMessage,
} from '../types'
import {
  JOIN_STORAGE_KEY,
  clearStoredJoin,
  loadStoredJoin,
  saveStoredJoin,
} from '../lib/persistedJoin'

const JOIN_PATH = '/api/join'
const LEAVE_PATH = '/api/leave'
const RECONNECT_DELAY_MS = 2000
// If the server never sends a snapshot, stop blocking the UI on a stored-join
// restore after this long and fall back to the normal (cover) flow.
const RESTORE_TIMEOUT_MS = 5000

// In dev, connect the WebSocket straight to the Worker (Vite's WS proxy is
// fragile and crashes on client socket churn). In production the frontend and
// Worker share an origin, so use a same-origin /api/ws path.
function resolveWsUrl(): string {
  if (import.meta.env.DEV) {
    return 'ws://localhost:8787/api/ws'
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}/api/ws`
}

export type ConnectionStatus = 'connecting' | 'open' | 'closed' | 'error'

type Returned = {
  participants: Participant[]
  currentUser: Participant | null
  currentUserId: string | null
  status: ConnectionStatus
  // True only while we're verifying a localStorage join against the server.
  // The UI should hold (splash) instead of flashing the cover/join flow.
  restoring: boolean
  join: (data: JoinRequest) => Promise<JoinResponse>
  leave: () => void
}

export function useRallyConnection(): Returned {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [currentUser, setCurrentUser] = useState<Participant | null>(null)
  const [status, setStatus] = useState<ConnectionStatus>('connecting')
  // Only block the UI for a restore if we actually have a stored join to verify.
  const [restoring, setRestoring] = useState<boolean>(
    () => loadStoredJoin() !== null,
  )

  const wsRef = useRef<WebSocket | null>(null)
  const currentUserRef = useRef<Participant | null>(null)
  // A join read from localStorage on load, awaiting confirmation against the
  // first server snapshot — it's only valid if still present in this rally.
  const pendingRestoreRef = useRef<Participant | null>(loadStoredJoin())

  useEffect(() => {
    currentUserRef.current = currentUser
  }, [currentUser])

  // Safety net: never strand the user on a spinner if the snapshot is slow.
  useEffect(() => {
    if (!restoring) return
    const t = window.setTimeout(() => setRestoring(false), RESTORE_TIMEOUT_MS)
    return () => window.clearTimeout(t)
  }, [restoring])

  // Cross-tab guard: if another tab in this browser joins or leaves, mirror it
  // here so a second tab can't run the join flow again. (storage events fire in
  // the *other* tabs, not the one that made the change.)
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== JOIN_STORAGE_KEY) return
      if (e.newValue) {
        try {
          const p = JSON.parse(e.newValue) as Participant
          currentUserRef.current = p
          setCurrentUser(p)
        } catch {
          // ignore malformed
        }
      } else {
        currentUserRef.current = null
        setCurrentUser(null)
      }
      setRestoring(false)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  useEffect(() => {
    let reconnectTimer: number | null = null
    let cancelled = false

    function open() {
      if (cancelled || typeof window === 'undefined') return

      setStatus('connecting')
      const ws = new WebSocket(resolveWsUrl())
      wsRef.current = ws

      ws.onopen = () => setStatus('open')

      ws.onmessage = (event) => {
        let msg: WsServerMessage
        try {
          msg = JSON.parse(event.data) as WsServerMessage
        } catch {
          return
        }

        switch (msg.type) {
          case 'snapshot': {
            const list = msg.participants
            // Resolve a pending localStorage restore against the first snapshot:
            // keep it only if we're still present in this rally; otherwise it's
            // stale (we left, or the rally was wiped by oblivion) — forget it.
            const pending = pendingRestoreRef.current
            if (pending) {
              pendingRestoreRef.current = null
              if (list.some((p) => p.id === pending.id)) {
                currentUserRef.current = pending
                setCurrentUser(pending)
              } else {
                clearStoredJoin()
              }
              setRestoring(false)
            }
            // Never let a snapshot drop the local user (join/snapshot race).
            const me = currentUserRef.current
            setParticipants(
              me && !list.some((p) => p.id === me.id) ? [...list, me] : list,
            )
            break
          }
          case 'join':
            setParticipants((prev) =>
              prev.some((p) => p.id === msg.participant.id)
                ? prev
                : [...prev, msg.participant],
            )
            break
          case 'leave':
            setParticipants((prev) =>
              prev.filter((p) => p.id !== msg.participantId),
            )
            break
          case 'purged':
            // Rally ended (oblivion): our stored join no longer applies.
            clearStoredJoin()
            currentUserRef.current = null
            setParticipants([])
            setCurrentUser(null)
            break
        }
      }

      ws.onclose = () => {
        setStatus('closed')
        if (!cancelled) {
          reconnectTimer = window.setTimeout(open, RECONNECT_DELAY_MS)
        }
      }

      ws.onerror = () => setStatus('error')
    }

    open()

    return () => {
      cancelled = true
      if (reconnectTimer !== null) window.clearTimeout(reconnectTimer)
      wsRef.current?.close()
      wsRef.current = null
    }
  }, [])

  const join = useCallback(async (data: JoinRequest): Promise<JoinResponse> => {
    const response = await fetch(JOIN_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const result = (await response.json()) as JoinResponse
    if (result.ok) {
      // Remember this device joined so refreshes/extra tabs don't re-join.
      saveStoredJoin(result.participant)
      currentUserRef.current = result.participant
      setCurrentUser(result.participant)
      setParticipants((prev) =>
        prev.some((p) => p.id === result.participant.id)
          ? prev
          : [...prev, result.participant],
      )
    }
    return result
  }, [])

  const leave = useCallback(() => {
    const me = currentUserRef.current
    if (me) {
      // Free the handle + decrement the count server-side. Fire-and-forget.
      fetch(LEAVE_PATH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: me.id }),
      }).catch(() => {})
      setParticipants((prev) => prev.filter((p) => p.id !== me.id))
    }
    clearStoredJoin()
    currentUserRef.current = null
    setCurrentUser(null)
  }, [])

  return {
    participants,
    currentUser,
    currentUserId: currentUser?.id ?? null,
    status,
    restoring,
    join,
    leave,
  }
}
