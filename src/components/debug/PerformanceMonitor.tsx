import { useState } from 'react';
import { useAdaptiveQuality } from '../../hooks/useAdaptiveQuality';

interface PerformanceMonitorProps {
  enabled?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showDetailed?: boolean;
}

export function PerformanceMonitor({ 
  enabled = false, 
  position = 'top-right',
  showDetailed = false 
}: PerformanceMonitorProps) {
  const { 
    currentFPS, 
    averageFPS, 
    memoryUsage, 
    settings, 
    capabilities,
    isPerformanceGood 
  } = useAdaptiveQuality(enabled);
  
  const [isExpanded, setIsExpanded] = useState(false);

  if (!enabled) return null;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  const performanceColor = isPerformanceGood ? 'text-green-400' : 'text-red-400';

  return (
    <div 
      className={`fixed ${positionClasses[position]} z-50 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white text-xs font-mono`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Basic Performance Info */}
      <div className="flex items-center space-x-2 cursor-pointer">
        <div className={`w-2 h-2 rounded-full ${isPerformanceGood ? 'bg-green-400' : 'bg-red-400'}`} />
        <span className={performanceColor}>
          {Math.round(currentFPS)} FPS
        </span>
        <span className="text-gray-400">|</span>
        <span className="text-blue-400">
          {settings.modelQuality.toUpperCase()}
        </span>
      </div>

      {/* Detailed Info (Expandable) */}
      {(isExpanded || showDetailed) && (
        <div className="mt-2 space-y-1 border-t border-gray-600 pt-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="text-gray-400">Avg FPS:</div>
              <div className={performanceColor}>{Math.round(averageFPS)}</div>
            </div>
            <div>
              <div className="text-gray-400">Memory:</div>
              <div className="text-yellow-400">{Math.round(memoryUsage)}MB</div>
            </div>
            <div>
              <div className="text-gray-400">Quality:</div>
              <div className="text-blue-400">{settings.modelQuality}</div>
            </div>
            <div>
              <div className="text-gray-400">Shadows:</div>
              <div className="text-purple-400">{settings.shadowMapSize}px</div>
            </div>
          </div>

          {/* Device Capabilities */}
          <div className="mt-2 pt-2 border-t border-gray-600">
            <div className="text-gray-400 mb-1">Device:</div>
            <div className="text-xs space-y-0.5">
              <div>Tier: <span className="text-cyan-400">{capabilities.performanceTier}</span></div>
              <div>WebGL: <span className="text-green-400">{capabilities.webglSupported ? '✓' : '✗'}</span></div>
              <div>Cores: <span className="text-orange-400">{capabilities.hardwareConcurrency}</span></div>
              <div>RAM: <span className="text-pink-400">{capabilities.memoryEstimate}GB</span></div>
            </div>
          </div>

          {/* Current Settings */}
          <div className="mt-2 pt-2 border-t border-gray-600">
            <div className="text-gray-400 mb-1">Settings:</div>
            <div className="text-xs space-y-0.5">
              <div>DPR: <span className="text-blue-400">{settings.pixelRatio}</span></div>
              <div>AA: <span className="text-green-400">{settings.antialias ? '✓' : '✗'}</span></div>
              <div>Lights: <span className="text-yellow-400">{settings.maxLights}</span></div>
              <div>Reflect: <span className="text-purple-400">{settings.enableReflections ? '✓' : '✗'}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Expand/Collapse Indicator */}
      <div className="text-center mt-1 text-gray-500 text-xs">
        {isExpanded ? '▲' : '▼'}
      </div>
    </div>
  );
}

// Development-only performance overlay
export function DevPerformanceOverlay() {
  const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  
  return (
    <PerformanceMonitor 
      enabled={isDevelopment} 
      position="top-right" 
      showDetailed={false}
    />
  );
}