import { useCallback } from 'react'
import type { ControlZone, BlendshapeKey, BlendshapeValues } from '../types/blendshape'
import { CONSTRAINTS } from '../config/controlConstraints'

/**
 * Maximum pixel drag distance that maps to a morph value of 1.0.
 * Drag this many pixels → full influence. Tweak to feel right.
 */
const DEFAULT_DRAG_RANGE = 300
const DEFAULT_MIN = 0
const DEFAULT_MAX = 1

/**
 * Given a control zone and a drag delta in pixels,
 * returns the morph target updates to apply.
 */
export function useBlendshapeControl(
  setBlendshapes: React.Dispatch<React.SetStateAction<BlendshapeValues>>
) {
  const applyDrag = useCallback((zone: ControlZone, dx: number, dy: number) => {

        // Use per-zone overrides, falling back to defaults
    const dragRange = zone.sensitivity
      ? DEFAULT_DRAG_RANGE / zone.sensitivity  // higher sensitivity = fewer pixels needed
      : DEFAULT_DRAG_RANGE

    const min = zone.minValue ?? DEFAULT_MIN
    const max = zone.maxValue ?? DEFAULT_MAX


    setBlendshapes(prev => {
      const next = { ...prev }

      // Helper: apply one axis
      function applyAxis(
        mapping: ControlZone['x'],
        delta: number,
        invert: boolean = false
      ) {
        if (!mapping) return
        const d = invert ? -delta : delta
        // Clamp value between min and max instead of always 0-1
        const raw = Math.abs(d) / dragRange
        const value = Math.min(max, Math.max(min, raw))

        if (d > 0) {
          if (mapping.positive) next[mapping.positive] = value
          if (mapping.negative) next[mapping.negative] = 0
        } else if (d < 0) {
          if (mapping.negative) next[mapping.negative] = value
          if (mapping.positive) next[mapping.positive] = 0
        } else {
          if (mapping.positive) next[mapping.positive] = 0
          if (mapping.negative) next[mapping.negative] = 0
        }
      }

      // Y axis: invert because screen Y is flipped (drag up = negative dy)
      applyAxis(zone.y, dy, true)
      applyAxis(zone.x, dx)

      // Apply constraints
      for (const constraint of CONSTRAINTS) {
        const currentValue = next[constraint.target] ?? 0
        let clampedValue = currentValue

        if (constraint.min) {
          const minAllowed = constraint.min(next)
          if (clampedValue < minAllowed) {
            clampedValue = minAllowed
          }
        }

        if (constraint.max) {
          const maxAllowed = constraint.max(next)
          if (clampedValue > maxAllowed) {
            clampedValue = maxAllowed
          }
        }

        next[constraint.target] = clampedValue
      }

      return next
    })
  }, [setBlendshapes])

  /**
   * Reset all keys belonging to a zone back to 0.
   * Called when the user releases the drag.
   */
  const resetZone = useCallback((zone: ControlZone) => {
    setBlendshapes(prev => {
      const next = { ...prev }
      const keys = [
        zone.x?.positive, zone.x?.negative,
        zone.y?.positive, zone.y?.negative,
      ].filter(Boolean) as BlendshapeKey[]

      keys.forEach(k => { next[k] = 0 })
      return next
    })
  }, [setBlendshapes])

  return { applyDrag, resetZone }
}