import { useRef, type ReactNode } from 'react'
import * as AccessibleDialog from '@radix-ui/react-dialog'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const opener = useRef<HTMLElement | null>(null)
  return (
    <AccessibleDialog.Root open={open} onOpenChange={onOpenChange}>
      <AccessibleDialog.Portal>
      <AccessibleDialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
      <AccessibleDialog.Content aria-describedby={undefined}
        onOpenAutoFocus={() => { opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null }}
        onCloseAutoFocus={(event) => { event.preventDefault(); if (opener.current?.isConnected) opener.current.focus() }}
        className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-background p-6 text-foreground shadow-lg">
        <AccessibleDialog.Title className="sr-only">Formulario de administración</AccessibleDialog.Title>
        {children}
      </AccessibleDialog.Content>
      </AccessibleDialog.Portal>
    </AccessibleDialog.Root>
  )
}
