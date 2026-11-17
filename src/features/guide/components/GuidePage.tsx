import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import cardTap from 'wobli/icons/card-tap'
import { Sticker } from 'wobli/react'
import { ExportPanel } from '~/features/export'
import { DEFAULT_STYLE, toEngineStyle } from '~/features/style'
import { cn } from '~/shared/lib/cn'
import { CodeBlock } from '~/shared/ui/CodeBlock'
import { CopyButton } from '~/shared/ui/CopyButton'
import { NumberedHeading, P } from '~/shared/ui/Numbered'
import { BAND, FILLED, GHOST, LG, SM, tint } from '~/shared/ui/slush'
import { BEATS, BRIEF, CHECKS, FILES, FORMATS, GENERAL, PROMPT, RULES, RUN, SKILLS, STORY, SWAPS } from '../lib/content'

// How an illustration gets made, told with one of them (Card Tap) from the first sentence to every file it exports as.
// A sticker-book page (DESIGN.md): sky poster, white manual, lavender closer.

const STEPS = [
  ['brief', 'General Description'],
  ['motion', 'Animation Description'],
  ['skills', 'Use the Skills'],
  ['check', 'Check and Poster'],
  ['export', 'Export Every Format'],
] as const

const CARD = 'rounded-[20px] border border-black bg-white'
// the closer's three columns, each headed in its own sticker colour
const SWAP_FILL = ['bg-slush-sunburst', 'bg-slush-mint', 'bg-slush-sky'] as const

