import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { Product } from '../../types'
import { catalogService } from '../../services'
import { StoreNav } from '../../components/store/StoreNav'
import { StoreFooter } from '../../components/store/StoreFooter'
import { ProductCard } from '../../components/store/ProductCard'
import { Reveal } from '../../components/store/Reveal'
import { IMG } from '../../data/images'

const origins = ['Marcala', 'Santa Barbara', 'Copan', 'Intibuca', 'Comayagua', 'El Paraiso']

export function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([])

  useEffect(() => {
    catalogService.getProducts(true).then((p) => {
      setFeatured([...p].sort((a, b) => b.quality.cuppingScore - a.quality.cuppingScore).slice(0, 3))
    })
  }, [])

  return (
    <main className="w-full max-w-full overflow-x-hidden">
      <StoreNav overHero />

      {/* Atencion: hero cinematografico a pantalla completa */}
      <section className="relative flex min-h-svh items-center justify-center bg-forest-deep text-forest-foreground">
        <img
          src={IMG.heroFog}
          alt="Bosque de altura hondureno bajo la niebla del amanecer"
          className="absolute inset-0 h-full w-full object-cover opacity-55"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,oklch(0.21_0.045_135/0.55)_75%,oklch(0.21_0.045_135/0.85)_100%)]" />
        <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-32 text-center md:px-8">
          <h1 className="hero-rise mx-auto max-w-5xl font-display text-[clamp(2.7rem,7vw,5.5rem)] font-extrabold leading-[1.02] tracking-tight">
            Cafe nacido a mil setecientos metros
          </h1>
          <p className="hero-rise-late mx-auto mt-6 max-w-xl text-balance text-lg text-forest-foreground/85">
            {/* TODO(copy): propuesta de valor definitiva pendiente del cliente */}
            Microlotes de especialidad cultivados en las montanas de Honduras,
            tostados en tandas pequenas y enviados directo a tu puerta.
          </p>
          <div className="hero-rise-late mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/tienda"
              className="rounded-full bg-accent px-8 py-3.5 font-semibold text-forest-deep transition-transform duration-300 hover:scale-[1.03]"
            >
              Comprar cafe
            </Link>
            <Link
              to="/origen"
              className="rounded-full border border-forest-foreground/40 px-8 py-3.5 font-semibold text-forest-foreground transition-colors hover:bg-white/10"
            >
              Conocer el origen
            </Link>
          </div>
        </div>
      </section>

      {/* Cinta de origenes */}
      <section aria-label="Regiones de origen" className="overflow-hidden border-b border-border bg-background py-5">
        <div className="marquee flex w-max items-center gap-10 whitespace-nowrap font-display text-sm font-bold tracking-[0.18em] text-muted-foreground uppercase">
          {[...origins, ...origins].map((o, i) => (
            <span key={i} className="flex items-center gap-10">
              {o}
              <svg viewBox="0 0 8 8" className="h-2 w-2 fill-accent" aria-hidden="true"><circle cx="4" cy="4" r="4" /></svg>
            </span>
          ))}
        </div>
      </section>

      {/* Interes: cosecha destacada */}
      <section className="mx-auto max-w-7xl px-5 py-28 md:px-8 md:py-40">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="max-w-2xl font-display text-4xl font-extrabold tracking-tight md:text-5xl">
            La cosecha de esta temporada
          </h2>
          <Link to="/tienda" className="group inline-flex items-center gap-2 font-semibold text-primary">
            Ver toda la carta
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>
        <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p, i) => (
            <Reveal key={p.id} delay={i * 90}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Deseo: historia de origen, split editorial */}
      <section className="bg-forest text-forest-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-28 md:grid-cols-2 md:px-8 md:py-40">
          <Reveal>
            <div className="overflow-hidden rounded-lg">
              <img
                src={IMG.beansSack}
                alt="Granos de cafe recien tostados en saco de yute"
                loading="lazy"
                className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-out hover:scale-105"
              />
            </div>
          </Reveal>
          <Reveal delay={120}>
            <h2 className="font-display text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
              Sabemos el nombre de quien lo cultivo
            </h2>
            <div className="mt-7 max-w-prose space-y-5 leading-relaxed text-forest-foreground/85">
              {/* TODO(copy): historia real de la empresa pendiente */}
              <p>
                Cada lote llega con su trazabilidad completa: la finca, la altura
                exacta, el dia de la cosecha y la mano que lo recogio. Trabajamos
                directamente con productores de seis regiones cafetaleras de Honduras.
              </p>
              <p>
                Pagamos por encima del precio de bolsa y catamos cada microlote
                antes de comprarlo. Si esta en nuestra carta, supero los 84 puntos
                en mesa de catacion.
              </p>
            </div>
            <Link
              to="/origen"
              className="mt-9 inline-flex items-center gap-2 rounded-full border border-forest-foreground/40 px-7 py-3 font-semibold transition-colors hover:bg-white/10"
            >
              Nuestra trazabilidad
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Deseo: como lo preparas */}
      <section className="mx-auto max-w-7xl px-5 py-28 md:px-8 md:py-40">
        <Reveal>
          <h2 className="max-w-3xl font-display text-4xl font-extrabold tracking-tight md:text-5xl">
            Elegi segun como lo tomas
          </h2>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Filtramos la carta por proceso y tueste para que encuentres tu taza,
            no la nuestra.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            {
              img: IMG.cupTop,
              alt: 'Taza de cafe filtrado vista desde arriba',
              title: 'Filtrados y metodos',
              text: 'Tuestes claros, acidez brillante. Honey y naturales de Santa Barbara e Intibuca.',
              to: '/tienda?proceso=Honey',
            },
            {
              img: IMG.espresso,
              alt: 'Espresso con crema densa recien extraido',
              title: 'Espresso y leche',
              text: 'Tuestes medios y oscuros con cuerpo para cortar la leche. Comayagua y Copan.',
              to: '/tienda?tueste=Oscuro',
            },
            {
              img: IMG.equipment,
              alt: 'Molino y bolsa de cafe sobre barra de madera',
              title: 'Cosechas limitadas',
              text: 'Microlotes Geisha y Parainema de subasta. Pocas unidades por temporada.',
              to: '/tienda',
            },
          ].map((c, i) => (
            <Reveal key={c.title} delay={i * 90}>
              <Link to={c.to} className="group block">
                <div className="overflow-hidden rounded-lg">
                  <img
                    src={c.img}
                    alt={c.alt}
                    loading="lazy"
                    className="aspect-[3/2] w-full object-cover saturate-[0.92] transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold group-hover:text-primary transition-colors">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.text}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Accion: CTA final drenched */}
      <section className="bg-forest-deep text-forest-foreground">
        <Reveal className="mx-auto max-w-5xl px-5 py-28 text-center md:px-8 md:py-36">
          <h2 className="font-display text-[clamp(2.4rem,5vw,4rem)] font-extrabold leading-tight tracking-tight">
            Pedi hoy. Tostamos manana.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-forest-foreground/80">
            Tostamos cada pedido despues de confirmarlo y lo despachamos en 48 horas
            a todo Honduras.
          </p>
          <Link
            to="/tienda"
            className="mt-10 inline-block rounded-full bg-accent px-10 py-4 font-semibold text-forest-deep transition-transform duration-300 hover:scale-[1.03]"
          >
            Armar mi pedido
          </Link>
        </Reveal>
      </section>

      <StoreFooter />
    </main>
  )
}
