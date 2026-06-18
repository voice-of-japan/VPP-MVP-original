import { Button } from '@/components/ui/button'

type Props = {
  onBack: () => void
}

function DeclinedScreen({ onBack }: Props) {
  return (
    <main className="flex flex-1 items-center justify-center bg-gradient-to-b from-background to-[#161826] px-6 py-12">
      <div className="flex max-w-[520px] flex-col items-center gap-5 text-center">
        <h1 className="font-display text-[clamp(28px,4vw,40px)] font-normal leading-[1.2] text-foreground">
          Thanks for stopping by.
        </h1>
        <p className="text-base leading-relaxed text-text-muted">
          You chose not to attend this session. You can return any time before
          the rally closes.
        </p>
        <Button
          variant="outline"
          className="mt-2 rounded-full border-border bg-transparent text-foreground hover:bg-white/5"
          onClick={onBack}
        >
          Back to cover
        </Button>
      </div>
    </main>
  )
}

export default DeclinedScreen
