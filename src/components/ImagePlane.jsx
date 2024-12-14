import { useThree, useFrame } from '@react-three/fiber'
import React, { useRef, useState, useCallback } from 'react'
import { useTexture} from '@react-three/drei'
import LiveDataDisplay from './LiveData'

export default function ImagePlane({ position, machineID }) {
  const texture = useTexture('images/pngegg.png');
  const planeRef = useRef();
  //const [isLiveDataVisible, setIsLiveDataVisible] = useState(false);
  
  const { camera } = useThree();
  const [isVisible, setIsVisible] = useState(false);

  // Function to check distance to the camera
  const checkVisibility = useCallback(() => {
    if (planeRef.current) {
      const distance = camera.position.distanceTo(planeRef.current.position);
      setIsVisible(distance < 20); // Adjust threshold as needed
    }
  }, [camera]);


  // Update visibility on every frame
  useFrame(() => {
    checkVisibility();
  });

  const handleMeshClick = (e) => {
    e.stopPropagation();
    setIsLiveDataVisible((prev) => !prev); // Toggle visibility
  };

  useFrame(({ camera }) => {
    if (planeRef.current) {
      // Make the plane face the camera
      planeRef.current.lookAt(camera.position);
    }
  });
  

  return (
    <mesh ref={planeRef} position={position} rotation={[0, Math.PI / 2, 0]}
      // onClick={handleMeshClick}
    >
      <planeGeometry args={[15, 10]} />
      <meshBasicMaterial map={texture}
      transparent />
      {/* {isLiveDataVisible && <LiveDataDisplay machineID={machineID} position={[3, 4.5, 0.1]} />} */}
      {isVisible && <LiveDataDisplay machineID={machineID} position={[3, 4.5, 0.1]} />}
    </mesh>
  );
}