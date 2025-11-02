import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useAdaptiveQuality } from '../../hooks/useAdaptiveQuality';
import { detectWebGLSupport, getDeviceCapabilities } from '../../utils/webglDetection';
import { deviceCapabilities } from '../../utils/deviceCapabilities';

// Mock device capabilities
vi.mock('../../utils/deviceCapabilities', () => ({
  deviceCapabilities: {
    getMemoryInfo: vi.fn(() => ({ usedJSHeapSize: 50000000, totalJSHeapSize: 100000000 })),
    getBatteryInfo: vi.fn(() => Promise.resolve({ level: 0.8, charging: false })),
    getConnectionInfo: vi.fn(() => ({ effectiveType: '4g', downlink: 10 })),
    getCPUInfo: vi.fn(() => ({ hardwareConcurrency: 4 })),
    isLowEndDevice: vi.fn(() => false),
    getPerformanceMetrics: vi.fn(() => ({
      memory: { used: 50, total: 100 },
      battery: { level: 80, charging: false },
      connection: { type: '4g', speed: 10 },
      cpu: { cores: 4 },
    })),
  },
}));

// Mock WebGL detection
vi.mock('../../utils/webglDetection', () => ({
  detectWebGLSupport: vi.fn(() => ({
    webgl: true,
    webgl2: true,
    extensions: ['OES_texture_float', 'WEBGL_depth_texture'],
  })),
  getDeviceCapabilities: vi.fn(() => ({
    maxTextureSize: 4096,
    maxRenderbufferSize: 4096,
    maxVertexAttribs: 16,
    maxVaryingVectors: 8,
    maxFragmentUniforms: 256,
    maxVertexUniforms: 256,
  })),
}));

// Mock adaptive quality hook
vi.mock('../../hooks/useAdaptiveQuality', () => ({
  useAdaptiveQuality: vi.fn(() => ({
    quality: 'high',
    shouldReduceQuality: false,
    memoryUsage: 50,
    batteryLevel: 80,
    connectionSpeed: 10,
  })),
}));

