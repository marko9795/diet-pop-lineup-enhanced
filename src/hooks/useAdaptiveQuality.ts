import { useState, useEffect, useRef } from 'react';
import { 
  detectDeviceCapabilities, 
  getAdaptiveQualitySettings, 
  PerformanceMonitor,
  DeviceCapabilities 
} from '../utils/deviceCapabilities';

export interface AdaptiveQualitySettings {
  modelQuality: 'low' | 'medium' | 'high';
  textureQuality: 'low' | 'medium' | 'high';
  shadowMapSize: number;
  antialias: boolean;
  pixelRatio: number;
  enablePostProcessing: boolean;
  maxLights: number;
  enableReflections: boolean;
  modelLOD: 'low' | 'medium' | 'high';
}

export interface AdaptiveQualityState {
  settings: AdaptiveQualitySettings;
  capabilities: DeviceCapabilities;
  currentFPS: number;
  averageFPS: number;
  memoryUsage: number;
  isPerformanceGood: boolean;
  canUpgradeQuality: boolean;
  shouldDowngradeQuality: boolean;
}

export function useAdaptiveQuality(enableMonitoring = true): AdaptiveQualityState {
  const [capabilities] = useState(() => detectDeviceCapabilities());
  const [settings, setSettings] = useState(() => {
    const adaptiveSettings = getAdaptiveQualitySettings(capabilities);
    return {
      ...adaptiveSettings,
      modelQuality: capabilities.recommendedQuality,
      textureQuality: capabilities.recommendedQuality,
    } as AdaptiveQualitySettings;
  });
  
  const [performanceMetrics, setPerformanceMetrics] = useState({
    currentFPS: 60,
    averageFPS: 60,
    memoryUsage: 0,
  });

  const performanceMonitor = useRef<PerformanceMonitor | null>(null);
  const qualityAdjustmentTimer = useRef<number | null>(null);
  const lastQualityAdjustment = useRef<number>(0);

  useEffect(() => {
    if (!enableMonitoring) return;

    performanceMonitor.current = new PerformanceMonitor();
    performanceMonitor.current.startMonitoring();

    const updateMetrics = () => {
      if (performanceMonitor.current) {
        const currentFPS = performanceMonitor.current.getCurrentFPS();
        const averageFPS = performanceMonitor.current.getAverageFPS();
        const memoryUsage = performanceMonitor.current.getMemoryUsage();

        setPerformanceMetrics({
          currentFPS,
          averageFPS,
          memoryUsage,
        });

        // Adaptive quality adjustment
        adjustQualityBasedOnPerformance(averageFPS, memoryUsage);
      }
    };

    const metricsInterval = setInterval(updateMetrics, 2000); // Update every 2 seconds

    return () => {
      clearInterval(metricsInterval);
      if (qualityAdjustmentTimer.current) {
        clearTimeout(qualityAdjustmentTimer.current);
      }
    };
  }, [enableMonitoring]);

  const adjustQualityBasedOnPerformance = (avgFPS: number, memoryUsage: number) => {
    const now = Date.now();
    
    // Don't adjust quality too frequently (minimum 10 seconds between adjustments)
    if (now - lastQualityAdjustment.current < 10000) return;

    const shouldDowngrade = avgFPS < 25 || memoryUsage > 150; // 150MB threshold
    const canUpgrade = avgFPS > 50 && memoryUsage < 50 && settings.modelQuality !== 'high';

    if (shouldDowngrade && settings.modelQuality !== 'low') {
      downgradeQuality();
      lastQualityAdjustment.current = now;
    } else if (canUpgrade) {
      upgradeQuality();
      lastQualityAdjustment.current = now;
    }
  };

  const downgradeQuality = () => {
    setSettings(prev => {
      let newQuality: 'low' | 'medium' | 'high' = prev.modelQuality;
      
      if (prev.modelQuality === 'high') newQuality = 'medium';
      else if (prev.modelQuality === 'medium') newQuality = 'low';

      const newAdaptiveSettings = getAdaptiveQualitySettings({
        ...capabilities,
        recommendedQuality: newQuality,
        performanceTier: newQuality === 'low' ? 'low' : newQuality === 'medium' ? 'medium' : 'high',
      });

      return {
        ...prev,
        ...newAdaptiveSettings,
        modelQuality: newQuality,
        textureQuality: newQuality,
      };
    });

    console.log('🔽 Quality downgraded due to performance');
  };

  const upgradeQuality = () => {
    setSettings(prev => {
      let newQuality: 'low' | 'medium' | 'high' = prev.modelQuality;
      
      if (prev.modelQuality === 'low') newQuality = 'medium';
      else if (prev.modelQuality === 'medium') newQuality = 'high';

      const newAdaptiveSettings = getAdaptiveQualitySettings({
        ...capabilities,
        recommendedQuality: newQuality,
        performanceTier: newQuality === 'low' ? 'low' : newQuality === 'medium' ? 'medium' : 'high',
      });

      return {
        ...prev,
        ...newAdaptiveSettings,
        modelQuality: newQuality,
        textureQuality: newQuality,
      };
    });

    console.log('🔼 Quality upgraded due to good performance');
  };

  // Manual quality adjustment function (reserved for future use)
  // const manualQualityAdjustment = (quality: 'low' | 'medium' | 'high') => {
  //   const newAdaptiveSettings = getAdaptiveQualitySettings({
  //     ...capabilities,
  //     recommendedQuality: quality,
  //     performanceTier: quality,
  //   });

  //   setSettings({
  //     ...newAdaptiveSettings,
  //     modelQuality: quality,
  //     textureQuality: quality,
  //   });

  //   lastQualityAdjustment.current = Date.now();
  // };

  const isPerformanceGood = performanceMetrics.averageFPS >= 30 && performanceMetrics.memoryUsage < 100;
  const canUpgradeQuality = isPerformanceGood && settings.modelQuality !== 'high';
  const shouldDowngradeQuality = !isPerformanceGood && settings.modelQuality !== 'low';

  return {
    settings,
    capabilities,
    currentFPS: performanceMetrics.currentFPS,
    averageFPS: performanceMetrics.averageFPS,
    memoryUsage: performanceMetrics.memoryUsage,
    isPerformanceGood,
    canUpgradeQuality,
    shouldDowngradeQuality,
  };
}

