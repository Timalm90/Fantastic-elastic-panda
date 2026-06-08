import { useCallback, useRef } from 'react'
import type { ControlZone, BlendshapeKey, BlendshapeValues } from '../types/blendshape'
import { CONSTRAINTS } from '../config/controlConstraints'

const DEFAULT_DRAG_RANGE = 300
const DEFAULT_MIN = 0
const DEFAULT_MAX = 1
const MAX_OVERSHOOT_AMOUNT = 0.12

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

  const applyDrag = useCallback((
    zone: ControlZone,
    dx: number,
    dy: number,
    overshootT: number = 0,
  ) => {
    setBlendshapes(prev => {
      const baseDragRange = zone.sensitivity
        ? DEFAULT_DRAG_RANGE / zone.sensitivity
        : DEFAULT_DRAG_RANGE

      const dragRangeX = zone.dragDistanceX ?? baseDragRange
      const dragRangeY = zone.dragDistanceY ?? baseDragRange

      const min = zone.minValue ?? DEFAULT_MIN
      const max = zone.maxValue ?? DEFAULT_MAX
      const effectiveMax = max + MAX_OVERSHOOT_AMOUNT * overshootT

      const next = { ...prev }
      const snap = dragStartValuesRef.current

      // Track which keys this zone wrote, so we can exclude them from
      // constraint-fighting. Constraints for keys within the same axis
      // are already satisfied by the drag math — enforcing them on top
      // causes the jump when crossing zero between up/down or left/right.
      const writtenKeys = new Set<BlendshapeKey>()

      function applyAxis(
        mapping: ControlZone['x'],
        delta: number,
        dragRange: number,
        invert: boolean = false,
      ) {
        if (!mapping) return

        const d = invert ? -delta : delta
        const amount = Math.abs(d) / dragRange

        const pos = mapping.positive as BlendshapeKey | null | undefined
        const neg = mapping.negative as BlendshapeKey | null | undefined

        if (pos) writtenKeys.add(pos)
        if (neg) writtenKeys.add(neg)

        if (d > 0) {
          // Moving in positive direction:
          // positive key increases from snapshot, negative key decreases toward 0
          if (pos) next[pos] = Math.min(effectiveMax, Math.max(min, (snap[pos] ?? 0) + amount))
          if (neg) next[neg] = Math.min(max,          Math.max(min, (snap[neg] ?? 0) - amount))
        } else if (d < 0) {
          // Moving in negative direction:
          // negative key increases from snapshot, positive key decreases toward 0
          if (neg) next[neg] = Math.min(effectiveMax, Math.max(min, (snap[neg] ?? 0) + amount))
          if (pos) next[pos] = Math.min(max,          Math.max(min, (snap[pos] ?? 0) - amount))
        } else {
          // First frame of re-grab before cursor moves — write snapshot values
          // exactly so there is zero discontinuity
          if (pos) next[pos] = Math.min(effectiveMax, Math.max(min, snap[pos] ?? 0))
          if (neg) next[neg] = Math.min(max,          Math.max(min, snap[neg] ?? 0))
        }
      }

      applyAxis(zone.y, dy, dragRangeY, true)
      applyAxis(zone.x, dx, dragRangeX)

      // Apply constraints — but SKIP any constraint whose target was directly
      // written by applyAxis above. Those keys are already mutually exclusive
      // by construction (the drag math ensures pos and neg can't both be
      // nonzero from the same gesture). Applying the mutual-exclusion
      // constraint on top clamps the wrong key to 0 during the transition
      // from e.g. Cheek_Up → Cheek_Down, which causes the visible jump.
      //
      // Cross-zone constraints (e.g. cheek limited by mouth state) still
      // apply because they target keys that belong to a different zone.
      if (overshootT === 0) {
        for (const constraint of CONSTRAINTS) {
          if (writtenKeys.has(constraint.target)) continue

          let v = next[constraint.target] ?? 0
          if (constraint.min) v = Math.max(v, constraint.min(next))
          if (constraint.max) v = Math.min(v, constraint.max(next))
          next[constraint.target] = v
        }
      }

      return next
    })
  }, [setBlendshapes])

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