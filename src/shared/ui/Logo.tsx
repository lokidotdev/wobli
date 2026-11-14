// An isometric slab in Apple's system colours, outlined like the stickers
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <path d="M16 4 27.5 10.5 16 17 4.5 10.5Z" fill="#ffd60a" stroke="#000" strokeWidth="2" strokeLinejoin="round" />
      <path d="M4.5 10.5 16 17v11.5L4.5 22Z" fill="#0a84ff" stroke="#000" strokeWidth="2" strokeLinejoin="round" />
      <path d="M27.5 10.5 16 17v11.5L27.5 22Z" fill="#34c759" stroke="#000" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}
