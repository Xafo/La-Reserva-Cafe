import { Link } from 'react-router-dom'
import { BrandMark } from './BrandMark'

export function StoreFooter() {
  return (
    <footer className="bg-forest-deep text-forest-foreground">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm space-y-4">
            <BrandMark dark />
            <p className="text-sm leading-relaxed text-forest-foreground/70">
              Directo Café es una empresa hondureña dedicada a acercarte café
              con información clara, origen verificable y una taza que cumpla
              lo que promete.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-12 text-sm">
            <div className="space-y-3">
              <p className="font-display font-bold">Explorar</p>
              <ul className="space-y-2 text-forest-foreground/70">
                <li><Link to="/tienda" className="hover:text-forest-foreground">Tienda</Link></li>
                <li><Link to="/origen" className="hover:text-forest-foreground">Nuestra historia</Link></li>
                <li><Link to="/admin/login" className="hover:text-forest-foreground">Portal interno</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <p className="font-display font-bold">Tu café</p>
              <ul className="space-y-2 text-forest-foreground/70">
                <li><Link to="/cuenta" className="hover:text-forest-foreground">Mi cuenta</Link></li>
                <li><Link to="/registro" className="hover:text-forest-foreground">Crear cuenta</Link></li>
                <li>Desde Honduras</li>
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-14 border-t border-white/10 pt-6 text-xs text-forest-foreground/50">
          {new Date().getFullYear()} Directo Café. Café de Honduras.
        </p>
      </div>
    </footer>
  )
}
