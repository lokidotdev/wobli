import { Link } from '@tanstack/react-router'
import type { Palette, Style } from 'wobli'
import { useEffect, useRef } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { GlobalStyleControls, SITE_PALETTES, randomPresetForVisit, useGlobalLook, useGlobalStyle } from '~/features/style'
import { LiveSticker, StickerCard, useFeatured } from '~/features/illustrations'
import type { Illustration } from '~/features/illustrations'
import { INSTALL } from '~/features/export/lib/code'
import { cn } from '~/shared/lib/cn'
import { CopyButton } from '~/shared/ui/CopyButton'
import { GitHubStar } from '~/shared/ui/GitHubStar'
import { LetterSticker } from '~/shared/ui/LetterSticker'
import { BAND, FILLED, GHOST, LG, SM, STAR_GHOST } from '~/shared/ui/SlushChrome'
import { useLandingMotion } from '../hooks/useLandingMotion'
import letterD from '../lib/letter-d'
import letterI from '../lib/letter-i'

// The landing page is a sticker book: pastel colour bands, crushed display type, black hairline
// outlines, pills everywhere, no shadows and no gradients. The stickers are the site's own live illustrations, pinned around
// the type like cut-outs. Everything else on the site stays Geist (DESIGN.md).

const GRID = ['folder-hover', 'ai-agent-tasks', 'calendar-booking', 'camera-capture', 'e-signature', 'headphones', 'invoice-paid', 'no-results']
const rank = (slug: string) => (GRID.indexOf(slug) + GRID.length + 1) % (GRID.length + 1)

type PinProps = { illustration: Illustration; look: Style; index: number; motion: string; className?: string; tilt?: string }

/**
 * A live illustration pinned to the page like a cut-out sticker: tilted, straightening on hover. The outer box is placed by
 * `className` and is what the scroll motion moves (data-pin); the link inside holds the tilt, so the two never fight.
 */
function Pin({ illustration, look, index, motion, className, tilt }: PinProps) {
  return (
    <div data-pin={motion} className={cn('absolute z-10', className)}>
      <Link
        to="/illustrations/$slug"
        params={{ slug: illustration.slug }}
        aria-label={`Customize ${illustration.title}`}
        className={cn('block rounded-[20px] transition-transform duration-300 ease-out hover:scale-105 hover:rotate-0', tilt)}
      >
        <LiveSticker illustration={illustration} look={look} offset={index * 24} enter={0.15 + index * 0.08} priority={index < 4} sizes="(min-width: 640px) 17vw, 28vw" />
      </Link>
    </div>
  )
}

type TagProps = { children: ReactNode; motion: string; className?: string; fill: string; tilt: string }

/**
 * A fact stuck onto the headline like a price label: a small tilted pill in a sticker colour, overlapping the letters.
 * Placed by `className` inside a Tags list from sm up; on a phone the tags line up in a row under the type. The motion pops it on (data-tag).
 */
function Tag({ children, motion, className, fill, tilt }: TagProps) {
  return (
    <li data-tag={motion} className={cn('sm:absolute', className)}>
      <span className={cn('inline-flex h-7 items-center rounded-full border border-black px-3 text-[10px] whitespace-nowrap slush-label sm:h-10 sm:px-5 sm:text-[13px]', fill, tilt)}>
        {children}
      </span>
    </li>
  )
}

/** The layer the tags sit in: over the headline from sm up, out of the pointer's way so the letters under them still answer; on a phone, a row under it, out at either edge with the ribbon's loop between them. */
function Tags({ label, children }: { label: string; children: ReactNode }) {
  return (
    <ul aria-label={label} className="pointer-events-none relative z-20 mt-6 flex justify-between gap-3 px-1 sm:absolute sm:inset-0 sm:mt-0 sm:block">
      {children}
    </ul>
  )
}

/**
 * The ribbon behind a display headline (DESIGN.md: display type never sits alone on a flat band): one fat looping line,
 * flat colour with the black cut-out outline, running off both edges of the screen. Drawn as the same path twice, the
 * black one a hairline wider. The shape stretches with the band; the stroke does not. The motion draws both paths along
 * their length (data-ribbon).
 */
