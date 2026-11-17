import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { PALETTES } from 'wobli'
import type { Palette } from 'wobli'
import ebookReader from 'wobli/icons/ebook-reader'
import { Sticker } from 'wobli/react'
import { cn } from '~/shared/lib/cn'
import { Chips } from '~/shared/ui/Chips'
import { CodeBlock } from '~/shared/ui/CodeBlock'
import { BAND, FILLED, GHOST, LG, SM } from '~/shared/ui/slush'
import { useThread } from '../hooks/useThread'
import { INSTALLS, LAZY, REACT, TYPES, VANILLA } from '../lib/examples'
import type { Lang } from '../lib/examples'

const SECTIONS = [
  ['install', 'Install'],
  ['react', 'React'],
  ['props', 'Sticker Props'],
  ['on-demand', 'Loading on Demand'],
  ['roles', 'Palette Roles'],
  ['no-react', 'Without React'],
  ['types', 'Types'],
  ['licence', 'Licence'],
] as const

// the sticker palette as a shared set (DESIGN.md): each section's number takes the next colour
const TINTS = ['bg-slush-sunburst', 'bg-slush-mint', 'bg-slush-lavender', 'bg-slush-blue', 'bg-slush-ember', 'bg-slush-violet text-white'] as const
const IDS = SECTIONS.map(([id]) => id)
// the sidebar list: every row is ROW tall and its number sits on the thread, THREAD_X in from the row's edge
const ROW = 40
const THREAD_X = 24
// one path through the centre of every number, weaving left then right between them like a running stitch
const THREAD =
  `M${THREAD_X} ${ROW / 2}` +
  SECTIONS.slice(1)
    .map((_, i) => {
      const y = ROW / 2 + ROW * i
      const x = THREAD_X + (i % 2 ? 7 : -7)
      return `C${x} ${y + ROW * 0.3} ${x} ${y + ROW * 0.7} ${THREAD_X} ${y + ROW}`
    })
    .join('')
const CODE = 'rounded-[20px]'
const CARD = 'overflow-hidden rounded-[20px] border border-black bg-white'

const PROPS = [
  ['icon', 'Icon', 'Any illustration, imported from wobli/icons/<slug>.'],
  ['palette', 'Partial<Palette>', 'Slots to swap over the default. ink is the stroke colour.'],
  ['line', 'number', 'Outline width multiplier. 1 by default, 0 removes every outline.'],
  ['depth', 'number', 'Extrusion multiplier. 1 by default, 0 is flat.'],
  ['loop', 'boolean', 'false plays once when it first shows, then rests on the still frame.'],
  ['offset', 'number', 'Frames ahead of the page clock, to put neighbours out of step.'],
  ['enter', 'number', 'Seconds after it first shows to pop in. Leave out to skip the entrance.'],
  ['replayOnHover', 'boolean', 'Restart the motion when the pointer enters.'],
  ['label', 'string', 'Accessible name. The canvas has role="img".'],
] as const

const ROLES: ReadonlyArray<[keyof Palette, string]> = [
  ['main', 'Bodies: the folder, the card, the file tag'],
  ['deep', 'The dark second colour: phones, the reader, card stripes'],
  ['tint', 'Pale fills: screens'],
  ['gold', 'Coins, stars, the card chip'],
  ['ok', 'Success: checks, Messages'],
  ['hot', 'Alerts and badges'],
  ['white', 'Paper, banners, buttons'],
  ['grey', 'Secondary parts: the laptop deck, a folded corner'],
  ['paper', 'Off-white panels'],
  ['ink', 'The outline: stroke colour'],
]

