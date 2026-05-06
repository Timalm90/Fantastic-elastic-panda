/**
 * PandaModel.tsx
 * 
 * Renders a 3D panda model with support for morph targets (blend shapes).
 * The model loads from panda.glb and applies morph target influences based on
 * incoming blendshapes prop values updated each frame.
 */

import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { GLTF } from 'three-stdlib'


type GLTFResult = GLTF & {
  nodes: {
    Panda001: THREE.Mesh           // Main panda mesh
    EyeL: THREE.Mesh               // Left eye mesh
    EyeR: THREE.Mesh               // Right eye mesh
  }
  materials: {
    Panda: THREE.MeshStandardMaterial  // Panda material
    Eyes: THREE.MeshStandardMaterial   // Eye material
  }
  animations: any[]
}

/**
 * Props interface for the Model component.
 */
interface ModelProps {
  blendshapes?: Record<string, number>
}

export const Model = React.forwardRef<THREE.Group, ModelProps>((props, ref) => {
  const { blendshapes = {}, ...groupProps } = props
  // blendshapes: Record of morph target name → influence value (0-1)
  // Default empty object prevents crashes if no blendshapes prop is passed
  // ...groupProps: Collects remaining props (position, scale, etc.) and spreads to <group>

  // Load the 3D model from panda.glb and cast to our typed GLTFResult
  const { nodes, materials } = useGLTF('/panda.glb') as unknown as GLTFResult
  const meshRef = useRef<THREE.Mesh>(null)

  // Log morph target names available on the mesh for debugging
  useEffect(() => {
    if (meshRef.current) {
      console.log('Morph targets:', meshRef.current.morphTargetDictionary)
    }
  }, [])

  // Update morph target influences every frame based on blendshapes prop
  // This allows real-time animation of facial features
  useFrame(() => {
    const mesh = meshRef.current
    if (!mesh?.morphTargetDictionary || !mesh.morphTargetInfluences) return

    // Iterate through each blendshape and apply its influence value to the mesh
    for (const [key, value] of Object.entries(blendshapes)) {
      const idx = mesh.morphTargetDictionary[key]
      if (idx !== undefined) {
        mesh.morphTargetInfluences[idx] = value
      }
    }
  })

  return (
    <group ref={ref} {...groupProps} dispose={null}>
      {/* Inner group with rotation and scale to match model's coordinate system */}
      <group rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
        {/* Main panda body mesh with morph target support */}
        <mesh
          ref={meshRef}
          name="Panda001"
          geometry={nodes.Panda001.geometry}
          material={materials.Panda}
          morphTargetDictionary={nodes.Panda001.morphTargetDictionary}
          morphTargetInfluences={nodes.Panda001.morphTargetInfluences}
          position={[0, 62.02, 29.72]}
        >
          {/* Left and right eye meshes positioned relative to the body */}
          <mesh geometry={nodes.EyeL.geometry} material={materials.Eyes} position={[-32, 13.745, -31.52]} rotation={[Math.PI / 2, 0, 0]} scale={[0.86, 1.29, 0.86]} />
          <mesh geometry={nodes.EyeR.geometry} material={materials.Eyes} position={[32, 13.745, -31.52]} rotation={[Math.PI / 2, 0, 0]} scale={[0.86, 1.29, 0.86]} />
        </mesh>
      </group>
    </group>
  )
})

Model.displayName = 'Model'
useGLTF.preload('/panda.glb')