function Ribbon({ d, motion, className, viewBox = '0 0 1440 600' }: { d: string | ReadonlyArray<string>; motion: string; className?: string; viewBox?: string }) {
  const lines = typeof d === 'string' ? [d] : d
  return (
    <svg
      data-ribbon={motion}
      aria-hidden
      viewBox={viewBox}
      preserveAspectRatio="none"
      fill="none"
      strokeLinecap="round"
      className={cn('pointer-events-none absolute top-0 left-1/2 h-full w-screen -translate-x-1/2 overflow-visible [--w:clamp(14px,2.6vw,38px)]', className)}
    >
      {/* every outline first, then every fill, so one line's outline never crosses another's colour */}
      {lines.map((line) => (
        <path key={line} d={line} vectorEffect="non-scaling-stroke" stroke="#000" style={{ strokeWidth: 'calc(var(--w) + 2px)' }} />
      ))}
      {lines.map((line) => (
        <path key={line} d={line} vectorEffect="non-scaling-stroke" stroke="currentColor" style={{ strokeWidth: 'var(--w)' }} />
      ))}
    </svg>
  )
}

// The hero's ribbon is one line that goes round the headline, never behind it: a loop down the left edge, a long run
// under the last line of type, then a loop up the right edge and out.
const HERO_RIBBON =
  'M-60 90 C 60 40 190 90 170 220 C 155 320 40 330 60 240 C 80 160 190 300 150 430 C 130 500 200 550 340 555 C 600 565 900 530 1100 550 C 1230 562 1330 520 1340 420 C 1350 320 1240 300 1235 380 C 1230 450 1340 430 1370 300 C 1395 190 1300 120 1500 60'
// A phone's headline fills the width, so its ribbon cannot go round the sides: it sweeps in under the first sticker, runs down
// the very edge of the screen, swings under the tags, makes one loop between them and leaves. Built from its curvature rather than from
// points: every turn eases in and out (curvature rises and falls smoothly, zero between turns), so the bend never jumps and the
// line reads as one stroke. Drawn at the box's own proportions (390 × 360), so stretching it to fit barely distorts it.
const HERO_RIBBON_PHONE =
  'M-72 18 C-62.3 20.4 -52.5 22.7 -43 25.8 C-33.5 28.9 -24.2 33 -16.4 39.2 C-8.6 45.5 -2.6 53.9 0.9 63.3 C4.4 72.7 5.3 82.8 5.3 92.8 C5.3 102.8 4.4 112.8 3.7 122.8 C3 132.7 2.3 142.7 1.6 152.7 C0.9 162.7 0.2 172.6 -0.5 182.6 C-1.2 192.6 -1.9 202.6 -2.6 212.5 C-3.3 222.5 -4 232.5 -4.7 242.5 C-5.3 252.4 -6.1 262.4 -6.1 272.4 C-6.1 282.4 -5.3 292.5 -2.6 302.1 C0.1 311.8 4.7 320.9 11.3 328.4 C17.9 335.9 26.4 341.7 35.7 345.4 C45 349.2 54.9 351.1 64.9 352 C74.8 352.9 84.8 352.9 94.8 352.9 C104.8 352.9 114.8 352.9 124.8 352.9 C134.8 352.9 144.8 353 154.8 352.9 C164.8 352.8 174.9 352.5 184.7 350.7 C194.6 348.9 204.3 345.4 212 339 C219.6 332.5 224.8 322.7 224.2 312.7 C223.6 302.8 216.6 293.2 207.1 290.4 C197.5 287.5 186.3 291.7 180.8 300.1 C175.3 308.4 175.5 319.8 180.3 328.6 C185.1 337.4 193.7 343.6 203.1 347.2 C212.4 350.7 222.5 352 232.5 352.5 C242.5 353 252.5 352.9 262.5 352.9 C272.5 352.9 282.5 352.9 292.5 352.9 C302.5 352.9 312.5 352.9 322.5 352.9 C332.5 352.9 342.5 352.9 352.5 352.9 C362.5 352.9 372.5 352.9 382.5 352.9 C392.5 352.9 402.5 352.9 412.5 352.9 C422.5 352.9 432.5 352.9 442.5 352.9 C452.5 352.9 462.5 352.9 472.5 352.9 C482.5 352.9 492.5 352.9 502.5 352.4 C512.4 351.8 522.4 350.6 532.1 348.3 C541.9 346 551.3 342.6 560.5 338.5 C569.6 334.5 578.5 329.8 587.3 325.2 C590.8 323.3 594.4 321.4 597.9 319.5'
