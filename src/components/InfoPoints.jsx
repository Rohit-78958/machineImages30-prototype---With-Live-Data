import { Canvas, useThree } from '@react-three/fiber'
import React, { useRef, useState, useEffect ,Suspense, useCallback } from 'react'
import { OrbitControls, Stats, Environment, useGLTF, Html, useProgress, KeyboardControls, useKeyboardControls, PerspectiveCamera, useAnimations, PerformanceMonitor, ContactShadows, useTexture, useFBX } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Perf } from 'r3f-perf'

export default function InfoPoint({ position, info, imageUrl }) {
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  const sphereRef = useRef()

  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.scale.setScalar(hovered ? 2.4 : 1.4 + Math.sin(state.clock.elapsedTime * 5) * 0.1)
    }
  })

  return (
    <group position={position}>
      <mesh
        ref={sphereRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => setClicked(!clicked)}
      >
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshBasicMaterial color={hovered ? 'red' : 'yellow'} />
      </mesh>
      {clicked && (
        <Html distanceFactor={10}>
          <div style={{ background: 'white', padding: '10px', borderRadius: '5px', fontSize: '14px', width: '125px' }}>
          <img src={imageUrl} alt={info} style={{ width: '100%', height: 'auto', borderRadius: '5px' }} />
          </div>
        </Html>
      )}
    </group>
  )
}