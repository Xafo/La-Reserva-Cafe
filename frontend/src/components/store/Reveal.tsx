import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '../../lib/utils'

// Revela al entrar al viewport. El contenido es visible sin JS/animacion
// (la clase .reveal solo oculta dentro de prefers-reduced-motion: no-preference,
// y el observer la marca visible de inmediato si ya esta en pantalla).
export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible')
          observer.disconnect()
        }
      },
      { threshold: 0.12 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={cn('reveal', className)} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  )
}
