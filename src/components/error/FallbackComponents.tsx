import React from 'react';
import { Monitor, Package, AlertCircle, Download, Eye } from 'lucide-react';
import { Pop } from '../../types';

// Fallback component when 3D models fail to load
export function PopModel3DFallback({ 
  pop, 
  position = [0, 0, 0], 
  scale = 1,
  className = "" 
}: { 
  pop: Pop; 
  position?: [number, number, number]; 
  scale?: number;
  className?: string;
}) {
  return (
    <div 
      className={`flex flex-col items-center justify-center p-4 bg-gradient-to-br rounded-lg border-2 border-dashed ${className}`}
      style={{
        backgroundColor: `${pop.brandColors.primary}20`,
        borderColor: pop.brandColors.primary,
        transform: `scale(${scale})`,
        transformOrigin: 'center',
      }}
    >
      <Package 
        className="w-12 h-12 mb-2" 
        style={{ color: pop.brandColors.primary }}
      />
      <div 
        className="text-sm font-medium text-center"
        style={{ color: pop.brandColors.primary }}
      >
        {pop.name}
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {pop.brand}
      </div>
    </div>
  );
}

// Fallback component for the entire 3D viewer when WebGL is unavailable
export function PopViewer3DFallback({ 
  pop, 
  isOpen, 
  onClose 
}: { 
  pop: Pop | null; 
  isOpen: boolean; 
  onClose: () => void;
}) {
  if (!pop || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {pop.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <AlertCircle className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="text-center mb-6">
          <div 
            className="w-32 h-48 mx-auto rounded-lg flex flex-col items-center justify-center border-2 border-dashed mb-4"
            style={{
              backgroundColor: `${pop.brandColors.primary}20`,
              borderColor: pop.brandColors.primary,
            }}
          >
            <Package 
              className="w-16 h-16 mb-2" 
              style={{ color: pop.brandColors.primary }}
            />
            <div 
              className="text-sm font-medium"
              style={{ color: pop.brandColors.primary }}
            >
              {pop.brand}
            </div>
          </div>
          
          <div className="flex items-center justify-center text-amber-600 mb-2">
            <Monitor className="w-4 h-4 mr-2" />
            <span className="text-sm">3D view unavailable</span>
          </div>
          
          <p className="text-gray-600 text-sm">
            Your browser doesn't support 3D graphics, but you can still view the pop details below.
          </p>
        </div>

        {/* Pop details */}
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-600">Brand:</span>
            <span className="font-medium">{pop.brand}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-600">Parent Company:</span>
            <span className="font-medium">{pop.parentCompany}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-600">Caffeine:</span>
            <span className="font-medium">{pop.caffeine}mg</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-600">Calories:</span>
            <span className="font-medium">{pop.calories}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// Fallback for 3D scene when WebGL context is lost
export function Scene3DFallback({ 
  children, 
  className = "",
  message = "3D graphics temporarily unavailable"
}: { 
  children?: React.ReactNode;
  className?: string;
  message?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center bg-gray-100 rounded-lg ${className}`}>
      <Monitor className="w-12 h-12 text-gray-400 mb-3" />
      <p className="text-gray-600 text-center text-sm max-w-xs">
        {message}
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-3 px-3 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
      >
        Reload to retry
      </button>
    </div>
  );
}

// Fallback for PDF export when generation fails
export function PDFExportFallback({ 
  onRetry, 
  onClose,
  error 
}: { 
  onRetry: () => void;
  onClose: () => void;
  error?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-red-800 mb-2">
        PDF Export Failed
      </h3>
      <p className="text-red-600 text-center mb-4 max-w-md">
        {error || "There was a problem generating your lineup PDF. This might be due to browser limitations or temporary issues."}
      </p>
      
      <div className="flex space-x-3">
        <button
          onClick={onRetry}
          className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          Try Again
        </button>
        
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// Generic loading fallback with error recovery
export function LoadingFallback({ 
  message = "Loading...",
  onCancel,
  timeout = 10000 
}: { 
  message?: string;
  onCancel?: () => void;
  timeout?: number;
}) {
  const [showTimeout, setShowTimeout] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeout(true);
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout]);

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600 text-center mb-4">{message}</p>
      
      {showTimeout && (
        <div className="text-center">
          <p className="text-amber-600 text-sm mb-3">
            This is taking longer than expected...
          </p>
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}