import { createLink } from '@tanstack/react-router'
import { forwardRef } from 'react'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react'
import { cn } from '~/shared/lib/cn'

type Variant = 'primary' | 'secondary' | 'tertiary' | 'plain' | 'error'
type Size = 'sm' | 'md' | 'lg'

// Geist Button (DESIGN.md §7): 6px radius, Button 14 type, 32 / 40 / 48 tall. Disabled is gray, not faded colour.
const BASE =
  'inline-flex select-none items-center justify-center gap-1.5 whitespace-nowrap [font-weight:var(--control-weight,500)] [letter-spacing:var(--control-tracking,normal)] transition-[background-color,box-shadow,color,opacity] duration-150 ease-out disabled:pointer-events-none'
const BOX = 'rounded-(--radius-control) disabled:text-label-3'
// filled buttons go gray when disabled; a tertiary one just dims its text
const SOLID_DISABLED = 'disabled:bg-fill disabled:shadow-[var(--shadow-border)]'
const variants: Record<Variant, string> = {
  primary: cn(BOX, SOLID_DISABLED, 'bg-contrast text-on-contrast hover:bg-contrast/90'),
  secondary: cn(BOX, SOLID_DISABLED, 'bg-bg text-label shadow-[var(--shadow-border-small)] hover:bg-fill'),
  // no chrome until hovered: toolbar actions like Reset Style
  tertiary: cn(BOX, 'text-label hover:bg-gray-alpha-100 active:bg-gray-alpha-200'),
  error: cn(BOX, SOLID_DISABLED, 'bg-red-700 text-white hover:bg-red-900'),
  // an inline text link-button: Clear Filters, Copy
  plain: 'rounded-sm text-label-2 underline-offset-4 hover:text-label hover:underline disabled:opacity-50',
}
const box: Record<Size, string> = { sm: 'h-8 px-2.5 text-[14px]', md: 'h-10 px-3.5 text-[14px]', lg: 'h-12 px-4 text-[16px]' }
const sizes: Record<Variant, Record<Size, string>> = {
  primary: box,
  secondary: box,
  tertiary: box,
  error: box,
  plain: { sm: 'gap-1 text-[13px]', md: 'text-[14px]', lg: 'text-[16px]' },
}

export const buttonClass = (variant: Variant = 'primary', size: Size = 'md', className?: string) => cn(BASE, variants[variant], sizes[variant][size], className)

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }
export const Button = forwardRef<HTMLButtonElement, BtnProps>(({ variant, size, className, type = 'button', ...props }, ref) => (
  <button ref={ref} type={type} className={buttonClass(variant, size, className)} {...props} />
))

type AProps = AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant; size?: Size }
const ButtonAnchor = forwardRef<HTMLAnchorElement, AProps>(({ variant, size, className, ...props }, ref) => (
  <a ref={ref} className={buttonClass(variant, size, className)} {...props} />
))
/** A router Link styled as a button. */
export const ButtonLink = createLink(ButtonAnchor)