// Progressive loading hook for 3D assets
export function useProgressiveLoading() {
  const [loadingStage, setLoadingStage] = useState<'geometry' | 'textures' | 'complete'>('geometry');
  const [loadedAssets, setLoadedAssets] = useState<Set<string>>(new Set());

  const markAssetLoaded = (assetId: string) => {
    setLoadedAssets(prev => new Set([...prev, assetId]));
  };

  const isAssetLoaded = (assetId: string) => {
    return loadedAssets.has(assetId);
  };

  const advanceLoadingStage = () => {
    setLoadingStage(prev => {
      if (prev === 'geometry') return 'textures';
      if (prev === 'textures') return 'complete';
      return prev;
    });
  };

  return {
    loadingStage,
    loadedAssets,
    markAssetLoaded,
    isAssetLoaded,
    advanceLoadingStage,
    isComplete: loadingStage === 'complete',
  };
}

// Memory management utilities
export function useMemoryManagement() {
  const disposedObjects = useRef<Set<string>>(new Set());

  const disposeObject = (objectId: string, disposeCallback: () => void) => {
    if (!disposedObjects.current.has(objectId)) {
      disposeCallback();
      disposedObjects.current.add(objectId);
    }
  };

  const isDisposed = (objectId: string) => {
    return disposedObjects.current.has(objectId);
  };

  const clearDisposedObjects = () => {
    disposedObjects.current.clear();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearDisposedObjects();
    };
  }, []);

  return {
    disposeObject,
    isDisposed,
    clearDisposedObjects,
  };
}