export function DocsPage() {
  const [lang, setLang] = useState<Lang>('ts')
  const sys = PALETTES.system
  const sets = Object.keys(PALETTES)
  return (
    <>
      {/* band one, sky: the page as a poster */}
      <section className="bg-slush-sky pt-[72px]">
        <div className={cn(BAND, 'pt-10 pb-12 sm:pt-14 sm:pb-16')}>
          <div className="flex items-center gap-4 sm:gap-8">
            <h1 className="text-[clamp(4rem,18vw,17.5rem)] slush-display">Docs</h1>
            {/* display type never stands alone (DESIGN.md): a live sticker leans on it */}
            <div aria-hidden className="pointer-events-none -my-[5vw] w-[28vw] max-w-[360px] shrink-0 rotate-[8deg]">
              <Sticker icon={ebookReader} enter={0.3} />
            </div>
          </div>
          <p className="mt-6 max-w-2xl text-[20px] leading-[1.2] font-medium tracking-[-0.01em] text-balance sm:mt-8 sm:text-[24px]">
            Every illustration is a plain data object drawn on a canvas by a small runtime with no dependencies. Colours are roles, not hex
            codes, so restyling one is a single object.
          </p>
        </div>
      </section>

      {/* band two, white: the manual */}
      <section className="bg-white">
        <div className={cn(BAND, 'pt-8 pb-20 sm:pt-10 sm:pb-24')}>
          {/* narrow screens: the sections as a row of pills */}
          <nav aria-label="On this page" className="scrollbar-none -mx-4 mb-8 flex gap-1 overflow-x-auto px-4 sm:-mx-8 sm:px-8 lg:hidden">
            {SECTIONS.map(([id, label]) => (
              <a key={id} href={`#${id}`} className={cn(GHOST, SM, 'shrink-0')}>
                {label}
              </a>
            ))}
          </nav>

          <div className="grid items-start gap-10 lg:grid-cols-[17rem_minmax(0,1fr)] xl:gap-16">
            <aside className="sticky top-[5.25rem] hidden rounded-[30px] border border-black bg-white p-3 lg:block">
              <Toc />
              <div className="mt-3 rounded-[20px] border border-black bg-slush-sky p-3">
                <h2 className="pb-2 text-[12px] slush-label">Examples In</h2>
                <LangChips lang={lang} onChange={setLang} />
              </div>
            </aside>

            <article className="flex min-w-0 max-w-4xl flex-col gap-16 sm:gap-20">
              <div className="-mb-6 flex items-center gap-3 sm:-mb-8 lg:hidden">
                <span className="text-[12px] slush-label">Examples in</span>
                <LangChips lang={lang} onChange={setLang} />
              </div>

              <Section n={1} id="install" title="Install">
                <p>
                  One package for both. It ships compiled JavaScript (ES modules) with type definitions beside it, so a TypeScript project
                  gets types with no extra install and a JavaScript project needs no build step for it.
                </p>
                <CodeBlock code={INSTALLS.join('\n')} className={CODE} />
                <p>
                  Three entry points: <code>wobli</code> is the engine, <code>wobli/react</code> the component, and{' '}
                  <code>wobli/icons/&lt;slug&gt;</code> one illustration each, so an app ships only the ones it imports. React is optional.
                </p>
              </Section>

              <Section n={2} id="react" title="React">
                <p>Size the sticker with CSS; the canvas fills its width at 1:1 and renders at device resolution.</p>
                <CodeBlock code={REACT[lang]} className={CODE} />
                <p>
                  Every sticker on a page shares one animation clock and one <code>requestAnimationFrame</code> loop. Stickers off screen skip
                  their paints, and a still hold costs nothing. Reduced motion shows each illustration's still frame.
                </p>
              </Section>

              <Section n={3} id="props" title="Sticker Props">
                <dl className={cn(CARD, 'divide-y divide-black')}>
                  {PROPS.map(([k, t, d]) => (
                    <div key={k} className="grid items-center gap-x-4 gap-y-1.5 px-5 py-4 sm:grid-cols-[9rem_10.5rem_1fr]">
                      <dt className="font-mono text-[14px] font-bold">{k}</dt>
                      <dd>
                        <span className="inline-flex h-6 items-center rounded-full border border-black bg-slush-lavender px-2.5 font-mono text-[12px] font-medium whitespace-nowrap">
                          {t}
                        </span>
                      </dd>
                      <dd className="text-[15px] leading-[1.39] font-medium">{d}</dd>
                    </div>
                  ))}
                </dl>
              </Section>

              <Section n={4} id="on-demand" title="Loading on Demand">
                <p>The slug is the last part of an illustration's address on this site. Import it up front, or only when it is about to show.</p>
                <CodeBlock code={LAZY[lang]} className={CODE} />
              </Section>

              <Section n={5} id="roles" title="Palette Roles">
                <p>
                  Each fill names what a part is, so any palette keeps its meaning. {sets.length} named sets ship in <code>PALETTES</code>:{' '}
                  {sets.map((s, i) => (
                    <span key={s}>
                      <code>{s}</code>
                      {i < sets.length - 1 ? ', ' : '. '}
                    </span>
                  ))}
                  Or derive one with <code>brand(a, b)</code>, <code>mono(hex)</code> or <code>hue(deg)</code>, all worked in OKLCH so contrast
                  holds.
                </p>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {ROLES.map(([k, d]) => (
                    <li key={k} className="flex items-center gap-4 rounded-[20px] border border-black bg-white px-4 py-3.5">
                      <span className="size-10 shrink-0 rounded-full border border-black" style={{ background: sys[k] }} />
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <code className="font-mono text-[14px] font-bold">{k}</code>
                        <span className="text-[14px] leading-[1.39] font-medium">{d}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </Section>

              <Section n={6} id="no-react" title="Without React">
                <p>The engine needs only a canvas, so it works with Vue, Svelte, or no framework at all.</p>
                <CodeBlock code={VANILLA[lang]} className={CODE} />
              </Section>

              <Section n={7} id="types" title="Types">
                <CodeBlock code={TYPES[lang]} className={CODE} />
              </Section>
            </article>
          </div>
        </div>
      </section>

      {/* band three, lavender: the licence as its own poster */}
      <section id="licence" className="scroll-mt-0 bg-slush-lavender">
        <div className={cn(BAND, 'py-16 sm:py-24')}>
          <h2 className="text-[clamp(3rem,12vw,10rem)] slush-display">Free &amp; MIT</h2>
          <p className="mt-6 max-w-2xl text-[20px] leading-[1.2] font-medium tracking-[-0.01em] text-balance sm:mt-8 sm:text-[24px]">
            Code is MIT. The illustrations are free to use in commercial and personal work.
          </p>
          <Link to="/illustrations" className={cn(FILLED, LG, 'mt-8')}>
            Browse Illustrations
          </Link>
        </div>
      </section>
    </>
  )
}

/** The sections as a list a thread runs through: it is sewn down the numbers as the page scrolls, colouring each one it reaches. */
function Toc() {
  const { ref, active } = useThread<HTMLOListElement>(IDS)
  return (
    <nav aria-label="On this page">
      <h2 className="px-3 pt-2 pb-3 text-[12px] text-label-3 slush-label">On This Page</h2>
      <ol ref={ref} className="relative flex flex-col">
        <li aria-hidden className="pointer-events-none absolute inset-0">
          <svg width={THREAD_X * 2} height={ROW * SECTIONS.length} fill="none" strokeLinecap="round" className="overflow-visible">
            {/* the stitches still to come, then the thread pulled through as far as the reader has got */}
            <path d={THREAD} stroke="var(--color-gray-500)" strokeWidth={1.5} strokeDasharray="3 5" />
            <path d={THREAD} pathLength={1} stroke="#000" strokeWidth={2} strokeDasharray={1} style={{ strokeDashoffset: 'calc(1 - var(--thread, 0))' }} />
          </svg>
        </li>
        {SECTIONS.map(([id, label], i) => (
          <li key={id} className="relative">
            <a
              href={`#${id}`}
              aria-current={i === active ? 'location' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-full px-3 text-[15px] transition-[color,font-weight] duration-150',
                i === active ? 'font-bold' : 'font-medium',
                i > active && 'text-label-3 hover:text-black',
              )}
              style={{ height: ROW }}
            >
              <span
                aria-hidden
                className={cn(
                  'grid size-6 shrink-0 place-items-center rounded-full border border-black text-[11px] font-bold tabular-nums transition-[background-color,color,scale] duration-200 ease-out',
                  i <= active ? TINTS[i % TINTS.length] : 'bg-white text-black',
                  i === active && 'scale-125',
                )}
              >
                {i + 1}
              </span>
              {label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

function LangChips({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  return (
    <Chips<Lang>
      label="Example language"
      value={lang}
      onChange={onChange}
      options={[
        { value: 'ts', label: 'TypeScript' },
        { value: 'js', label: 'JavaScript' },
      ]}
    />
  )
}

function Section({ n, id, title, children }: { n: number; id: string; title: string; children: ReactNode }) {
  return (
    <section
      id={id}
      className="scroll-mt-24 [&_code]:font-mono [&>div>p]:max-w-3xl [&>div>p]:text-[17px] [&>div>p]:leading-[1.5] [&>div>p]:font-medium [&>div>p]:tracking-[-0.01em] [&>div>p_code]:rounded-[6px] [&>div>p_code]:bg-slush-mist [&>div>p_code]:px-1.5 [&>div>p_code]:py-0.5 [&>div>p_code]:text-[0.85em]"
    >
      <h2 className="flex items-center gap-3 text-[clamp(2rem,4.4vw,3.5rem)] slush-display sm:gap-4">
        <span
          aria-hidden
          className={cn('grid size-[2em] shrink-0 -rotate-6 place-items-center rounded-full border border-black text-[0.4em] leading-none', TINTS[(n - 1) % TINTS.length])}
        >
          {n}
        </span>
        {title}
      </h2>
      <div className="mt-6 flex flex-col gap-5">{children}</div>
    </section>
  )
}
