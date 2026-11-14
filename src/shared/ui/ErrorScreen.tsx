import { useQueryErrorResetBoundary } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { useEffect } from 'react'
import { ApiError, isUnreachable } from '~/shared/lib/api'
import { Button } from './Button'

/** What a page shows when its data could not load. The header and footer stay, so the rest of the site still works. */
export function ErrorScreen({ error }: ErrorComponentProps) {
  const router = useRouter()
  const queryReset = useQueryErrorResetBoundary()
  // a failed suspense query stays failed until its boundary is reset
  useEffect(() => queryReset.reset(), [queryReset])

  const offline = isUnreachable(error)
  return (
    <div className="mx-auto max-w-xl px-4 py-32 text-center">
      <h1 className="type-title">{offline ? 'Catalogue Offline' : "Couldn't Load Page"}</h1>
      <p className="mt-3 text-[16px] leading-6 text-label-2">
        {offline
          ? "Illustrations couldn't load because the wobli API isn't answering. Try again in a moment."
          : error instanceof ApiError
            ? error.message
            : "This page couldn't load. Try again in a moment."}
      </p>
      {import.meta.env.DEV && offline && (
        <p className="mt-2 text-[13px] text-label-3">
          Dev: start the backend with <code>pnpm dev</code> at the repo root.
        </p>
      )}
      <Button className="mt-8" onClick={() => router.invalidate()}>
        Try Again
      </Button>
    </div>
  )
}
