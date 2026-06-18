import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'vpp-muted'
// Drop a calm, looping ambient track at public/ambient.mp3.
const AMBIENT_SRC = '/ambient.mp3'
const VOLUME = 0.3

function AmbientSound() {
  const [muted, setMuted] = useState<boolean>(
    () => localStorage.getItem(STORAGE_KEY) === 'true',
  )
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Browsers block autoplay until the user interacts — start (or resume) the
  // ambient loop on the first pointer/keydown if not muted.
  useEffect(() => {
    const tryPlay = () => {
      const audio = audioRef.current
      if (audio && !muted) audio.play().catch(() => {})
    }
    window.addEventListener('pointerdown', tryPlay)
    window.addEventListener('keydown', tryPlay)
    return () => {
      window.removeEventListener('pointerdown', tryPlay)
      window.removeEventListener('keydown', tryPlay)
    }
  }, [muted])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = VOLUME
    audio.muted = muted
    if (muted) {
      audio.pause()
    } else {
      audio.play().catch(() => {})
    }
    localStorage.setItem(STORAGE_KEY, String(muted))
  }, [muted])

  return (
    <>
      <audio ref={audioRef} src={AMBIENT_SRC} loop preload="auto" />
      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? 'Unmute ambient sound' : 'Mute ambient sound'}
        className={cn(
          'fixed bottom-4 right-4 z-50 flex size-10 items-center justify-center rounded-full border border-border bg-background/70 text-text-muted backdrop-blur-md transition-colors hover:text-foreground',
        )}
      >
        {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
      </button>
    </>
  )
}

export default AmbientSound
