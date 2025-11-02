import { useState, useEffect, Suspense } from 'react';
import { useProgressiveLoading } from '../../hooks/useAdaptiveQuality';

interface ProgressiveLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingStages?: ('geometry' | 'textures' | 'complete')[];
  onStageComplete?: (stage: string) => void;
}

export function ProgressiveLoader({ 
  children, 
  fallback,
  loadingStages = ['geometry', 'textures', 'complete'],
  onStageComplete 
}: ProgressiveLoaderProps) {
  const { advanceLoadingStage } = useProgressiveLoading();
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStageIndex < loadingStages.length - 1) {
        advanceLoadingStage();
        setCurrentStageIndex(prev => prev + 1);
        onStageComplete?.(loadingStages[currentStageIndex]);
      }
    }, 500); // 500ms delay between stages

    return () => clearTimeout(timer);
  }, [currentStageIndex, loadingStages, advanceLoadingStage, onStageComplete]);

  const LoadingFallback = () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <div className="text-sm text-gray-600">
          Loading {loadingStages[currentStageIndex]}...
        </div>
        <div className="w-32 bg-gray-200 rounded-full h-1 mt-2">
          <div 
            className="bg-blue-500 h-1 rounded-full transition-all duration-300"
            style={{ width: `${((currentStageIndex + 1) / loadingStages.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );

  return (
    <Suspense fallback={fallback || <LoadingFallback />}>
      {children}
    </Suspense>
  );
}

// Lightweight fallback component for 3D models
export function Model3DFallback({ 
  color = '#cccccc',
  position = [0, 0, 0],
  scale = 1 
}: {
  color?: string;
  position?: [number, number, number];
  scale?: number;
}) {
  return (
    <mesh position={position} scale={scale}>
      <cylinderGeometry args={[0.6, 0.6, 2.4, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.7} />
    </mesh>
  );
}

// Progressive texture loader
export function useProgressiveTextures(textureUrls: string[], quality: 'low' | 'medium' | 'high') {
  const [loadedTextures, setLoadedTextures] = useState<Map<string, any>>(new Map());
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;
    
    const loadTextures = async () => {
      const texturesToLoad = textureUrls.slice(0, getTextureCountForQuality(quality));
      
      for (let i = 0; i < texturesToLoad.length; i++) {
        if (cancelled) break;
        
        try {
          // Simulate progressive loading
          await new Promise(resolve => setTimeout(resolve, 100));
          
          if (!cancelled) {
            setLoadedTextures(prev => new Map(prev.set(texturesToLoad[i], true)));
            setLoadingProgress((i + 1) / texturesToLoad.length);
          }
        } catch (error) {
          console.warn(`Failed to load texture: ${texturesToLoad[i]}`, error);
        }
      }
    };

    loadTextures();

    return () => {
      cancelled = true;
    };
  }, [textureUrls, quality]);

  return {
    loadedTextures,
    loadingProgress,
    isComplete: loadingProgress === 1,
  };
}

function getTextureCountForQuality(quality: 'low' | 'medium' | 'high'): number {
  switch (quality) {
    case 'low': return 1; // Only base texture
    case 'medium': return 2; // Base + normal
    case 'high': return 3; // Base + normal + additional maps
    default: return 1;
  }
}