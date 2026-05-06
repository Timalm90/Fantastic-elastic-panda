import { useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import { Model } from './components/scene/PandaModel'
import { MorphDebugPanel } from './components/debug/MorphDebugPanel'

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

const defaultBlendshapes: Record<string, number> = Object.fromEntries(
  MORPH_KEYS.map((key) => [key, 0])
)

export default function App() {
  const [blendshapes, setBlendshapes] =
    useState<Record<string, number>>(defaultBlendshapes)

  function handleChange(key: string, value: number) {
    setBlendshapes((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        style={{ width: '100%', height: '100vh' }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <pointLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={1} />
          <ambientLight intensity={0.4} />

          <Model
            blendshapes={blendshapes}
            scale={1}
            position={[0, 0, 0]}
            castShadow
            receiveShadow
          />

          <Environment
            preset="studio"
            blur={0.5}
            background
            resolution={64}
          />

          <OrbitControls />
        </Suspense>
      </Canvas>

      <MorphDebugPanel
        blendshapes={blendshapes}
        onChange={handleChange}
      />
    </>
  )
}