import { useRef, useCallback } from 'react'
import { stepSpring } from './useSpring'
import type { SpringState } from './useSpring'

export interface UseBlinkAnimationOptions {
  minInterval?: number  // milliseconds, default 10000 (10 seconds)
  maxInterval?: number  // milliseconds, default 15000 (15 seconds)
  peakValue?: number  // max animation value, default 1.5 (150%)
  springConfig?: {
    stiffness: number
    damping: number
    mass: number
  }
}

/**
 * Hook that manages an automatic blink animation.
 * Returns the current blink value (0-1) to be added to blendshapes.
 * Each instance animates independently.
 */
export function useBlinkAnimation(options: UseBlinkAnimationOptions = {}) {
  const {
    minInterval = 4000,
    maxInterval = 7000,
    peakValue = 1,
    springConfig = { stiffness: 500, damping: 10, mass: 1 },
  } = options

  const blinkValueRef = useRef<SpringState>({ value: 0, velocity: 0 })
  const targetBlinkRef = useRef<number>(0)
  const nextBlinkTimeRef = useRef<number>(Date.now() + Math.random() * (maxInterval - minInterval) + minInterval)
  const isBlinkingRef = useRef<boolean>(false)

  const scheduleNextBlink = useCallback(() => {
    const delay = Math.random() * (maxInterval - minInterval) + minInterval
    nextBlinkTimeRef.current = Date.now() + delay
  }, [minInterval, maxInterval])

  const triggerBlink = useCallback(() => {
    isBlinkingRef.current = true
    targetBlinkRef.current = peakValue
  }, [peakValue])

  // Update blink animation on each frame
  const updateBlink = useCallback((deltaTime: number) => {
    const now = Date.now()

    // Check if it's time to blink
    if (now >= nextBlinkTimeRef.current && !isBlinkingRef.current) {
      triggerBlink()
    }

    // If blinking, animate toward target (1), then back to 0
    if (isBlinkingRef.current) {
      // Step toward target (1)
      blinkValueRef.current = stepSpring(blinkValueRef.current, targetBlinkRef.current, deltaTime / 1000, springConfig)

      // If we've peaked and are coming back down, check if we're done
      if (targetBlinkRef.current === peakValue && blinkValueRef.current.value >= peakValue * 0.95) {
        // Peak reached, now go back to 0
        targetBlinkRef.current = 0
      }

      // If we're back to 0, stop blinking
      if (targetBlinkRef.current === 0 && blinkValueRef.current.value < 0.05) {
        isBlinkingRef.current = false
        blinkValueRef.current = { value: 0, velocity: 0 }
        scheduleNextBlink()
      }
    }

    return blinkValueRef.current.value
  }, [triggerBlink, scheduleNextBlink, springConfig])

  return {
    updateBlink,
    getBlinkValue: () => blinkValueRef.current.value,
  }
}
