/**
 * All valid morph target key names, matching panda.glb exactly.
 */
export type BlendshapeKey =
  | 'Blink'
  | 'L_Brow_Down' | 'L_Brow_Left' | 'L_Brow_Right' | 'L_Brow_Up'
  | 'L_Cheek_Down' | 'L_Cheek_Left' | 'L_Cheek_Up'
  | 'L_Ear_Down' | 'L_Ear_Left' | 'L_Ear_Right' | 'L_Ear_Up'
  | 'L_Eye_Blink'
  | 'MouthClosed' | 'Mouth_Down' | 'Mouth_Left' | 'Mouth_Right' | 'Mouth_Up'
  | 'Nose_Down' | 'Nose_Left' | 'Nose_Right' | 'Nose_Up'
  | 'R_Brow_Down' | 'R_Brow_Left' | 'R_Brow_Right' | 'R_Brow_Up'
  | 'R_Cheek_Down' | 'R_Cheek_Right' | 'R_Cheek_Up'
  | 'R_Ear_Down' | 'R_Ear_Left' | 'R_Ear_Right' | 'R_Ear_Up'
  | 'R_Eye_Blink'

export type BlendshapeValues = Record<BlendshapeKey, number>

/**
 * Maps a drag axis to a pair of morph target keys.
 * Positive drag (up/right) drives the first key.
 * Negative drag (down/left) drives the second key.
 */
export interface AxisMapping {
  positive: BlendshapeKey | null   // e.g. drag up → R_Ear_Up
  negative: BlendshapeKey | null   // e.g. drag down → R_Ear_Down
}

/**
 * A single control zone on the face.
 * Each zone maps X and Y drag to morph target pairs.
 */
export interface ControlZone {
  id: string
  label: string
  x?: AxisMapping      // horizontal drag — optional (Nose has no X axis for example)
  y?: AxisMapping      // vertical drag — optional
  sensitivity?: number // Multiplier for drag sensitivity (default: 1.0, higher = more sensitive)
  minValue?: number    // Minimum blendshape value (default: 0)
  maxValue?: number    // Maximum blendshape value (default: 1)
}