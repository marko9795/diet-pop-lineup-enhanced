import React, { Suspense, useEffect, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { WebGLErrorBoundary, Scene3DFallback, LoadingFallback } from '../error';
import { detectWebGLSupport, WebGLContextManager } from '../../utils/webglDetection';
import { detectDeviceCapabilities } from '../../utils/deviceCapabilities';

interface Scene3DWithErrorHandlingProps {
  children: React.ReactNode;
  enableControls?: boolean;
  cameraPosition?: [number, number, number];
  className?: string;
  touchOptimized?: boolean;
  onError?: (error: Error) => void;
  fallbackMessage?: string;
}

export function Scene3DWithErrorHandling({
  children,
  enableControls = true,
  cameraPosition = [0, 0, 5],
  className = "w-full h-full",
  touchOptimized = false,
  onError,
  fallbackMessage
}: Scene3DWithErrorHandlingProps) {
  const [webglSupport, setWebglSupport] = useState<any>(null);
  const [contextLost, setContextLost] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextManagerRef = useRef<WebGLContextManager | null>(null);

  // Check WebGL support on mount
  useEffect(() => {
    const support = detectWebGLSupport();
    setWebglSupport(support);

    if (!support.supported && onError) {
      onError(new Error(`WebGL not supported: ${support.limitations.join(', ')}`));
    }
  }, [onError, retryCount]);

  // Setup WebGL context management
  useEffect(() => {
    if (canvasRef.current && webglSupport?.supported) {
      contextManagerRef.current = new WebGLContextManager(
        canvasRef.current,
        () => {
          console.warn('WebGL context lost in Scene3D');
          setContextLost(true);
        },
        () => {
          console.log('WebGL context restored in Scene3D');
          setContextLost(false);
        }
      );

      return () => {
        if (contextManagerRef.current) {
          contextManagerRef.current.dispose();
        }
      };
    }
  }, [webglSupport?.supported]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setContextLost(false);
  };

  // Show fallback if WebGL is not supported
  if (!webglSupport) {
    return (
      <div className={className}>
        <LoadingFallback message="Checking 3D graphics support..." />
      </div>
    );
  }

  if (!webglSupport.supported) {
    return (
      <div className={className}>
        <Scene3DFallback 
          message={fallbackMessage || "3D graphics not supported on this device"}
        />
      </div>
    );
  }

  // Show fallback if context is lost
  if (contextLost) {
    return (
      <div className={className}>
        <Scene3DFallback 
          message="3D graphics context lost - click to retry"
        />
      </div>
    );
  }

  const capabilities = detectDeviceCapabilities();
  
  // Canvas configuration based on device capabilities
  const canvasConfig = {
    camera: { 
      position: cameraPosition,
      fov: touchOptimized ? 60 : 50
    },
    gl: {
      antialias: capabilities.performanceTier !== 'low',
      alpha: false,
      powerPreference: capabilities.performanceTier === 'high' ? 'high-performance' : 'default',
      stencil: false,
      depth: true,
    },
    dpr: Math.min(capabilities.devicePixelRatio, capabilities.performanceTier === 'low' ? 1 : 2),
    performance: {
      min: capabilities.performanceTier === 'low' ? 0.2 : 0.5,
      max: 1,
      debounce: capabilities.performanceTier === 'low' ? 200 : 100,
    },
    frameloop: 'demand' as const,
  };

  return (
    <div className={className}>
      <WebGLErrorBoundary
        onWebGLError={(error, caps) => {
          console.error('WebGL Error in Scene3D:', error, caps);
          if (onError) onError(error);
        }}
        fallback={
          <Scene3DFallback 
            message={fallbackMessage || "3D graphics encountered an error"}
          />
        }
      >
        <Suspense 
          fallback={
            <LoadingFallback 
              message="Loading 3D scene..." 
              timeout={8000}
              onCancel={handleRetry}
            />
          }
        >
          <Canvas
            ref={canvasRef}
            {...canvasConfig}
            onCreated={({ gl, scene, camera }) => {
              // Configure renderer for better performance
              gl.setClearColor('#000000', 0);
              gl.shadowMap.enabled = capabilities.performanceTier !== 'low';
              gl.shadowMap.type = capabilities.performanceTier === 'high' ? 2 : 0; // PCFSoftShadowMap : BasicShadowMap
              
              // Set up tone mapping for better visuals
              gl.toneMapping = 1; // ACESFilmicToneMapping
              gl.toneMappingExposure = 1.2;
            }}
            onError={(error) => {
              console.error('Canvas error:', error);
              if (onError) onError(error);
            }}
          >
            {/* Lighting setup */}
            <ambientLight intensity={0.4} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={1}
              castShadow={capabilities.performanceTier !== 'low'}
              shadow-mapSize-width={capabilities.performanceTier === 'high' ? 2048 : 1024}
              shadow-mapSize-height={capabilities.performanceTier === 'high' ? 2048 : 1024}
            />
            <pointLight position={[-10, -10, -10]} intensity={0.3} />

            {/* Environment for reflections (high performance only) */}
            {capabilities.performanceTier === 'high' && (
              <Environment preset="studio" />
            )}

            {/* Controls */}
            {enableControls && (
              <OrbitControls
                enablePan={!touchOptimized}
                enableZoom={true}
                enableRotate={true}
                minDistance={touchOptimized ? 2 : 1}
                maxDistance={touchOptimized ? 8 : 10}
                maxPolarAngle={Math.PI / 1.8}
                minPolarAngle={Math.PI / 6}
                dampingFactor={touchOptimized ? 0.1 : 0.05}
                enableDamping={true}
                rotateSpeed={touchOptimized ? 0.8 : 0.5}
                zoomSpeed={touchOptimized ? 0.8 : 1}
                panSpeed={touchOptimized ? 0.8 : 1}
                touches={{
                  ONE: touchOptimized ? 2 : 0, // ROTATE
                  TWO: touchOptimized ? 1 : 2, // DOLLY (zoom)
                }}
              />
            )}

            {/* Scene content */}
            {children}
          </Canvas>
        </Suspense>
      </WebGLErrorBoundary>
    </div>
  );
}