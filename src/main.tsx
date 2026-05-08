import { StrictMode, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Canvas } from '@react-three/fiber'
import { Model } from './components/scene/PandaModel'
import { Environment, useGLTF, OrbitControls } from '@react-three/drei'

useGLTF.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    
    <Canvas camera={{ position: [0, 0, 8], fov: 50 }}
      style={{ width: '100%', height: '100vh' }}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 2]}
    >
      <pointLight position={[10, 10, 5]} intensity={1}  />
      <pointLight position={[-10, -10, -5]} intensity={1}  />
      <ambientLight intensity={0.4} />


<Model scale={1} position={[0, 0, 0]} castShadow receiveShadow />

      <Environment 
      preset="studio"
      blur={0}
      background resolution={64}>

      </Environment>

      <OrbitControls />

    </Canvas>

  </StrictMode>,
)