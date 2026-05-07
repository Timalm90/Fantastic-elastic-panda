import type { ControlZone } from '../types/blendshape'

export const CONTROL_ZONES: ControlZone[] = [
  {
    id: 'r_ear',
    label: 'Right Ear',
    x: { positive: 'R_Ear_Right', negative: 'R_Ear_Right' }, // adjust once tested
    y: { positive: 'R_Ear_Up',    negative: 'R_Ear_Down'   },
  },
  {
    id: 'l_ear',
    label: 'Left Ear',
    x: { positive: 'L_Ear_Right', negative: 'L_Ear_Left' },
    y: { positive: 'L_Ear_Up',    negative: 'L_Ear_Down'  },
  },
  {
    id: 'r_brow',
    label: 'Right Brow',
    x: { positive: 'R_Brow_Right', negative: 'R_Brow_Left' }, // adjust once tested
    y: { positive: 'R_Brow_Up', negative: 'R_Brow_Down' },
  },
  {
    id: 'l_brow',
    label: 'Left Brow',
    x: { positive: 'L_Brow_Right', negative: 'L_Brow_Left' },
    y: { positive: 'L_Brow_Up', negative: 'L_Brow_Down' },
  },
  {
    id: 'r_cheek',
    label: 'Right Cheek',
    x: { positive: 'R_Cheek_Right', negative: null },
    y: { positive: 'R_Cheek_Up',    negative: 'R_Cheek_Down'  },
  },
  {
    id: 'l_cheek',
    label: 'Left Cheek',
    x: { positive: null, negative: 'L_Cheek_Left' },
    y: { positive: 'L_Cheek_Up',   negative: 'L_Cheek_Down' },
  },
  {
    id: 'nose',
    label: 'Nose',
    x: { positive: 'Nose_Right', negative: 'Nose_Left' },
    y: { positive: 'Nose_Up',    negative: 'Nose_Down' },
  },
  {
    id: 'mouth',
    label: 'Mouth',
    x: { positive: 'Mouth_Right', negative: 'Mouth_Left'   },
    y: { positive: 'Mouth_Up',    negative: 'Mouth_Down'    },
  },
]