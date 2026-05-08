import { useCallback } from 'react'
import type { ControlZone, BlendshapeKey, BlendshapeValues } from '../types/blendshape'
import { CONSTRAINTS } from '../config/controlConstraints'

const DEFAULT_DRAG_RANGE = 300
const DEFAULT_MIN = 0
const DEFAULT_MAX = 1

export function useBlendshapeControl(
  setBlendshapes: React.Dispatch<React.SetStateAction<BlendshapeValues>>
) {
  const applyDrag = useCallback((zone: ControlZone, dx: number, dy: number) => {
    const baseDragRange = zone.sensitivity
      ? DEFAULT_DRAG_RANGE / zone.sensitivity
      : DEFAULT_DRAG_RANGE

    const dragRangeX = zone.dragDistanceX ?? baseDragRange
    const dragRangeY = zone.dragDistanceY ?? baseDragRange

    const min = zone.minValue ?? DEFAULT_MIN
    const max = zone.maxValue ?? DEFAULT_MAX

    setBlendshapes(prev => {
      const next = { ...prev }

      function applyAxis(
        mapping: ControlZone['x'],
        delta: number,
        dragRange: number,
        invert: boolean = false
      ) {
        if (!mapping) return

        const d = invert ? -delta : delta
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

      applyAxis(zone.y, dy, dragRangeY, true)
      applyAxis(zone.x, dx, dragRangeX)

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

  const resetZone = useCallback((zone: ControlZone) => {
    setBlendshapes(prev => {
      const next = { ...prev }

      const keys = [
        zone.x?.positive,
        zone.x?.negative,
        zone.y?.positive,
        zone.y?.negative,
      ].filter(Boolean) as BlendshapeKey[]

      keys.forEach(k => {
        next[k] = 0
      })

      return next
    })
  }, [setBlendshapes])

  return { applyDrag, resetZone }
}