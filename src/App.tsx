/**
 * App.tsx
 * 
 * Main application component that sets up the game scene.
 * Combines the 3D scene with the panda model and face controls.
 */

import { useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import { Model } from './components/scene/PandaModel'
import { FaceControls } from './components/controls/FaceControls'
import type { BlendshapeValues } from './types/blendshape'

export default function App() {
  const [blendshapes, setBlendshapes] = useState<BlendshapeValues>({} as BlendshapeValues)

  return (
    <>
      <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
        {/* 3D Canvas with lighting and environment */}
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
            <Model 
              blendshapes={blendshapes} 
              springConfig={{ stiffness: 100, damping: 14, mass: 1 }}
            />
            <Environment preset="studio" blur={0.5} background resolution={64} />
            <OrbitControls />
          </Suspense>
        </Canvas>

        {/* All facial control drag zones */}
        <FaceControls onBlendshapesChange={setBlendshapes} />
      </div>
    </>
  )
}