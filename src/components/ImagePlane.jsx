import { useThree, useFrame } from '@react-three/fiber';
import React, { useRef, useState, useCallback } from 'react';
import { useTexture } from '@react-three/drei';
import LiveDataDisplay from './LiveData';

export default function ImagePlane({ position, machineID }) {
  const texture = useTexture('images/pngegg.png');
  const planeRef = useRef();

  const { camera } = useThree();
  const [isVisible, setIsVisible] = useState(false);

  // Function to check distance to the camera
  const checkVisibility = useCallback(() => {
    if (planeRef.current) {
      const distance = camera.position.distanceTo(planeRef.current.position);
      setIsVisible(distance < 20); // Adjust threshold as needed
    }
  }, [camera]);

  // Update visibility and lookAt logic on every frame
  useFrame(() => {
    if (planeRef.current) {
      const distance = camera.position.distanceTo(planeRef.current.position);
      checkVisibility();

      if (distance > 10) {
        // Only make the plane face the camera when distance > 10
        planeRef.current.lookAt(camera.position);
      }
    }
  });

  return (
    <mesh
      ref={planeRef}
      position={position}
      rotation={[0, Math.PI / 2, 0]}
    >
      <planeGeometry args={[15, 10]} />
      <meshBasicMaterial map={texture} transparent />
      {isVisible && <LiveDataDisplay machineID={machineID} position={[3, 4.5, 0.1]} />}
    </mesh>
  );
}
