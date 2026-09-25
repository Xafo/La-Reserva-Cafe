import { Link } from 'react-router-dom'
import { StoreNav } from '../../components/store/StoreNav'
import { StoreFooter } from '../../components/store/StoreFooter'
import { Reveal } from '../../components/store/Reveal'
import { IMG } from '../../data/images'

const commitments = [
  { title: 'Frescura como estándar', text: 'La frescura que buscamos desde el inicio es la base de lo que queremos llevar a cada taza.' },
  { title: 'Un origen que podamos respaldar', text: 'Nuestro compromiso es contar de dónde viene cada café, quién lo produce y cómo se procesa. La historia debe sostenerse en el producto.' },
  { title: 'Calidad que valga lo que pagás', text: 'Queremos que el valor esté en el café que recibís. Acercar al productor y a quien lo disfruta es parte de ese camino.' },
]

const horizons = [
  { stage: 'Nuestro comienzo', title: 'La Reserva Café, Honduras', text: 'Empezamos con cafés hondureños seleccionados con frescura, origen real y una buena relación calidad-precio.' },
  { stage: 'El siguiente paso', title: 'Más fincas y tostadurías', text: 'Una vez validado este primer paso, queremos invitar a otros productores y tostadurías de Honduras que compartan nuestro compromiso con la calidad.' },
  { stage: 'Nuestra visión', title: 'La cultura del café, más lejos', text: 'Con el tiempo, queremos ir más allá del café tostado y de Centroamérica, llevando esa misma confianza a más personas que aman el café.' },
]

export function OriginPage() {
  return (
    <main className="w-full max-w-full overflow-x-hidden">
      <StoreNav />
      <section className="relative bg-forest-deep text-forest-foreground">
        <img src={IMG.cuppingMesa} alt="Mesa de catación donde comienza nuestra historia" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="relative mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-36">
          <h1 className="max-w-4xl font-display text-[clamp(2.5rem,6vw,5rem)] font-extrabold leading-[1.08] tracking-tight">Conocé La Reserva Café</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-forest-foreground/90">Nuestra historia empieza en Honduras, con la convicción de que cada taza merece información clara y buen café.</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-24 md:grid-cols-2 md:px-8 md:py-32" aria-labelledby="story-heading">
        <Reveal>
          <h2 id="story-heading" className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">La frescura nos abrió una pregunta</h2>
          <div className="mt-6 max-w-prose space-y-5 leading-relaxed text-muted-foreground">
            <p>La Reserva Café nace de una idea sencilla: llevar café fresco y bien explicado a más personas. Cada taza nos recuerda que el origen, el proceso y la calidad deben notarse al probarla.</p>
            <p>Al mismo tiempo, veíamos un mercado lleno de historias que no siempre se cumplían al probar el café. La Reserva Café nace de esas dos experiencias: lo que aprendimos tostando y el deseo de que cada producto cumpla lo que promete.</p>
            <p>La Reserva Café es la empresa y la plataforma. Empezamos con cafés hondureños y queremos abrir, más adelante, un espacio para otras fincas y tostadurías que compartan nuestros estándares.</p>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <img src={IMG.bolsasEstante} alt="Cafés de La Reserva Café en el estante" loading="lazy" className="aspect-[4/5] w-full rounded-lg object-cover" />
        </Reveal>
      </section>

      <section className="bg-forest text-forest-foreground" aria-labelledby="mission-heading">
        <div className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
          <Reveal>
            <h2 id="mission-heading" className="max-w-3xl font-display text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">Que la confianza llegue hasta tu taza</h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-forest-foreground/90">Existimos para acercar lo que el café promete a lo que realmente disfrutás. Nuestra misión se sostiene en tres compromisos.</p>
          </Reveal>
          <dl className="mt-14 divide-y divide-white/20">
            {commitments.map((item) => (
              <div key={item.title} className="grid gap-4 py-7 md:grid-cols-[1fr_1.4fr] md:gap-12">
                <dt className="font-display text-xl font-bold md:text-2xl">{item.title}</dt>
                <dd className="max-w-prose leading-relaxed text-forest-foreground/90">{item.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32" aria-labelledby="vision-heading">
        <Reveal>
          <h2 id="vision-heading" className="max-w-3xl font-display text-3xl font-extrabold tracking-tight md:text-5xl">Una visión que crece paso a paso</h2>
          <p className="mt-5 max-w-2xl leading-relaxed text-muted-foreground">Queremos llevar la confianza que nació en Honduras a cualquier persona que ame el café. Ese camino tiene tres horizontes.</p>
        </Reveal>
        <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-12">
          {horizons.map((item, index) => (
            <li key={item.title}>
              <p className="font-semibold text-primary">{index + 1}. {item.stage}</p>
              <h3 className="mt-3 font-display text-2xl font-bold tracking-tight">{item.title}</h3>
              <p className="mt-4 max-w-prose leading-relaxed text-muted-foreground">{item.text}</p>
            </li>
          ))}
        </ol>
        <Link to="/tienda" className="mt-14 inline-block rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground hover:bg-forest">Conocé los cafés de La Reserva Café</Link>
      </section>
      <StoreFooter />
    </main>
  )
}