const TAKE_RIBBON = 'M-60 420 C 160 560 330 330 250 190 C 190 80 50 150 120 270 C 220 440 560 60 800 90 C 1040 120 1060 500 1230 510 C 1390 520 1420 300 1300 280 C 1190 262 1190 420 1320 430 C 1400 436 1460 400 1500 360'

const Spark = ({ className }: { className?: string }) => (
  <svg aria-hidden viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 0c1 7 4 10 12 12-8 2-11 5-12 12-1-7-4-10-12-12 8-2 11-5 12-12Z" />
  </svg>
)

const TAPE = ['Pick a palette', 'Set the outline', 'Dial the depth', 'Export a PNG', 'Drop in React']

/**
 * The tape that closes the hero: a tilted yellow strip of display type, stuck across the seam into the next band. It
 * says the three steps the next band spells out, so it is decoration to a screen reader.
 */
function Tape() {
  const run = (
    <ul className="flex shrink-0">
      {TAPE.map((t) => (
        <li key={t} className="flex items-center whitespace-nowrap">
          {t}
          <Spark className="mx-[0.55em] size-[0.5em]" />
        </li>
      ))}
    </ul>
  )
  return (
    <div aria-hidden className="relative z-10 -mx-[3vw] -mb-px translate-y-1/2 -rotate-2 overflow-hidden border-y border-black bg-slush-sunburst py-[0.45em] text-[clamp(1.375rem,3.4vw,3rem)] slush-display">
      {/* each half holds the run three times, so one half always covers the widest screen */}
      <div className="slush-marquee flex w-max [animation-duration:48s]">
        {[0, 1].map((half) => (
          <div key={half} className="flex shrink-0">
            {run}
            {run}
            {run}
          </div>
        ))}
      </div>
    </div>
  )
}

// where the three hero stickers sit: out at the corners, clear of the headline
const HERO_PINS = [
  ['top-0 left-0 w-[25vw] max-w-[230px] sm:w-[16vw]', '-rotate-12'],
  ['top-0 right-0 w-[24vw] max-w-[220px] sm:w-[15vw]', 'rotate-[10deg]'],
  // bottom left, from sm up; a phone has room for two stickers, so this one sits it out and the tags take the space
  ['bottom-[-5%] left-[3%] w-[17vw] max-w-[240px] max-sm:hidden', 'rotate-[8deg]'],
] as const

const HEADLINE = [['Style'], ['it', 'live']]
const LETTER_SLOTS = ['main', 'gold', 'ok', 'hot', 'deep'] as const
const LETTER_TILT = [-7, 5, -4, 8, -6, 4, 7, -5, 6, -8, 5]

/**
 * The headline, a letter at a time. Hover one and it becomes a sticker: it takes a colour from the palette picked in
 * "Try a Style", gets the black cut-out outline and tips up off the page. The colour fades out slowly, so sweeping across
 * leaves a trail. It is the pitch in the headline itself: the type restyles live, like the illustrations do.
 */
function Headline({ palette, look }: { palette: Palette; look: Style }) {
  let n = 0
  return (
    <h1
      aria-label="Animated isometric illustrations. Style it live"
      className="relative text-center text-[clamp(4.5rem,19vw,17.25rem)] slush-display"
    >
      {/* the keyword line: the poster type below says nothing a search engine can use */}
      <span className="mb-4 block text-[13px] leading-none slush-label sm:mb-6 sm:text-[15px]">Animated isometric illustrations</span>
      {HEADLINE.map((words, row) => (
        <span key={row} aria-hidden className="block">
          {words.map((word, w) => (
            <span key={word}>
              {w > 0 && ' '}
              <span className="inline-block whitespace-nowrap">
                {[...word].map((ch) => {
                  const i = n++
                  const style = { '--c': palette[LETTER_SLOTS[i % LETTER_SLOTS.length]!], '--r': `${LETTER_TILT[i % LETTER_TILT.length]}deg` } as CSSProperties
                  // the I of LIVE is the pitch itself: a live sticker standing in the type, in the look picked below
                  if (word === 'live' && ch === 'i') return <LetterSticker key={i} icon={letterI} look={look} label="I" enter={0.5} className="slush-letter mx-[0.02em] w-[0.46em]" style={style} />
                  return (
                    <span key={i} className="slush-letter" style={style}>
                      {ch}
                    </span>
                  )
                })}
              </span>
            </span>
          ))}
        </span>
      ))}
    </h1>
  )
}

