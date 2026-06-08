import { useCallback, useRef } from 'react'
import type { ControlZone, BlendshapeKey, BlendshapeValues } from '../types/blendshape'
import { CONSTRAINTS } from '../config/controlConstraints'

const DEFAULT_DRAG_RANGE = 300
const DEFAULT_MIN = 0
const DEFAULT_MAX = 1

/**
 * Maximum extra stretch allowed at overshootT=1 (just before snap), as a
 * fraction of the blendshape's max value.
 * e.g. 0.12 = 12% overshoot at most, before the snap fires.
 * Keep this small — it's the "stretch" visible to the user, not the drag range.
 */
const MAX_OVERSHOOT_AMOUNT = 0.50

function getZoneKeys(zone: ControlZone): BlendshapeKey[] {
  return [
    zone.x?.positive,
    zone.x?.negative,
    zone.y?.positive,
    zone.y?.negative,
  ].filter((k): k is BlendshapeKey => !!k)
}

export function useBlendshapeControl(
  blendshapes: BlendshapeValues,
  setBlendshapes: React.Dispatch<React.SetStateAction<BlendshapeValues>>
) {
  const liveBlendshapesRef = useRef<BlendshapeValues>(blendshapes)
  liveBlendshapesRef.current = blendshapes

  const dragStartValuesRef = useRef<BlendshapeValues>({} as BlendshapeValues)

  const startDrag = useCallback((_zone: ControlZone) => {
    dragStartValuesRef.current = { ...liveBlendshapesRef.current }
  }, [])

  // ─── Core builder ─────────────────────────────────────────────────────────
  /**
   * overshootT in [0, 1]:
   *   0   → normal drag, hard-clamped at max
   *   0→1 → resistance gradually increases, values are allowed to exceed max
   *          by up to (MAX_OVERSHOOT_AMOUNT × t), creating a smooth stretch
   *   1   → snap is about to fire (handled by DragZone before we ever reach here)
   *
   * The stretch amount grows with t, and because DragZone eases t with a t³
   * curve, the first ~70% of the rubber-band zone is barely perceptible —
   * resistance only becomes obvious in the final 30% before snap.
   */
  function buildNext(
    zone: ControlZone,
    dx: number,
    dy: number,
    overshootT: number,
  ): BlendshapeValues {
    const baseDragRange = zone.sensitivity
      ? DEFAULT_DRAG_RANGE / zone.sensitivity
      : DEFAULT_DRAG_RANGE

    const dragRangeX = zone.dragDistanceX ?? baseDragRange
    const dragRangeY = zone.dragDistanceY ?? baseDragRange

    const min = zone.minValue ?? DEFAULT_MIN
    const max = zone.maxValue ?? DEFAULT_MAX

    // How far past max we allow right now, based on how deep into the
    // rubber-band zone the cursor is. At t=0 this is 0 (normal clamp).
    const allowedOvershoot = MAX_OVERSHOOT_AMOUNT * overshootT
    const effectiveMax = max + allowedOvershoot

    const next = { ...liveBlendshapesRef.current }
    const startValues = dragStartValuesRef.current

    function applyAxis(
      mapping: ControlZone['x'],
      delta: number,
      dragRange: number,
      invert: boolean = false,
    ) {
      if (!mapping) return

      const d = invert ? -delta : delta
      const amount = Math.abs(d) / dragRange

      const positiveKey = mapping.positive as BlendshapeKey | null | undefined
      const negativeKey = mapping.negative as BlendshapeKey | null | undefined

      if (d > 0) {
        if (positiveKey) {
          const start = startValues[positiveKey] ?? 0
          // Clamp to effectiveMax — at t=0 this equals max, at t>0 allows stretch
          next[positiveKey] = Math.min(effectiveMax, Math.max(min, start + amount))
        }
        if (negativeKey) {
          const start = startValues[negativeKey] ?? 0
          // Opposing side always hard-clamped (no stretch for values going to 0)
          next[negativeKey] = Math.min(max, Math.max(min, start - amount))
        }
      } else if (d < 0) {
        if (negativeKey) {
          const start = startValues[negativeKey] ?? 0
          next[negativeKey] = Math.min(effectiveMax, Math.max(min, start + amount))
        }
        if (positiveKey) {
          const start = startValues[positiveKey] ?? 0
          next[positiveKey] = Math.min(max, Math.max(min, start - amount))
        }
      }
    }

    applyAxis(zone.y, dy, dragRangeY, true)
    applyAxis(zone.x, dx, dragRangeX)

    // Only apply constraints in the normal range (t=0).
    // During overshoot the stretch is intentional — constraining it would
    // cause a visible pop when crossing the boundary.
    if (overshootT === 0) {
      for (const constraint of CONSTRAINTS) {
        const currentValue = next[constraint.target] ?? 0
        let clampedValue = currentValue

        if (constraint.min) {
          const minAllowed = constraint.min(next)
          if (clampedValue < minAllowed) clampedValue = minAllowed
        }
        if (constraint.max) {
          const maxAllowed = constraint.max(next)
          if (clampedValue > maxAllowed) clampedValue = maxAllowed
        }

        next[constraint.target] = clampedValue
      }
    }

    return next
  }

  // ─── applyDrag ────────────────────────────────────────────────────────────
  // Unified drag handler for both normal and rubber-band phases.
  // overshootT=0 → normal; overshootT>0 → progressive stretch.
  const applyDrag = useCallback((
    zone: ControlZone,
    dx: number,
    dy: number,
    overshootT: number = 0,
  ) => {
    setBlendshapes(() => buildNext(zone, dx, dy, overshootT))
  }, [setBlendshapes])

  // ─── snapBack ─────────────────────────────────────────────────────────────
  const snapBack = useCallback((zone: ControlZone) => {
    const keys = getZoneKeys(zone)

    setBlendshapes(prev => {
      const next = { ...prev }
      keys.forEach(k => { next[k] = 0 })
      return next
    })

    const freshSnapshot = { ...liveBlendshapesRef.current }
    keys.forEach(k => { freshSnapshot[k] = 0 })
    dragStartValuesRef.current = freshSnapshot
  }, [setBlendshapes])

  // ─── resetZone ────────────────────────────────────────────────────────────
  const resetZone = useCallback((zone: ControlZone) => {
    const keys = getZoneKeys(zone)
    setBlendshapes(prev => {
      const next = { ...prev }
      keys.forEach(k => { next[k] = 0 })
      return next
    })
  }, [setBlendshapes])

  return { startDrag, applyDrag, snapBack, resetZone }
}