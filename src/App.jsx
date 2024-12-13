import { Canvas, useThree } from '@react-three/fiber'
import React, { useRef, useState, useEffect ,Suspense, useCallback } from 'react'
import { OrbitControls, Stats, Environment, useGLTF, Html, useProgress, KeyboardControls, useKeyboardControls, useAnimations, PerformanceMonitor, ContactShadows, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Perf } from 'r3f-perf'
import LiveDataDisplay from './LiveData'


// Constants for movement
const SPEED = 5
const direction = new THREE.Vector3()
const frontVector = new THREE.Vector3()
const sideVector = new THREE.Vector3()

function Loader() {
  const { progress } = useProgress()
  return <Html center>
  <div className='w-screen h-screen flex justify-center items-center text-white bg-zinc-800'>
    {progress.toFixed(2)} % loaded
  </div>
</Html>
}

function CameraController({ showroomBoundary }) {
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

function ShowroomModel({ setBoundary }) {
  const { scene } = useGLTF("models/showroom.glb");
  const showroom = useRef();
  const [boundary, setBoundaryState] = useState(null);

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

// Camera controller component - inside Canvas
function CameraControllerDpad({ mobileControls, showroomBoundary }) {
  const [, get] = useKeyboardControls();

  useFrame((state) => {
    // Combine keyboard and mobile controls
    const keyboardControls = get();
    const controls = {
      forward: keyboardControls.forward || mobileControls.forward,
      backward: keyboardControls.backward || mobileControls.backward,
      left: keyboardControls.left || mobileControls.left,
      right: keyboardControls.right || mobileControls.right
    };

    // Calculate movement direction
    frontVector.set(0, 0, controls.backward - controls.forward);
    sideVector.set(controls.left - controls.right, 0, 0);
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


function MachineModel(props) {
  const { scene, animations } = useGLTF('models/aceproject1.glb')
  const modelRef = useRef()
  const [isDragging, setIsDragging] = useState(false)
  const previousMousePositionRef = useRef({ x: 0, y: 0 })
  const isVisible = useFrustumCulling(props.position)
  
  // const isVisible = useFrustumCulling(props.position)

  // if (!isVisible) return null // Skip rendering if not in the frustum



  // Set up animations
  const group = useRef()
  const { actions } = useAnimations(animations, group)
  const [isAnimating, setIsAnimating] = useState(false)
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

// InfoPoint component remains the same
function InfoPoint({ position, info, imageUrl }) {
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

function ImagePlane({ position, machineID }) {
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

  // useFrame(({ camera }) => {
  //   if (planeRef.current) {
  //     // Make the plane face the camera
  //     planeRef.current.lookAt(camera.position);
  //   }
  // });

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


function App() {
  const [mobileControls, setMobileControls] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false
  });

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const [showroomBoundary, setShowroomBoundary] = useState(null);

  // Callback to set boundary in ShowroomModel
  const setBoundary = (boundary) => {
    setShowroomBoundary(boundary);
  };

  return (
    <KeyboardControls
      map={[
        { name: "forward", keys: ["ArrowUp", "w", "W"] },
        { name: "backward", keys: ["ArrowDown", "s", "S"] },
        { name: "left", keys: ["ArrowLeft", "a", "A"] },
        { name: "right", keys: ["ArrowRight", "d", "D"] },
        { name: "jump", keys: ["Space"] },
      ]}>
      <Canvas style={{ height: '100vh', width: '100vw' }} camera={{ fov: 75, position: [100, 10, -8], near: 0.0001, far: 1000 }}
        //shadows={false} // 10. Disable shadows for performance
        gl={{ 
          powerPreference: "high-performance",
          antialias: true, 
          // stencil: false,
          // depth: true,
          logarithmicDepthBuffer: true,
          
        }}
        //performance={{ min: 0.5 }}
      >
      
        {/* <GlobalCanvas scaleMultiplier={0.01} /> */}
        {/* <PerformanceOptimizer /> */}
        <Perf position="top-left" />
        {/* <CameraController showroomBoundary={showroomBoundary} /> */}
        {/* <CameraControllerDpad mobileControls={mobileControls} /> */}
        <directionalLight position={[1, 10, 1]}/>
        <Environment preset="warehouse" />
        <Stats position="top-right" />
        <Suspense fallback={<Loader />}>
          <ShowroomModel setBoundary={setBoundary} />
          {showroomBoundary && (
            <CameraController showroomBoundary={showroomBoundary} />
          )}

          {showroomBoundary && (
            <CameraControllerDpad mobileControls={mobileControls} showroomBoundary={showroomBoundary} />
          )}

          {/* White circular floor */}
          <ImagePlane position={[34, 7, -80]} />
          <mesh position={[30, 1, -80]} rotation={[0, 0, 0]} receiveShadow>
            {/* <circleGeometry args={[100, 64]} /> */}
            <cylinderGeometry args={[10, 10, 1, 64]} />
            <meshStandardMaterial color="white" />
          </mesh>

          <ImagePlane position={[-5, 7, -46]} />
          <mesh position={[-10, 1, -45]} rotation={[0, 0, 0]} receiveShadow>
            {/* <circleGeometry args={[100, 64]} /> */}
            <cylinderGeometry args={[10, 10, 1, 64]} />
            <meshStandardMaterial color="white" />
          </mesh>

          <ImagePlane position={[-30, 7, -46]}  />
          <mesh position={[-35, 1, -45]} rotation={[0, 0, 0]} receiveShadow>
            {/* <circleGeometry args={[100, 64]} /> */}
            <cylinderGeometry args={[10, 10, 1, 64]} />
            <meshStandardMaterial color="white" />
          </mesh>

          <ImagePlane position={[45, 7, 28]}  />
          {/* White circular floor */}
          <mesh position={[40, 1, 28]} rotation={[0, 0, 0]} receiveShadow>
            {/* <circleGeometry args={[100, 64]} /> */}
            <cylinderGeometry args={[10, 10, 1, 64]} />
            <meshStandardMaterial color="white" receiveShadow />
          </mesh>

          <ImagePlane position={[13, 7, 30]} />
          <mesh position={[10, 1, 28]} rotation={[0, 0, 0]} receiveShadow>
            {/* <circleGeometry args={[100, 64]} /> */}
            <cylinderGeometry args={[10, 10, 1, 64]} />
            <meshStandardMaterial color="white"  receiveShadow/>
          </mesh>


          <ImagePlane position={[-16, 7, 30]} />
          <mesh position={[-20, 1, 28]} rotation={[0, 0, 0]} receiveShadow>
            {/* <circleGeometry args={[100, 64]} /> */}
            <cylinderGeometry args={[10, 10, 1, 64]} />
            <meshStandardMaterial color="white"  receiveShadow/>
          </mesh>


          <ImagePlane position={[-22, 7, 70]}/>
          <mesh position={[-25, 1, 70]} rotation={[0, 0, 0]} receiveShadow>
            {/* <circleGeometry args={[100, 64]} /> */}
            <cylinderGeometry args={[10, 10, 1, 64]} />
            <meshStandardMaterial color="white" />
          </mesh>


          <ImagePlane position={[-22, 7, 100]} />
          <mesh position={[-25, 1, 100]} rotation={[0, 0, 0]} receiveShadow>
            {/* <circleGeometry args={[100, 64]} /> */}
            <cylinderGeometry args={[10, 10, 1, 64]} />
            <meshStandardMaterial color="white" />
          </mesh>


          <ImagePlane position={[-22, 7, 130]} />
          <mesh position={[-25, 1, 130]} rotation={[0, 0, 0]} receiveShadow>
            {/* <circleGeometry args={[100, 64]} /> */}
            <cylinderGeometry args={[10, 10, 1, 64]} />
            <meshStandardMaterial color="white" />
          </mesh>

          <ImagePlane position={[-22, 7, 160]} />
          <mesh position={[-25, 1, 160]} rotation={[0, 0, 0]} receiveShadow>
            {/* <circleGeometry args={[100, 64]} /> */}
            <cylinderGeometry args={[10, 10, 1, 64]} />
            <meshStandardMaterial color="white" />
          </mesh>

          <ImagePlane position={[28, 7, 80]} />
          <mesh position={[25, 1, 80]} rotation={[0, 0, 0]} receiveShadow> 
            {/* <circleGeometry args={[100, 64]} /> */}
            <cylinderGeometry args={[10, 10, 1, 64]} />
            <meshStandardMaterial color="white" />
          </mesh>

          <ImagePlane position={[52, 7, -55]} />
          <mesh position={[50, 1, -55]} rotation={[0, 0, 0]} receiveShadow>
            {/* <circleGeometry args={[100, 64]} /> */}
            <cylinderGeometry args={[10, 10, 1, 64]} />
            <meshStandardMaterial color="white" receiveShadow/>
          </mesh>


          <ImagePlane position={[43, 7, -107]}  />
          <mesh position={[40, 1, -108]} rotation={[0, 0, 0]} receiveShadow>
            {/* <circleGeometry args={[100, 64]} /> */}
            <cylinderGeometry args={[10, 10, 1, 64]} />
            <meshStandardMaterial color="white"  receiveShadow/>
          </mesh>
          
          <ImagePlane position={[12, 7, -107]}  />
          <mesh position={[10, 1, -108]} rotation={[0, 0, 0]} receiveShadow>
            {/* <circleGeometry args={[100, 64]} /> */}
            <cylinderGeometry args={[10, 10, 1, 64]} />
            <meshStandardMaterial color="white"  receiveShadow/>
          </mesh>


          <ImagePlane position={[-18, 7, -107]}  />
          <mesh position={[-20, 1, -108]} rotation={[0, 0, 0]} receiveShadow>
            {/* <circleGeometry args={[100, 64]} /> */}
            <cylinderGeometry args={[10, 10, 1, 64]} />
            <meshStandardMaterial color="white"  receiveShadow/>
          </mesh>

          
          <ImagePlane position={[-180, 7, 25]} />
          <mesh position={[-182, 1, 24]} rotation={[0, 0, 0]} receiveShadow>
            {/* <circleGeometry args={[100, 64]} /> */}
            <cylinderGeometry args={[10, 10, 1, 64]} />
            <meshStandardMaterial color="white"  receiveShadow/>
          </mesh>

          <ImagePlane position={[-160, 7, 25]}  />
          <mesh position={[-162, 1, 24]} rotation={[0, 0, 0]} receiveShadow>
            {/* <circleGeometry args={[100, 64]} /> */}
            <cylinderGeometry args={[10, 10, 1, 64]} />
            <meshStandardMaterial color="white"  receiveShadow/>
          </mesh>

          <ImagePlane position={[-140, 7, 25]}  />
          <mesh position={[-142, 1, 24]} rotation={[0, 0, 0]} receiveShadow>
            {/* <circleGeometry args={[100, 64]} /> */}
            <cylinderGeometry args={[10, 10, 1, 64]} />
            <meshStandardMaterial color="white"  receiveShadow/>
          </mesh>

          <ImagePlane position={[-110, 7, 25]}  />
          <mesh position={[-112, 1, 24]} rotation={[0, 0, 0]} receiveShadow>
            {/* <circleGeometry args={[100, 64]} /> */}
            <cylinderGeometry args={[10, 10, 1, 64]} />
            <meshStandardMaterial color="white"  receiveShadow/>
          </mesh>

          <ImagePlane position={[-90, 7, 25]}  />
          <mesh position={[-92, 1, 24]} rotation={[0, 0, 0]} receiveShadow>
            {/* <circleGeometry args={[100, 64]} /> */}
            <cylinderGeometry args={[10, 10, 1, 64]} />
            <meshStandardMaterial color="white"  receiveShadow/>
          </mesh>

          <ImagePlane position={[-90,7, 56]} />
          <mesh position={[-92, 1, 57]} rotation={[0, 0, 0]} receiveShadow>
            {/* <circleGeometry args={[100, 64]} /> */}
            <cylinderGeometry args={[10, 10, 1, 64]} />
            <meshStandardMaterial color="white"  receiveShadow/>
          </mesh>

          <ImagePlane position={[-90, 7, 96]}  />
          <mesh position={[-92, 1, 96]} rotation={[0, 0, 0]} receiveShadow>
            {/* <circleGeometry args={[100, 64]} /> */}
            <cylinderGeometry args={[10, 10, 1, 64]} />
            <meshStandardMaterial color="white"  receiveShadow/>
          </mesh>

          <ImagePlane position={[-90, 7, 76]} />
          <mesh position={[-92, 1, 76]} rotation={[0, 0, 0]} receiveShadow>
            {/* <circleGeometry args={[100, 64]} /> */}
            <cylinderGeometry args={[10, 10, 1, 64]} />
            <meshStandardMaterial color="white"  receiveShadow/>
          </mesh>

          <ImagePlane position={[-80, 7, -48]} />
          <mesh position={[-82, 1, -48]} rotation={[0, 0, 0]} receiveShadow>
            {/* <circleGeometry args={[100, 64]} /> */}
            <cylinderGeometry args={[10, 10, 1, 64]} />
            <meshStandardMaterial color="white"  receiveShadow/>
          </mesh>

          <ImagePlane position={[-80, 7, -86]} />
          <mesh position={[-82, 1, -86]} rotation={[0, 0, 0]} receiveShadow>
            {/* <circleGeometry args={[100, 64]} /> */}
            <cylinderGeometry args={[10, 10, 1, 64]} />
            <meshStandardMaterial color="white"  receiveShadow/>
          </mesh>

          <ImagePlane position={[-80, 7, -107]} />
          <mesh position={[-82, 1, -107]} rotation={[0, 0, 0]} receiveShadow>
            {/* <circleGeometry args={[100, 64]} /> */}
            <cylinderGeometry args={[10, 10, 1, 64]} />
            <meshStandardMaterial color="white"  receiveShadow/>
          </mesh>

          <ImagePlane position={[-100, 7, -50]} />
          <mesh position={[-104, 1, -48]} rotation={[0, 0, 0]} receiveShadow>
            {/* <circleGeometry args={[100, 64]} /> */}
            <cylinderGeometry args={[10, 10, 1, 64]} />
            <meshStandardMaterial color="white"  receiveShadow/>
          </mesh>

          <ImagePlane position={[-121, 7, -50]} />
          <mesh position={[-125, 1, -48]} rotation={[0, 0, 0]} receiveShadow>
            {/* <circleGeometry args={[100, 64]} /> */}
            <cylinderGeometry args={[10, 10, 1, 64]} />
            <meshStandardMaterial color="white"  receiveShadow/>
          </mesh>

          <ImagePlane position={[-142, 7, -50]} />
          <mesh position={[-146, 1, -48]} rotation={[0, 0, 0]} receiveShadow>
            {/* <circleGeometry args={[100, 64]} /> */}
            <cylinderGeometry args={[10, 10, 1, 64]} />
            <meshStandardMaterial color="white"  receiveShadow/>
          </mesh>

          <ImagePlane position={[-162, 7, -50]} />
          <mesh position={[-167, 1, -48]} rotation={[0, 0, 0]} receiveShadow>
            {/* <circleGeometry args={[100, 64]} /> */}
            <cylinderGeometry args={[10, 10, 1, 64]} />
            <meshStandardMaterial color="white"  receiveShadow/>
          </mesh>

        </Suspense>
      </Canvas>
      {isMobile && <VirtualDpad onDirectionChange={setMobileControls} />}
    </KeyboardControls>
  )
}

export default App