function Hero({ items, look, palette }: { items: ReadonlyArray<Illustration>; look: Style; palette: Palette }) {
  return (
    <section data-hero className="overflow-x-clip bg-slush-sky pt-[72px]">
      <div className={cn(BAND, 'pt-4 pb-12 sm:pb-16')}>
        <div className="relative pt-[27vw] pb-[9vw] sm:py-[12vw] lg:py-[9vw] min-[1440px]:py-[130px]">
          <Ribbon d={HERO_RIBBON} motion="hero" className="text-slush-blue max-sm:hidden" />
          <Ribbon d={HERO_RIBBON_PHONE} viewBox="0 0 390 360" motion="hero" className="text-slush-blue sm:hidden" />
          {/* the headline and the facts stuck on it move as one */}
          <div data-hero-title className="relative">
            <Headline palette={palette} look={look} />
            {/* each tag sits on the ribbon: the left loop, the right loop, and the run under the type */}
            <Tags label="In short">
              <Tag motion="hero" className="max-sm:order-2 sm:top-[49%] sm:right-[2%]" fill="bg-slush-mint" tilt="rotate-[5deg] sm:rotate-[7deg]">
                Free &amp; MIT
              </Tag>
              <Tag motion="hero" className="max-sm:order-1 sm:top-[64%] sm:left-[1%]" fill="bg-slush-sunburst" tilt="-rotate-[5deg] sm:-rotate-[8deg]">
                No account
              </Tag>
              <Tag motion="hero" className="right-[24%] bottom-[-15%] max-sm:hidden" fill="bg-slush-lavender" tilt="-rotate-[4deg]">
                Drawn in code
              </Tag>
            </Tags>
          </div>
          {items.slice(0, HERO_PINS.length).map((it, i) => (
            <Pin key={it.slug} illustration={it} look={look} index={i} motion="hero" className={HERO_PINS[i]![0]} tilt={HERO_PINS[i]![1]} />
          ))}
        </div>

        <p className="mx-auto mt-6 max-w-3xl text-center text-[20px] leading-[1.2] font-medium tracking-[-0.01em] text-balance sm:mt-8 sm:text-[24px]">
          Animated isometric illustrations you restyle in the browser. Pick a palette, set the outline and depth, then export a PNG or a
          component for React and Next.js.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <Link
            to="/illustrations"
            className={cn(FILLED, LG, 'slush-pill [--c:var(--color-slush-sunburst)] [--r:-2deg] hover:text-black focus-visible:text-black')}
          >
            Browse Illustrations
          </Link>
          <GitHubStar size="lg" className={cn(STAR_GHOST, 'px-6! text-[14px]!')} />
        </div>

        {/* the pitch, made by touching it: this strip restyles every sticker on the page */}
        <GlobalStyleControls
          label="Try a Style"
          className="mx-auto mt-10 max-w-5xl rounded-[30px] border border-black bg-white px-5 py-4 sm:mt-12 lg:rounded-full lg:px-6 lg:py-2.5"
        />
      </div>
      <Tape />
    </section>
  )
}

const STEPS = [
  ['Pick', 'Start from any illustration. Each one is code, drawn live on a canvas, so nothing is baked in.', 'bg-slush-lavender'],
  ['Tweak', 'Every colour is a role, not a hex. Swap a palette, shift the hue, set your brand, outline and depth.', 'bg-slush-sunburst'],
  ['Export', 'A transparent PNG at any size, a React component with your style in its props, or a link to the look.', 'bg-slush-mint'],
] as const
const STEP_TILT = ['-rotate-6', 'rotate-[5deg]', '-rotate-[4deg]']

