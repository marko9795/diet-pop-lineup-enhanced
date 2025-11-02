import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { Suspense } from 'react';
import { TouchControls } from './TouchControls';
import { useResponsive } from '../../hooks/useResponsive';
import { useAdaptiveQuality } from '../../hooks/useAdaptiveQuality';

interface Scene3DProps {
  children: React.ReactNode;
  enableControls?: boolean;
  cameraPosition?: [number, number, number];
  className?: string;
  touchOptimized?: boolean;
}

export function Scene3D({ 
  children, 
  enableControls = true, 
  cameraPosition = [0, 0, 5],
  className = "w-full h-full",
  touchOptimized = false
}: Scene3DProps) {
  const { isTouchDevice, isMobile } = useResponsive();
  const { settings } = useAdaptiveQuality(true);
  return (
    <Canvas 
      className={className}
      dpr={settings.pixelRatio}
      gl={{ 
        antialias: settings.antialias,
        alpha: true,
        powerPreference: isMobile ? 'low-power' : 'high-performance',
      }}
      shadows={settings.shadowMapSize > 0}
    >
      <PerspectiveCamera makeDefault position={cameraPosition} />
      
      {/* Adaptive lighting setup */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1} 
        castShadow={settings.shadowMapSize > 0}
        shadow-mapSize-width={settings.shadowMapSize}
        shadow-mapSize-height={settings.shadowMapSize}
      />
      {settings.maxLights > 1 && (
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
      )}
      {settings.maxLights > 2 && (
        <pointLight position={[5, -5, 5]} intensity={0.3} />
      )}
      
      {/* Environment for reflections - only if enabled */}
      {settings.enableReflections && <Environment preset="studio" />}
      
      {/* Controls for interaction */}
      {enableControls && (
        <>
          {/* Use touch controls on mobile/touch devices or when explicitly requested */}
          {(isTouchDevice || touchOptimized) ? (
            <TouchControls
              enableRotation={true}
              enableZoom={true}
              enablePan={isMobile ? false : true} // Disable pan on mobile to avoid conflicts
              rotationSpeed={isMobile ? 0.8 : 1}
              zoomSpeed={isMobile ? 0.6 : 1}
              minDistance={isMobile ? 3 : 2}
              maxDistance={isMobile ? 8 : 10}
            />
          ) : (
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={2}
              maxDistance={10}
              maxPolarAngle={Math.PI / 1.5}
              // Optimize for desktop
              enableDamping={true}
              dampingFactor={0.05}
            />
          )}
        </>
      )}
      
      <Suspense fallback={null}>
        {children}
      </Suspense>
    </Canvas>
  );
}