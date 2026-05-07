import { useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import { Model } from './components/scene/PandaModel'
import { DragZone } from './components/controls/DragZone'
import { MorphDebugPanel } from './components/debug/MorphDebugPanel'
import { useBlendshapeControl } from './hooks/useBlendshapeControl'
import { CONTROL_ZONES } from './config/controlZones'
import type { BlendshapeValues } from './types/blendshape'
import type { ControlZone } from './types/blendshape'

/**
 * Extract all unique blendshape names from control zones
 * and initialize them all to 0 (neutral state)
 */
const getAllBlendshapeKeys = (): string[] => {
  const keys = new Set<string>()
  CONTROL_ZONES.forEach(zone => {
    if (zone.x?.positive) keys.add(zone.x.positive)
    if (zone.x?.negative) keys.add(zone.x.negative)
    if (zone.y?.positive) keys.add(zone.y.positive)
    if (zone.y?.negative) keys.add(zone.y.negative)
  })
  return Array.from(keys)
}

const defaultBlendshapes = Object.fromEntries(
  getAllBlendshapeKeys().map(key => [key, 0])
) as BlendshapeValues

export default function App() {
  const [blendshapes, setBlendshapes] = useState<BlendshapeValues>(defaultBlendshapes)
  const { applyDrag, resetZone } = useBlendshapeControl(setBlendshapes)

  return (
    <>
      <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
        <Canvas
          camera={{ position: [0, 0, 8], fov: 50 }}
          style={{ width: '100%', height: '100%' }}
          gl={{ antialias: true }}
          dpr={[1, 2]}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 5]} intensity={1} />
            <pointLight position={[-10, -10, -5]} intensity={1} />
            <Model blendshapes={blendshapes} />
            <Environment preset="sunset" blur={0.2} background resolution={64} />
            <OrbitControls />
          </Suspense>
        </Canvas>

        {/*
          DragZones sit as absolute-positioned divs over the canvas.
          Positions are placeholders — you'll tune these to match
          the actual face regions once the model is visible.
        */}
        {CONTROL_ZONES.map((zone: ControlZone) => (
          <DragZone
            key={zone.id}
            zone={zone}
            onDrag={applyDrag}
            onRelease={resetZone}
            style={ZONE_POSITIONS[zone.id]}
          />
        ))}
      </div>

      <MorphDebugPanel blendshapes={blendshapes} onChange={(key, value) =>
        setBlendshapes(prev => ({ ...prev, [key]: value } as BlendshapeValues))
      } />
    </>
  )
}

/**
 * Placeholder positions — tune these by eye once model is visible.
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