function How({ items, look }: { items: ReadonlyArray<Illustration>; look: Style }) {
  return (
    <section className="bg-white" aria-labelledby="how">
      <div className={cn(BAND, 'py-20 sm:py-28')}>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <h2 id="how" data-lines className="text-[clamp(4.25rem,15vw,13.75rem)] slush-display">
            {['Pick.', 'Tweak.', 'Export.'].map((line) => (
              <span key={line} data-line className="block">
                {line}
              </span>
            ))}
          </h2>
          <p data-rise className="max-w-[9em] text-[clamp(2rem,4.4vw,4rem)] leading-none font-bold tracking-[-0.03em] lg:pb-2 lg:text-right">No design tool in between.</p>
        </div>
        <ol data-steps className="mt-12 grid gap-4 sm:mt-16 md:grid-cols-3">
          {STEPS.map(([title, body, fill], i) => {
            const it = items[i]
            return (
              <li key={title} data-step className={cn('relative flex flex-col rounded-[40px] border border-black p-6 sm:p-8', fill)}>
                <div className="flex items-start justify-between">
                  <span className="inline-flex h-9 items-center rounded-full border border-black bg-white px-3.5 text-[13px] slush-label tabular-nums">0{i + 1}</span>
                  {it && (
                    <div data-step-sticker className="-mt-16 -mr-2 w-[46%] max-w-[190px] sm:-mt-20">
                      <LiveSticker illustration={it} look={look} offset={i * 30} sizes="(min-width: 768px) 190px, 37vw" className={STEP_TILT[i]} />
                    </div>
                  )}
                </div>
                <h3 className="mt-6 text-[clamp(3rem,6vw,5rem)] slush-display">{title}</h3>
                <p className="mt-4 max-w-sm text-[16px] leading-[1.39] font-medium tracking-[-0.01em]">{body}</p>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

// Only whole rows, whatever the column count and however many are featured: a card past the last full row is hidden at that
// breakpoint. Two rows at most, except a phone's single column, which gets four. Columns: 1 below sm, 2 from sm, 3 from lg, 4 from xl.
const PHONE_ROWS = 4
const fullRows = (n: number, cols: number) => (n < cols ? n : Math.min(Math.floor(n / cols), 2) * cols)
const rowClass = (i: number, n: number) =>
  cn(i >= Math.min(n, PHONE_ROWS) && 'max-sm:hidden', i >= fullRows(n, 2) && 'sm:max-lg:hidden', i >= fullRows(n, 3) && 'lg:max-xl:hidden', i >= fullRows(n, 4) && 'xl:hidden')

function Featured({ items, look }: { items: ReadonlyArray<Illustration>; look: Style }) {
  return (
    <section className="bg-slush-concrete" aria-labelledby="all">
      <div className={cn(BAND, 'py-20 sm:py-28')}>
        <div className="relative">
          {/* the D is a live sticker standing in the type, like the hero's I */}
          <h2 id="all" data-lines aria-label="Featured" className="text-[clamp(3.75rem,15.5vw,14rem)] slush-display">
            <span data-line aria-hidden className="block whitespace-nowrap">
              Feature
              <LetterSticker icon={letterD} look={look} label="D" className="ml-[0.03em] w-[0.52em]" />
            </span>
          </h2>
        </div>
        <div data-rise className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <p className="text-[24px] leading-[1.2] font-medium tracking-[-0.01em] sm:text-[30px]">All of them, in your style.</p>
          <Link to="/illustrations" className={cn(GHOST, SM)}>
            Browse All Illustrations
          </Link>
        </div>
        <div data-cards className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((it, i) => (
            // the wrapper is what the scroll motion deals in; the card inside keeps its own hover lift
            <div key={it.slug} data-card className={cn('grid', rowClass(i, items.length))}>
              <StickerCard illustration={it} look={look} offset={i * 20} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TakeHome({ pins, look }: { pins: ReadonlyArray<Illustration>; look: Style }) {
  return (
    <section className="overflow-x-clip bg-slush-blue" aria-labelledby="take">
      <div className={cn(BAND, 'py-20 text-center sm:py-28')}>
        <div className="relative py-[25vw] sm:py-[5vw]">
          <Ribbon d={TAKE_RIBBON} motion="take" className="text-slush-sunburst" />
          {/* the headline and what you leave with, stuck on it: they swell as one */}
          <div data-grow className="relative">
            <h2 id="take" className="text-[clamp(4rem,17vw,15.5rem)] slush-display">
              Take it
              <br />
              home
            </h2>
            {/* each tag keeps to a corner the stickers do not use: stickers top left and bottom right, tags the other two */}
            <Tags label="What you leave with">
              <Tag motion="take" className="max-sm:top-[-26%] max-sm:right-[3%] sm:top-[-10%] sm:right-[7%]" fill="bg-white" tilt="rotate-[6deg]">
                PNG, any size
              </Tag>
              <Tag motion="take" className="max-sm:bottom-[-26%] max-sm:left-[3%] sm:top-[80%] sm:left-[2%]" fill="bg-slush-mint" tilt="-rotate-[7deg]">
                React &amp; Next.js
              </Tag>
              <Tag motion="take" className="bottom-[-13%] left-[38%] max-sm:hidden" fill="bg-slush-lavender" tilt="rotate-[4deg]">
                A link to the look
              </Tag>
            </Tags>
          </div>
          {pins[0] && <Pin illustration={pins[0]} look={look} index={6} motion="take-left" className="top-0 left-0 w-[28vw] max-w-[220px] sm:w-[16vw]" tilt="-rotate-[10deg]" />}
          {pins[1] && <Pin illustration={pins[1]} look={look} index={7} motion="take-right" className="right-0 bottom-0 w-[28vw] max-w-[220px] sm:w-[16vw]" tilt="rotate-[9deg]" />}
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-[20px] leading-[1.2] font-medium tracking-[-0.01em] text-balance sm:text-[24px]">
          A transparent PNG, a React component, or a link to the look. Free and MIT, no account.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <Link to="/illustrations" className={cn(FILLED, LG)}>
            Browse Illustrations
          </Link>
          <Link to="/docs" className={cn(GHOST, LG)}>
            Read the Docs
          </Link>
        </div>
        {/* the fastest way home: the install line, one click from the clipboard */}
        <div data-rise className="mx-auto mt-4 flex h-12 w-fit items-center gap-2 rounded-full border border-black bg-white pr-2 pl-5">
          <code className="font-mono text-[14px] font-medium">
            <span aria-hidden className="mr-2 select-none text-black/40">$</span>
            {INSTALL}
          </code>
          <CopyButton variant="icon" text={INSTALL} label="Copy install command" />
        </div>
      </div>
    </section>
  )
}

export function LandingPage() {
  const { data: items } = useFeatured()
  // the grid: the eight featured, in this order, as two full rows of four
  const { data: featured } = useFeatured(GRID.length)
  const grid = [...featured].sort((a, b) => rank(a.slug) - rank(b.slug))
  const look = useGlobalLook()
  const palette = SITE_PALETTES[useGlobalStyle().preset]
  // stickers for the lower bands: ones the hero has not already shown come first
  const hero = new Set(items.map((it) => it.slug))
  const rest = [...grid.filter((it) => !hero.has(it.slug)), ...grid.filter((it) => hero.has(it.slug))]
  // wraps round, so every band gets its stickers even when few are featured
  const pick = (from: number, count: number) => (rest.length ? Array.from({ length: count }, (_, i) => rest[(from + i) % rest.length]!) : [])

  // a fresh random palette on every visit, for this page only (not saved; the other pages keep the visitor's own look)
  useEffect(() => randomPresetForVisit(), [])

  const root = useRef<HTMLDivElement>(null)
  useLandingMotion(root)

  return (
    <div ref={root}>
      <Hero items={items} look={look} palette={palette} />
      <How items={pick(0, 3)} look={look} />
      <Featured items={grid} look={look} />
      <TakeHome pins={pick(4, 2)} look={look} />
    </div>
  )
}
