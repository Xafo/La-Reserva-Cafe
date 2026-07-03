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
              {/* TODO(copy): texto institucional pendiente del cliente */}
              Cafe de especialidad cultivado en las montanas de Honduras, tostado en
              tandas pequenas y enviado a tu puerta.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-12 text-sm">
            <div className="space-y-3">
              <p className="font-display font-bold">Explorar</p>
              <ul className="space-y-2 text-forest-foreground/70">
                <li><Link to="/tienda" className="hover:text-forest-foreground">Tienda</Link></li>
                <li><Link to="/origen" className="hover:text-forest-foreground">Origen</Link></li>
                <li><Link to="/admin/login" className="hover:text-forest-foreground">Portal interno</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <p className="font-display font-bold">Contacto</p>
              <ul className="space-y-2 text-forest-foreground/70">
                {/* TODO(copy): datos reales de contacto */}
                <li>Tegucigalpa, Honduras</li>
                <li>hola@altura.hn</li>
                <li>+504 0000-0000</li>
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-14 border-t border-white/10 pt-6 text-xs text-forest-foreground/50">
          {new Date().getFullYear()} ALTURA. Nombre y logo provisionales pendientes de definicion del cliente.
        </p>
      </div>
    </footer>
  )
}
