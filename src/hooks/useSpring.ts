import { useRef } from 'react'

export interface SpringConfig {
  stiffness?: number  // how fast it pulls back — higher = snappier (default: 200)
  damping?: number    // how much it resists — lower = more bounce (default: 18)
  mass?: number       // weight — higher = slower, more floaty (default: 1)
}

export interface SpringState {
  value: number
  velocity: number
}

/**
 * Advances a single spring value one step forward using semi-implicit Euler integration.
 * Call this inside useFrame for each morph target you want to animate.
 */
export function stepSpring(
  state: SpringState,
  target: number,
  delta: number,
  config: SpringConfig = {}
): SpringState {
  const { stiffness = 200, damping = 18, mass = 1 } = config

  const force = -stiffness * (state.value - target)
  const damped = -damping * state.velocity
  const acceleration = (force + damped) / mass

  const velocity = state.velocity + acceleration * delta
  const value = state.value + velocity * delta

  // Snap to rest if close enough — prevents infinite tiny oscillations
  if (Math.abs(value - target) < 0.001 && Math.abs(velocity) < 0.001) {
    return { value: target, velocity: 0 }
  }

  return { value, velocity }
}

/**
 * Returns a ref containing spring states for every blendshape key.
 * Initialised to { value: 0, velocity: 0 } for each key.
 */
export function useSpringStates(keys: readonly string[]) {
  return useRef<Record<string, SpringState>>(
    Object.fromEntries(keys.map(k => [k, { value: 0, velocity: 0 }]))
  )
}