import React, { useRef } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { GLTF } from 'three-stdlib'
import { stepSpring, useSpringStates } from '../../hooks/useSpring'
import type { SpringConfig } from '../../hooks/useSpring'
import { MORPH_KEYS } from '../../config/morphKeys'

type GLTFResult = GLTF & {
  nodes: { Panda001: THREE.Mesh; EyeL: THREE.Mesh; EyeR: THREE.Mesh }
  materials: { Panda: THREE.MeshStandardMaterial; Eyes: THREE.MeshStandardMaterial }
  animations: any[]
}

interface ModelProps {
  blendshapes?: Record<string, number>
  springConfig?: SpringConfig
}

export const Model = React.forwardRef<THREE.Group, ModelProps>((props, ref) => {
  const { blendshapes = {}, springConfig, ...groupProps } = props
  const { nodes, materials } = useGLTF('/panda.glb') as unknown as GLTFResult
  const meshRef = useRef<THREE.Mesh>(null)
  const springs = useSpringStates(MORPH_KEYS)

  useFrame((_, delta) => {
    const mesh = meshRef.current
    if (!mesh?.morphTargetDictionary || !mesh.morphTargetInfluences) return

    for (const key of MORPH_KEYS) {
      const target = blendshapes[key] ?? 0
      const current = springs.current[key]

      // Step the spring toward the target value
      springs.current[key] = stepSpring(current, target, delta, springConfig)

      // Write the animated value to the mesh
      const idx = mesh.morphTargetDictionary[key]
      if (idx !== undefined) {
        mesh.morphTargetInfluences[idx] = springs.current[key].value
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