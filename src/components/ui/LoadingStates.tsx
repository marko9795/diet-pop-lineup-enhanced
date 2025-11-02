import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Package, Download, Eye, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

// Generic loading spinner with customizable size and color
export function LoadingSpinner({ 
  size = 'md', 
  color = 'blue',
  className = '' 
}: { 
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'white' | 'gray' | 'green' | 'red';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    blue: 'text-blue-600',
    white: 'text-white',
    gray: 'text-gray-600',
    green: 'text-green-600',
    red: 'text-red-600'
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={className}
    >
      <Loader2 className={`${sizeClasses[size]} ${colorClasses[color]}`} />
    </motion.div>
  );
}

// 3D Model loading indicator
export function Model3DLoadingIndicator({ 
  popName,
  progress = 0,
  className = '' 
}: { 
  popName?: string;
  progress?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`flex flex-col items-center justify-center p-6 bg-white/10 backdrop-blur-sm rounded-lg ${className}`}
    >
      <motion.div
        animate={{ 
          rotateY: 360,
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          rotateY: { duration: 2, repeat: Infinity, ease: "linear" },
          scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
        }}
        className="mb-4"
      >
        <Package className="w-12 h-12 text-blue-400" />
      </motion.div>
      
      <div className="text-white text-center">
        <div className="font-medium mb-1">
          Loading 3D Model
        </div>
        {popName && (
          <div className="text-sm text-blue-200 mb-3">
            {popName}
          </div>
        )}
        
        {progress > 0 && (
          <div className="w-32 bg-white/20 rounded-full h-2 mb-2">
            <motion.div
              className="bg-blue-400 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}
        
        <div className="text-xs text-blue-300">
          Preparing 3D visualization...
        </div>
      </div>
    </motion.div>
  );
}

// PDF Export loading indicator
export function PDFExportLoadingIndicator({ 
  stage = 'preparing',
  progress = 0,
  className = '' 
}: { 
  stage?: 'preparing' | 'generating' | 'optimizing' | 'finalizing';
  progress?: number;
  className?: string;
}) {
  const stageMessages = {
    preparing: 'Preparing lineup data...',
    generating: 'Generating PDF document...',
    optimizing: 'Optimizing images...',
    finalizing: 'Finalizing export...'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-lg ${className}`}
    >
      <motion.div
        animate={{ 
          rotate: [0, 10, -10, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="mb-4"
      >
        <Download className="w-16 h-16 text-green-600" />
      </motion.div>
      
      <div className="text-center">
        <div className="text-xl font-semibold text-gray-800 mb-2">
          Exporting Your Lineup
        </div>
        
        <div className="text-gray-600 mb-4">
          {stageMessages[stage]}
        </div>
        
        {progress > 0 && (
          <div className="w-64 bg-gray-200 rounded-full h-3 mb-4">
            <motion.div
              className="bg-green-600 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}
        
        <div className="flex items-center justify-center space-x-2">
          <LoadingSpinner size="sm" color="green" />
          <span className="text-sm text-gray-500">
            This may take a few moments...
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// Pop Viewer loading state
export function PopViewerLoadingState({ 
  popName,
  className = '' 
}: { 
  popName?: string;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-900/50 to-purple-900/50 backdrop-blur-sm ${className}`}
    >
      <motion.div
        animate={{ 
          rotateY: 360,
          scale: [1, 1.2, 1]
        }}
        transition={{ 
          rotateY: { duration: 3, repeat: Infinity, ease: "linear" },
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
        className="mb-6"
      >
        <Eye className="w-16 h-16 text-white/80" />
      </motion.div>
      
      <div className="text-center text-white">
        <div className="text-xl font-semibold mb-2">
          Loading 3D Viewer
        </div>
        {popName && (
          <div className="text-blue-200 mb-4">
            Preparing {popName}
          </div>
        )}
        <div className="flex items-center justify-center space-x-2">
          <LoadingSpinner size="sm" color="white" />
          <span className="text-sm text-white/70">
            Initializing 3D graphics...
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// Skeleton loading for lineup grid
export function LineupGridSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`grid grid-cols-6 gap-2 sm:gap-4 ${className}`}>
      {Array.from({ length: 18 }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          className="aspect-square bg-white/10 backdrop-blur-sm rounded-lg"
        >
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-full h-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-lg"
          />
        </motion.div>
      ))}
    </div>
  );
}

// Generic content loading placeholder
export function ContentLoadingPlaceholder({ 
  lines = 3,
  className = '' 
}: { 
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="h-4 bg-gray-200 rounded"
          style={{ width: `${Math.random() * 40 + 60}%` }}
        >
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="h-full bg-gradient-to-r from-transparent via-white/50 to-transparent rounded"
          />
        </motion.div>
      ))}
    </div>
  );
}