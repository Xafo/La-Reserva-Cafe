import { Link } from 'react-router-dom'
import { StoreNav } from '../../components/store/StoreNav'
import { StoreFooter } from '../../components/store/StoreFooter'
import { Reveal } from '../../components/store/Reveal'
import { IMG } from '../../data/images'

const regions = [
  { name: 'Montecillos', areas: 'Marcala, Intibuca, Comayagua', profile: 'Acidez citrica, cuerpo sedoso, final dulce. Primera denominacion de origen de Centroamerica.' },
  { name: 'Opalaca', areas: 'Santa Barbara, Lempira', profile: 'Frutas tropicales y florales. Cuna del Parainema que gana las subastas nacionales.' },
  { name: 'Copan', areas: 'Copan, Ocotepeque', profile: 'Chocolate, caramelo y nuez. El perfil clasico hondureno de taza redonda.' },
  { name: 'El Paraiso', areas: 'El Paraiso, Danli', profile: 'Microclimas de altura para variedades exoticas: Geisha, Java y Pacamara.' },
]

export function OriginPage() {
  return (
    <main className="w-full max-w-full overflow-x-hidden">
      <StoreNav />

      <section className="relative bg-forest-deep text-forest-foreground">
        <img
          src={IMG.pourOver}
          alt="Barra de cafe con metodos de filtrado junto a la ventana"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-44 md:px-8">
          <h1 className="max-w-4xl font-display text-[clamp(2.8rem,6vw,5rem)] font-extrabold leading-[1.04] tracking-tight">
            Cuatro cordilleras, un mismo rigor
          </h1>
          <p className="mt-6 max-w-xl text-lg text-forest-foreground/85">
            {/* TODO(copy): historia de origen definitiva del cliente */}
            Honduras es el mayor productor de cafe de Centroamerica. Nosotros
            recorremos sus cordilleras buscando los lotes que la exportacion
            tradicional deja pasar.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-36">
        <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2">
          {regions.map((r, i) => (
            <Reveal key={r.name} delay={i * 70} className="bg-background p-8 md:p-10">
              <h2 className="font-display text-2xl font-extrabold">{r.name}</h2>
              <p className="mt-1 text-sm font-medium text-accent-ink">{r.areas}</p>
              <p className="mt-4 max-w-prose leading-relaxed text-muted-foreground">{r.profile}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-24 grid items-center gap-12 md:grid-cols-2">
          <div className="overflow-hidden rounded-lg">
            <img
              src={IMG.flatLay}
              alt="Mesa de catacion con molido, granos y taza de espresso"
              loading="lazy"
              className="aspect-[3/2] w-full object-cover"
            />
          </div>
          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
              Catamos antes de comprar
            </h2>
            <p className="mt-5 max-w-prose leading-relaxed text-muted-foreground">
              Cada microlote pasa por mesa de catacion con protocolo SCA. Solo
              compramos lotes que superan 84 puntos, y pagamos al productor un
              premio sobre el precio de bolsa por esa calidad.
            </p>
            <Link to="/tienda" className="mt-8 inline-block rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground hover:bg-forest">
              Probar la cosecha
            </Link>
          </div>
        </Reveal>
      </section>

      <StoreFooter />
    </main>
  )
}
