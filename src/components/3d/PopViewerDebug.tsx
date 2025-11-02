import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Scene3D } from './Scene3D';
import { PopModel3D } from './PopModel3D';
import { PopCard } from '../cards/PopCard';
import { Pop } from '../../types';

interface PopViewerDebugProps {
  pop: Pop | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PopViewerDebug({ pop, isOpen, onClose }: PopViewerDebugProps) {
  const [showCard, setShowCard] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
  };

  useEffect(() => {
    if (isOpen && pop) {
      addDebugInfo(`Modal opened for ${pop.name}`);
      const timer = setTimeout(() => {
        setShowCard(true);
        addDebugInfo('Card shown');
      }, 500);
      return () => clearTimeout(timer);
    } else if (!isOpen) {
      addDebugInfo('Modal closed');
      setShowCard(false);
      setDebugInfo([]);
    }
  }, [isOpen, pop]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        addDebugInfo('Escape key pressed');
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      addDebugInfo('Event listeners added');
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
      if (isOpen) {
        addDebugInfo('Event listeners removed');
      }
    };
  }, [isOpen, onClose]);

  if (!pop) {
    addDebugInfo('No pop provided');
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => {
            addDebugInfo('Backdrop clicked');
            onClose();
          }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          
          {/* Debug Info */}
          <div className="absolute top-4 left-4 bg-black/80 text-white text-xs p-2 rounded max-w-xs max-h-32 overflow-y-auto z-20">
            <div className="font-bold mb-1">Debug Info:</div>
            {debugInfo.map((info, index) => (
              <div key={index}>{info}</div>
            ))}
          </div>
          
          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full h-full max-w-7xl max-h-screen flex bg-gray-900"
            onClick={(e) => {
              e.stopPropagation();
              addDebugInfo('Modal content clicked (should not close)');
            }}
          >
            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                addDebugInfo('Close button clicked');
                onClose();
              }}
              className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* 3D Viewer Section */}
            <div className="flex-1 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900">
                <Scene3D 
                  enableControls={true}
                  cameraPosition={[0, 0, 4]}
                  className="w-full h-full"
                >
                  <PopModel3D
                    pop={pop}
                    position={[0, 0, 0]}
                    animate={false}
                    showLabel={true}
                    scale={1.5}
                  />
                </Scene3D>
              </div>
              
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