import { detectDeviceCapabilities } from './deviceCapabilities';

export interface WebGLSupport {
  supported: boolean;
  version: 1 | 2 | null;
  contextLost: boolean;
  extensions: string[];
  limitations: string[];
  recommendations: string[];
}

export function detectWebGLSupport(): WebGLSupport {
  const canvas = document.createElement('canvas');
  const capabilities = detectDeviceCapabilities();
  
  let supported = false;
  let version: 1 | 2 | null = null;
  let contextLost = false;
  let extensions: string[] = [];
  let limitations: string[] = [];
  let recommendations: string[] = [];

  try {
    // Test WebGL 2.0 first
    const gl2 = canvas.getContext('webgl2', { 
      failIfMajorPerformanceCaveat: false,
      antialias: false,
      alpha: false,
      depth: true,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: 'default'
    }) as WebGL2RenderingContext | null;

    if (gl2 && !gl2.isContextLost()) {
      supported = true;
      version = 2;
      extensions = getSupportedExtensions(gl2);
    } else {
      // Fallback to WebGL 1.0
      const gl = canvas.getContext('webgl', {
        failIfMajorPerformanceCaveat: false,
        antialias: false,
        alpha: false,
        depth: true,
        stencil: false,
        preserveDrawingBuffer: false,
        powerPreference: 'default'
      }) || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;

      if (gl && !gl.isContextLost()) {
        supported = true;
        version = 1;
        extensions = getSupportedExtensions(gl);
      }
    }

    // Check for context lost
    if (supported) {
      const context = version === 2 ? 
        canvas.getContext('webgl2') as WebGL2RenderingContext :
        canvas.getContext('webgl') as WebGLRenderingContext;
      
      if (context) {
        contextLost = context.isContextLost();
      }
    }

  } catch (error) {
    console.warn('WebGL detection failed:', error);
    supported = false;
  }

  // Analyze limitations and provide recommendations
  if (!supported) {
    limitations.push('WebGL is not supported or disabled');
    recommendations.push('Update your browser to the latest version');
    recommendations.push('Enable hardware acceleration in browser settings');
    recommendations.push('Try a different browser (Chrome, Firefox, Safari, Edge)');
  } else {
    // Check for performance limitations
    if (capabilities.performanceTier === 'low') {
      limitations.push('Limited graphics performance detected');
      recommendations.push('Close other browser tabs to free memory');
      recommendations.push('Reduce browser zoom level');
    }

    if (capabilities.maxTextureSize < 2048) {
      limitations.push('Limited texture size support');
      recommendations.push('Graphics may appear at reduced quality');
    }

    if (version === 1) {
      limitations.push('Only WebGL 1.0 available (WebGL 2.0 recommended)');
    }

    if (contextLost) {
      limitations.push('WebGL context was lost');
      recommendations.push('Refresh the page to restore 3D graphics');
      recommendations.push('Close other graphics-intensive applications');
    }
  }

  // Mobile-specific recommendations
  if (isMobileDevice()) {
    recommendations.push('Close background apps to free memory');
    recommendations.push('Ensure device is not in low power mode');
  }

  return {
    supported,
    version,
    contextLost,
    extensions,
    limitations,
    recommendations
  };
}

function getSupportedExtensions(gl: WebGLRenderingContext | WebGL2RenderingContext): string[] {
  const extensions: string[] = [];
  
  const commonExtensions = [
    'OES_texture_float',
    'OES_texture_half_float',
    'WEBGL_depth_texture',
    'EXT_texture_filter_anisotropic',
    'WEBGL_compressed_texture_s3tc',
    'WEBGL_compressed_texture_pvrtc',
    'WEBGL_compressed_texture_etc1',
    'WEBGL_lose_context',
    'OES_standard_derivatives',
    'EXT_shader_texture_lod',
    'WEBGL_debug_renderer_info',
    'WEBGL_debug_shaders'
  ];

  for (const ext of commonExtensions) {
    if (gl.getExtension(ext)) {
      extensions.push(ext);
    }
  }

  return extensions;
}

