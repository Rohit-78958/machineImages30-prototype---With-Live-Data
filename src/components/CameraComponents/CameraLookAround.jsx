import { Canvas, useThree } from '@react-three/fiber'
import React, { useRef, useState, useEffect ,Suspense, useCallback } from 'react'
import { OrbitControls, Stats, Environment, useGLTF, Html, useProgress, KeyboardControls, useKeyboardControls, PerspectiveCamera, useAnimations, PerformanceMonitor, ContactShadows, useTexture, useFBX } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Perf } from 'r3f-perf'

export default function CameraLookAround() {
  const { camera } = useThree();
  const [isDragging, setIsDragging] = useState(false); // Whether the mouse is being dragged
  const [prevMousePos, setPrevMousePos] = useState({ x: 0, y: 0 }); // Track previous mouse position
  const rotationSpeed = 0.002; // Control rotation sensitivity

  // Track mouse down, move, and up events for dragging
  useEffect(() => {
    const handleMouseDown = (event) => {
      setIsDragging(true);
      setPrevMousePos({ x: event.clientX, y: event.clientY });
    };

    const handleMouseMove = (event) => {
      if (isDragging) {
        const deltaX = event.clientX - prevMousePos.x;
        const deltaY = event.clientY - prevMousePos.y;

        // Update camera rotation based on mouse movement
        camera.rotation.y -= deltaX * rotationSpeed; // Horizontal (left/right) rotation

        // Clamp vertical rotation to avoid flipping
        camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));

        setPrevMousePos({ x: event.clientX, y: event.clientY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    // Attach event listeners for mouse interactions
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, prevMousePos, camera]);
  
  return null;
}