import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
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

export const Model = React.forwardRef<THREE.Group, any>((props, ref) => {
  const { nodes, materials } = useGLTF('/panda.glb') as unknown as GLTFResult
  const meshRef = useRef<THREE.Mesh>(null)

  useEffect(() => {
    if (meshRef.current) {
      console.log('Morph targets:', meshRef.current.morphTargetDictionary)
    }
  }, [])

  return (
    <group ref={ref} {...props} dispose={null}>
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