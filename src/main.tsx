import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { useGLTF } from '@react-three/drei'
import './index.css'
import App from './App.tsx'

useGLTF.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)