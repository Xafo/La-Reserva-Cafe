import { cn } from '../../lib/utils'

// TODO(brand): sustituir por el logo real del cliente cuando exista.
// Marca de trabajo: monograma de hoja de cafe + wordmark "ALTURA".
export function BrandMark({ className, dark = false }: { className?: string; dark?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5 select-none', className)}>
      <svg viewBox="0 0 32 32" aria-hidden="true" className="h-8 w-8 shrink-0">
        <circle cx="16" cy="16" r="15" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M16 6c5 3.2 5 16.8 0 20-5-3.2-5-16.8 0-20Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path d="M16 6v20" stroke="currentColor" strokeWidth="1.2" />
      </svg>
      <span
        className={cn(
          'font-display text-xl font-extrabold tracking-tight',
          dark ? 'text-forest-foreground' : 'text-foreground'
        )}
      >
        ALTURA
        <span className="ml-1.5 hidden align-middle text-[10px] font-medium tracking-wide text-muted-foreground sm:inline">
          HONDURAS
        </span>
      </span>
    </span>
  )
}
