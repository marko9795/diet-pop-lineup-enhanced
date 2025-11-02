import { useRef, useMemo, Suspense, useEffect, useState } from 'react';
import { Mesh, Color, TextureLoader } from 'three';
import { useFrame, useLoader } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { Pop } from '../../types';
import { useAdaptiveQuality, useMemoryManagement } from '../../hooks/useAdaptiveQuality';
import { PopModel3DFallback } from '../error';

interface PopModel3DEnhancedProps {
  pop: Pop;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  animate?: boolean;
  showLabel?: boolean;
  quality?: 'low' | 'medium' | 'high';
}

function PopModel3DContent({ 
  pop, 
  position = [0, 0, 0], 
  rotation = [0, 0, 0],
  scale = 1,
  animate = false,
  showLabel = false,
  quality = 'medium'
}: PopModel3DEnhancedProps) {
  const meshRef = useRef<Mesh>(null);
  const { settings } = useAdaptiveQuality(true);
  const { disposeObject } = useMemoryManagement();
  const [textureError, setTextureError] = useState(false);
  const [normalMapError, setNormalMapError] = useState(false);
  
  // Use adaptive quality if not explicitly overridden
  const effectiveQuality = quality === 'medium' ? settings.modelQuality : quality;
  
  // Load textures progressively based on quality
  const shouldLoadHighResTexture = effectiveQuality === 'high' && settings.textureQuality === 'high';
  const textureUrl = shouldLoadHighResTexture ? pop.modelAssets.texture : pop.modelAssets.texture;
  
  const texture = useLoader(TextureLoader, textureUrl, undefined, (error) => {
    console.warn(`Failed to load texture for ${pop.name}:`, error);
    setTextureError(true);
  });
  
  const normalMap = (pop.modelAssets.normalMap && effectiveQuality !== 'low' && !normalMapError)
    ? useLoader(TextureLoader, pop.modelAssets.normalMap, undefined, (error) => {
        console.warn(`Failed to load normal map for ${pop.name}:`, error);
        setNormalMapError(true);
      })
    : null;

  // Geometry detail based on adaptive quality
  const geometryDetail = useMemo(() => {
    switch (effectiveQuality) {
      case 'low': return Math.max(8, 16);
      case 'medium': return Math.max(16, 32);
      case 'high': return Math.max(32, 64);
      default: return 32;
    }
  }, [effectiveQuality]);

  // Dispose of resources when component unmounts
  useEffect(() => {
    const objectId = `pop-model-${pop.id}`;
    
    return () => {
      disposeObject(objectId, () => {
        if (texture) texture.dispose();
        if (normalMap) normalMap.dispose();
      });
    };
  }, [pop.id, texture, normalMap, disposeObject]);

  // Create dynamic material based on pop brand colors and adaptive settings
  const material = useMemo(() => {
    const primaryColor = new Color(pop.brandColors.primary);
    
    const baseMaterial = {
      color: primaryColor,
      map: textureError ? null : texture,
      normalMap: normalMapError ? null : normalMap,
      emissive: primaryColor.clone().multiplyScalar(0.05),
    };

    // Add advanced material properties based on quality
    if (effectiveQuality === 'high' && settings.enableReflections) {
      return {
        ...baseMaterial,
        metalness: 0.9,
        roughness: 0.1,
        envMapIntensity: 1.5,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
      };
    } else if (effectiveQuality === 'medium') {
      return {
        ...baseMaterial,
        metalness: 0.7,
        roughness: 0.2,
        envMapIntensity: 1.0,
      };
    } else {
      return {
        ...baseMaterial,
        metalness: 0.5,
        roughness: 0.3,
        envMapIntensity: 0.5,
      };
    }
  }, [pop.brandColors.primary, texture, normalMap, effectiveQuality, settings.enableReflections, textureError, normalMapError]);

  // Optional rotation animation
  useFrame((_, delta) => {
    if (animate && meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Main can body with texture */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 0.6, 2.4, geometryDetail]} />
        <meshStandardMaterial
          {...material}
        />
      </mesh>
      
      {/* Can top (aluminum) */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.58, 0.58, 0.05, geometryDetail]} />
        <meshStandardMaterial
          color="#E8E8E8"
          metalness={1.0}
          roughness={0.05}
          envMapIntensity={2}
        />
      </mesh>
      
      {/* Can bottom (aluminum) */}
      <mesh position={[0, -1.2, 0]} receiveShadow>
        <cylinderGeometry args={[0.58, 0.58, 0.05, geometryDetail]} />
        <meshStandardMaterial
          color="#E8E8E8"
          metalness={1.0}
          roughness={0.05}
          envMapIntensity={2}
        />
      </mesh>
      
      {/* Brand accent ring */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.61, 0.61, 0.1, geometryDetail]} />
        <meshStandardMaterial
          color={pop.brandColors.accent || pop.brandColors.secondary}
          metalness={0.8}
          roughness={0.2}
          envMapIntensity={1.2}
        />
      </mesh>
      
      {/* Pop tab with realistic details */}
      <group position={[0, 1.25, 0.2]}>
        <mesh>
          <boxGeometry args={[0.3, 0.05, 0.15]} />
          <meshStandardMaterial
            color="#D0D0D0"
            metalness={1.0}
            roughness={0.1}
          />
        </mesh>
        {/* Tab pull ring */}
        <mesh position={[0, 0.03, -0.05]}>
          <torusGeometry args={[0.08, 0.02, 8, 16]} />
          <meshStandardMaterial
            color="#C0C0C0"
            metalness={1.0}
            roughness={0.1}
          />
        </mesh>
      </group>
      
      {/* Brand label overlay */}
      {showLabel && (
        <>
          <Text
            position={[0, 0.2, 0.61]}
            rotation={[0, 0, 0]}
            fontSize={0.15}
            color={pop.brandColors.secondary}
            anchorX="center"
            anchorY="middle"
            maxWidth={2}
            font="/fonts/roboto-bold.woff"
          >
            {pop.brand}
          </Text>
          
          <Text
            position={[0, -0.1, 0.61]}
            rotation={[0, 0, 0]}
            fontSize={0.12}
            color={pop.brandColors.secondary}
            anchorX="center"
            anchorY="middle"
            maxWidth={2}
            font="/fonts/roboto-regular.woff"
          >
            {pop.name}
          </Text>
          
          <Text
            position={[0, -0.4, 0.61]}
            rotation={[0, 0, 0]}
            fontSize={0.08}
            color={pop.brandColors.secondary}
            anchorX="center"
            anchorY="middle"
            font="/fonts/roboto-regular.woff"
          >
            {pop.caffeine}mg caffeine
          </Text>
        </>
      )}
    </group>
  );
}

export function PopModel3DEnhanced(props: PopModel3DEnhancedProps) {
  return (
    <Suspense fallback={
      <mesh position={props.position} scale={props.scale}>
        <cylinderGeometry args={[0.6, 0.6, 2.4, 16]} />
        <meshStandardMaterial color="#cccccc" />
      </mesh>
    }>
      <PopModel3DContent {...props} />
    </Suspense>
  );
}