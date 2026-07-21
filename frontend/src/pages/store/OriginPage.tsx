import { Link } from 'react-router-dom'
import { StoreNav } from '../../components/store/StoreNav'
import { StoreFooter } from '../../components/store/StoreFooter'
import { Reveal } from '../../components/store/Reveal'
import { IMG } from '../../data/images'

const regions = [
  { name: 'Campamento', areas: 'Olancho', profile: 'Base de nuestro blend. Lempira, IHCAFE 90 y Obata en lavado: taza citrica, acaramelada y balanceada.' },
  { name: 'Guaimaca', areas: 'Francisco Morazan', profile: 'Parainema en proceso melado del productor Josue Galo. Notas de lima y panela sobre un cuerpo compacto.' },
  { name: 'Cantarranas', areas: 'El Zurzular, Francisco Morazan', profile: 'Catuai natural de Nahun Vidal Sanchez, secado al sol. Cacao, pina y miel en una taza jugosa.' },
  { name: 'Marale', areas: 'Francisco Morazan', profile: 'Lotes de altura para nuestros filtrados de temporada. Perfil floral y afrutado que rota con la cosecha.' },
]

export function OriginPage() {
  return (
    <main className="w-full max-w-full overflow-x-hidden">
      <StoreNav />

      <section className="relative bg-forest-deep text-forest-foreground">
        <img
          src={IMG.cataCoE}
          alt="Catador de La Reserva en mesa de catacion del Cup of Excellence"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-44 md:px-8">
          <h1 className="max-w-4xl font-display text-[clamp(2.8rem,6vw,5rem)] font-extrabold leading-[1.04] tracking-tight">
            Productores con nombre y apellido
          </h1>
          <p className="mt-6 max-w-xl text-lg text-forest-foreground/85">
            Compramos directo a productores de Olancho y Francisco Morazan.
            Catamos sus lotes, los tostamos en casa y ponemos su nombre en la
            bolsa.
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
              src={IMG.cuppingSetup}
              alt="Mesa de catacion de La Reserva con muestras y tazas"
              loading="lazy"
              className="aspect-[3/2] w-full object-cover"
            />
          </div>
          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
              Catamos antes de comprar
            </h2>
            <p className="mt-5 max-w-prose leading-relaxed text-muted-foreground">
              Cada microlote pasa por mesa de catacion antes de entrar a la
              carta. Probamos, puntuamos y solo tostamos los lotes que nos
              convencen, pagando al productor un premio por esa calidad.
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
