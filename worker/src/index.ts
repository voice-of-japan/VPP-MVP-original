import { RallyRoom, type Env } from './rallyRoom'

export { RallyRoom }

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
}

function withCors(response: Response): Response {
  const out = new Response(response.body, response)
  for (const [k, v] of Object.entries(corsHeaders)) {
    out.headers.set(k, v)
  }
  return out
}

function getRallyStub(env: Env): DurableObjectStub {
  const id = env.RALLY_ROOM.idFromName(env.RALLY_ID || 'current')
  return env.RALLY_ROOM.get(id)
}

// The rally ends at 8:00 PM U.S. Eastern, when all participants are wiped
// (data oblivion per the ToS). The Cron fires at both 00:00 and 01:00 UTC so it
// lands on 8 PM ET in EDT and EST alike; the handler purges only at 20:00 ET.
const RALLY_END_HOUR_ET = 20

/** Current hour (0–23) in U.S. Eastern Time, DST-aware. */
function easternHour(now: Date): number {
  const value = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour12: false,
    hour: '2-digit',
  })
    .formatToParts(now)
    .find((p) => p.type === 'hour')?.value
  const hour = Number(value ?? '0')
  return hour === 24 ? 0 : hour
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    if (!url.pathname.startsWith('/api/')) {
      return withCors(new Response('Not found', { status: 404 }))
    }

    // /purge is internal-only (the Cron calls the DO directly via scheduled()).
    // Never expose it publicly, or anyone could wipe the live rally.
    if (url.pathname === '/api/purge') {
      return withCors(new Response('Not found', { status: 404 }))
    }

    const doPath = url.pathname.replace(/^\/api/, '') || '/'
    const stub = getRallyStub(env)

    const doUrl = new URL(request.url)
    doUrl.pathname = doPath

    const doRequest = new Request(doUrl.toString(), request)
    const doResponse = await stub.fetch(doRequest)

    if (doResponse.status === 101 && doResponse.webSocket) {
      return doResponse
    }

    return withCors(doResponse)
  },

  async scheduled(
    _event: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    // Only wipe at 8 PM ET (rally end). The other UTC trigger is the wrong DST
    // half of the year and is intentionally a no-op.
    if (easternHour(new Date()) !== RALLY_END_HOUR_ET) return
    const stub = getRallyStub(env)
    ctx.waitUntil(
      stub
        .fetch('https://internal/purge', { method: 'POST' })
        .then(() => undefined),
    )
  },
} satisfies ExportedHandler<Env>
