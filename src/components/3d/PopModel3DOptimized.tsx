import { useRef, useMemo, useEffect } from 'react';
import { Color, TextureLoader, Group } from 'three';
import { useFrame, useLoader } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { Pop } from '../../types';
import { RenderQuality } from '../../utils/performance';

interface PopModel3DOptimizedProps {
  pop: Pop;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  animate?: boolean;
  showLabel?: boolean;
  renderQuality: RenderQuality;
  onResourceLoad?: (resource: { dispose: () => void }) => void;
}

export function PopModel3DOptimized({ 
  pop, 
  position = [0, 0, 0], 
  rotation = [0, 0, 0],
  scale = 1,
  animate = false,
  showLabel = false,
  renderQuality,
  onResourceLoad
}: PopModel3DOptimizedProps) {
  const groupRef = useRef<Group>(null);
  
  // Load textures with error handling and quality-based resolution
  const textureUrl = useMemo(() => {
    const baseUrl = pop.modelAssets.texture;
    switch (renderQuality.textureQuality) {
      case 'low': return baseUrl.replace('.jpg', '_low.jpg').replace('.png', '_low.png');
      case 'medium': return baseUrl.replace('.jpg', '_med.jpg').replace('.png', '_med.png');
      case 'high': 
      default: return baseUrl;
    }
  }, [pop.modelAssets.texture, renderQuality.textureQuality]);

  const texture = useLoader(TextureLoader, textureUrl, undefined, (error) => {
    console.warn(`Failed to load texture for ${pop.name}:`, error);
  });

  const normalMap = pop.modelAssets.normalMap && renderQuality.textureQuality !== 'low'
    ? useLoader(TextureLoader, pop.modelAssets.normalMap, undefined, (error) => {
        console.warn(`Failed to load normal map for ${pop.name}:`, error);
      })
    : null;

  // Register resources for disposal
  useEffect(() => {
    if (texture && onResourceLoad) {
      onResourceLoad(texture);
    }
    if (normalMap && onResourceLoad) {
      onResourceLoad(normalMap);
    }
  }, [texture, normalMap, onResourceLoad]);

  // Create LOD levels based on render quality
  const lodLevels = useMemo(() => {
    const baseDetail = renderQuality.geometryDetail;
    return [
      { distance: 0, detail: baseDetail },
      { distance: 5, detail: Math.max(16, Math.floor(baseDetail * 0.7)) },
      { distance: 10, detail: Math.max(8, Math.floor(baseDetail * 0.4)) }
    ];
  }, [renderQuality.geometryDetail]);

  // Create dynamic material based on pop brand colors and quality
  const material = useMemo(() => {
    const primaryColor = new Color(pop.brandColors.primary);
    
    const baseMaterial = {
      color: primaryColor,
      emissive: primaryColor.clone().multiplyScalar(0.05),
      metalness: renderQuality.environmentMapping ? 0.9 : 0.7,
      roughness: 0.1,
      envMapIntensity: renderQuality.environmentMapping ? 1.5 : 0.5,
    };

    if (renderQuality.textureQuality !== 'low') {
      return {
        ...baseMaterial,
        map: texture,
        normalMap: normalMap,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1
      };
    }

    return baseMaterial;
  }, [pop.brandColors.primary, texture, normalMap, renderQuality]);

  // Optional rotation animation with performance consideration
  useFrame((_, delta) => {
    if (animate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  // Create can geometry for different LOD levels
  const createCanGeometry = (detail: number) => (
    <group>
      {/* Main can body */}
      <mesh castShadow={renderQuality.shadowsEnabled} receiveShadow={renderQuality.shadowsEnabled}>
        <cylinderGeometry args={[0.6, 0.6, 2.4, detail]} />
        <meshStandardMaterial {...material} />
      </mesh>
      
      {/* Can top */}
      <mesh position={[0, 1.2, 0]} castShadow={renderQuality.shadowsEnabled}>
        <cylinderGeometry args={[0.58, 0.58, 0.05, detail]} />
        <meshStandardMaterial
          color="#E8E8E8"
          metalness={1.0}
          roughness={0.05}
          envMapIntensity={renderQuality.environmentMapping ? 2 : 1}
        />
      </mesh>
      
      {/* Can bottom */}
      <mesh position={[0, -1.2, 0]} receiveShadow={renderQuality.shadowsEnabled}>
        <cylinderGeometry args={[0.58, 0.58, 0.05, detail]} />
        <meshStandardMaterial
          color="#E8E8E8"
          metalness={1.0}
          roughness={0.05}
          envMapIntensity={renderQuality.environmentMapping ? 2 : 1}
        />
      </mesh>
      
      {/* Brand accent ring - only on higher quality */}
      {detail >= 24 && (
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.61, 0.61, 0.1, detail]} />
          <meshStandardMaterial
            color={pop.brandColors.accent || pop.brandColors.secondary}
            metalness={0.8}
            roughness={0.2}
            envMapIntensity={renderQuality.environmentMapping ? 1.2 : 0.8}
          />
        </mesh>
      )}
      
      {/* Pop tab - only on highest quality */}
      {detail >= 32 && (
        <group position={[0, 1.25, 0.2]}>
          <mesh>
            <boxGeometry args={[0.3, 0.05, 0.15]} />
            <meshStandardMaterial
              color="#D0D0D0"
              metalness={1.0}
              roughness={0.1}
            />
          </mesh>
          <mesh position={[0, 0.03, -0.05]}>
            <torusGeometry args={[0.08, 0.02, 8, 16]} />
            <meshStandardMaterial
              color="#C0C0C0"
              metalness={1.0}
              roughness={0.1}
            />
          </mesh>
        </group>
      )}
    </group>
  );

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* LOD System */}
      {lodLevels.map((level, index) => (
        <group key={index}>
          {createCanGeometry(level.detail)}
        </group>
      ))}
      
      {/* Brand labels - only show on medium+ quality */}
      {showLabel && renderQuality.textureQuality !== 'low' && (
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
          
          {renderQuality.textureQuality === 'high' && (
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
          )}
        </>
      )}
    </group>
  );
}