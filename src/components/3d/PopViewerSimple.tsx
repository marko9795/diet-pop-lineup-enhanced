import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { PopCard } from '../cards/PopCard';
import { Pop } from '../../types';

interface PopViewerSimpleProps {
  pop: Pop | null;
  isOpen: boolean;
  onClose: () => void;
}

function SimpleCan({ pop }: { pop: Pop }) {
  return (
    <group>
      {/* Main can body */}
      <mesh>
        <cylinderGeometry args={[0.6, 0.6, 2.4, 32]} />
        <meshStandardMaterial 
          color={pop.brandColors.primary}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Can top */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.58, 0.58, 0.05, 32]} />
        <meshStandardMaterial color="#silver" />
      </mesh>
      
      {/* Can bottom */}
      <mesh position={[0, -1.2, 0]}>
        <cylinderGeometry args={[0.58, 0.58, 0.05, 32]} />
        <meshStandardMaterial color="#silver" />
      </mesh>
    </group>
  );
}

export function PopViewerSimple({ pop, isOpen, onClose }: PopViewerSimpleProps) {
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    if (isOpen && pop) {
      const timer = setTimeout(() => setShowCard(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowCard(false);
    }
  }, [isOpen, pop]);

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

  if (!pop) return null;

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
          <div className="absolute inset-0 bg-black/80" />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full h-full max-w-7xl max-h-screen flex bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-white/20 rounded-full"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <div className="flex-1 relative">
              <Canvas className="w-full h-full">
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                
                <SimpleCan pop={pop} />
                
                <OrbitControls />
              </Canvas>
              
              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                <p className="text-white text-sm">
                  Simple 3D Can - {pop.name}
                </p>
              </div>
            </div>

            <AnimatePresence>
              {showCard && (
                <motion.div
                  initial={{ x: 400, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 400, opacity: 0 }}
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