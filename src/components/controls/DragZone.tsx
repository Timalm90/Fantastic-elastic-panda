import { useRef } from 'react'
import type { ControlZone } from '../../types/blendshape'

interface DragZoneProps {
  zone: ControlZone
  onDrag: (zone: ControlZone, dx: number, dy: number) => void
  onRelease: (zone: ControlZone) => void
  /** Position as percentage of container, e.g. { top: '20%', left: '60%' } */
  style?: React.CSSProperties
}

export function DragZone({ zone, onDrag, onRelease, style }: DragZoneProps) {
  const originRef = useRef<{ x: number; y: number } | null>(null)

  // ── Mouse ──────────────────────────────────────────────

  function onMouseDown(e: React.MouseEvent) {
    originRef.current = { x: e.clientX, y: e.clientY }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  function onMouseMove(e: MouseEvent) {
    if (!originRef.current) return
    onDrag(zone, e.clientX - originRef.current.x, e.clientY - originRef.current.y)
  }

  function onMouseUp() {
    originRef.current = null
    onRelease(zone)
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }

  // ── Touch ──────────────────────────────────────────────

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0]
    originRef.current = { x: t.clientX, y: t.clientY }
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!originRef.current) return
    const t = e.touches[0]
    onDrag(zone, t.clientX - originRef.current.x, t.clientY - originRef.current.y)
  }

  function onTouchEnd() {
    originRef.current = null
    onRelease(zone)
  }

  return (
    <div
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        position: 'absolute',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        cursor: 'grab',
        touchAction: 'none',   // prevents scroll interfering with drag
        // Invisible by default — no background, no border
        // Uncomment below to see zones during development:
         background: 'rgba(255,0,0,0.2)',
         border: '1px solid red',
        ...style,
      }}
      aria-label={`Control ${zone.label}`}
      role="slider"
    />
  )
}