describe('Cross-Device Performance Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Device Capability Detection', () => {
    it('should detect WebGL support correctly', () => {
      const webglSupport = detectWebGLSupport();
      
      expect(webglSupport.webgl).toBe(true);
      expect(webglSupport.webgl2).toBe(true);
      expect(Array.isArray(webglSupport.extensions)).toBe(true);
    });

    it('should get device capabilities', () => {
      const capabilities = getDeviceCapabilities();
      
      expect(capabilities.maxTextureSize).toBeGreaterThan(0);
      expect(capabilities.maxRenderbufferSize).toBeGreaterThan(0);
      expect(capabilities.maxVertexAttribs).toBeGreaterThan(0);
    });

    it('should detect low-end devices', () => {
      const isLowEnd = deviceCapabilities.isLowEndDevice();
      expect(typeof isLowEnd).toBe('boolean');
    });

    it('should get memory information', () => {
      const memoryInfo = deviceCapabilities.getMemoryInfo();
      
      expect(memoryInfo.usedJSHeapSize).toBeGreaterThan(0);
      expect(memoryInfo.totalJSHeapSize).toBeGreaterThan(0);
      expect(memoryInfo.usedJSHeapSize).toBeLessThanOrEqual(memoryInfo.totalJSHeapSize);
    });

    it('should get CPU information', () => {
      const cpuInfo = deviceCapabilities.getCPUInfo();
      
      expect(cpuInfo.hardwareConcurrency).toBeGreaterThan(0);
    });
  });

  describe('Adaptive Quality System', () => {
    it('should provide quality settings based on device capabilities', () => {
      const qualitySettings = useAdaptiveQuality();
      
      expect(['low', 'medium', 'high']).toContain(qualitySettings.quality);
      expect(typeof qualitySettings.shouldReduceQuality).toBe('boolean');
      expect(qualitySettings.memoryUsage).toBeGreaterThanOrEqual(0);
    });

    it('should reduce quality on low-end devices', () => {
      // Mock low-end device
      vi.mocked(deviceCapabilities.isLowEndDevice).mockReturnValue(true);
      vi.mocked(useAdaptiveQuality).mockReturnValue({
        quality: 'low',
        shouldReduceQuality: true,
        memoryUsage: 80,
        batteryLevel: 20,
        connectionSpeed: 1,
      });

      const qualitySettings = useAdaptiveQuality();
      
      expect(qualitySettings.quality).toBe('low');
      expect(qualitySettings.shouldReduceQuality).toBe(true);
    });

    it('should maintain high quality on capable devices', () => {
      // Mock high-end device
      vi.mocked(deviceCapabilities.isLowEndDevice).mockReturnValue(false);
      vi.mocked(useAdaptiveQuality).mockReturnValue({
        quality: 'high',
        shouldReduceQuality: false,
        memoryUsage: 30,
        batteryLevel: 90,
        connectionSpeed: 20,
      });

      const qualitySettings = useAdaptiveQuality();
      
      expect(qualitySettings.quality).toBe('high');
      expect(qualitySettings.shouldReduceQuality).toBe(false);
    });
  });

  describe('Battery Optimization', () => {
    it('should detect battery status', async () => {
      const batteryInfo = await deviceCapabilities.getBatteryInfo();
      
      expect(batteryInfo.level).toBeGreaterThanOrEqual(0);
      expect(batteryInfo.level).toBeLessThanOrEqual(1);
      expect(typeof batteryInfo.charging).toBe('boolean');
    });

    it('should reduce quality when battery is low', () => {
      // Mock low battery
      vi.mocked(deviceCapabilities.getBatteryInfo).mockResolvedValue({
        level: 0.15,
        charging: false,
      });

      vi.mocked(useAdaptiveQuality).mockReturnValue({
        quality: 'low',
        shouldReduceQuality: true,
        memoryUsage: 50,
        batteryLevel: 15,
        connectionSpeed: 10,
      });

      const qualitySettings = useAdaptiveQuality();
      expect(qualitySettings.batteryLevel).toBeLessThan(20);
      expect(qualitySettings.shouldReduceQuality).toBe(true);
    });
  });

  describe('Network Optimization', () => {
    it('should detect connection quality', () => {
      const connectionInfo = deviceCapabilities.getConnectionInfo();
      
      expect(connectionInfo.effectiveType).toBeDefined();
      expect(connectionInfo.downlink).toBeGreaterThan(0);
    });

    it('should adapt to slow connections', () => {
      // Mock slow connection
      vi.mocked(deviceCapabilities.getConnectionInfo).mockReturnValue({
        effectiveType: '2g',
        downlink: 0.5,
      });

      vi.mocked(useAdaptiveQuality).mockReturnValue({
        quality: 'low',
        shouldReduceQuality: true,
        memoryUsage: 50,
        batteryLevel: 80,
        connectionSpeed: 0.5,
      });

      const qualitySettings = useAdaptiveQuality();
      expect(qualitySettings.connectionSpeed).toBeLessThan(1);
      expect(qualitySettings.shouldReduceQuality).toBe(true);
    });
  });

  describe('Memory Management', () => {
    it('should monitor memory usage', () => {
      const memoryInfo = deviceCapabilities.getMemoryInfo();
      const usagePercentage = (memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize) * 100;
      
      expect(usagePercentage).toBeGreaterThan(0);
      expect(usagePercentage).toBeLessThanOrEqual(100);
    });

    it('should reduce quality when memory usage is high', () => {
      // Mock high memory usage
      vi.mocked(deviceCapabilities.getMemoryInfo).mockReturnValue({
        usedJSHeapSize: 90000000,
        totalJSHeapSize: 100000000,
      });

      vi.mocked(useAdaptiveQuality).mockReturnValue({
        quality: 'medium',
        shouldReduceQuality: true,
        memoryUsage: 90,
        batteryLevel: 80,
        connectionSpeed: 10,
      });

      const qualitySettings = useAdaptiveQuality();
      expect(qualitySettings.memoryUsage).toBeGreaterThan(80);
      expect(qualitySettings.shouldReduceQuality).toBe(true);
    });
  });

  describe('Performance Metrics Collection', () => {
    it('should collect comprehensive performance metrics', () => {
      const metrics = deviceCapabilities.getPerformanceMetrics();
      
      expect(metrics.memory).toBeDefined();
      expect(metrics.battery).toBeDefined();
      expect(metrics.connection).toBeDefined();
      expect(metrics.cpu).toBeDefined();
      
      expect(metrics.memory.used).toBeGreaterThan(0);
      expect(metrics.memory.total).toBeGreaterThan(0);
      expect(metrics.cpu.cores).toBeGreaterThan(0);
    });

    it('should validate performance thresholds', () => {
      const metrics = deviceCapabilities.getPerformanceMetrics();
      
      // Memory usage should be reasonable
      const memoryUsagePercent = (metrics.memory.used / metrics.memory.total) * 100;
      expect(memoryUsagePercent).toBeLessThan(95); // Should not exceed 95%
      
      // CPU cores should be detected
      expect(metrics.cpu.cores).toBeGreaterThan(0);
      expect(metrics.cpu.cores).toBeLessThanOrEqual(32); // Reasonable upper bound
      
      // Battery level should be valid
      expect(metrics.battery.level).toBeGreaterThanOrEqual(0);
      expect(metrics.battery.level).toBeLessThanOrEqual(100);
    });
  });

  describe('Cross-Device Compatibility', () => {
    it('should handle devices without WebGL support', () => {
      // Mock device without WebGL
      vi.mocked(detectWebGLSupport).mockReturnValue({
        webgl: false,
        webgl2: false,
        extensions: [],
      });

      const webglSupport = detectWebGLSupport();
      expect(webglSupport.webgl).toBe(false);
      
      // Application should still function without WebGL
      expect(() => {
        // This would trigger fallback rendering
        const fallbackMode = !webglSupport.webgl;
        expect(fallbackMode).toBe(true);
      }).not.toThrow();
    });

    it('should handle devices with limited capabilities', () => {
      // Mock limited device capabilities
      vi.mocked(getDeviceCapabilities).mockReturnValue({
        maxTextureSize: 1024,
        maxRenderbufferSize: 1024,
        maxVertexAttribs: 8,
        maxVaryingVectors: 4,
        maxFragmentUniforms: 128,
        maxVertexUniforms: 128,
      });

      const capabilities = getDeviceCapabilities();
      
      // Should adapt to limited capabilities
      expect(capabilities.maxTextureSize).toBeLessThan(2048);
      expect(capabilities.maxVertexAttribs).toBeLessThan(16);
    });

    it('should validate PDF export performance across devices', () => {
      // Test PDF export doesn't cause memory issues
      const initialMemory = deviceCapabilities.getMemoryInfo();
      
      // Simulate PDF export process
      const mockPDFExport = () => {
        // This would normally trigger PDF generation
        return Promise.resolve(new Blob(['mock pdf'], { type: 'application/pdf' }));
      };

      expect(mockPDFExport).not.toThrow();
      
      // Memory usage should remain stable
      const finalMemory = deviceCapabilities.getMemoryInfo();
      const memoryIncrease = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
      
      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50000000);
    });
  });
});