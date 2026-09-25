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

const origins = ['Campamento', 'Guaimaca', 'Cantarranas', 'Marale', 'Olancho', 'Francisco Morazan']

export function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [catalogError, setCatalogError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    catalogService.getProducts(true)
      .then((p) => {
        if (!cancelled) setFeatured([...p].sort((a, b) => b.quality.cuppingScore - a.quality.cuppingScore).slice(0, 3))
      })
      .catch(() => { if (!cancelled) setCatalogError(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [attempt])

  return (
    <main className="w-full max-w-full overflow-x-hidden">
      <StoreNav overHero />

      {/* Atencion: hero cinematografico a pantalla completa */}
      <section className="relative flex min-h-svh items-center justify-center bg-forest-deep text-forest-foreground">
        <img
          src={IMG.heroFog}
          alt="Preparación de café de Directo Cafe"
          className="absolute inset-0 h-full w-full object-cover opacity-55"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,oklch(0.21_0.045_135/0.55)_75%,oklch(0.21_0.045_135/0.85)_100%)]" />
        <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-32 text-center md:px-8">
          <h1 className="hero-rise mx-auto max-w-5xl font-display text-[clamp(2.7rem,7vw,5.5rem)] font-extrabold leading-[1.02] tracking-tight">
            Buen café. Desde el origen.
          </h1>
          <p className="hero-rise-late mx-auto mt-6 max-w-xl text-balance text-lg text-forest-foreground/85">
            Somos Directo Cafe, una empresa hondureña creada para acercarte café que cumpla en la taza lo que promete.
          </p>
          <div className="hero-rise-late mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/tienda"
              className="rounded-full bg-accent px-8 py-3.5 font-semibold text-forest-deep transition-transform duration-300 hover:scale-[1.03]"
            >
              Explorar los cafés
            </Link>
            <Link
              to="/origen"
              className="rounded-full border border-forest-foreground/40 px-8 py-3.5 font-semibold text-forest-foreground transition-colors hover:bg-white/10"
            >
              Conocer nuestra historia
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
            Café Directo Cafe
          </h2>
          <Link to="/tienda" className="group inline-flex items-center gap-2 font-semibold text-primary">
            Ver toda la carta
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>
        <p className="mt-5 max-w-xl text-muted-foreground">
          Nuestros cafés son el primer paso de Directo Cafe.
          Explorá sus orígenes, procesos y notas de sabor.
        </p>
        {loading ? (
          <p role="status" className="mt-10 text-muted-foreground">Cargando los cafés de Directo Cafe…</p>
        ) : catalogError ? (
          <div className="mt-10 max-w-xl">
            <p role="status">No pudimos cargar los cafés. Podés volver a intentarlo.</p>
            <button type="button" onClick={() => {
              setCatalogError(false)
              setLoading(true)
              setAttempt((value) => value + 1)
            }} className="mt-4 cursor-pointer rounded-full border border-primary px-6 py-2.5 font-semibold text-primary hover:bg-muted">
              Reintentar
            </button>
          </div>
        ) : featured.length === 0 ? (
          <p role="status" className="mt-10 text-muted-foreground">No hay cafés disponibles en este momento. Volvé a consultar más adelante.</p>
        ) : (
        <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p, i) => (
            <Reveal key={p.id} delay={i * 90}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
        )}
      </section>

      {/* Deseo: historia de origen, split editorial */}
      <section className="bg-forest text-forest-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-28 md:grid-cols-2 md:px-8 md:py-40">
          <Reveal>
            <div className="overflow-hidden rounded-lg">
              <img
                src={IMG.beansSack}
                alt="Granos de café tostado de Directo Cafe"
                loading="lazy"
                className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-out hover:scale-105"
              />
            </div>
          </Reveal>
          <Reveal delay={120}>
            <h2 className="font-display text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
              Todo empezó con una taza de café
            </h2>
            <div className="mt-7 max-w-prose space-y-5 leading-relaxed text-forest-foreground/85">
              <p>
                Sirviendo café en nuestra tostaduría descubrimos algo sencillo:
                la frescura hacía la diferencia. Quisimos llevar esa confianza
                a más personas, empezando por lo que conocemos.
              </p>
              <p>
                Así es Directo Cafe: una empresa nacida con el compromiso
                de acercar el origen a quien lo disfruta. Nuestra misión es que
                cada compra se sienta confiable, desde la descripción hasta el primer sorbo.
              </p>
            </div>
            <Link
              to="/origen"
              className="mt-9 inline-flex items-center gap-2 rounded-full border border-forest-foreground/40 px-7 py-3 font-semibold transition-colors hover:bg-white/10"
            >
              Conocé Directo Cafe
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Deseo: como lo preparas */}
      <section className="mx-auto max-w-7xl px-5 py-28 md:px-8 md:py-40">
        <Reveal>
          <h2 className="max-w-3xl font-display text-4xl font-extrabold tracking-tight md:text-5xl">
            Elegí según cómo lo tomás
          </h2>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Filtramos la carta por proceso y tueste para que encuentres tu taza,
            no la nuestra.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            {
              img: IMG.mug,
              alt: 'Taza de café de Directo Cafe junto a granos tostados',
              title: 'Filtrados y métodos',
              text: 'Explorá los cafés de tueste claro y compará sus notas de sabor.',
              to: '/tienda?tueste=Claro',
            },
            {
              img: IMG.espresso,
              alt: 'Espresso con crema densa recien extraido',
              title: 'Espresso y leche',
              text: 'Nuestro Espresso de Casa: tueste oscuro con cuerpo para cortar la leche.',
              to: '/tienda?tueste=Oscuro',
            },
            {
              img: IMG.bolsasEstante,
              alt: 'Bolsas de microlote en el estante de la tostaduria',
              title: 'Conocé los orígenes',
              text: 'Conocé los productores, procesos y notas de los cafés de Directo Cafe.',
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
            Encontrá tu próxima taza
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-forest-foreground/80">
            Empezá por un café de Directo Cafe. Compará sus notas, su origen y
            su tueste, y elegí el que más te guste.
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
