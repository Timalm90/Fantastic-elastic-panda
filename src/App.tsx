import { useState, Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { Model } from './components/scene/PandaModel'
import { FaceControls } from './components/controls/FaceControls'
import { SceneDebugController } from './components/debug/SceneDebugController'
import type { BlendshapeValues } from './types/blendshape'

export default function App() {
  const [blendshapes, setBlendshapes] = useState<BlendshapeValues>({} as BlendshapeValues)
  const [envIntensity, setEnvIntensity] = useState(0.5)
  const [envBlur, setEnvBlur] = useState(0)
  const [envRotation, setEnvRotation] = useState(0)  // single Y-axis value
  const [cameraX, setCameraX] = useState(0)
  const [cameraY, setCameraY] = useState(0)
  const [cameraZ, setCameraZ] = useState(8)
  const [cameraFov, setCameraFov] = useState(20)
  const [rotationX, setRotationX] = useState(0)
  const ambientLightRef = useRef(null)
  const pointLight1Ref = useRef(null)
  const pointLight2Ref = useRef(null)

  return (
    <>
      <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
        <Canvas
          camera={{ position: [cameraX, cameraY, cameraZ], fov: cameraFov, rotation: [rotationX, 0, 0] }}
          style={{ width: '100%', height: '100%' }}
          gl={{ antialias: true }}
          dpr={[1, 2]}
        >
          <Suspense fallback={null}>
            <ambientLight ref={ambientLightRef} intensity={1} />
            <pointLight ref={pointLight1Ref} position={[10, 10, 5]} intensity={1} />
            <pointLight ref={pointLight2Ref} position={[-10, -10, -5]} intensity={1} />
            <SceneDebugController 
              ambientLightRef={ambientLightRef}
              pointLight1Ref={pointLight1Ref}
              pointLight2Ref={pointLight2Ref}
              cameraX={cameraX}
              cameraY={cameraY}
              cameraZ={cameraZ}
              cameraFov={cameraFov}
              setCameraX={setCameraX}
              setCameraY={setCameraY}
              setCameraZ={setCameraZ}
              setCameraFov={setCameraFov}
              rotationX={rotationX}
              setRotationX={setRotationX}
              envIntensity={envIntensity}
              envBlur={envBlur}
              setEnvIntensity={setEnvIntensity}
              setEnvBlur={setEnvBlur}
              envRotation={envRotation}       // 👈 added
              setEnvRotation={setEnvRotation} // 👈 added
            />
            <Model 
              blendshapes={blendshapes} 
              springConfig={{ stiffness: 100, damping: 14, mass: 1 }}
            />
            <Environment 
              preset="studio" 
              blur={envBlur} 
              background 
              resolution={64}  
              environmentIntensity={envIntensity}
              environmentRotation={[0, envRotation, 0]}  // 👈 fixed
              backgroundRotation={[0, envRotation, 0]}   // 👈 fixed
            />
          </Suspense>
        </Canvas>

        <FaceControls onBlendshapesChange={setBlendshapes} />
      </div>
    </>
  )
}