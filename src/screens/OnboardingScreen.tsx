import { useMemo, useState } from 'react'
import Avatar from '../components/Avatar'
import Hourglass from '../components/Hourglass'
import { avatars } from '../data/avatars'
import type { AvatarId, Intent, JoinRequest, JoinResponse } from '../types'
import {
  MAX_HANDLE_LENGTH,
  MAX_MESSAGE_LENGTH,
  intentColors,
  intentLabels,
} from '../types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

type Props = {
  existingHandles: string[]
  onJoin: (data: JoinRequest) => Promise<JoinResponse>
  onBack: () => void
}

const intentOptions: Intent[] = ['yes', 'observe', 'no']

function errorMessage(error: 'handle_taken' | 'invalid' | 'rally_full'): string {
  switch (error) {
    case 'handle_taken':
      return 'That handle was just taken. Try another.'
    case 'rally_full':
      return 'The rally is full. Please try again later.'
    case 'invalid':
      return 'Some details look invalid. Check your handle and try again.'
  }
}

const labelClass =
  'flex items-baseline justify-between text-[13px] uppercase tracking-[0.08em] text-text-muted'
const hintClass = 'text-[11px] tracking-[0.06em] text-text-faint'

function OnboardingScreen({ existingHandles, onJoin, onBack }: Props) {
  const [avatarId, setAvatarId] = useState<AvatarId>(avatars[0].id)
  const [intent, setIntent] = useState<Intent | ''>('')
  const [handle, setHandle] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const trimmedHandle = handle.trim()
  const handleError = useMemo(() => {
    if (!trimmedHandle) return null
    if (trimmedHandle.length > MAX_HANDLE_LENGTH) {
      return `Handle must be ${MAX_HANDLE_LENGTH} characters or fewer.`
    }
    const lower = trimmedHandle.toLowerCase()
    if (existingHandles.some((h) => h.toLowerCase() === lower)) {
      return 'That handle is already taken.'
    }
    return null
  }, [trimmedHandle, existingHandles])

  const canSubmit =
    !submitting &&
    avatarId !== undefined &&
    intent !== '' &&
    trimmedHandle.length > 0 &&
    !handleError &&
    message.length <= MAX_MESSAGE_LENGTH

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const result = await onJoin({
        avatarId,
        intent: intent as Intent,
        handle: trimmedHandle,
        message: message.trim() ? message.trim() : undefined,
      })
      if (!result.ok) {
        setSubmitError(errorMessage(result.error))
        setSubmitting(false)
      }
    } catch {
      setSubmitError('Could not reach the rally. Check your connection.')
      setSubmitting(false)
    }
  }

  const frameColor = intent ? intentColors[intent] : 'var(--border)'

  return (
    <main className="relative isolate flex flex-1 items-center justify-center overflow-x-hidden px-4 pb-20 pt-20 sm:px-6">
      <div
        className="absolute inset-0 -z-20"
        style={{
          background:
            'radial-gradient(ellipse at 80% 10%, rgba(246,196,83,0.08) 0%, transparent 60%), radial-gradient(ellipse at 10% 90%, rgba(90,169,214,0.08) 0%, transparent 60%), linear-gradient(180deg, #0b0d12 0%, #161826 100%)',
        }}
        aria-hidden="true"
      />

      <Button
        variant="outline"
        size="sm"
        className="absolute left-6 top-6 rounded-full border-border bg-transparent text-[13px] text-text-muted hover:bg-white/5 hover:text-foreground"
        onClick={onBack}
      >
        ← Back
      </Button>

      <div className="flex w-full max-w-[1000px] flex-col items-center justify-center gap-6 md:flex-row md:gap-[60px]">
        <aside
          className="hidden shrink-0 items-center justify-center opacity-85 md:flex"
          aria-hidden="true"
        >
          <Hourglass size="lg" glow />
        </aside>

        <form
          className="flex w-full max-w-[520px] flex-col gap-[26px]"
          onSubmit={handleSubmit}
        >
          <header className="mb-1 text-center">
            <p className="mb-2 text-xs uppercase tracking-[0.24em] text-text-faint">
              Join the rally
            </p>
            <h1 className="text-[clamp(28px,4.2vw,40px)] font-normal leading-[1.15] text-foreground">
              Set up your presence
            </h1>
          </header>

          <section className="flex flex-col items-center gap-[18px] py-6">
            <div
              className="min-w-[140px] rounded-xl border-2 bg-white/[0.02] px-[18px] py-2 text-center transition-[border-color,box-shadow] duration-200"
              style={{
                borderColor: frameColor,
                boxShadow: `0 0 24px ${frameColor}33`,
              }}
            >
              <span className="text-sm font-medium tracking-[0.04em] text-foreground">
                {trimmedHandle || 'your handle'}
              </span>
            </div>
            <Avatar
              avatarId={avatarId}
              intent={intent || undefined}
              size="xl"
              animated
            />
          </section>

          <section className="flex flex-col gap-[10px]">
            <span className={labelClass}>1. Choose an avatar</span>
            <div
              className="grid grid-cols-4 gap-2.5 sm:grid-cols-8"
              role="radiogroup"
              aria-label="Avatar"
            >
              {avatars.map((a) => {
                const selected = a.id === avatarId
                return (
                  <button
                    key={a.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={a.label}
                    className={cn(
                      'flex items-center justify-center rounded-xl border p-2 transition-[background,border-color,transform] duration-150',
                      selected
                        ? 'border-brand bg-brand/[0.08]'
                        : 'border-border bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]',
                    )}
                    onClick={() => setAvatarId(a.id)}
                  >
                    <Avatar avatarId={a.id} size="md" animated={selected} />
                  </button>
                )
              })}
            </div>
          </section>

          <section className="flex flex-col gap-[10px]">
            <span className={labelClass}>2. Participation</span>
            <Select
              value={intent}
              onValueChange={(v) => setIntent(v as Intent)}
            >
              <SelectTrigger
                className="w-full"
                aria-label="Participation intent"
                style={intent ? { color: intentColors[intent] } : undefined}
              >
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                {intentOptions.map((value) => (
                  <SelectItem key={value} value={value}>
                    <span
                      className="inline-block size-2.5 shrink-0 rounded-full"
                      style={{ background: intentColors[value] }}
                      aria-hidden="true"
                    />
                    {intentLabels[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>

          <section className="flex flex-col gap-[10px]">
            <label htmlFor="handle" className={labelClass}>
              3. Handle name
              <span className={hintClass}>
                {trimmedHandle.length}/{MAX_HANDLE_LENGTH}
              </span>
            </label>
            <Input
              id="handle"
              type="text"
              inputMode="text"
              maxLength={MAX_HANDLE_LENGTH}
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="e.g. CalmRiver"
              autoComplete="off"
              spellCheck={false}
            />
            {handleError && !submitting && (
              <p className="text-[13px] text-no">{handleError}</p>
            )}
          </section>

          <section className="flex flex-col gap-[10px]">
            <label htmlFor="message" className={labelClass}>
              <span>
                Message{' '}
                <span className="ml-1.5 text-xs normal-case tracking-normal text-text-faint">
                  (optional)
                </span>
              </span>
              <span className={hintClass}>
                {message.length}/{MAX_MESSAGE_LENGTH}
              </span>
            </label>
            <Textarea
              id="message"
              value={message}
              maxLength={MAX_MESSAGE_LENGTH}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Say something quietly…"
              rows={2}
            />
          </section>

          {submitError && (
            <p className="text-[13px] text-no" role="alert">
              {submitError}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            className="rounded-full bg-brand font-semibold text-primary-foreground hover:bg-brand-strong"
            disabled={!canSubmit}
          >
            {submitting ? 'Joining…' : 'Enter the rally'}
          </Button>
        </form>
      </div>
    </main>
  )
}

export default OnboardingScreen
