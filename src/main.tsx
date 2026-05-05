import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Canvas } from '@react-three/fiber'
import { Model } from './components/scene/PandaModel'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Canvas>
      <Model />
    </Canvas>
  </StrictMode>,
)
