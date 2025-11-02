import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Stats } from '@react-three/drei';
import { Suspense, useEffect, useRef, useState } from 'react';
import { AdaptiveQualityManager, RenderQuality } from '../../utils/performance';

interface Scene3DOptimizedProps {
  children: React.ReactNode;
  enableControls?: boolean;
  cameraPosition?: [number, number, number];
  className?: string;
  showStats?: boolean;
  onQualityChange?: (quality: RenderQuality) => void;
}

export function Scene3DOptimized({ 
  children, 
  enableControls = true, 
  cameraPosition = [0, 0, 5],
  className = "w-full h-full",
  showStats = false,
  onQualityChange
}: Scene3DOptimizedProps) {
  const qualityManagerRef = useRef<AdaptiveQualityManager>();
  const [renderQuality, setRenderQuality] = useState<RenderQuality | null>(null);

  // Initialize quality manager
  useEffect(() => {
    qualityManagerRef.current = new AdaptiveQualityManager();
    const initialQuality = qualityManagerRef.current.getCurrentQuality();
    setRenderQuality(initialQuality);
    onQualityChange?.(initialQuality);

    return () => {
      qualityManagerRef.current?.dispose();
    };
  }, [onQualityChange]);

  // Performance monitoring
  useEffect(() => {
    let animationId: number;
    
    const updatePerformance = (currentTime: number) => {
      if (qualityManagerRef.current) {
        qualityManagerRef.current.update(currentTime);
        
        const newQuality = qualityManagerRef.current.getCurrentQuality();
        if (JSON.stringify(newQuality) !== JSON.stringify(renderQuality)) {
          setRenderQuality(newQuality);
          onQualityChange?.(newQuality);
        }
      }
      
      animationId = requestAnimationFrame(updatePerformance);
    };

    animationId = requestAnimationFrame(updatePerformance);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [renderQuality, onQualityChange]);

  if (!renderQuality) {
    return (
      <div className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}>
        <div className="text-gray-500">Loading 3D Scene...</div>
      </div>
    );
  }

  return (
    <Canvas 
      className={className}
      dpr={[1, renderQuality.antialiasing ? 2 : 1]}
      performance={{ min: 0.5 }}
      gl={{ 
        antialias: renderQuality.antialiasing,
        alpha: true,
        powerPreference: "high-performance"
      }}
    >
      <PerspectiveCamera makeDefault position={cameraPosition} />
      
      {/* Adaptive Lighting */}
      <ambientLight intensity={0.4} />
      
      {renderQuality.maxLights >= 1 && (
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1} 
          castShadow={renderQuality.shadowsEnabled}
          shadow-mapSize-width={renderQuality.shadowsEnabled ? 1024 : 512}
          shadow-mapSize-height={renderQuality.shadowsEnabled ? 1024 : 512}
        />
      )}
      
      {renderQuality.maxLights >= 2 && (
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
      )}
      
      {renderQuality.maxLights >= 3 && (
        <spotLight 
          position={[0, 10, 0]} 
          intensity={0.3}
          angle={Math.PI / 6}
          penumbra={0.5}
        />
      )}
      
      {/* Environment mapping based on quality */}
      {renderQuality.environmentMapping && (
        <Environment preset="studio" />
      )}
      
      {/* Orbital controls */}
      {enableControls && (
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={10}
          maxPolarAngle={Math.PI / 1.5}
          enableDamping={true}
          dampingFactor={0.05}
        />
      )}
      
      {/* Performance stats */}
      {showStats && <Stats />}
      
      <Suspense fallback={null}>
        {children}
      </Suspense>
    </Canvas>
  );
}