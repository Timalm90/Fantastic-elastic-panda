import type { ControlZone } from '../types/blendshape'

export const CONTROL_ZONES: ControlZone[] = [
  {
    id: 'r_ear',
    label: 'Right Ear',
    x: { positive: 'R_Ear_Right', negative: 'R_Ear_Left' }, 
    y: { positive: 'R_Ear_Up',    negative: 'R_Ear_Down'   },

        maxValue: 0.5,

  displayOffsetYPositive: 0.2,  // moves up more when Mouth_Up is active
  displayOffsetYNegative: 0.05,  // moves down less when Mouth_Down is active
  displayOffsetXNegative: 0.15,  // moves left less when Mouth_Left is active
  displayOffsetXPositive: 0.3,  // moves left less when Mouth_Left is active

  },
  {
    id: 'l_ear',
    label: 'Left Ear',
    x: { positive: 'L_Ear_Right', negative: 'L_Ear_Left' },
    y: { positive: 'L_Ear_Up',    negative: 'L_Ear_Down'  },

        maxValue: 0.5,

    
  displayOffsetYPositive: 0.2,  
  displayOffsetYNegative: 0.05,  
  displayOffsetXNegative: 0.3,  
  displayOffsetXPositive: 0.15,  
  },
  {
    id: 'r_brow',
    label: 'Right Brow',
    x: { positive: 'R_Brow_Right', negative: 'R_Brow_Left' },
    y: { positive: 'R_Brow_Up', negative: 'R_Brow_Down' },
  displayOffsetYPositive: 0.08,  
  displayOffsetYNegative: 0.04,  
  },
  {
    id: 'l_brow',
    label: 'Left Brow',
    x: { positive: 'L_Brow_Right', negative: 'L_Brow_Left' },
    y: { positive: 'L_Brow_Up', negative: 'L_Brow_Down' },
  displayOffsetYPositive: 0.08,  
  displayOffsetYNegative: 0.04,  
  },
  {
    id: 'r_cheek',
    label: 'Right Cheek',
    x: { positive: 'R_Cheek_Right', negative: null },
    y: { positive: 'R_Cheek_Up',    negative: 'R_Cheek_Down'  },
    maxValue: 0.75,

  displayOffsetYPositive: 0.05,  
  displayOffsetYNegative: 0.15,  
  displayOffsetXPositive: 0.25,  
  },
  {
    id: 'l_cheek',
    label: 'Left Cheek',
    x: { positive: null, negative: 'L_Cheek_Left'},
    y: { positive: 'L_Cheek_Up',   negative: 'L_Cheek_Down' },
    maxValue: 0.75,

  displayOffsetYPositive: 0.05,  
  displayOffsetYNegative: 0.15,  
  displayOffsetXNegative: 0.25,  

  },
  {
    id: 'nose',
    label: 'Nose',
    x: { positive: 'Nose_Right', negative: 'Nose_Left' },
    y: { positive: 'Nose_Up',    negative: 'Nose_Down' },
  displayOffsetYPositive: 0.04,  
  displayOffsetYNegative: 0.04,  
  },
  {
    id: 'mouth',
    label: 'Mouth',
    x: { positive: 'Mouth_Right', negative: 'Mouth_Left'   },
    y: { positive: 'Mouth_Up',    negative: 'Mouth_Down'    },
  displayOffsetYPositive: 0.08,  
  displayOffsetYNegative: 0.15,  
  displayOffsetXNegative: 0.15,
  displayOffsetXPositive: 0.15,
  },
]