import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { GLTF } from 'three-stdlib'

type GLTFResult = GLTF & {
  nodes: {
    Panda001: THREE.Mesh
    EyeL: THREE.Mesh
    EyeR: THREE.Mesh
  }
  materials: {
    Panda: THREE.MeshStandardMaterial
    Eyes: THREE.MeshStandardMaterial
  }
  animations: any[]
}

interface ModelProps {
  blendshapes?: Record<string, number>
}

export const Model = React.forwardRef<THREE.Group, ModelProps>((props, ref) => {
  const { blendshapes = {}, ...groupProps } = props
  const { nodes, materials } = useGLTF('/panda.glb') as unknown as GLTFResult
  const meshRef = useRef<THREE.Mesh>(null)

  useEffect(() => {
    if (meshRef.current) {
      console.log('Morph targets:', meshRef.current.morphTargetDictionary)
    }
  }, [])

  useFrame(() => {
    const mesh = meshRef.current
    if (!mesh?.morphTargetDictionary || !mesh.morphTargetInfluences) return

    for (const [key, value] of Object.entries(blendshapes)) {
      const idx = mesh.morphTargetDictionary[key]
      if (idx !== undefined) {
        mesh.morphTargetInfluences[idx] = value
      }
    }
  })

  return (
    <group ref={ref} {...groupProps} dispose={null}>
      <group rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
        <mesh
          ref={meshRef}
          name="Panda001"
          geometry={nodes.Panda001.geometry}
          material={materials.Panda}
          morphTargetDictionary={nodes.Panda001.morphTargetDictionary}
          morphTargetInfluences={nodes.Panda001.morphTargetInfluences}
          position={[0, 62.02, 29.72]}
        >
          <mesh geometry={nodes.EyeL.geometry} material={materials.Eyes} position={[-32, 13.745, -31.52]} rotation={[Math.PI / 2, 0, 0]} scale={[0.86, 1.29, 0.86]} />
          <mesh geometry={nodes.EyeR.geometry} material={materials.Eyes} position={[32, 13.745, -31.52]} rotation={[Math.PI / 2, 0, 0]} scale={[0.86, 1.29, 0.86]} />
        </mesh>
      </group>
    </group>
  )
})

Model.displayName = 'Model'
useGLTF.preload('/panda.glb')