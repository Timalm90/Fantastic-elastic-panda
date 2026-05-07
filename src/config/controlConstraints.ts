// src/config/controlConstraints.ts

import type { BlendshapeValues } from '../types/blendshape'

/**
 * Constraint defines a blendshape that is limited based on the state of other blendshapes.
 * Constraints can limit both minimum and maximum values.
 */
export interface Constraint {
  /** The key being constrained */
  target: keyof BlendshapeValues
  /** Returns the minimum allowed value given current blendshape state (optional) */
  min?: (current: BlendshapeValues) => number
  /** Returns the maximum allowed value given current blendshape state (optional) */
  max?: (current: BlendshapeValues) => number
}

/**
 * Define all blendshape constraints.
 * 
 * Constraints apply to Cheek_Down to prevent clipping when mouth is open.
 * When mouth opens, cheeks can't reach full range of motion.
 * Min stays at 0, but max is reduced based on mouth opening amount.
 */
export const CONSTRAINTS: Constraint[] = [
  {
    target: 'R_Cheek_Down',
    // Only clamp when Mouth_Up is active, not when Mouth_Down is active
    max: (bs) => bs['Mouth_Up'] > 0 ? (1 - bs['Mouth_Up'] * 0.5) : 1,
  },
  {
    target: 'L_Cheek_Down',
    // Only clamp when Mouth_Up is active, not when Mouth_Down is active
    max: (bs) => bs['Mouth_Up'] > 0 ? (1 - bs['Mouth_Up'] * 0.5) : 1,
  },
]