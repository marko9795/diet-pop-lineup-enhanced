import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, Gauge } from 'lucide-react';
import { Scene3DOptimized } from './Scene3DOptimized';
import { PopModel3DOptimized } from './PopModel3DOptimized';
import { PopCard } from '../cards/PopCard';
import { Pop } from '../../types';
import { RenderQuality, AdaptiveQualityManager } from '../../utils/performance';

interface PopViewerOptimizedProps {
  pop: Pop | null;
  isOpen: boolean;
  onClose: () => void;
  showPerformanceStats?: boolean;
}

export function PopViewerOptimized({ 
  pop, 
  isOpen, 
  onClose, 
  showPerformanceStats = false 
}: PopViewerOptimizedProps) {
  const [showCard, setShowCard] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [renderQuality, setRenderQuality] = useState<RenderQuality | null>(null);
  const [fps, setFPS] = useState(60);
  const qualityManagerRef = useRef<AdaptiveQualityManager>();
  const resourcesRef = useRef<Array<{ dispose: () => void }>>([]);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize quality manager
  useEffect(() => {
    if (isOpen) {
      qualityManagerRef.current = new AdaptiveQualityManager();
      setRenderQuality(qualityManagerRef.current.getCurrentQuality());
    }

    return () => {
      if (qualityManagerRef.current) {
        qualityManagerRef.current.dispose();
      }
      // Dispose of all registered resources
      resourcesRef.current.forEach(resource => {
        try {
          resource.dispose();
        } catch (error) {
          console.warn('Error disposing resource:', error);
        }
      });
      resourcesRef.current = [];
    };
  }, [isOpen]);

  // Show card after a brief delay when modal opens (desktop only)
  useEffect(() => {
    if (isOpen && pop && !isMobile) {
      const timer = setTimeout(() => setShowCard(true), 300);
      return () => clearTimeout(timer);
    } else if (!isOpen || isMobile) {
      setShowCard(false);
    }
  }, [isOpen, pop, isMobile]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Performance monitoring
  useEffect(() => {
    if (!isOpen || !qualityManagerRef.current) return;

    const interval = setInterval(() => {
      if (qualityManagerRef.current) {
        setFPS(qualityManagerRef.current.getFPS());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleQualityChange = (quality: RenderQuality) => {
    setRenderQuality(quality);
  };

  const handleResourceLoad = (resource: { dispose: () => void }) => {
    resourcesRef.current.push(resource);
    if (qualityManagerRef.current) {
      qualityManagerRef.current.registerDisposable(resource);
    }
  };

  if (!pop || !renderQuality) return null;

  // Mobile Layout
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            <div className="absolute inset-0 bg-black/90" />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full h-full flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-sm">
                <h2 className="text-white text-lg font-semibold truncate">
                  {pop.name}
                </h2>
                <div className="flex items-center space-x-2">
                  {showPerformanceStats && (
                    <div className="flex items-center space-x-1 bg-white/10 rounded-full px-2 py-1">
                      <Gauge className="w-4 h-4 text-white" />
                      <span className="text-white text-xs">{fps}fps</span>
                    </div>
                  )}
                  <button
                    onClick={() => setShowCard(!showCard)}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <Info className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* 3D Viewer */}
              <div className="flex-1 relative">
                <Scene3DOptimized 
                  enableControls={true}
                  cameraPosition={[0, 0, 4]}
                  className="w-full h-full"
                  showStats={showPerformanceStats}
                  onQualityChange={handleQualityChange}
                >
                  <PopModel3DOptimized
                    pop={pop}
                    position={[0, 0, 0]}
                    animate={false}
                    showLabel={false}
                    renderQuality={renderQuality}
                    scale={1.2}
                    onResourceLoad={handleResourceLoad}
                  />
                </Scene3DOptimized>
                
                {/* Touch Controls Hint */}
                <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                  <p className="text-white text-sm text-center">
                    Touch to rotate • Pinch to zoom • Two fingers to pan
                  </p>
                </div>
              </div>

              {/* Sliding Pop Card */}
              <AnimatePresence>
                {showCard && (
                  <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="absolute bottom-0 left-0 right-0 max-h-[60vh] overflow-y-auto"
                  >
                    <div className="p-4">
                      <PopCard pop={pop} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Desktop Layout
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full h-full max-w-7xl max-h-screen flex"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Performance Stats */}
            {showPerformanceStats && (
              <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                <div className="flex items-center space-x-2 text-white text-sm">
                  <Gauge className="w-4 h-4" />
                  <span>FPS: {fps}</span>
                  <span>Quality: {renderQuality.textureQuality}</span>
                  <span>Geometry: {renderQuality.geometryDetail}</span>
                </div>
              </div>
            )}

            {/* 3D Viewer Section */}
            <div className="flex-1 relative">
              <Scene3DOptimized 
                enableControls={true}
                cameraPosition={[0, 0, 4]}
                className="w-full h-full"
                showStats={showPerformanceStats}
                onQualityChange={handleQualityChange}
              >
                <PopModel3DOptimized
                  pop={pop}
                  position={[0, 0, 0]}
                  animate={false}
                  showLabel={false}
                  renderQuality={renderQuality}
                  scale={1.5}
                  onResourceLoad={handleResourceLoad}
                />
              </Scene3DOptimized>
              
              {/* 3D Controls Hint */}
              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                <p className="text-white text-sm">
                  Drag to rotate • Scroll to zoom • Right-click to pan
                </p>
              </div>
            </div>

            {/* Pop Card Section */}
            <AnimatePresence>
              {showCard && (
                <motion.div
                  initial={{ x: 400, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 400, opacity: 0 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="w-96 p-6 flex items-center"
                >
                  <PopCard pop={pop} className="w-full" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}