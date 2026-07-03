import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import type {
  PreferenceProfile,
  PlatformGoal,
  BrewMethod,
  DrinkStyle,
  FlavorFamily,
  Intensity,
  Budget,
} from '../../types'
import { cn } from '../../lib/utils'

// Wizard de preferencias: captura que busca el cliente en la plataforma.
// Lo reutilizan RegisterPage (registro) y AccountPage (edicion pre-llenada).

interface QuizOption {
  value: string
  label: string
  hint?: string
}

interface QuizStep {
  key: keyof QuizAnswers
  question: string
  hint: string
  multi: boolean
  options: QuizOption[]
}

interface QuizAnswers {
  goals: string[]
  brewMethods: string[]
  drinkStyles: string[]
  flavorFamilies: string[]
  intensity: string[]
  budget: string[]
}

const STEPS: QuizStep[] = [
  {
    key: 'goals',
    question: 'Que buscas en nuestra plataforma?',
    hint: 'Elegi todas las que apliquen',
    multi: true,
    options: [
      { value: 'Cafe de especialidad', label: 'Cafe de especialidad', hint: 'Microlotes y taza alta' },
      { value: 'Cafe de todos los dias', label: 'Cafe de todos los dias', hint: 'Rendidor y confiable' },
      { value: 'Regalar cafe', label: 'Regalar cafe', hint: 'Algo que impresione' },
      { value: 'Comprar para mi negocio', label: 'Para mi negocio', hint: 'Volumen y consistencia' },
    ],
  },
  {
    key: 'brewMethods',
    question: 'Como preparas tu cafe?',
    hint: 'Elegi todas las que apliquen',
    multi: true,
    options: [
      { value: 'Espresso', label: 'Espresso o maquina' },
      { value: 'Prensa francesa', label: 'Prensa francesa' },
      { value: 'V60 o chorreado', label: 'V60 o chorreado' },
      { value: 'Cafetera de goteo', label: 'Cafetera de goteo' },
      { value: 'Cold brew', label: 'Cold brew' },
    ],
  },
  {
    key: 'drinkStyles',
    question: 'Como lo tomas?',
    hint: 'Elegi todas las que apliquen',
    multi: true,
    options: [
      { value: 'Solo (negro)', label: 'Solo (negro)' },
      { value: 'Con leche', label: 'Con leche' },
      { value: 'Frio', label: 'Frio' },
    ],
  },
  {
    key: 'flavorFamilies',
    question: 'Que sabores te llaman?',
    hint: 'Elegi todas las que apliquen',
    multi: true,
    options: [
      { value: 'Chocolate y nuez', label: 'Chocolate y nuez' },
      { value: 'Frutal y tropical', label: 'Frutal y tropical' },
      { value: 'Floral y te', label: 'Floral y te' },
      { value: 'Caramelo y panela', label: 'Caramelo y panela' },
      { value: 'Vino y frutos rojos', label: 'Vino y frutos rojos' },
    ],
  },
  {
    key: 'intensity',
    question: 'Que intensidad preferis?',
    hint: 'Elegi una',
    multi: false,
    options: [
      { value: 'Suave', label: 'Suave y aromatico', hint: 'Tueste claro' },
      { value: 'Balanceado', label: 'Balanceado', hint: 'Tueste medio' },
      { value: 'Intenso', label: 'Fuerte y con cuerpo', hint: 'Tueste oscuro' },
    ],
  },
  {
    key: 'budget',
    question: 'Cuanto inviertes por bolsa?',
    hint: 'Elegi una',
    multi: false,
    options: [
      { value: 'Hasta L400', label: 'Hasta L. 400' },
      { value: 'L400 a L600', label: 'L. 400 a L. 600' },
      { value: 'Sin limite', label: 'Lo mejor, sin limite' },
    ],
  },
]

const emptyAnswers = (): QuizAnswers => ({
  goals: [],
  brewMethods: [],
  drinkStyles: [],
  flavorFamilies: [],
  intensity: [],
  budget: [],
})

const fromProfile = (p: PreferenceProfile): QuizAnswers => ({
  goals: [...p.goals],
  brewMethods: [...p.brewMethods],
  drinkStyles: [...p.drinkStyles],
  flavorFamilies: [...p.flavorFamilies],
  intensity: [p.intensity],
  budget: [p.budget],
})

interface PreferenceQuizProps {
  initial?: PreferenceProfile | null
  submitLabel?: string
  submitting?: boolean
  onComplete: (profile: PreferenceProfile) => void
}

export function PreferenceQuiz({ initial, submitLabel = 'Ver mi cafe ideal', submitting = false, onComplete }: PreferenceQuizProps) {
  const [stepIdx, setStepIdx] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswers>(() => (initial ? fromProfile(initial) : emptyAnswers()))

  const step = STEPS[stepIdx]
  const selected = answers[step.key]
  const isLast = stepIdx === STEPS.length - 1
  const canContinue = selected.length > 0

  const toggle = (value: string) => {
    setAnswers((prev) => {
      const current = prev[step.key]
      const next = step.multi
        ? current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value]
        : [value]
      return { ...prev, [step.key]: next }
    })
  }

  const finish = () => {
    onComplete({
      goals: answers.goals as PlatformGoal[],
      brewMethods: answers.brewMethods as BrewMethod[],
      drinkStyles: answers.drinkStyles as DrinkStyle[],
      flavorFamilies: answers.flavorFamilies as FlavorFamily[],
      intensity: answers.intensity[0] as Intensity,
      budget: answers.budget[0] as Budget,
      updatedAt: new Date().toISOString(),
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span className="font-medium">
          Paso {stepIdx + 1} de {STEPS.length}
        </span>
        <span>{step.hint}</span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={stepIdx + 1} aria-valuemin={1} aria-valuemax={STEPS.length}>
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${((stepIdx + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <h2 className="mt-8 font-display text-2xl font-extrabold tracking-tight md:text-3xl">{step.question}</h2>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {step.options.map((option) => {
          const active = selected.includes(option.value)
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggle(option.value)}
              aria-pressed={active}
              className={cn(
                'flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-5 py-4 text-left transition-colors',
                active
                  ? 'border-primary bg-primary/8 text-foreground'
                  : 'border-input bg-background text-foreground hover:border-ring',
              )}
            >
              <span>
                <span className="block font-semibold">{option.label}</span>
                {option.hint && <span className="mt-0.5 block text-sm text-muted-foreground">{option.hint}</span>}
              </span>
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors',
                  active ? 'border-primary bg-primary text-primary-foreground' : 'border-input',
                )}
              >
                {active && <Check className="h-4 w-4" />}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-9 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStepIdx((i) => i - 1)}
          disabled={stepIdx === 0}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full px-5 py-2.5 font-medium text-muted-foreground transition-colors hover:text-foreground disabled:invisible"
        >
          <ArrowLeft className="h-4 w-4" /> Atras
        </button>
        <button
          type="button"
          onClick={() => (isLast ? finish() : setStepIdx((i) => i + 1))}
          disabled={!canContinue || submitting}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-7 py-3 font-semibold text-primary-foreground transition-colors hover:bg-forest disabled:opacity-50"
        >
          {isLast ? (submitting ? 'Calculando...' : submitLabel) : 'Siguiente'}
          {!isLast && <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
