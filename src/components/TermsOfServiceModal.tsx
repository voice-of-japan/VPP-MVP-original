import { termsPreamble, termsSections } from '../data/termsOfService'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type Props = {
  open: boolean
  onClose: () => void
  onAgreeAndAttend?: () => void
}

function TermsOfServiceModal({ open, onClose, onAgreeAndAttend }: Props) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[85dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[640px]">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle className="text-xl uppercase tracking-[0.02em]">
            Terms of Service
          </DialogTitle>
          <DialogDescription className="sr-only">
            Review and agree to the rally terms before attending.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 text-[15px] leading-[1.65] text-text-muted">
          <p className="mb-6 text-foreground">{termsPreamble}</p>
          {termsSections.map((section) => (
            <section key={section.title} className="mt-[22px] first:mt-0">
              <h3 className="mb-2 text-[15px] text-foreground">
                {section.title}
              </h3>
              <ul className="list-disc space-y-1 pl-5">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {onAgreeAndAttend && (
          <DialogFooter className="border-t border-border px-6 py-4">
            <Button
              className="rounded-full bg-brand font-semibold text-primary-foreground hover:bg-brand-strong"
              onClick={onAgreeAndAttend}
            >
              Agree to Terms &amp; Attend
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default TermsOfServiceModal
