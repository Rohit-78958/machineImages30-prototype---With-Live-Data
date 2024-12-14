import { Canvas, useThree } from '@react-three/fiber'
import React, { useRef, useState, useEffect ,Suspense, useCallback } from 'react'
import { OrbitControls, Stats, Environment, useGLTF, Html, useProgress, KeyboardControls, useKeyboardControls, PerspectiveCamera, useAnimations, PerformanceMonitor, ContactShadows, useTexture, useFBX } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Perf } from 'r3f-perf'


export default function ShowroomModel({ setBoundary }) {
  const { scene } = useGLTF("models/showroom.glb");
  const showroom = useRef();

  useEffect(() => {
    if (showroom.current) {
      const boundingBox = new THREE.Box3().setFromObject(showroom.current);
      const min = boundingBox.min;
      const max = boundingBox.max;

      const boundaryData = {
        minX: min.x + 20,
        maxX: max.x - 160,
        minZ: min.z + 10,
        maxZ: max.z - 10,
      };

      setBoundary(boundaryData); // Pass boundary data to App component
    }
  }, [scene, setBoundary]);

  return (
    <group ref={showroom}>
      <primitive object={scene} scale={0.2} castShadow receiveShadow />
    </group>
  );
}