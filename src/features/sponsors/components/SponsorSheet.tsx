import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { FormEvent, ReactNode } from 'react'
import { cn } from '~/shared/lib/cn'
import { FILLED, LG } from '~/shared/ui/slush'
import { formSchema, planPrice, startCheckout, track } from '../lib/data'
import type { FormField, FormValues, Plan } from '../lib/data'

// The sponsor form as a sheet: a bottom sheet on phones, a card in the middle elsewhere. It leaves the way it came in,
// dims the page behind (a modal task), and checks each field as you leave it, with the API's own schema.

const BLANK: FormValues = { name: '', email: '', website: '', logoUrl: '', message: '', company: '' }
const EXIT_MS = 200

const FIELDS: { name: Exclude<FormField, 'company' | 'message'>; label: string; type?: string; placeholder: string; optional?: boolean; autoComplete?: string }[] = [
  { name: 'name', label: 'Name or company', placeholder: 'Acme Inc.', autoComplete: 'organization' },
  { name: 'email', label: 'Email', type: 'email', placeholder: 'you@acme.dev', autoComplete: 'email' },
  { name: 'website', label: 'Website', type: 'url', placeholder: 'https://acme.dev', optional: true, autoComplete: 'url' },
  { name: 'logoUrl', label: 'Logo URL', type: 'url', placeholder: 'https://acme.dev/logo.svg', optional: true },
]

export function SponsorSheet({ plan, onClose }: { plan: Plan | null; onClose: () => void }) {
  // keeps the last plan on screen while the sheet animates out
  const [shown, setShown] = useState<Plan | null>(plan)
  const [leaving, setLeaving] = useState(false)
  useEffect(() => {
    if (plan) {
      setShown(plan)
      setLeaving(false)
    } else if (shown) {
      setLeaving(true)
      const t = setTimeout(() => (setShown(null), setLeaving(false)), EXIT_MS)
      return () => clearTimeout(t)
    }
  }, [plan]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!plan) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    addEventListener('keydown', onKey)
    return () => {
      removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [plan, onClose])

  if (!shown) return null
  // on body, above the page's own stacking contexts (the floating nav included); only ever rendered in the browser
  return createPortal(
    <div data-leaving={leaving || undefined} className="slush sponsor-sheet fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div aria-hidden className="sponsor-scrim absolute inset-0 bg-black/45" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sponsor-sheet-title"
        className="sponsor-panel relative max-h-[92dvh] w-full overflow-y-auto rounded-t-[30px] border border-black bg-white sm:max-w-lg sm:rounded-[30px]"
      >
        <SponsorForm plan={shown} onClose={onClose} />
      </div>
    </div>,
    document.body,
  )
}

