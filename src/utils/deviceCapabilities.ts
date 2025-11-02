export interface DeviceCapabilities {
  webglSupported: boolean;
  webgl2Supported: boolean;
  maxTextureSize: number;
  maxRenderbufferSize: number;
  devicePixelRatio: number;
  hardwareConcurrency: number;
  memoryEstimate: number; // in GB
  performanceTier: 'low' | 'medium' | 'high';
  recommendedQuality: 'low' | 'medium' | 'high';
  maxModelComplexity: number;
  supportedTextureFormats: string[];
}

export function detectDeviceCapabilities(): DeviceCapabilities {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
  const gl2 = canvas.getContext('webgl2') as WebGL2RenderingContext | null;
  
  let webglSupported = !!gl;
  let webgl2Supported = !!gl2;
  let maxTextureSize = 0;
  let maxRenderbufferSize = 0;
  let supportedTextureFormats: string[] = [];

  if (gl) {
    maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    maxRenderbufferSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
    
    // Check for common texture format support
    const formats = [
      'WEBGL_compressed_texture_s3tc',
      'WEBGL_compressed_texture_pvrtc',
      'WEBGL_compressed_texture_etc1',
      'WEBGL_compressed_texture_astc',
    ];
    
    supportedTextureFormats = formats.filter(format => gl.getExtension(format));
  }

  const devicePixelRatio = window.devicePixelRatio || 1;
  const hardwareConcurrency = navigator.hardwareConcurrency || 4;
  
  // Estimate memory (rough approximation)
  let memoryEstimate = 4; // Default to 4GB
  if ('memory' in navigator) {
    // @ts-ignore - deviceMemory is experimental
    memoryEstimate = navigator.memory?.deviceMemory || 4;
  } else {
    // Fallback estimation based on other factors
    if (hardwareConcurrency >= 8) memoryEstimate = 8;
    else if (hardwareConcurrency >= 4) memoryEstimate = 4;
    else memoryEstimate = 2;
  }

  // Performance tier calculation
  let performanceTier: 'low' | 'medium' | 'high' = 'medium';
  
  const performanceScore = calculatePerformanceScore({
    webglSupported,
    webgl2Supported,
    maxTextureSize,
    hardwareConcurrency,
    memoryEstimate,
    devicePixelRatio,
  });

  if (performanceScore >= 80) performanceTier = 'high';
  else if (performanceScore >= 50) performanceTier = 'medium';
  else performanceTier = 'low';

  // Recommended quality based on performance tier and device type
  let recommendedQuality: 'low' | 'medium' | 'high' = performanceTier;
  
  // Adjust for mobile devices
  if (isMobileDevice()) {
    if (recommendedQuality === 'high') recommendedQuality = 'medium';
    if (memoryEstimate < 3) recommendedQuality = 'low';
  }

  // Max model complexity (vertices)
  let maxModelComplexity = 10000; // Default
  switch (performanceTier) {
    case 'high':
      maxModelComplexity = 50000;
      break;
    case 'medium':
      maxModelComplexity = 20000;
      break;
    case 'low':
      maxModelComplexity = 5000;
      break;
  }

  return {
    webglSupported,
    webgl2Supported,
    maxTextureSize,
    maxRenderbufferSize,
    devicePixelRatio,
    hardwareConcurrency,
    memoryEstimate,
    performanceTier,
    recommendedQuality,
    maxModelComplexity,
    supportedTextureFormats,
  };
}

