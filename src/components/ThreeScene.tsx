import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { 
  Float, 
  MeshTransmissionMaterial, 
  Environment, 
  Center,
  RoundedBox
} from '@react-three/drei'
import * as THREE from 'three'

function GlassV() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.15
      groupRef.current.rotation.x = Math.cos(state.clock.getElapsedTime() * 0.2) * 0.05
    }
  })

  const materialProps = {
    backside: true,
    samples: 30,
    resolution: 1024,
    transmission: 1,
    roughness: 0,
    thickness: 1.2,
    ior: 1.4,
    chromaticAberration: 0.04,
    anisotropy: 0.3,
    distortion: 0.1,
    color: "#3B82F6",
    attenuationDistance: 0.5,
    attenuationColor: "#3B82F6"
  }

  return (
    <Center top>
      <group ref={groupRef}>
        {/* Left Arm of V */}
        <RoundedBox 
          args={[0.4, 2.2, 0.4]} 
          radius={0.15} 
          smoothness={10}
          position={[-0.45, 0, 0]} 
          rotation={[0, 0, Math.PI / 9]}
        >
          <MeshTransmissionMaterial {...materialProps} />
        </RoundedBox>
        
        {/* Right Arm of V */}
        <RoundedBox 
          args={[0.4, 2.2, 0.4]} 
          radius={0.15} 
          smoothness={10}
          position={[0.45, 0, 0]} 
          rotation={[0, 0, -Math.PI / 9]}
        >
          <MeshTransmissionMaterial {...materialProps} />
        </RoundedBox>
      </group>
    </Center>
  )
}

export default function ThreeScene() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <pointLight position={[-10, -10, -10]} color="#3B82F6" intensity={2} />
        
        <Float speed={2.5} rotationIntensity={0.5} floatIntensity={1}>
          <GlassV />
        </Float>
        
        <Environment preset="city" />
      </Canvas>
    </div>
  )
}
