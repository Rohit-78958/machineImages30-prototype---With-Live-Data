import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

function LiveDataDisplay({ machineID, position }) {
  const spriteRef = useRef();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const keys = ['AE', 'PE', 'OEE', 'DownTime', 'PartCount', 'key6'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data for machineID:', machineID);
        const response = await fetch(
          'http://172.36.0.64:8016/api/GetMachineDetails?machineID=' + machineID
        );
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const jsonData = await response.json();
        setData(jsonData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch data');
        console.error('Error fetching data:', err);
      }
    };

    // Initial fetch
    fetchData();

    // Set up interval for periodic updates
    const intervalId = setInterval(fetchData, 2000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [machineID]);

  useFrame(() => {
    if (spriteRef.current && data) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 300;
      canvas.height = 200;

      // Clear canvas
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background with semi-transparency
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Center "Live Machine Data" heading
      context.fillStyle = 'black';
      context.font = 'bold 20px Arial'; // Bold and larger text
      const heading = 'Live Machine Data';
      const textWidth = context.measureText(heading).width;
      context.fillText(heading, (canvas.width - textWidth) / 2, 40);

      // Display other values left-aligned
      context.font = 'bold 16px Arial'; // Bold and slightly smaller
      let yOffset = 80;
      Object.entries(data).forEach(([key, value]) => {
        const label = keys[key] || key; // Ensure valid key label
        context.fillText(`${label}: ${value}`, 20, yOffset);
        yOffset += 20;
      });

      // Create texture and update material
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;

      if (spriteRef.current.material) {
        spriteRef.current.material.map = texture;
        spriteRef.current.material.transparent = true;
        spriteRef.current.material.opacity = 1.0; // Ensure opacity is set to full
        spriteRef.current.material.needsUpdate = true;
      }
    }
  });

  return (
    <sprite ref={spriteRef} position={position} scale={[3, 2, 1]}>
      <spriteMaterial attach="material" />
    </sprite>
  );
}

export default LiveDataDisplay;
