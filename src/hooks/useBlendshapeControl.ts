import { useCallback } from 'react'
import type { ControlZone, BlendshapeKey, BlendshapeValues } from '../types/blendshape'

/**
 * Maximum pixel drag distance that maps to a morph value of 1.0.
 * Drag this many pixels → full influence. Tweak to feel right.
 */
const DRAG_RANGE = 80

/**
 * Given a control zone and a drag delta in pixels,
 * returns the morph target updates to apply.
 */
export function useBlendshapeControl(
  setBlendshapes: React.Dispatch<React.SetStateAction<BlendshapeValues>>
) {
  const applyDrag = useCallback((zone: ControlZone, dx: number, dy: number) => {
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
        const value = Math.min(1, Math.abs(d) / DRAG_RANGE)

        if (d > 0) {
          next[mapping.positive] = value
          next[mapping.negative] = 0
        } else if (d < 0) {
          next[mapping.negative] = value
          next[mapping.positive] = 0
        } else {
          next[mapping.positive] = 0
          next[mapping.negative] = 0
        }
      }

      // Y axis: invert because screen Y is flipped (drag up = negative dy)
      applyAxis(zone.y, dy, true)
      applyAxis(zone.x, dx)

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
      const keys: BlendshapeKey[] = [
        zone.x?.positive, zone.x?.negative,
        zone.y?.positive, zone.y?.negative,
      ].filter(Boolean) as BlendshapeKey[]

      keys.forEach(k => { next[k] = 0 })
      return next
    })
  }, [setBlendshapes])

  return { applyDrag, resetZone }
}