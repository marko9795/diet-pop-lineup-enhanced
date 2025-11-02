import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { PopCard } from '../cards/PopCard';
import { Pop } from '../../types';

interface PopViewerBasicProps {
  pop: Pop | null;
  isOpen: boolean;
  onClose: () => void;
}

function RealisticCan({ pop }: { pop: Pop }) {
  console.log('Rendering can for:', pop.name, pop.brandColors);
  
  return (
    <group>
      {/* Main can body */}
      <mesh>
        <cylinderGeometry args={[0.6, 0.6, 2.4, 32]} />
        <meshStandardMaterial 
          color={pop.brandColors.primary}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* Can top (aluminum) */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.58, 0.58, 0.05, 32]} />
        <meshStandardMaterial
          color="#E8E8E8"
          metalness={1.0}
          roughness={0.05}
        />
      </mesh>
      
      {/* Can bottom */}
      <mesh position={[0, -1.2, 0]}>
        <cylinderGeometry args={[0.58, 0.58, 0.05, 32]} />
        <meshStandardMaterial
          color="#E8E8E8"
          metalness={1.0}
          roughness={0.05}
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
      
      {/* Brand Text */}
      <Text
        position={[0, 0.3, 0.61]}
        rotation={[0, 0, 0]}
        fontSize={0.18}
        color={pop.brandColors.secondary}
        anchorX="center"
        anchorY="middle"
        maxWidth={2}
      >
        {pop.brand}
      </Text>
      
      {/* Product Name */}
      <Text
        position={[0, 0, 0.61]}
        rotation={[0, 0, 0]}
        fontSize={0.14}
        color={pop.brandColors.secondary}
        anchorX="center"
        anchorY="middle"
        maxWidth={2}
      >
        {pop.name}
      </Text>
      
      {/* Caffeine Info */}
      <Text
        position={[0, -0.4, 0.61]}
        rotation={[0, 0, 0]}
        fontSize={0.08}
        color={pop.brandColors.secondary}
        anchorX="center"
        anchorY="middle"
      >
        {pop.caffeine}mg CAFFEINE
      </Text>
    </group>
  );
}

export function PopViewerBasic({ pop, isOpen, onClose }: PopViewerBasicProps) {
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
              <Canvas 
                className="w-full h-full"
                camera={{ position: [0, 0, 4], fov: 50 }}
              >
                {/* Lighting setup */}
                <ambientLight intensity={0.6} />
                <directionalLight 
                  position={[10, 10, 5]} 
                  intensity={1.2} 
                />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />
                
                {/* 3D Can Model */}
                <RealisticCan pop={pop} />
                
                {/* Controls */}
                <OrbitControls
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={true}
                  minDistance={2}
                  maxDistance={8}
                  maxPolarAngle={Math.PI / 1.5}
                />
              </Canvas>
              
              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                <p className="text-white text-sm">
                  Drag to rotate • Scroll to zoom • Right-click to pan
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