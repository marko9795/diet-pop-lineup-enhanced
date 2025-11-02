// Performance utilities for 3D rendering optimization

export interface DeviceCapabilities {
  isMobile: boolean;
  isLowEnd: boolean;
  supportsWebGL2: boolean;
  maxTextureSize: number;
  devicePixelRatio: number;
  memoryInfo?: {
    totalJSHeapSize: number;
    usedJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

export interface RenderQuality {
  geometryDetail: number;
  textureQuality: 'low' | 'medium' | 'high';
  shadowsEnabled: boolean;
  antialiasing: boolean;
  environmentMapping: boolean;
  maxLights: number;
}

// Detect device capabilities
export function getDeviceCapabilities(): DeviceCapabilities {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || window.innerWidth < 768;

  const capabilities: DeviceCapabilities = {
    isMobile,
    isLowEnd: false,
    supportsWebGL2: !!canvas.getContext('webgl2'),
    maxTextureSize: 1024,
    devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    memoryInfo: undefined
  };

  if (gl) {
    capabilities.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  }

  // Check for memory info (Chrome only)
  if ('memory' in performance) {
    capabilities.memoryInfo = (performance as any).memory;
  }

  // Determine if device is low-end based on various factors
  capabilities.isLowEnd = Boolean(
    isMobile && (
      capabilities.maxTextureSize < 2048 ||
      (navigator.hardwareConcurrency || 4) <= 2 ||
      (capabilities.memoryInfo && capabilities.memoryInfo.jsHeapSizeLimit < 1073741824) // < 1GB
    )
  );

  return capabilities;
}

// Get optimal render quality based on device capabilities
export function getOptimalRenderQuality(capabilities: DeviceCapabilities): RenderQuality {
  if (capabilities.isLowEnd) {
    return {
      geometryDetail: 16,
      textureQuality: 'low',
      shadowsEnabled: false,
      antialiasing: false,
      environmentMapping: false,
      maxLights: 2
    };
  }

  if (capabilities.isMobile) {
    return {
      geometryDetail: 24,
      textureQuality: 'medium',
      shadowsEnabled: false,
      antialiasing: true,
      environmentMapping: true,
      maxLights: 3
    };
  }

  // Desktop/high-end
  return {
    geometryDetail: 32,
    textureQuality: 'high',
    shadowsEnabled: true,
    antialiasing: true,
    environmentMapping: true,
    maxLights: 5
  };
}

// Performance monitoring
export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = 0;
  private fps = 60;
  private fpsHistory: number[] = [];
  private readonly maxHistoryLength = 60; // 1 second at 60fps

  update(currentTime: number) {
    this.frameCount++;
    
    if (currentTime - this.lastTime >= 1000) {
      this.fps = this.frameCount;
      this.fpsHistory.push(this.fps);
      
      if (this.fpsHistory.length > this.maxHistoryLength) {
        this.fpsHistory.shift();
      }
      
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
  }

  getFPS(): number {
    return this.fps;
  }

  getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 60;
    return this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length;
  }

  isPerformancePoor(): boolean {
    return this.getAverageFPS() < 30;
  }

  shouldReduceQuality(): boolean {
    return this.getAverageFPS() < 45 && this.fpsHistory.length > 10;
  }
}

// Memory management utilities
export class MemoryManager {
  private disposables: Array<{ dispose: () => void }> = [];

  register(disposable: { dispose: () => void }) {
    this.disposables.push(disposable);
  }

  dispose() {
    this.disposables.forEach(item => {
      try {
        item.dispose();
      } catch (error) {
        console.warn('Error disposing resource:', error);
      }
    });
    this.disposables = [];
  }

  getMemoryUsage(): number | null {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    }
    return null;
  }

  isMemoryPressureHigh(): boolean {
    const usage = this.getMemoryUsage();
    return usage !== null && usage > 0.8;
  }
}

// Adaptive quality manager
export class AdaptiveQualityManager {
  private performanceMonitor = new PerformanceMonitor();
  private memoryManager = new MemoryManager();
  private currentQuality: RenderQuality;
  private capabilities: DeviceCapabilities;
  private qualityReductionCount = 0;
  private readonly maxQualityReductions = 3;

  constructor() {
    this.capabilities = getDeviceCapabilities();
    this.currentQuality = getOptimalRenderQuality(this.capabilities);
  }

  update(currentTime: number) {
    this.performanceMonitor.update(currentTime);

    // Check if we need to reduce quality
    if (this.performanceMonitor.shouldReduceQuality() && 
        this.qualityReductionCount < this.maxQualityReductions) {
      this.reduceQuality();
    }

    // Check memory pressure
    if (this.memoryManager.isMemoryPressureHigh()) {
      this.reduceQuality();
    }
  }

  private reduceQuality() {
    this.qualityReductionCount++;
    
    // Progressively reduce quality
    if (this.qualityReductionCount === 1) {
      this.currentQuality.shadowsEnabled = false;
      this.currentQuality.antialiasing = false;
    } else if (this.qualityReductionCount === 2) {
      this.currentQuality.geometryDetail = Math.max(16, this.currentQuality.geometryDetail - 8);
      this.currentQuality.environmentMapping = false;
    } else if (this.qualityReductionCount === 3) {
      this.currentQuality.textureQuality = 'low';
      this.currentQuality.maxLights = Math.max(1, this.currentQuality.maxLights - 1);
    }

    console.log('Quality reduced:', this.currentQuality);
  }

  getCurrentQuality(): RenderQuality {
    return { ...this.currentQuality };
  }

  getCapabilities(): DeviceCapabilities {
    return { ...this.capabilities };
  }

  getFPS(): number {
    return this.performanceMonitor.getFPS();
  }

  registerDisposable(disposable: { dispose: () => void }) {
    this.memoryManager.register(disposable);
  }

  dispose() {
    this.memoryManager.dispose();
  }
}