function calculatePerformanceScore(params: {
  webglSupported: boolean;
  webgl2Supported: boolean;
  maxTextureSize: number;
  hardwareConcurrency: number;
  memoryEstimate: number;
  devicePixelRatio: number;
}): number {
  let score = 0;

  // WebGL support
  if (params.webglSupported) score += 20;
  if (params.webgl2Supported) score += 10;

  // Texture size capability
  if (params.maxTextureSize >= 4096) score += 15;
  else if (params.maxTextureSize >= 2048) score += 10;
  else if (params.maxTextureSize >= 1024) score += 5;

  // CPU cores
  if (params.hardwareConcurrency >= 8) score += 15;
  else if (params.hardwareConcurrency >= 4) score += 10;
  else if (params.hardwareConcurrency >= 2) score += 5;

  // Memory
  if (params.memoryEstimate >= 8) score += 15;
  else if (params.memoryEstimate >= 4) score += 10;
  else if (params.memoryEstimate >= 2) score += 5;

  // Device pixel ratio (higher = more demanding)
  if (params.devicePixelRatio <= 1) score += 10;
  else if (params.devicePixelRatio <= 2) score += 5;
  // No bonus for very high DPR as it's more demanding

  // Mobile penalty
  if (isMobileDevice()) score -= 15;

  return Math.max(0, Math.min(100, score));
}

function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         ('ontouchstart' in window) ||
         (navigator.maxTouchPoints > 0);
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = 0;
  private fps = 60;
  private fpsHistory: number[] = [];
  private memoryUsage: number[] = [];

  startMonitoring() {
    this.lastTime = performance.now();
    this.monitorFrame();
  }

  private monitorFrame = () => {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    
    if (deltaTime >= 1000) { // Update every second
      this.fps = (this.frameCount * 1000) / deltaTime;
      this.fpsHistory.push(this.fps);
      
      // Keep only last 10 seconds of history
      if (this.fpsHistory.length > 10) {
        this.fpsHistory.shift();
      }
      
      // Monitor memory if available
      if ('memory' in performance) {
        // @ts-ignore - memory is experimental
        const memory = (performance as any).memory;
        if (memory) {
          this.memoryUsage.push(memory.usedJSHeapSize / 1024 / 1024); // MB
          if (this.memoryUsage.length > 10) {
            this.memoryUsage.shift();
          }
        }
      }
      
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
    
    this.frameCount++;
    requestAnimationFrame(this.monitorFrame);
  };

  getCurrentFPS(): number {
    return this.fps;
  }

  getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 60;
    return this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
  }

  getMemoryUsage(): number {
    if (this.memoryUsage.length === 0) return 0;
    return this.memoryUsage[this.memoryUsage.length - 1];
  }

  shouldReduceQuality(): boolean {
    const avgFPS = this.getAverageFPS();
    const memoryUsage = this.getMemoryUsage();
    
    return avgFPS < 30 || memoryUsage > 100; // 100MB threshold
  }
}

// Adaptive quality settings
export function getAdaptiveQualitySettings(capabilities: DeviceCapabilities) {
  const settings = {
    shadowMapSize: 1024,
    antialias: true,
    pixelRatio: Math.min(capabilities.devicePixelRatio, 2),
    modelLOD: capabilities.recommendedQuality,
    textureQuality: capabilities.recommendedQuality,
    enablePostProcessing: true,
    maxLights: 3,
    enableReflections: true,
  };

  switch (capabilities.performanceTier) {
    case 'low':
      settings.shadowMapSize = 512;
      settings.antialias = false;
      settings.pixelRatio = 1;
      settings.enablePostProcessing = false;
      settings.maxLights = 1;
      settings.enableReflections = false;
      break;
      
    case 'medium':
      settings.shadowMapSize = 1024;
      settings.antialias = true;
      settings.pixelRatio = Math.min(capabilities.devicePixelRatio, 1.5);
      settings.enablePostProcessing = false;
      settings.maxLights = 2;
      settings.enableReflections = true;
      break;
      
    case 'high':
      settings.shadowMapSize = 2048;
      settings.antialias = true;
      settings.pixelRatio = Math.min(capabilities.devicePixelRatio, 2);
      settings.enablePostProcessing = true;
      settings.maxLights = 3;
      settings.enableReflections = true;
      break;
  }

  return settings;
}