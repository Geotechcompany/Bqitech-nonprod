import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Mesh } from 'three'

export function useAnimatedBackground() {
  const meshRef = useRef<Mesh>(null)

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    
    meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.3) * 0.2
    meshRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.2) * 0.2
  })

  return meshRef
}
