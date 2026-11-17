import { useEffect, useRef, useState } from 'react'
import { FPS, toSvg } from 'wobli'
import type { Icon } from 'wobli'
import { backgroundColor, styleQuery, toEngineStyle } from '~/features/style'
import type { EditorStyle } from '~/features/style'
import { illustrationLabel, illustrationPath } from '~/features/illustrations'
import { useFlash } from '~/shared/hooks/useFlash'
import { Button } from '~/shared/ui/Button'
import { CopyButton } from '~/shared/ui/CopyButton'
import { Group } from '~/shared/ui/Group'
import { Check, Copy, Download, Link2 } from '~/shared/ui/icons'
import { Segmented } from '~/shared/ui/Segmented'
import { INSTALL } from '~/shared/config/site'
import { reactSnippet } from '../lib/code'
import { embedUrl, iframeSnippet } from '../lib/embed'
import { OPAQUE_GROUND, videoSeconds } from '../lib/frame'
import { download, renderPng } from '../lib/png'
import type { VideoFormat } from '../lib/video'

type Props = {
  slug: string
  title: string
  icon: Icon
  style: EditorStyle
  /** The frame on the editor's stage right now: what a PNG export captures. */
  currentFrame: () => number
}
const SIZES = ['512', '1024', '2048'] as const
const VSIZES = ['480', '720', '1080'] as const
const LOOPS = ['1', '2', '3'] as const

// The video encoder is most of this page's JavaScript and most visitors never export one, so it loads on first use.
const loadVideoEncoder = () => import('../lib/video')

export function ExportPanel({ slug, title, icon, style, currentFrame }: Props) {
  const look = toEngineStyle(style)
  const code = reactSnippet(slug, icon, look.palette, look.line, look.depth)
  // set after mount: the server has no origin, and rendering one there would not match the client
  const [origin, setOrigin] = useState('')
  useEffect(() => setOrigin(location.origin), [])
  const embed = embedUrl(origin, slug, style)
  const iframe = iframeSnippet(embed, illustrationLabel(title))
  const shareLink = () => `${location.origin}${illustrationPath(slug)}${styleQuery(style)}`

  return (
    <div className="flex flex-col gap-6">
      <PngGroup slug={slug} icon={icon} style={style} currentFrame={currentFrame} />
      <SvgGroup slug={slug} icon={icon} style={style} currentFrame={currentFrame} />
      <VideoGroup slug={slug} icon={icon} style={style} />

      <Group title="React" action={<CopyButton text={code} />}>
        <div className="flex h-10 items-center justify-between gap-2 rounded-full bg-bg pr-1 pl-4 shadow-[var(--shadow-border-inset)]">
          <code className="truncate font-mono text-[13px]">{INSTALL}</code>
          <CopyButton text={INSTALL} variant="icon" label="Copy install command" />
        </div>
        <pre className="scrollbar-slush max-h-48 overflow-auto rounded-[20px] bg-slush-mist px-4 py-3 font-mono text-[12px] leading-5 text-label shadow-[var(--shadow-border-inset)]">{code}</pre>
      </Group>

      <Group title="Embed" footer="A hosted player for this exact look, for any site. Transparent unless you set a background." action={<CopyButton text={iframe} label="Copy Iframe" />}>
        <div className="flex h-10 items-center gap-2 rounded-full bg-bg pr-1 pl-4 shadow-[var(--shadow-border-inset)]">
          <input readOnly value={embed} aria-label="Embed link" onFocus={(e) => e.currentTarget.select()} className="min-w-0 flex-1 truncate bg-transparent font-mono text-[12px] text-label-2 outline-none" />
          <CopyButton text={embed} variant="icon" label="Copy embed link" icon={Link2} />
        </div>
        <pre className="scrollbar-none overflow-x-auto rounded-[20px] bg-slush-mist px-4 py-3 font-mono text-[12px] leading-5 text-label shadow-[var(--shadow-border-inset)]">{iframe}</pre>
      </Group>

      <CopyButton text={shareLink} variant="block" label="Copy Link to This Look" copiedLabel="Link Copied" icon={Link2} className="w-full text-[13px]! uppercase" />
    </div>
  )
}

