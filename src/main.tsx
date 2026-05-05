import { StrictMode, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Canvas } from '@react-three/fiber'
import { Model } from './components/scene/PandaModel'
import { Environment, ContactShadows, useGLTF,OrbitControls } from '@react-three/drei'

useGLTF.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    
    <Canvas shadows camera={{ position: [0, -2, 10], fov: 50 }}
      style={{ width: '100%', height: '100vh' }}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 2]}
    >
      <pointLight position={[10, 10, 5]} />
      <pointLight position={[-10, -10, -5]} />
      <ambientLight intensity={0.4} />
      
      <group position={[0, -1.5, 0]}>
          <Model scale={2} position={[0, 2, 0]} castShadow receiveShadow />

        <ContactShadows scale={10} blur={3} opacity={0.25} far={10} />
      </group>

      <Environment 
      preset="studio"
      blur={0}
      background resolution={64}>

      </Environment>
              <OrbitControls />

    </Canvas>

  </StrictMode>,
)