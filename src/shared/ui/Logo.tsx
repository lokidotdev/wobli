import { useRef } from 'react'
import type { AnimationEvent, PointerEvent } from 'react'

// An isometric slab in Apple's system colours, outlined like the stickers. Same drawing as media/logo/logo.svg and
// public/favicon.svg. The face classes are what the hover (.logo in app.css) animates.
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className ? `logo ${className}` : 'logo'}>
      <path className="logo-t" d="M16 4 27.5 10.5 16 17 4.5 10.5Z" fill="#ffd60a" stroke="#000" strokeWidth="1.4" strokeLinejoin="round" />
      <path className="logo-l" d="M4.5 10.5 16 17v11.5L4.5 22Z" fill="#0a84ff" stroke="#000" strokeWidth="1.4" strokeLinejoin="round" />
      <path className="logo-r" d="M27.5 10.5 16 17v11.5L27.5 22Z" fill="#34c759" stroke="#000" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * Spread on the link that holds a <Logo>: while a mouse is over it the logo's colours step round its faces and the
 * outline thickens (data-shuffle, app.css). On leave the running cycle finishes first, so the colours land back on
 * their own faces instead of snapping. Touch never starts it: a tap would fire a stray hover before navigating.
 */
export function useLogoShuffle() {
  const leaving = useRef(false)
  return {
    onPointerEnter: (e: PointerEvent<HTMLElement>) => {
      if (e.pointerType !== 'mouse') return
      leaving.current = false
      e.currentTarget.dataset.shuffle = ''
    },
    onPointerLeave: () => {
      leaving.current = true
    },
    onAnimationIteration: (e: AnimationEvent<HTMLElement>) => {
      if (!leaving.current) return
      leaving.current = false
      delete e.currentTarget.dataset.shuffle
    },
  }
}
