import { useEffect, useRef, useState } from 'react'
import type { OnboardingProfileId, OnboardingProfile } from '../../types'
import { isProfile, isConsumer, onboardingSchema, validOnboarding } from '../../services/onboarding'
import { cn } from '../../lib/utils'

export function OnboardingQuiz({ initial, submitting = false, onComplete }: {
  initial?: OnboardingProfile | null
  submitting?: boolean
  onComplete: (value: OnboardingProfile) => void
}) {
  const [profile, setProfile] = useState<OnboardingProfileId | null>(() => initial && validOnboarding(initial) ? initial.profile : null)
  const [answers, setAnswers] = useState<Record<string, string>>(() => initial && validOnboarding(initial) ? { ...initial.answers } : {})
  const [step, setStep] = useState(-1)
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => { heading.current?.focus() }, [step])
  const questions = profile ? onboardingSchema.questions[profile] : []
  const question = questions[step]
  const complete = () => {
    if (!profile || submitting) return
    const result: OnboardingProfile = { version: 1, profile, answers, updatedAt: new Date().toISOString() }
    if (validOnboarding(result)) onComplete(result)
  }

  return (
    <div aria-busy={submitting}>
      <p className="text-sm text-muted-foreground" aria-live="polite">{step < 0 ? 'Primero, tu relación con el café' : `Pregunta ${step + 1} de ${questions.length}`}</p>
      <h2 ref={heading} tabIndex={-1} className="mt-4 scroll-mt-32 font-display text-2xl font-bold tracking-tight md:text-3xl">
        {step < 0 ? '¿Cuál es tu relación con el café?' : question.question}
      </h2>
      {step < 0 ? (
        <fieldset className="mt-6 grid gap-3 sm:grid-cols-2" disabled={submitting}>
          <legend className="sr-only">Elegí tu perfil</legend>
          {onboardingSchema.profiles.map(option => (
            <label key={option.value} className={cn('flex items-start gap-3 rounded-lg border p-5', profile === option.value ? 'border-primary bg-primary/8' : 'border-border', !option.enabled ? 'bg-muted text-muted-foreground' : 'cursor-pointer')}>
              <input type="radio" name="onboarding-profile" value={option.value} checked={profile === option.value} disabled={!option.enabled} onChange={() => {
                if (isProfile(option.value)) {
                  if (profile !== option.value) setAnswers({})
                  setProfile(option.value)
                }
              }} className="mt-1 accent-primary" />
              <span><span className="block font-semibold">{option.label}</span><span className="mt-1 block text-sm">{option.hint}</span></span>
            </label>
          ))}
        </fieldset>
      ) : (
        <fieldset key={question.key} className="mt-6 grid gap-3 sm:grid-cols-2" disabled={submitting}>
          <legend className="sr-only">{question.question}</legend>
          {question.options.map(option => (
            <label key={option.value} className={cn('flex cursor-pointer items-start gap-3 rounded-lg border p-5', answers[question.key] === option.value ? 'border-primary bg-primary/8' : 'border-border hover:border-primary')}>
              <input type="radio" name={question.key} value={option.value} checked={answers[question.key] === option.value} onChange={() => setAnswers(previous => ({ ...previous, [question.key]: option.value }))} className="mt-1 accent-primary" />
              <span><span className="block font-semibold">{option.label}</span><span className="mt-1 block text-sm text-muted-foreground">{option.hint}</span></span>
            </label>
          ))}
        </fieldset>
      )}
      <div className="mt-8 flex items-center justify-between gap-4">
        <button type="button" disabled={step < 0 || submitting} onClick={() => setStep(previous => previous - 1)} className="cursor-pointer rounded-full border border-border px-5 py-3 disabled:invisible">{step === 0 ? 'Cambiar perfil' : 'Atrás'}</button>
        <button type="button" disabled={submitting || (step < 0 ? !profile : !answers[question.key])} onClick={() => step === questions.length - 1 && step >= 0 ? complete() : setStep(previous => previous + 1)} className="cursor-pointer rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground disabled:opacity-50">
          {submitting ? 'Guardando…' : step === questions.length - 1 && step >= 0 ? (profile && isConsumer(profile) ? 'Ver mi recomendación' : 'Ver mi resumen') : 'Siguiente'}
        </button>
      </div>
    </div>
  )
}