function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         ('ontouchstart' in window) ||
         (navigator.maxTouchPoints > 0);
}

// WebGL context recovery utilities
export class WebGLContextManager {
  private canvas: HTMLCanvasElement | null = null;
  private gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
  private contextLostHandler: ((event: Event) => void) | null = null;
  private contextRestoredHandler: ((event: Event) => void) | null = null;
  private onContextLost?: () => void;
  private onContextRestored?: () => void;

  constructor(
    canvas: HTMLCanvasElement,
    onContextLost?: () => void,
    onContextRestored?: () => void
  ) {
    this.canvas = canvas;
    this.onContextLost = onContextLost;
    this.onContextRestored = onContextRestored;
    this.setupContextHandlers();
  }

  private setupContextHandlers() {
    if (!this.canvas) return;

    this.contextLostHandler = (event: Event) => {
      event.preventDefault();
      console.warn('WebGL context lost');
      if (this.onContextLost) {
        this.onContextLost();
      }
    };

    this.contextRestoredHandler = (event: Event) => {
      console.log('WebGL context restored');
      if (this.onContextRestored) {
        this.onContextRestored();
      }
    };

    this.canvas.addEventListener('webglcontextlost', this.contextLostHandler);
    this.canvas.addEventListener('webglcontextrestored', this.contextRestoredHandler);
  }

  getContext(): WebGLRenderingContext | WebGL2RenderingContext | null {
    if (!this.canvas) return null;

    if (!this.gl || this.gl.isContextLost()) {
      // Try WebGL 2.0 first
      this.gl = this.canvas.getContext('webgl2') as WebGL2RenderingContext;
      
      if (!this.gl) {
        // Fallback to WebGL 1.0
        this.gl = this.canvas.getContext('webgl') || 
                  this.canvas.getContext('experimental-webgl') as WebGLRenderingContext;
      }
    }

    return this.gl;
  }

  isContextLost(): boolean {
    return !this.gl || this.gl.isContextLost();
  }

  forceContextLoss(): void {
    if (this.gl) {
      const loseContext = this.gl.getExtension('WEBGL_lose_context');
      if (loseContext) {
        loseContext.loseContext();
      }
    }
  }

  dispose(): void {
    if (this.canvas && this.contextLostHandler && this.contextRestoredHandler) {
      this.canvas.removeEventListener('webglcontextlost', this.contextLostHandler);
      this.canvas.removeEventListener('webglcontextrestored', this.contextRestoredHandler);
    }
    
    this.canvas = null;
    this.gl = null;
    this.contextLostHandler = null;
    this.contextRestoredHandler = null;
  }
}

// Graceful degradation helper
export function createGracefulWebGLContext(
  canvas: HTMLCanvasElement,
  options?: WebGLContextAttributes
): {
  gl: WebGLRenderingContext | WebGL2RenderingContext | null;
  version: 1 | 2 | null;
  error: string | null;
} {
  const defaultOptions: WebGLContextAttributes = {
    alpha: false,
    antialias: true,
    depth: true,
    failIfMajorPerformanceCaveat: false,
    powerPreference: 'default',
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    stencil: false,
    ...options
  };

  let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
  let version: 1 | 2 | null = null;
  let error: string | null = null;

  try {
    // Try WebGL 2.0 first
    gl = canvas.getContext('webgl2', defaultOptions) as WebGL2RenderingContext;
    if (gl && !gl.isContextLost()) {
      version = 2;
      return { gl, version, error };
    }

    // Fallback to WebGL 1.0
    gl = canvas.getContext('webgl', defaultOptions) || 
         canvas.getContext('experimental-webgl', defaultOptions) as WebGLRenderingContext;
    
    if (gl && !gl.isContextLost()) {
      version = 1;
      return { gl, version, error };
    }

    error = 'WebGL context could not be created';
  } catch (e) {
    error = e instanceof Error ? e.message : 'Unknown WebGL error';
  }

  return { gl: null, version: null, error };
}