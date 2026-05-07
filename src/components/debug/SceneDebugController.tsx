import { useThree } from '@react-three/fiber'
import { useControls } from 'leva'
import { useEffect } from 'react'
import * as THREE from 'three'

interface Props {
  ambientLightRef: React.RefObject<THREE.AmbientLight>
  pointLight1Ref: React.RefObject<THREE.PointLight>
  pointLight2Ref: React.RefObject<THREE.PointLight>
  cameraX: number
  cameraY: number
  cameraZ: number
  cameraFov: number
  rotationX?: number
  setCameraX: (value: number) => void
  setCameraY: (value: number) => void
  setCameraZ: (value: number) => void
  setCameraFov: (value: number) => void
  setRotationX: (value: number) => void
  envIntensity: number
  envBlur: number
  setEnvIntensity: (value: number) => void
  setEnvBlur: (value: number) => void
  envRotation: number
    setEnvRotation: (value: number) => void
}

/**
 * SceneDebugController
 * 
 * Interactive Leva panel for tweaking camera, lights, and environment.
 * Remove the <SceneDebugController /> component from App.tsx to disable.
 */
export function SceneDebugController({ 
  ambientLightRef, 
  pointLight1Ref, 
  pointLight2Ref,
  cameraX,
  cameraY,
  cameraZ,
  cameraFov,
  rotationX,
  setCameraX,
  setCameraY,
  setCameraZ,
  setCameraFov,
  setRotationX,
  envIntensity,
  envBlur,
  setEnvIntensity, 
  setEnvBlur,
  envRotation,
    setEnvRotation,
}: Props) {
  const { camera } = useThree()

  const config = useControls('Scene', {
    cameraX: { value: cameraX, min: -20, max: 20, step: 0.1 },
    cameraY: { value: cameraY, min: -20, max: 20, step: 0.1 },
    cameraZ: { value: cameraZ, min: -20, max: 20, step: 0.1 },
    cameraFov: { value: cameraFov, min: 10, max: 120, step: 1 },
    rotationX: { value: rotationX || 0, min: -Math.PI, max: Math.PI, step: 0.1 },
    ambientIntensity: { value: 3, min: 0, max: 3, step: 0.1 },
    light1Intensity: { value: 1, min: 0, max: 3, step: 0.1 },
    light1X: { value: 10, min: -30, max: 30, step: 0.5 },
    light1Y: { value: 10, min: -30, max: 30, step: 0.5 },
    light1Z: { value: 5, min: -30, max: 30, step: 0.5 },
    light2Intensity: { value: 1, min: 0, max: 3, step: 0.1 },
    light2X: { value: -10, min: -30, max: 30, step: 0.5 },
    light2Y: { value: -10, min: -30, max: 30, step: 0.5 },
    light2Z: { value: -5, min: -30, max: 30, step: 0.5 },
    envIntensity: { value: envIntensity, min: 0, max: 2, step: 0.1 },
    envBlur: { value: envBlur, min: 0, max: 1, step: 0.1 },
    envRotation: { value: envRotation, min: -Math.PI, max: Math.PI, step: 0.05 },

  })

  // Update camera state and directly update camera for real-time feedback
  useEffect(() => {
    setCameraX(config.cameraX)
    setCameraY(config.cameraY)
    setCameraZ(config.cameraZ)
    setCameraFov(config.cameraFov)
    setRotationX(config.rotationX)

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.position.set(config.cameraX, config.cameraY, config.cameraZ)
      camera.rotation.order = 'YXZ'
      camera.rotation.set(config.rotationX, 0, 0)
      camera.fov = config.cameraFov
      camera.updateProjectionMatrix()
    }
  }, [config.cameraX, config.cameraY, config.cameraZ, config.cameraFov, config.rotationX, setCameraX, setCameraY, setCameraZ, setCameraFov, setRotationX, camera])

  // Update lights
  useEffect(() => {
    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = config.ambientIntensity
    }
    if (pointLight1Ref.current) {
      pointLight1Ref.current.intensity = config.light1Intensity
      pointLight1Ref.current.position.set(config.light1X, config.light1Y, config.light1Z)
    }
    if (pointLight2Ref.current) {
      pointLight2Ref.current.intensity = config.light2Intensity
      pointLight2Ref.current.position.set(config.light2X, config.light2Y, config.light2Z)
    }
  }, [config.ambientIntensity, config.light1Intensity, config.light1X, config.light1Y, config.light1Z, config.light2Intensity, config.light2X, config.light2Y, config.light2Z, ambientLightRef, pointLight1Ref, pointLight2Ref])

  // Update environment
useEffect(() => {
  setEnvIntensity(config.envIntensity)
  setEnvBlur(config.envBlur)
  setEnvRotation(config.envRotation)
}, [config.envIntensity, config.envBlur, config.envRotation, setEnvIntensity, setEnvBlur, setEnvRotation])

  return null
}
