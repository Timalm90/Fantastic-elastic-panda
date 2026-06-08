import { useRef } from 'react'
import type { ControlZone } from '../../types/blendshape'

interface DragZoneProps {
  zone: ControlZone
  onDragStart?: (zone: ControlZone) => void
  /**
   * dx/dy: pixel deltas from drag-start origin.
   * overshootT: 0.0 = within normal range, smoothly rising to 1.0 at snap point.
   * The hook uses this to blend normal → rubber-band behavior continuously.
   */
  onDrag: (zone: ControlZone, dx: number, dy: number, overshootT: number) => void
  onRelease?: (zone: ControlZone) => void
  /** Fired once when the user pushes past the snap threshold. Gesture ends. */
  onSnapBack?: (zone: ControlZone) => void
  style?: React.CSSProperties
}

const SLOPPY_SOUND_SRC = "/sounds/sloppy.mp3"
const VELOCITY_THRESHOLD = 1.5
const SUSTAIN_REQUIRED_MS = 60
const FADE_IN_MS = 10
const STOP_DELAY_MS = 10
const FADE_OUT_MS = 0
const MAX_VOLUME = 0.55

// How many zone-diameters from origin before rubber-band resistance begins.
// 1.5 = very generous — user can drag 1.5× the zone width freely.
const RUBBER_BAND_START_FRACTION = 1.1

// How many additional zone-diameters of rubber-band zone exist before snap.
// The transition from 0 → 1 resistance happens across this distance.
const SNAP_EXTRA_FRACTION = 0.7

