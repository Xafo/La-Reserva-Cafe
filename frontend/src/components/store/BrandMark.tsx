import { cn } from '../../lib/utils'

// Identidad tipográfica transitoria; el isotipo de La Reserva pertenece a la tostaduría.
export function BrandMark({ className, dark = false }: { className?: string; dark?: boolean }) {
  return (
    <span className={cn('inline-flex shrink-0 flex-col select-none', className)}>
      <span className={cn('whitespace-nowrap font-display text-xl font-extrabold leading-tight tracking-tight', dark ? 'text-forest-foreground' : 'text-foreground')}>
        Directo Cafe<span aria-hidden="true" className={dark ? 'text-accent' : 'text-primary'}>.</span>
      </span>
      <span className={cn('mt-0.5 whitespace-nowrap text-[11px] leading-tight', dark ? 'text-forest-foreground/85' : 'text-muted-foreground')}>
        Nacido en La Reserva
      </span>
    </span>
  )
}
