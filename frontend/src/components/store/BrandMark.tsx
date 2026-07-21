import { cn } from '../../lib/utils'

// Logo de LA RESERVA - Cafe y Tostaduria.
// Recreacion en SVG del isotipo: taza con una ramita de cafe (dos hojas + cereza)
// en el rojo de la marca, junto al wordmark. TODO(brand): sustituir por el
// vector oficial si el cliente lo entrega.
export function BrandMark({ className, dark = false }: { className?: string; dark?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5 select-none', className)}>
      <svg viewBox="0 0 52 46" aria-hidden="true" className="h-9 w-9 shrink-0">
        <g
          fill="none"
          stroke="var(--color-brand)"
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* taza */}
          <path d="M13 20 h22 l-2 8 a11 10 0 0 1 -18 0 z" />
          {/* asa */}
          <path d="M35 21 a5 5 0 0 1 4 8" />
          {/* platillo */}
          <path d="M11 34 q13 4 26 0" />
          {/* tallo */}
          <path d="M24 20 c0 -5 -1 -8 -4 -11" />
        </g>
        <g fill="var(--color-brand)">
          {/* hoja izquierda */}
          <path d="M20 9 c-4 -1 -7 1 -7 5 c4 1 7 -1 7 -5 z" />
          {/* hoja derecha */}
          <path d="M22 13 c1 -3 5 -4 8 -2 c-2 3 -6 4 -8 2 z" />
          {/* cereza */}
          <circle cx="20" cy="6.5" r="2.4" />
        </g>
      </svg>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            'font-display text-lg font-extrabold tracking-tight',
            dark ? 'text-forest-foreground' : 'text-foreground'
          )}
        >
          LA RESERVA
        </span>
        <span
          className={cn(
            'mt-0.5 text-[9px] font-semibold uppercase tracking-[0.22em]',
            dark ? 'text-forest-foreground/60' : 'text-muted-foreground'
          )}
        >
          Cafe y Tostaduria
        </span>
      </span>
    </span>
  )
}