function PngGroup({ slug, icon, style, currentFrame }: Omit<Props, 'title'>) {
  const [size, setSize] = useState<(typeof SIZES)[number]>('1024')
  const [busy, setBusy] = useState(false)
  const [done, flash] = useFlash()
  const [error, setError] = useState<string | null>(null)
  const save = async () => {
    setBusy(true)
    setError(null)
    try {
      download(await renderPng(icon, Math.floor(currentFrame()), toEngineStyle(style), Number(size), backgroundColor(style.bg)), `${slug}-${size}.png`)
      flash()
    } catch {
      setError('This browser could not make the PNG. Try a smaller size.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <Group title="PNG" footer={error ?? (style.bg === 'none' ? 'Transparent, the frame on screen now.' : 'On your background, the frame on screen now.')}>
      <div className="flex items-center gap-3">
        <Segmented label="PNG size" value={size} onChange={setSize} options={SIZES.map((s) => ({ value: s, label: `${s}px` }))} className="flex-1" size="sm" />
        <Button size="sm" onClick={save} disabled={busy} aria-label="Save PNG" className="cursor-pointer disabled:cursor-default">
          {done ? <Check className="size-4" /> : <Download className="size-4" />}
          {done ? 'Saved' : 'Save'}
        </Button>
      </div>
    </Group>
  )
}

function SvgGroup({ slug, icon, style, currentFrame }: Omit<Props, 'title'>) {
  const [saved, flashSaved] = useFlash()
  const [copied, flashCopied] = useFlash()
  const [error, setError] = useState<string | null>(null)
  const svg = () => toSvg(icon, Math.floor(currentFrame()), toEngineStyle(style), { size: 1024, bg: backgroundColor(style.bg) })
  const save = () => {
    download(new Blob([svg()], { type: 'image/svg+xml' }), `${slug}.svg`)
    flashSaved()
  }
  const copy = async () => {
    setError(null)
    try {
      // Figma turns pasted SVG markup into editable vector layers
      await navigator.clipboard.writeText(svg())
      flashCopied()
    } catch {
      setError('The clipboard is blocked here. Save the SVG and drag it into Figma instead.')
    }
  }
  return (
    <Group title="SVG" footer={error ?? 'Editable vectors of the frame on screen now. Paste straight into Figma.'}>
      <div className="flex items-center gap-3">
        <Button size="sm" variant="secondary" onClick={copy} aria-label="Copy SVG for Figma" className="flex-1">
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? 'Copied' : 'Copy for Figma'}
        </Button>
        <Button size="sm" onClick={save} aria-label="Save SVG" className="cursor-pointer">
          {saved ? <Check className="size-4" /> : <Download className="size-4" />}
          {saved ? 'Saved' : 'Save'}
        </Button>
      </div>
    </Group>
  )
}

function VideoGroup({ slug, icon, style }: Pick<Props, 'slug' | 'icon' | 'style'>) {
  const [format, setFormat] = useState<VideoFormat>('mp4')
  const [size, setSize] = useState<(typeof VSIZES)[number]>('720')
  const [loops, setLoops] = useState<(typeof LOOPS)[number]>('1')
  const [progress, setProgress] = useState<number | null>(null)
  const [done, flash] = useFlash()
  const [error, setError] = useState<string | null>(null)
  const [alphaOk, setAlphaOk] = useState<boolean | null>(null)
  const abort = useRef<AbortController | null>(null)
  const bg = backgroundColor(style.bg)
  const seconds = videoSeconds(icon, style.speed, Number(loops))

  useEffect(() => {
    if (format === 'webm' && !bg) loadVideoEncoder()
        .then((video) => video.canTransparentWebm(Number(size)))
        .then(setAlphaOk, () => setAlphaOk(false))
  }, [format, size, bg])
  useEffect(() => () => abort.current?.abort(), [])

  const save = async () => {
    if (progress !== null) return abort.current?.abort() // a second press cancels
    setError(null)
    abort.current = new AbortController()
    setProgress(0)
    try {
      const { renderVideo } = await loadVideoEncoder()
      const blob = await renderVideo(icon, toEngineStyle(style), {
        format,
        size: Number(size),
        bg: format === 'webm' && !bg && alphaOk === false ? OPAQUE_GROUND : bg,
        speed: style.speed,
        loops: Number(loops),
        onProgress: setProgress,
        signal: abort.current.signal,
      })
      download(blob, `${slug}-${size}.${format}`)
      flash()
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setError('This browser could not encode the video. Try MP4, or a recent Chrome, Edge or Safari.')
    } finally {
      setProgress(null)
    }
  }

  const note =
    format === 'mp4'
      ? `H.264, ${bg ? 'on your background' : 'on white'}. Plays everywhere.`
      : bg
        ? 'VP9 on your background.'
        : alphaOk === false
          ? 'This browser can’t encode transparent video, so it will be on white. Chrome or Edge can.'
          : 'VP9 with a transparent background, for the web.'

  return (
    <Group title="Video" footer={error ?? `${note} ${seconds.toFixed(1)}s, ${FPS} fps, loops seamlessly.`}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Segmented<VideoFormat>
            label="Video format"
            value={format}
            onChange={setFormat}
            options={[
              { value: 'mp4', label: 'MP4' },
              { value: 'webm', label: 'WebM' },
            ]}
            className="flex-1"
            size="sm"
          />
          <Segmented label="Loops" value={loops} onChange={setLoops} options={LOOPS.map((l) => ({ value: l, label: `${l}×`, title: `${l} loop${l === '1' ? '' : 's'}` }))} className="w-28" size="sm" />
        </div>
        <div className="flex items-center gap-3">
          <Segmented label="Video size" value={size} onChange={setSize} options={VSIZES.map((s) => ({ value: s, label: `${s}p` }))} className="flex-1" size="sm" />
          <Button size="sm" onClick={save} aria-label={progress === null ? 'Save video' : 'Cancel video export'} className="relative w-24 cursor-pointer overflow-hidden">
            {progress !== null && <span aria-hidden className="absolute inset-y-0 left-0 bg-slush-violet transition-[width] duration-150" style={{ width: `${progress * 100}%` }} />}
            <span className="relative flex items-center gap-1.5">
              {progress !== null ? `${Math.round(progress * 100)}%` : done ? <><Check className="size-4" />Saved</> : <><Download className="size-4" />Save</>}
            </span>
          </Button>
        </div>
      </div>
    </Group>
  )
}
