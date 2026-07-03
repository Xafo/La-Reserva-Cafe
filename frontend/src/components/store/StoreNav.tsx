import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { BrandMark } from './BrandMark'
import { cn } from '../../lib/utils'

const links = [
  { to: '/tienda', label: 'Tienda' },
  { to: '/origen', label: 'Origen' },
]

export function StoreNav({ overHero = false }: { overHero?: boolean }) {
  const { count, open } = useCart()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const onDark = overHero && !scrolled

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-(--z-sticky) transition-colors duration-300',
        onDark ? 'text-forest-foreground' : 'bg-background/92 text-foreground backdrop-blur-sm border-b border-border',
        !overHero && 'sticky'
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
        <Link to="/" aria-label="Inicio">
          <BrandMark dark={onDark} />
        </Link>
        <div className="flex items-center gap-1 md:gap-6">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  'px-3 py-2 text-sm font-medium transition-colors',
                  onDark
                    ? 'text-forest-foreground/85 hover:text-forest-foreground'
                    : isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
          <button
            onClick={open}
            aria-label={`Abrir carrito, ${count} articulos`}
            className={cn(
              'relative ml-2 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-colors',
              onDark ? 'hover:bg-white/10' : 'hover:bg-muted'
            )}
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-semibold text-forest-deep">
                {count}
              </span>
            )}
          </button>
        </div>
      </nav>
    </header>
  )
}
