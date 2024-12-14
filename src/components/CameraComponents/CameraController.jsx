import { Canvas, useThree } from '@react-three/fiber'
import React, { useRef, useState, useEffect ,Suspense, useCallback } from 'react'
import { OrbitControls, Stats, Environment, useGLTF, Html, useProgress, KeyboardControls, useKeyboardControls, PerspectiveCamera, useAnimations, PerformanceMonitor, ContactShadows, useTexture, useFBX } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Perf } from 'r3f-perf'

// Constants for movement
const SPEED = 2
const direction = new THREE.Vector3()
const frontVector = new THREE.Vector3()
const sideVector = new THREE.Vector3()

export default function CameraController({ showroomBoundary }) {
    const [, get] = useKeyboardControls();
  
    useFrame((state) => {
      const { forward, backward, left, right } = get();
  
      // Calculate movement direction
      frontVector.set(0, 0, backward - forward);
      sideVector.set(left - right, 0, 0);
      direction
        .subVectors(frontVector, sideVector)
        .normalize()
        .multiplyScalar(SPEED)
        .applyEuler(state.camera.rotation);
  
      // Update camera position
      state.camera.position.x += direction.x * 0.1;
      state.camera.position.z += direction.z * 0.1;
  
      // Clamp the camera's position within the showroom boundary
      state.camera.position.x = THREE.MathUtils.clamp(state.camera.position.x, showroomBoundary.minX, showroomBoundary.maxX);
      state.camera.position.z = THREE.MathUtils.clamp(state.camera.position.z, showroomBoundary.minZ, showroomBoundary.maxZ);
    });
  
    return null;
  }