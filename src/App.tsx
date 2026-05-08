import { useState, Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { Model } from './components/scene/PandaModel'
import { FaceControls } from './components/controls/FaceControls'
import { SceneDebugController } from './components/debug/SceneDebugController'
import { ApiTest } from "./dev/ApiTest";
import Timer from "./components/ui/Timer";

import type { BlendshapeValues } from './types/blendshape'
import type { AmbientLight, PointLight } from "three";

import "./App.css";
export default function App() {
  const [blendshapes, setBlendshapes] = useState<BlendshapeValues>({} as BlendshapeValues)
  const [envIntensity, setEnvIntensity] = useState(0.3)
  const [envBlur, setEnvBlur] = useState(0)
  const [envRotation, setEnvRotation] = useState(-3.1)  // single Y-axis value
  const [cameraX, setCameraX] = useState(0)
  const [cameraY, setCameraY] = useState(-2.2)
  const [cameraZ, setCameraZ] = useState(4.3)
  const [cameraFov, setCameraFov] = useState(56)
  const [rotationX, setRotationX] = useState(0.2)
  const [light1Color, setLight1Color] = useState('#0450d5')
  const [light2Color, setLight2Color] = useState('#ff690f')
  const ambientLightRef = useRef<AmbientLight>(null!)
  const pointLight1Ref = useRef<PointLight>(null!)
  const pointLight2Ref = useRef<PointLight>(null!)


  return (
    <>
      <h1>Fantastic elastic panda</h1>
      <ApiTest />
      <Timer />
      <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
        <Canvas
          camera={{ position: [cameraX, cameraY, cameraZ], fov: cameraFov, rotation: [rotationX, 0, 0] }}
          style={{ width: '100%', height: '100%' }}
          gl={{ antialias: true }}
          dpr={[1, 2]}
  >
    
          <Suspense fallback={null}>
            <ambientLight ref={ambientLightRef} intensity={3} />
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
              envRotation={envRotation}       
              setEnvRotation={setEnvRotation}
              light1Color={light1Color}
              setLight1Color={setLight1Color}
              light2Color={light2Color}
              setLight2Color={setLight2Color}
            />
            <Model 
              blendshapes={blendshapes} 
              springConfig={{ stiffness: 100, damping: 12, mass: 1 }}
              receiveShadow
              castShadow
            />
            <Environment 
              preset="studio"
              blur={envBlur} 
              background 
              resolution={64}  
              environmentIntensity={envIntensity}
              environmentRotation={[0, envRotation, 0]}  
              backgroundRotation={[0, envRotation, 0]}   
            />
          </Suspense>
        </Canvas>
        <FaceControls onBlendshapesChange={setBlendshapes} />
      </div>
    </>
  )
}



