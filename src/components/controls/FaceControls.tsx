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
  r_ear:   { top: '30%', left: '65%' },
  l_ear:   { top: '30%', left: '30%' },
  r_brow:  { top: '38%', left: '55%' },
  l_brow:  { top: '37%', left: '42%' },
  r_cheek: { top: '55%', left: '60%' },
  l_cheek: { top: '55%', left: '36%' },
  nose:    { top: '53%', left: '48%' },
  mouth:   { top: '67%', left: '48%' },
}

export const FaceControls: React.FC<FaceControlsProps> = ({ onBlendshapesChange }) => {
  const [blendshapes, setBlendshapes] = useState<BlendshapeValues>({} as BlendshapeValues)
  
  // useBlendshapeControl converts drag deltas (dx, dy) into blendshape values
  const { applyDrag } = useBlendshapeControl(setBlendshapes)

  // Notify parent component whenever blendshapes change
  React.useEffect(() => {
    onBlendshapesChange?.(blendshapes)
  }, [blendshapes, onBlendshapesChange])

  // Calculate dynamic position for a control zone based on current blendshape values
  const getZoneStyle = (zone: ControlZone): React.CSSProperties => {
    const baseStyle = ZONE_POSITIONS[zone.id] || {}
    const maxOffsetX = zone.displayOffsetX ?? 60
    const maxOffsetY = zone.displayOffsetY ?? 60
    const maxOffsetYPositive = zone.displayOffsetYPositive ?? maxOffsetY
    const maxOffsetYNegative = zone.displayOffsetYNegative ?? maxOffsetY

    let offsetX = 0
    let offsetY = 0

    // Calculate X offset from blendshape values
if (zone.x?.positive) {
      const positiveValue = blendshapes[zone.x.positive] ?? 0
      const negativeValue = zone.x.negative ? blendshapes[zone.x.negative] ?? 0 : 0
      offsetX = (positiveValue - negativeValue) * maxOffsetX
    }

    // Calculate Y offset from blendshape values (inverted because screen Y is flipped)
   if (zone.y?.positive) {
  const positiveValue = blendshapes[zone.y.positive] ?? 0
  const negativeValue = zone.y.negative ? blendshapes[zone.y.negative] ?? 0 : 0
  const netY = positiveValue - negativeValue
  offsetY = -(netY > 0 ? netY * maxOffsetYPositive : netY * maxOffsetYNegative)
}

    return {
      ...baseStyle,
      transform: `translate(${offsetX}px, ${offsetY}px)`,
      transition: 'transform 0.2s ease-out',
    }
  }

  return (
    <>
      {/* Render a DragZone for each control region on the face */}
      {CONTROL_ZONES.map((zone: ControlZone) => (
        <DragZone
          key={zone.id}
          zone={zone}
          onDrag={applyDrag}
          onRelease={() => {}}
          style={getZoneStyle(zone)}
        />
      ))}
    </>
  )
}