export function DragZone({
  zone,
  onDragStart,
  onDrag,
  onRelease,
  onSnapBack,
  style,
}: DragZoneProps) {
  const divRef = useRef<HTMLDivElement>(null)
  const originRef = useRef<{ x: number; y: number } | null>(null)
  const snapFiredRef = useRef(false)

  const fastSinceRef = useRef<number | null>(null)
  const fadeInIntervalRef = useRef<number | null>(null)
  const stopTimeoutRef = useRef<number | null>(null)
  const fadeOutIntervalRef = useRef<number | null>(null)
  const lastMoveRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // ─── Sound ────────────────────────────────────────────────────────────────

  function shouldUseSloppySound(zoneId: string) {
    return zoneId === 'l_cheek' || zoneId === 'r_cheek'
  }

  function getAudio() {
    if (!audioRef.current) {
      audioRef.current = new Audio(SLOPPY_SOUND_SRC)
      audioRef.current.loop = true
      audioRef.current.volume = 0.35
    }
    return audioRef.current
  }

  function clearSoundTimers() {
    if (stopTimeoutRef.current) { window.clearTimeout(stopTimeoutRef.current); stopTimeoutRef.current = null }
    if (fadeInIntervalRef.current) { window.clearInterval(fadeInIntervalRef.current); fadeInIntervalRef.current = null }
    if (fadeOutIntervalRef.current) { window.clearInterval(fadeOutIntervalRef.current); fadeOutIntervalRef.current = null }
  }

  function startSloppySound() {
    if (!shouldUseSloppySound(zone.id)) return
    const audio = getAudio()
    clearSoundTimers()
    if (audio.paused) { audio.volume = 0; audio.play().catch(() => {}) }
    const startVolume = audio.volume
    const steps = 12
    const stepTime = FADE_IN_MS / steps
    let step = 0
    fadeInIntervalRef.current = window.setInterval(() => {
      step += 1
      audio.volume = Math.min(MAX_VOLUME, startVolume + (MAX_VOLUME - startVolume) * (step / steps))
      if (step >= steps) {
        window.clearInterval(fadeInIntervalRef.current!); fadeInIntervalRef.current = null
        audio.volume = MAX_VOLUME
      }
    }, stepTime)
  }

  function stopSloppySound() {
    if (!shouldUseSloppySound(zone.id)) return
    const audio = audioRef.current
    if (!audio) return
    clearSoundTimers()
    stopTimeoutRef.current = window.setTimeout(() => {
      const startVolume = audio.volume
      const steps = 12
      const stepTime = FADE_OUT_MS / steps
      let step = 0
      fadeOutIntervalRef.current = window.setInterval(() => {
        step += 1
        audio.volume = Math.max(0, startVolume * (1 - step / steps))
        if (step >= steps) {
          window.clearInterval(fadeOutIntervalRef.current!); fadeOutIntervalRef.current = null
          audio.pause(); audio.volume = MAX_VOLUME
        }
      }, stepTime)
    }, STOP_DELAY_MS)
  }

  function updateVelocitySound(x: number, y: number) {
    const now = performance.now()
    if (lastMoveRef.current) {
      const dx = x - lastMoveRef.current.x
      const dy = y - lastMoveRef.current.y
      const dt = now - lastMoveRef.current.time
      const velocity = Math.sqrt(dx * dx + dy * dy) / Math.max(dt, 1)
      if (velocity > VELOCITY_THRESHOLD) {
        if (fastSinceRef.current === null) fastSinceRef.current = now
        if (now - fastSinceRef.current >= SUSTAIN_REQUIRED_MS) startSloppySound()
      } else {
        fastSinceRef.current = null
        stopSloppySound()
      }
    }
    lastMoveRef.current = { x, y, time: now }
  }

  // ─── Overshoot math ───────────────────────────────────────────────────────

  function getZoneDiameter(): number {
    return divRef.current?.offsetWidth ?? 44
  }

  /**
   * Compute overshootT in [0, 1] given current drag distance.
   *
   *   dist < rubberBandStart  →  t = 0         (normal drag, no resistance)
   *   rubberBandStart ≤ dist < snapDist  →  t rises 0→1 with an ease-in curve
   *   dist ≥ snapDist         →  snap fires
   *
   * The ease-in curve (t²) means the first half of the rubber-band zone feels
   * almost normal, and resistance grows noticeably only near the snap point.
   */
  function computeOvershootT(dist: number): { t: number; shouldSnap: boolean } {
    const diameter = getZoneDiameter()
    const rubberBandStart = diameter * RUBBER_BAND_START_FRACTION
    const snapDist = rubberBandStart + diameter * SNAP_EXTRA_FRACTION

    if (dist >= snapDist) return { t: 1, shouldSnap: true }
    if (dist <= rubberBandStart) return { t: 0, shouldSnap: false }

    // Linear progress through the rubber-band zone [0, 1]
    const linear = (dist - rubberBandStart) / (snapDist - rubberBandStart)

    // Ease-in: slow start, accelerating resistance toward snap
    // Using t³ for a gentler entry and sharper end
    const eased = linear * linear * linear

    return { t: eased, shouldSnap: false }
  }

  // ─── Drag lifecycle ───────────────────────────────────────────────────────

  function beginDrag(x: number, y: number) {
    originRef.current = { x, y }
    lastMoveRef.current = { x, y, time: performance.now() }
    snapFiredRef.current = false
    onDragStart?.(zone)
  }

  function moveDrag(x: number, y: number) {
    if (!originRef.current || snapFiredRef.current) return

    const dx = x - originRef.current.x
    const dy = y - originRef.current.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    updateVelocitySound(x, y)

    const { t, shouldSnap } = computeOvershootT(dist)

    if (shouldSnap) {
      snapFiredRef.current = true
      stopSloppySound()
      onSnapBack?.(zone)
      cleanupMouseListeners()
      originRef.current = null
      lastMoveRef.current = null
      return
    }

    // Single onDrag call for both phases — t=0 is normal, t→1 is rubber-band.
    // The hook applies resistance based on t, with no discontinuity.
    onDrag(zone, dx, dy, t)
  }

  function endDrag() {
    if (!snapFiredRef.current) onRelease?.(zone)
    originRef.current = null
    lastMoveRef.current = null
    stopSloppySound()
    cleanupMouseListeners()
  }

  // ─── Mouse ────────────────────────────────────────────────────────────────

  function onMouseDown(e: React.MouseEvent) {
    e.preventDefault()
    beginDrag(e.clientX, e.clientY)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  function onMouseMove(e: MouseEvent) { moveDrag(e.clientX, e.clientY) }
  function onMouseUp() { endDrag() }

  function cleanupMouseListeners() {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }

  // ─── Touch ────────────────────────────────────────────────────────────────

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0]
    beginDrag(t.clientX, t.clientY)

    const touchMoveHandler = (event: TouchEvent) => {
      event.preventDefault()
      if (!originRef.current) return
      moveDrag(event.touches[0].clientX, event.touches[0].clientY)
    }

    const touchEndHandler = () => {
      if (!snapFiredRef.current) onRelease?.(zone)
      originRef.current = null
      lastMoveRef.current = null
      stopSloppySound()
      window.removeEventListener('touchmove', touchMoveHandler as EventListener)
      window.removeEventListener('touchend', touchEndHandler as EventListener)
    }

    window.addEventListener('touchmove', touchMoveHandler as EventListener, { passive: false } as AddEventListenerOptions)
    window.addEventListener('touchend', touchEndHandler as EventListener)
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      ref={divRef}
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      style={{
        position: 'absolute',
        width: '1%',
        height: '1%',
        minWidth: '44px',
        minHeight: '44px',
        borderRadius: '50%',
        cursor: 'grab',
        userSelect: 'none',
        touchAction: 'none',
        // border: '2px solid rgba(255, 255, 255, 0.8)', // debugging aid, shows zone boundaries
        ...style,
      }}
      aria-label={`Control ${zone.label}`}
      role="slider"
    />
  )
}
