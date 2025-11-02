import { useRef } from 'react';
import { Mesh } from 'three';
import { useFrame } from '@react-three/fiber';

interface BasicCanProps {
  color?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  animate?: boolean;
}

export function BasicCan({ 
  color = '#ff6b6b', 
  position = [0, 0, 0], 
  rotation = [0, 0, 0],
  scale = 1,
  animate = false
}: BasicCanProps) {
  const meshRef = useRef<Mesh>(null);

  // Optional rotation animation
  useFrame((_, delta) => {
    if (animate && meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
      {/* Cylindrical can geometry - standard soda can proportions */}
      <cylinderGeometry args={[0.6, 0.6, 2.4, 32]} />
      
      {/* Basic metallic material */}
      <meshStandardMaterial 
        color={color}
        metalness={0.8}
        roughness={0.2}
        envMapIntensity={1}
      />
    </mesh>
  );
}