function SponsorForm({ plan, onClose }: { plan: Plan; onClose: () => void }) {
  const id = useId()
  const [values, setValues] = useState(BLANK)
  const [errors, setErrors] = useState<Partial<Record<FormField, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<FormField, boolean>>>({})
  const [state, setState] = useState<{ kind: 'idle' | 'sending' } | { kind: 'error'; message: string }>({ kind: 'idle' })
  const first = useRef<HTMLInputElement>(null)
  useEffect(() => first.current?.focus({ preventScroll: true }), [])

  const errorOf = (next: FormValues, field: FormField) => formSchema.safeParse(next).error?.issues.find((i) => i.path[0] === field)?.message
  const change = (field: FormField, value: string) => {
    const next = { ...values, [field]: value }
    setValues(next)
    if (touched[field]) setErrors((e) => ({ ...e, [field]: errorOf(next, field) }))
  }
  const blur = (field: FormField) => {
    setTouched((t) => ({ ...t, [field]: true }))
    setErrors((e) => ({ ...e, [field]: errorOf(values, field) }))
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const parsed = formSchema.safeParse(values)
    if (!parsed.success) {
      const next: typeof errors = {}
      for (const issue of parsed.error.issues) next[issue.path[0] as FormField] ??= issue.message
      setErrors(next)
      setTouched({ name: true, email: true, website: true, logoUrl: true, message: true })
      document.getElementById(`${id}-${Object.keys(next)[0]}`)?.focus()
      return
    }
    setState({ kind: 'sending' })
    track('sponsor-checkout', plan.billing === 'one_time' ? { billing: 'one_time', amount: plan.amount / 100 } : { billing: plan.billing, tier: plan.tier.id })
    const res = await startCheckout(plan, values)
    if (res.ok) return void (window.location.href = res.data.url)
    if (res.fields) setErrors(Object.fromEntries(Object.entries(res.fields).map(([k, v]) => [k, v[0]])))
    setState({ kind: 'error', message: res.message })
  }

  const summary = plan.billing === 'one_time' ? `One-time · ${planPrice(plan)}` : `${plan.tier.name} · ${planPrice(plan)}`
  const logo = values.logoUrl.trim()
  const shownError = (f: FormField) => (touched[f] ? errors[f] : undefined)

  return (
    <form onSubmit={submit} noValidate>
      <div aria-hidden className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-black/15 sm:hidden" />
      <header className="flex items-start justify-between gap-4 px-6 pt-5 sm:pt-7">
        <div>
          <span className="inline-block -rotate-2 rounded-full border border-black bg-slush-sunburst px-3 py-1 text-[11px] slush-label">{summary}</span>
          <h2 id="sponsor-sheet-title" className="mt-3 text-[34px] slush-display">
            Who&rsquo;s sponsoring?
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid size-10 shrink-0 place-items-center rounded-full border border-black bg-white text-[18px] leading-none transition-[background-color,scale] duration-150 hover:bg-slush-mist active:scale-[0.94]"
        >
          ×
        </button>
      </header>

      <div className="flex flex-col gap-4 px-6 pt-6">
        {FIELDS.map((f, i) => (
          <Field key={f.name} id={`${id}-${f.name}`} label={f.label} optional={f.optional} error={shownError(f.name)}>
            <div className="relative">
              <input
                ref={i === 0 ? first : undefined}
                id={`${id}-${f.name}`}
                name={f.name}
                type={f.type ?? 'text'}
                autoComplete={f.autoComplete ?? 'off'}
                placeholder={f.placeholder}
                value={values[f.name]}
                onChange={(e) => change(f.name, e.target.value)}
                onBlur={() => blur(f.name)}
                aria-invalid={Boolean(shownError(f.name))}
                aria-describedby={shownError(f.name) ? `${id}-${f.name}-error` : undefined}
                className={cn(INPUT, f.name === 'logoUrl' && logo && 'pr-14')}
              />
              {f.name === 'logoUrl' && logo.startsWith('https://') && (
                <img src={logo} alt="" className="absolute top-1/2 right-2 size-9 -translate-y-1/2 rounded-xl border border-black bg-white object-contain p-1" onError={(e) => (e.currentTarget.style.visibility = 'hidden')} onLoad={(e) => (e.currentTarget.style.visibility = '')} />
              )}
            </div>
          </Field>
        ))}
        <Field id={`${id}-message`} label="Message" optional error={shownError('message')} hint={`${values.message.length}/500`}>
          <textarea
            id={`${id}-message`}
            rows={3}
            placeholder="Anything we should know?"
            value={values.message}
            onChange={(e) => change('message', e.target.value)}
            onBlur={() => blur('message')}
            aria-invalid={Boolean(shownError('message'))}
            className={cn(INPUT, 'h-auto resize-none rounded-[20px] py-3 leading-[1.4]')}
          />
        </Field>
        {/* there for bots, not for people */}
        <input tabIndex={-1} autoComplete="off" aria-hidden name="company" value={values.company} onChange={(e) => change('company', e.target.value)} className="absolute -left-[9999px] h-px w-px opacity-0" />
      </div>

      <footer className="sticky bottom-0 mt-6 flex flex-col gap-3 border-t border-black bg-white/90 px-6 py-5 backdrop-blur-md">
        {state.kind === 'error' && (
          <p role="alert" className="rounded-2xl border border-black bg-slush-ember/15 px-4 py-2.5 text-[14px] font-medium">
            {state.message}
          </p>
        )}
        <button type="submit" disabled={state.kind === 'sending'} className={cn(FILLED, LG, 'w-full active:scale-[0.98] disabled:opacity-60 motion-reduce:active:scale-100')}>
          {state.kind === 'sending' && <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />}
          {state.kind === 'sending' ? 'Opening checkout…' : 'Continue to payment'}
        </button>
        <p className="text-center text-[12px] leading-[1.5] font-medium text-black/60">
          {plan.billing === 'monthly' ? 'Billed monthly until you cancel. ' : plan.billing === 'one_month' ? 'Charged once; your logo stays up for 30 days. ' : 'Charged once. '}
          Payments by Dodo Payments. Your logo goes up once we&rsquo;ve verified it, usually within a day.
        </p>
      </footer>
    </form>
  )
}

const INPUT =
  'h-12 w-full rounded-full border border-black bg-white px-5 text-[16px] font-medium text-black transition-[box-shadow,background-color] duration-150 placeholder:text-black/35 hover:bg-slush-mist/40 focus:shadow-[3px_3px_0_0_#000] focus:outline-none aria-invalid:bg-slush-ember/10'

function Field({ id, label, optional, error, hint, children }: { id: string; label: string; optional?: boolean; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex items-baseline justify-between px-1 text-[12px] slush-label">
        <span>
          {label}
          {optional && <span className="ml-2 font-medium tracking-normal text-black/45 normal-case">optional</span>}
        </span>
        {hint && <span className="font-medium text-black/45 tabular-nums">{hint}</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="field-error px-1 text-[13px] font-medium text-slush-ember">
          {error}
        </p>
      )}
    </div>
  )
}
