import { Canvas, useThree } from '@react-three/fiber'
import React, { useRef, useState, useEffect ,Suspense, useCallback } from 'react'
import { OrbitControls, Stats, Environment, useGLTF, Html, useProgress, KeyboardControls, useKeyboardControls, PerspectiveCamera, useAnimations, PerformanceMonitor, ContactShadows, useTexture, useFBX } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Perf } from 'r3f-perf'

export default function HumanModel({isMoving}) {
  const { camera } = useThree();
  const { scene, animations } = useGLTF('models/Walk.glb');

  const idleModel = useGLTF('models/Idle1.glb'); 
  const { actions: idleActions } = useAnimations(idleModel.animations, idleModel.scene);

  const { actions } = useAnimations(animations, scene);
  const modelRef = useRef();

  useEffect(() => {
    if(!isMoving) {
      const idleAnimationName = Object.keys(idleActions)[0]; 
      if (idleActions[idleAnimationName]) idleActions[idleAnimationName].play();
    }
    else {
      const animationName = Object.keys(actions)[0]; 
      if (actions[animationName]) actions[animationName].play();
    }
  }, [actions, idleActions, isMoving]);

  useFrame(() => {
    if (modelRef.current) {
      const offsetDistance = 1.2; // Distance in front of the camera
      const heightOffset = -0.6; // Height adjustment

      // Calculate position in front of the camera
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);

      const cameraPosition = camera.position.clone();
      const targetPosition = cameraPosition.add(direction.multiplyScalar(offsetDistance));

      modelRef.current.position.set(
        targetPosition.x,
        targetPosition.y + heightOffset,
        targetPosition.z
      );

      // Sync rotation with camera
      modelRef.current.rotation.copy(camera.rotation); // Make model rotation same as camera
      modelRef.current.rotation.y += Math.PI; // Rotate model 180 degrees
    }
  });

  return <primitive ref={modelRef} 
    object={isMoving ? scene : idleModel.scene}
    scale={0.2} />;
}