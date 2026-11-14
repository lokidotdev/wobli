import { createLink } from '@tanstack/react-router'
import { forwardRef } from 'react'
import type { AnchorHTMLAttributes } from 'react'
import { cn } from '~/shared/lib/cn'
import { ChevronLeft, ChevronRight } from './icons'

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { back?: boolean }

const Anchor = forwardRef<HTMLAnchorElement, Props>(({ back, className, children, ...props }, ref) => (
  <a ref={ref} className={cn('flex items-center gap-0.5 text-[14px] font-medium text-label-2 transition-colors hover:text-label', back && '-ml-1', className)} {...props}>
    {back && <ChevronLeft className="size-4" />}
    {children}
    {!back && <ChevronRight className="size-4" />}
  </a>
))
/** A quiet text link with a chevron: forward by default, `back` for the way out of a page. */
export const ArrowLink = createLink(Anchor)
