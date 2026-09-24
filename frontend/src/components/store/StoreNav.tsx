import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ShoppingBag, UserRound } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { BrandMark } from './BrandMark'
import { api } from '../../config/api'
import { cn } from '../../lib/utils'

const links = [
  { to: '/tienda', label: 'Tienda' },
  { to: '/empresas', label: 'Empresas' },
  { to: '/origen', label: 'Origen' },
]

export function StoreNav({ overHero = false }: { overHero?: boolean }) {
  const { count, open } = useCart()
  const { account } = useCustomerAuth()
  const [scenario, setScenario] = useState(false)
  useEffect(() => { api<{ scenarioEnabled: boolean }>('/commerce').then(c => setScenario(c.scenarioEnabled)).catch(() => undefined) }, [])
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
      <nav aria-label="Navegación principal" className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-3 md:px-8">
        <Link to="/" aria-label="Directo Cafe, inicio">
          <BrandMark dark={onDark} />
        </Link>
        <div className="order-last flex w-full items-center justify-center gap-4 sm:order-none sm:w-auto md:gap-6">
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
        </div>
        <div className="flex items-center gap-1 md:gap-3">
          {!account && (
            <NavLink
              to="/registro"
              className={cn(
                'hidden px-3 py-2 text-sm font-medium transition-colors md:block',
                onDark ? 'text-forest-foreground/85 hover:text-forest-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Crear cuenta
            </NavLink>
          )}
          <Link
            to={account ? '/cuenta' : '/ingresar'}
            aria-label={account ? 'Mi cuenta' : 'Iniciar sesion'}
            className={cn(
              'ml-1 inline-flex h-10 items-center justify-center gap-2 rounded-full px-2.5 transition-colors',
              onDark ? 'hover:bg-white/10' : 'hover:bg-muted'
            )}
          >
            <UserRound className="h-5 w-5" />
            {account && <span className="hidden text-sm font-medium md:block">{account.name.split(' ')[0]}</span>}
          </Link>
          <button
            onClick={open}
            aria-label={`Abrir carrito, ${count} articulos`}
            className={cn(
              'relative ml-1 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-colors',
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
      {scenario && <p role="status" className="bg-primary px-5 py-2 text-center text-xs text-primary-foreground">Entorno de simulación: catálogo y condiciones de prueba. Sin cobros ni entregas reales.</p>}
    </header>
  )
}