export function GuidePage() {
  // read while rendering, not when the module loads: the site's starting look arrives with the admin's settings
  const LOOK = toEngineStyle(DEFAULT_STYLE)
  return (
    <>
      {/* band one, sky: the page as a poster */}
      <section className="bg-slush-sky pt-(--nav-h)">
        <div className={cn(BAND, 'pt-10 pb-12 sm:pt-14 sm:pb-16')}>
          <div className="flex items-center gap-4 sm:gap-8">
            <h1 className="text-[clamp(2.75rem,11.5vw,11rem)] slush-display">
              <span className="whitespace-nowrap">How It&rsquo;s</span> <br />
              Made
            </h1>
            {/* display type never stands alone (DESIGN.md): the illustration this page builds leans on it */}
            <div aria-hidden className="pointer-events-none -my-[5vw] w-[30vw] max-w-[380px] shrink-0 rotate-[8deg]">
              <Sticker icon={cardTap} palette={LOOK.palette} line={LOOK.line} depth={LOOK.depth} enter={0.3} />
            </div>
          </div>
          <p className="mt-6 max-w-2xl text-[20px] leading-[1.2] font-medium text-balance sm:mt-8 sm:text-[24px]">
            No design tool. Every illustration starts as two descriptions in plain words, an AI agent draws and animates it with two skills,
            and it leaves in every format the editor exports. Here is one, start to finish.
          </p>
          <nav aria-label="Steps" className="scrollbar-none -mx-4 mt-8 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            {STEPS.map(([id, label], i) => (
              <a key={id} href={`#${id}`} className={cn(GHOST, SM, 'shrink-0 gap-2 pl-1.5')}>
                <span aria-hidden className={cn('grid size-7 place-items-center rounded-full border border-black text-[11px] tabular-nums', tint(i))}>
                  {i + 1}
                </span>
                {label}
              </a>
            ))}
          </nav>
        </div>
      </section>

      {/* band two, white: the five steps */}
      <section className="bg-white">
        <div className={cn(BAND, 'flex flex-col gap-20 pt-14 pb-20 sm:gap-28 sm:pt-20 sm:pb-28')}>
          <Step id="brief" title="Write a General Description" lead="One line that says what the object is and the single thing it does. If it does not read in a second, the idea is not ready to draw.">
            <div className={cn(CARD, 'overflow-hidden')}>
              <dl className="divide-y divide-black">
                {BRIEF.map(([k, v]) => (
                  <div key={k} className="grid gap-x-4 gap-y-1 px-5 py-4 sm:grid-cols-[9rem_1fr]">
                    <dt className="text-[12px] leading-6 slush-label">{k}</dt>
                    <dd className="text-[17px] leading-[1.39] font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {RULES.map(([name, text]) => (
                <li key={name} className={cn(CARD, 'px-5 py-4')}>
                  <h3 className="text-[17px] leading-[1.2] font-bold">{name}</h3>
                  <p className="mt-1.5 text-[15px] leading-[1.39] font-medium text-label-3">{text}</p>
                </li>
              ))}
            </ul>
            <P>Those rules are the short version. This is the general description we use, word for word. It goes to the agent with every idea.</P>
            <Description title="General description" text={GENERAL} />
          </Step>

          <Step
            id="motion"
            title="Write the Animation Description"
            lead="Now the same idea as a short story, in the order it happens. Four beats: rest, action, settle, reset. End with the loop length and the palette."
          >
            <figure className={cn(CARD, 'overflow-hidden')}>
              <blockquote className="bg-slush-sky px-5 py-6 text-[20px] leading-[1.3] font-medium text-pretty sm:px-7 sm:py-8 sm:text-[24px]">{STORY}</blockquote>
              <figcaption className="grid divide-y divide-black border-t border-black sm:grid-cols-4 sm:divide-x sm:divide-y-0">
                {BEATS.map(([name, text], i) => (
                  <div key={name} className="px-5 py-4">
                    <p className="flex items-center gap-2 text-[12px] slush-label">
                      <span aria-hidden className={cn('size-3 rounded-full border border-black', tint(i))} />
                      {name}
                    </p>
                    <p className="mt-1.5 text-[14px] leading-[1.39] font-medium">{text}</p>
                  </div>
                ))}
              </figcaption>
            </figure>
            <P>And the same text to copy. Change the object and the four beats, keep the shape.</P>
            <Description title="Animation description" text={STORY} />
            <P>
              When one thing replaces another, say that it <b>morphs</b>: the ring closes into the check. Nothing vanishes and pops back as
              something new. The long still hold after the action is on purpose, so leave it empty.
            </P>
          </Step>

          <Step
            id="skills"
            title="Use the Skills"
            lead="A skill is a folder of instructions an AI coding agent reads before it works. Two of them turn the description into a drawing that moves."
          >
            <ul className="grid gap-2 sm:grid-cols-2">
              {SKILLS.map((s, i) => (
                <li key={s.name} className={cn(CARD, 'flex flex-col overflow-hidden')}>
                  <div className={cn('flex items-center justify-between gap-3 border-b border-black px-5 py-4', i ? 'bg-slush-mint' : 'bg-slush-sunburst')}>
                    <code className="font-mono text-[16px] font-bold">{s.name}</code>
                    <span className="inline-flex h-7 shrink-0 items-center rounded-full border border-black bg-white px-3 text-[11px] slush-label">{s.job}</span>
                  </div>
                  <div className="flex flex-1 flex-col gap-3 px-5 py-4">
                    <p className="text-[15px] leading-[1.39] font-medium">{s.text}</p>
                    <ul className="flex flex-col gap-1.5 text-[14px] leading-[1.39] font-medium text-label-3">
                      {s.gives.map((g) => (
                        <li key={g} className="flex gap-2">
                          <span aria-hidden className="mt-[0.45em] size-1.5 shrink-0 rounded-full bg-black" />
                          {g}
                        </li>
                      ))}
                    </ul>
                    {s.href && (
                      <a href={s.href} target="_blank" rel="noreferrer" className="mt-auto w-fit pt-1 text-[13px] underline underline-offset-4 slush-label">
                        {s.link}
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <P>Then ask for it. The object goes on the first line, both descriptions go under it.</P>
            <CodeBlock code={PROMPT} className="[&_pre]:whitespace-pre-wrap" />
            <P>
              The agent writes two small files. The drawing is plain data on a 500 unit canvas, and every colour is a role such as{' '}
              <code>main</code> or <code>ok</code>, never a hex code, which is what lets anyone restyle it later.
            </P>
            <CodeBlock code={FILES} />
          </Step>

          <Step id="check" title="Check It and Make the Poster" lead="Two commands decide whether it ships. Nobody eyeballs a loop seam.">
            <CodeBlock code={RUN} />
            <ul className={cn(CARD, 'divide-y divide-black overflow-hidden')}>
              {CHECKS.map((c) => (
                <li key={c} className="flex items-center gap-3 px-5 py-3.5 text-[15px] leading-[1.39] font-medium">
                  <span aria-hidden className="grid size-6 shrink-0 place-items-center rounded-full border border-black bg-slush-mint text-[12px] font-bold">
                    ✓
                  </span>
                  {c}
                </li>
              ))}
            </ul>
            <P>The poster is the still frame, the one where the illustration reads whole. It is what shows before the canvas loads and under reduced motion.</P>
          </Step>

          <Step
            id="export"
            title="Export It in Every Format"
            lead="One drawing, every file. This is the finished Card Tap, and the panel beside it is the real exporter: each button saves or copies it right here."
          >
            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
              <div className="flex min-w-0 flex-col gap-4">
                <div className={cn(CARD, 'overflow-hidden rounded-[30px]')}>
                  <div className="checker px-[12%] py-[4%]">
                    <Sticker icon={cardTap} palette={LOOK.palette} line={LOOK.line} depth={LOOK.depth} label="Card Tap, the finished illustration" />
                  </div>
                </div>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {FORMATS.map(([name, text], i) => (
                    <li key={name} className={cn(CARD, 'flex items-start gap-3 px-4 py-3.5')}>
                      <span aria-hidden className={cn('mt-0.5 size-4 shrink-0 rounded-full border border-black', tint(i))} />
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="text-[13px] slush-label">{name}</span>
                        <span className="text-[14px] leading-[1.39] font-medium text-label-3">{text}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={cn(CARD, 'min-w-0 rounded-[30px] p-5')}>
                <ExportPanel slug="card-tap" title="Card Tap" icon={cardTap} style={DEFAULT_STYLE} currentFrame={() => cardTap.still ?? 0} />
              </div>
            </div>
            <P>
              Every illustration in the catalogue has the same panel in its editor, where the palette, stroke, depth and background can be
              changed first.
            </P>
          </Step>
        </div>
      </section>

      {/* band three, lavender: the same recipe with other ingredients */}
      <section id="your-style" className="bg-slush-lavender">
        <div className={cn(BAND, 'py-16 sm:py-24')}>
          <h2 className="text-[clamp(3rem,12vw,10rem)] slush-display">
            Want Another <br />
            Style?
          </h2>
          <p className="mt-6 max-w-2xl text-[20px] leading-[1.2] font-medium text-balance sm:mt-8 sm:text-[24px]">
            Nothing here is tied to stickers. The recipe is a description plus skills, so change either one and the same steps give you a
            different look.
          </p>
          {/* three kinds of change, biggest first: one column each, so the six options read as three choices. From lg the
              columns share their rows (subgrid): headers are one height and each option lines up with its neighbours. */}
          <ul className="mt-10 grid gap-4 lg:grid-cols-3 lg:gap-y-0">
            {SWAPS.map((group, g) => (
              <li key={group.kind} className={cn(CARD, 'grid overflow-hidden rounded-[30px] lg:row-span-3 lg:grid-rows-subgrid')}>
                <div className={cn('flex flex-col justify-center border-b border-black px-6 py-5', SWAP_FILL[g])}>
                  <h3 className="text-[clamp(1.75rem,2.2vw,2rem)] slush-display">{group.kind}</h3>
                  <p className="mt-2 text-[15px] leading-[1.39] font-medium">{group.note}</p>
                </div>
                {group.items.map((item, i) => (
                  <div key={item.change} className={cn('flex flex-col px-6 py-5', i > 0 && 'border-t border-black')}>
                    {/* what we use today, always on its own line so every title starts at the same height */}
                    <p className="flex items-center gap-2 text-[11px] slush-label">
                      We use
                      <span className="inline-flex h-6 items-center rounded-full bg-black px-2.5 text-[11px] font-medium tracking-normal whitespace-nowrap text-white normal-case">{item.from}</span>
                    </p>
                    <h4 className="mt-3 text-[22px] leading-[1.2] font-bold">{item.change}</h4>
                    <p className="mt-2 mb-4 text-[15px] leading-[1.39] font-medium text-label-3 lg:min-h-[4.17em]">{item.how}</p>
                    {/* the sentence above keeps room for three lines, so the chips of all three columns start on one line */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="mr-0.5 text-[11px] slush-label">Try</span>
                      <ul className="contents">
                        {item.tries.map((t) => (
                          <li key={t} className="inline-flex h-8 items-center rounded-full border border-black bg-white px-3 text-[13px] font-medium whitespace-nowrap">
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap gap-2">
            <Link to="/illustrations" className={cn(FILLED, LG)}>
              Browse Illustrations
            </Link>
            <Link to="/docs" className={cn(GHOST, LG)}>
              Read the Docs
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

/** A description as we use it: plain text on a card, with one button that copies all of it. */
function Description({ title, text }: { title: string; text: string }) {
  return (
    <div className={cn(CARD, 'overflow-hidden')}>
      <div className="flex h-12 items-center justify-between border-b border-black bg-slush-mist pr-3 pl-5">
        <h3 className="text-[12px] slush-label">{title}</h3>
        <CopyButton text={text} />
      </div>
      <p className="px-5 py-5 text-[15px] leading-[1.5] font-medium whitespace-pre-line">{text}</p>
    </div>
  )
}

/** One numbered step: the number as a tilted sticker, the title in display type, a lead, then whatever the step shows. */
function Step({ id, title, lead, children }: { id: (typeof STEPS)[number][0]; title: string; lead: string; children: ReactNode }) {
  const n = STEPS.findIndex(([step]) => step === id) + 1
  return (
    <section id={id} className="scroll-mt-24">
      <NumberedHeading n={n} title={title} />
      <p className="mt-5 max-w-3xl text-[20px] leading-[1.25] font-medium text-pretty sm:text-[24px]">{lead}</p>
      <div className="mt-8 flex max-w-5xl flex-col gap-5">{children}</div>
    </section>
  )
}
