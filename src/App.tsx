/**
 * App.tsx
 * 
 * Main application component. Sets up the 3D scene with lighting, camera,
 * and environment, and manages morph target (blend shape) state for the panda model.
 */

import { useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import { Model } from './components/scene/PandaModel'
import { MorphDebugPanel } from './components/debug/MorphDebugPanel'

/**
 * All available morph targets (blend shapes) for the panda model.
 * These names must match the morph target names in the panda.glb file.
 */
const MORPH_KEYS = [
  'Blink',
  'L_Brow_Down',
  'L_Brow_Up',
  'L_Cheek_Down',
  'L_Cheek_Left',
  'L_Cheek_Up',
  'L_Ear_Down',
  'L_Ear_Left',
  'L_Ear_Right',
  'L_Ear_Up',
  'L_Eye_Blink',
  'MouthClosed',
  'MouthOpen',
  'Mouth_Left',
  'Mouth_Right',
  'Mouth_Up',
  'Nose_Down',
  'Nose_Left',
  'Nose_Right',
  'Nose_Up',
  'R_Brow_Down',
  'R_Brow_Up',
  'R_Cheek_Down',
  'R_Cheek_Right',
  'R_Cheek_Up',
  'R_Ear_Down',
  'R_Ear_Right',
  'R_Ear_Up',
  'R_Eye_Blink',
]

/**
 * Initialize all morph targets to 0 (neutral/off state)
 */
const defaultBlendshapes: Record<string, number> = Object.fromEntries(
  MORPH_KEYS.map((key) => [key, 0])
)

export default function App() {
  // State to track current morph target influence values
  const [blendshapes, setBlendshapes] =
    useState<Record<string, number>>(defaultBlendshapes)

  /**
   * Handle morph target slider changes from the debug panel
   * Updates the specific morph target value while keeping others unchanged
   */
  function handleChange(key: string, value: number) {
    setBlendshapes((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <>
      {/* 3D Canvas container with React Three Fiber */}
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        style={{ width: '100%', height: '100vh' }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}  // Device pixel ratio for sharp rendering on high-DPI screens
      >
        <Suspense fallback={null}>
          {/* Lighting setup */}
          <pointLight position={[10, 10, 5]} intensity={1} />  {/* Key light */}
          <pointLight position={[-10, -10, -5]} intensity={1} />  {/* Fill light */}
          <ambientLight intensity={0.4} />  {/* Ambient light for base illumination */}

          {/* 3D Panda model with current morph target values */}
          <Model
            blendshapes={blendshapes}
          />

          {/* Studio environment preset with soft lighting reflections */}
          <Environment
            preset="studio"
            blur={0.5}
            background
            resolution={64}
          />

          {/* Orbit controls for manual camera rotation and zoom */}
          <OrbitControls />
        </Suspense>
      </Canvas>

      {/* Debug panel with morph target sliders */}
      <MorphDebugPanel
        blendshapes={blendshapes}
        onChange={handleChange}
      />
    </>
  )
}