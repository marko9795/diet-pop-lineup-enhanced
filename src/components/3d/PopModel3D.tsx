import { useRef, useMemo } from 'react';
import { Mesh, Color, MeshStandardMaterial } from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { Pop } from '../../types';

interface PopModel3DProps {
  pop: Pop;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  animate?: boolean;
  showLabel?: boolean;
}

export function PopModel3D({ 
  pop, 
  position = [0, 0, 0], 
  rotation = [0, 0, 0],
  scale = 1,
  animate = false,
  showLabel = false
}: PopModel3DProps) {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);

  // Create dynamic material based on pop brand colors
  const material = useMemo(() => {
    const primaryColor = new Color(pop.brandColors.primary);
    
    return {
      color: primaryColor,
      emissive: primaryColor.clone().multiplyScalar(0.1),
      metalness: 0.9,
      roughness: 0.1,
      envMapIntensity: 1.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    };
  }, [pop.brandColors.primary]);

  // Optional rotation animation
  useFrame((_, delta) => {
    if (animate && meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Main can body */}
      <mesh ref={meshRef}>
        <cylinderGeometry args={[0.6, 0.6, 2.4, 32]} />
        <meshStandardMaterial
          ref={materialRef}
          {...material}
        />
      </mesh>
      
      {/* Can top */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.58, 0.58, 0.05, 32]} />
        <meshStandardMaterial
          color="#C0C0C0"
          metalness={1.0}
          roughness={0.1}
          envMapIntensity={2}
        />
      </mesh>
      
      {/* Can bottom */}
      <mesh position={[0, -1.2, 0]}>
        <cylinderGeometry args={[0.58, 0.58, 0.05, 32]} />
        <meshStandardMaterial
          color="#C0C0C0"
          metalness={1.0}
          roughness={0.1}
          envMapIntensity={2}
        />
      </mesh>
      
      {/* Brand accent ring */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.61, 0.61, 0.1, 32]} />
        <meshStandardMaterial
          color={pop.brandColors.accent || pop.brandColors.secondary}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Pop tab */}
      <mesh position={[0, 1.25, 0.2]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.3, 0.05, 0.15]} />
        <meshStandardMaterial
          color="#C0C0C0"
          metalness={1.0}
          roughness={0.1}
        />
      </mesh>
      
      {/* Brand label (simplified text representation) */}
      {showLabel && (
        <Text
          position={[0, 0, 0.61]}
          rotation={[0, 0, 0]}
          fontSize={0.2}
          color={pop.brandColors.secondary}
          anchorX="center"
          anchorY="middle"
          maxWidth={2}
          font="/fonts/roboto-bold.woff"
        >
          {pop.brand}
        </Text>
      )}
      
      {/* Caffeine indicator (small text) */}
      {showLabel && (
        <Text
          position={[0, -0.5, 0.61]}
          rotation={[0, 0, 0]}
          fontSize={0.1}
          color={pop.brandColors.secondary}
          anchorX="center"
          anchorY="middle"
          font="/fonts/roboto-regular.woff"
        >
          {pop.caffeine}mg
        </Text>
      )}
    </group>
  );
}