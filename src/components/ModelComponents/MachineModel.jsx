import React, { useRef, useState, useEffect , useCallback } from 'react'
import { useGLTF, Html, useAnimations} from '@react-three/drei'


export default function MachineModel(props) {
  const { scene, animations } = useGLTF('models/aceproject1.glb')
  const modelRef = useRef()
  const [isDragging, setIsDragging] = useState(false)
  const previousMousePositionRef = useRef({ x: 0, y: 0 })

  // Set up animations
  const group = useRef()
  const { actions } = useAnimations(animations, group)
  const isAnimatingRef = useRef(false)


  // Control animation with useRef
  const toggleAnimation = useCallback(() => {
    isAnimatingRef.current = !isAnimatingRef.current;
    console.log('Toggling animation:', isAnimatingRef.current);
    Object.values(actions).forEach(action => {
      if (isAnimatingRef.current) {
        action.reset().play(); // Reset and play
      } else {
        action.stop(); // Stop animation
      }
    });
  }, [actions]);

  // Using useRef instead of state for mouse position to avoid stale closures
  const onPointerDown = (event) => {
    event.stopPropagation()
    setIsDragging(true)
    previousMousePositionRef.current = {
      x: event.clientX,
      y: event.clientY
    }
  }

  const onPointerMove = (event) => {
    if (!isDragging) return

    const deltaX = event.clientX - previousMousePositionRef.current.x
    
    if (modelRef.current) {
      modelRef.current.rotation.y += deltaX * 0.01
    }

    // Update the previous position after calculating delta
    previousMousePositionRef.current = {
      x: event.clientX,
      y: event.clientY
    }
  }

  const onPointerUp = () => {
    setIsDragging(false)
  }

  // Add pointer capture to ensure we don't lose the drag events
  useEffect(() => {
    const handlePointerMove = (event) => {
      onPointerMove(event)
    }

    const handlePointerUp = (event) => {
      onPointerUp()
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [isDragging])

  return (
    <group
      ref={modelRef}
      onPointerDown={onPointerDown}
      {...props}
    >
      <primitive ref={group} object={scene.clone()} scale={3.25} rotation={[0, Math.PI , 0]} castShadow recieveShadow />
      <InfoPoint position={[-1, 4, -1]} info="This is the front loader of the machine" imageUrl="images/machine.jpg" />
      <InfoPoint position={[-4, 6, 7]} info="This is the back of the machine" />
      <InfoPoint position={[-3, 7, 2]} info="This is the top of the machine" />
      <Html position={[-3, 1.5, -1]}  distanceFactor={15}>
        <button
          onClick={toggleAnimation}
          className="bg-white/90 px-3 py-2 rounded text-lg hover:bg-blue-200"
        >
          {isAnimatingRef.current.valueOf() ? 'Stop' : 'Play'}
        </button>
      </Html>
    </group>
  )
}