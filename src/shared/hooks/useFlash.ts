import { useEffect, useRef, useState } from 'react'

/** Completion feedback where the action happened: true for a moment after fire(), so a control can turn into a check. */
export function useFlash(ms = 1400) {
  const [on, setOn] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  const fire = () => {
    setOn(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setOn(false), ms)
  }
  return [on, fire] as const
}
