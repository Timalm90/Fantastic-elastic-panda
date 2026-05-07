/**
 * FaceControls.tsx
 * 
 * Renders all 8 drag zones for facial blendshape control.
 * Each zone is positioned on the panda's face and maps drag gestures
 * to blendshape morph targets using the useBlendshapeControl hook.
 */

import React, { useState } from 'react'
import { DragZone } from './DragZone'
import { useBlendshapeControl } from '../../hooks/useBlendshapeControl'
import { CONTROL_ZONES } from '../../config/controlZones'
import type { ControlZone, BlendshapeValues } from '../../types/blendshape'

interface FaceControlsProps {
  onBlendshapesChange?: (blendshapes: BlendshapeValues) => void
}

/**
 * Placeholder positions for control zones.
 * Tune these by eye to match the actual face regions on your model.
 * Values are percentage-based so they scale with viewport size.
 */
const ZONE_POSITIONS: Record<string, React.CSSProperties> = {
  r_ear:   { top: '10%', left: '65%' },
  l_ear:   { top: '10%', left: '30%' },
  r_brow:  { top: '28%', left: '60%' },
  l_brow:  { top: '28%', left: '35%' },
  r_cheek: { top: '50%', left: '63%' },
  l_cheek: { top: '50%', left: '30%' },
  nose:    { top: '48%', left: '48%' },
  mouth:   { top: '62%', left: '46%' },
}

export const FaceControls: React.FC<FaceControlsProps> = ({ onBlendshapesChange }) => {
  const [blendshapes, setBlendshapes] = useState<BlendshapeValues>({} as BlendshapeValues)
  
  // useBlendshapeControl converts drag deltas (dx, dy) into blendshape values
  const { applyDrag } = useBlendshapeControl(setBlendshapes)

  // Notify parent component whenever blendshapes change
  React.useEffect(() => {
    onBlendshapesChange?.(blendshapes)
  }, [blendshapes, onBlendshapesChange])

  return (
    <>
      {/* Render a DragZone for each control region on the face */}
      {CONTROL_ZONES.map((zone: ControlZone) => (
        <DragZone
          key={zone.id}
          zone={zone}
          onDrag={applyDrag}
          onRelease={() => {}}
          style={ZONE_POSITIONS[zone.id]}
        />
      ))}
    </>
  )
}
