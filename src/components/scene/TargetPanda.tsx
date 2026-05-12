import React, { useEffect, useImperativeHandle, useRef } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { GLTF } from 'three-stdlib'
import type { BlendshapeValues } from '../../types/blendshape'
import { useBlinkAnimation } from '../../hooks/useBlinkAnimation'
import { MORPH_KEYS } from '../../config/morphKeys'
import { applyConstraints } from '../../utils/constraintUtils'

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

interface TargetPandaProps {
  values?: Record<string, number>
  receiveShadow?: boolean
  castShadow?: boolean

  // Trigger animation by increasing this value
  spinTrigger?: number

  // Easy tuning
  spinStartDegrees?: number
  spinDurationMs?: number

  // Called while panda is spinning fast
  onSpinCovered?: () => void
}

export const TargetPanda = React.forwardRef<THREE.Group, TargetPandaProps>(
  (props, ref) => {
    const {
      values = {},
      spinTrigger = 0,
      spinStartDegrees = -1080,
      spinDurationMs = 2000,
      onSpinCovered,
      ...groupProps
    } = props

    const { nodes, materials } = useGLTF(
      '/panda.glb'
    ) as unknown as GLTFResult

    const meshRef = useRef<THREE.Mesh>(null)
    const groupRef = useRef<THREE.Group>(null)

    const { updateBlink } = useBlinkAnimation()

    useImperativeHandle(ref, () => groupRef.current!)

    const spinRef = useRef({
      active: false,
      elapsed: 0,
      coveredCalled: false,
    })

    // -------------------------
    // Animation Helpers
    // -------------------------

    function easeInOut(t: number) {
      return t < 0.5
        ? 2 * t * t
        : 1 - Math.pow(-2 * t + 2, 2) / 2
    }

    function easeOut(t: number) {
      return 1 - Math.pow(1 - t, 3)
    }

    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t
    }

    /**
     * Desired motion:
     *
     * -1080
     * -> slight wrong direction (-1200)
     * -> rapid spin upward
     * -> overshoot to 200
     * -> settle at 0
     */

    function getSpinDegrees(t: number) {
      const dipDegrees = spinStartDegrees - 120
      const overshootDegrees = 50

      // Phase 1:
      // slight backwards dip
      if (t < 0.14) {
        const p = easeInOut(t / 0.14)
        return lerp(spinStartDegrees, dipDegrees, p)
      }

      // Phase 2:
      // rapid spin toward overshoot
      if (t < 0.78) {
        const p = easeInOut((t - 0.14) / 0.64)
        return lerp(dipDegrees, overshootDegrees, p)
      }

      // Phase 3:
      // settle into 0
      const p = easeOut((t - 0.78) / 0.22)
      return lerp(overshootDegrees, 0, p)
    }

    // -------------------------
    // Start animation
    // -------------------------

    useEffect(() => {
      if (!spinTrigger) return

      spinRef.current.active = true
      spinRef.current.elapsed = 0
      spinRef.current.coveredCalled = false

      if (groupRef.current) {
        groupRef.current.rotation.y = THREE.MathUtils.degToRad(
          spinStartDegrees
        )
      }
    }, [spinTrigger, spinStartDegrees])

    // -------------------------
    // Frame loop
    // -------------------------

    useFrame((_, delta) => {
      // -------------------------
      // Spin animation
      // -------------------------

      const spin = spinRef.current

      if (spin.active && groupRef.current) {
        spin.elapsed += delta * 1000

        const t = Math.min(
          spin.elapsed / spinDurationMs,
          1
        )

        const degrees = getSpinDegrees(t)

        // Rotate ONLY around Y axis
        groupRef.current.rotation.y =
          THREE.MathUtils.degToRad(degrees)

        // Randomize face while hidden/spinning
        if (!spin.coveredCalled && t > 0.35) {
          spin.coveredCalled = true
          onSpinCovered?.()
        }

        // Finish
        if (t >= 1) {
          spin.active = false
          groupRef.current.rotation.y = 0
        }
      }

      // -------------------------
      // Morph targets
      // -------------------------

      const mesh = meshRef.current

      if (!mesh?.morphTargetDictionary) return

      // Initialize morphTargetInfluences if needed
      if (!mesh.morphTargetInfluences) {
        mesh.morphTargetInfluences = new Array(
          mesh.geometry.morphAttributes.position?.length ?? 0
        ).fill(0)
      }

      // Blink animation
      const blinkValue = updateBlink(delta * 1000)

      // Apply constraints
      const constrainedValues = {
        ...values,
      } as BlendshapeValues

      applyConstraints(constrainedValues)

      for (const key of MORPH_KEYS) {
        let value = constrainedValues[key] ?? 0

        // Add blink on top
        if (key === 'Blink') {
          value = Math.min(1, value + blinkValue)
        }

        const idx = mesh.morphTargetDictionary[key]

        if (idx !== undefined) {
          mesh.morphTargetInfluences[idx] = value
        }
      }
    })

    return (
      <group
        ref={groupRef}
        {...groupProps}
        dispose={null}
      >
        <group
          rotation={[Math.PI / 2, 0, 0]}
          scale={0.01}
          position={[0, -1.5, 0]}
        >
          <mesh
            ref={meshRef}
            name="Panda001"
            geometry={nodes.Panda001.geometry}
            material={materials.Panda}
            morphTargetDictionary={
              nodes.Panda001.morphTargetDictionary
            }
            position={[0, 62.02, 29.72]}
            receiveShadow={props.receiveShadow}
            castShadow={props.castShadow}
          >
            <mesh
              geometry={nodes.EyeL.geometry}
              material={materials.Panda}
              position={[-32, 13.7448, -24.33]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={[1, 1, 1]}
            />

            <mesh
              geometry={nodes.EyeR.geometry}
              material={materials.Panda}
              position={[32, 13.7448, -24.33]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={[1, 1, 1]}
            />
          </mesh>
        </group>
      </group>
    )
  }
)

TargetPanda.displayName = 'TargetPanda'

useGLTF.preload('/panda.glb')