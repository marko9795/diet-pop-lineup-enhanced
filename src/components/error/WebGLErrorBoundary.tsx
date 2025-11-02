import React, { Component, ReactNode } from 'react';
import { Monitor, AlertTriangle, Smartphone, Download } from 'lucide-react';
import { detectDeviceCapabilities } from '../../utils/deviceCapabilities';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onWebGLError?: (error: Error, capabilities: any) => void;
}

interface State {
  hasWebGLError: boolean;
  error: Error | null;
  capabilities: any;
  showTechnicalDetails: boolean;
}

export class WebGLErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasWebGLError: false,
      error: null,
      capabilities: null,
      showTechnicalDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Check if this is a WebGL-related error
    const isWebGLError = error.message.toLowerCase().includes('webgl') ||
                        error.message.toLowerCase().includes('context') ||
                        error.message.toLowerCase().includes('canvas') ||
                        error.stack?.toLowerCase().includes('three') ||
                        error.stack?.toLowerCase().includes('webgl');

    if (isWebGLError) {
      return {
        hasWebGLError: true,
        error,
        capabilities: detectDeviceCapabilities(),
      };
    }

    // Re-throw non-WebGL errors to be handled by parent error boundaries
    throw error;
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const capabilities = detectDeviceCapabilities();
    
    this.setState({
      capabilities,
    });

    // Call custom error handler if provided
    if (this.props.onWebGLError) {
      this.props.onWebGLError(error, capabilities);
    }

    // Log WebGL error with device capabilities
    console.error('WebGL Error caught:', {
      error: error.message,
      stack: error.stack,
      capabilities,
      userAgent: navigator.userAgent,
      errorInfo,
    });
  }

  handleRetry = () => {
    this.setState({
      hasWebGLError: false,
      error: null,
      capabilities: null,
      showTechnicalDetails: false,
    });
  };

  toggleTechnicalDetails = () => {
    this.setState(prev => ({
      showTechnicalDetails: !prev.showTechnicalDetails
    }));
  };

  render() {
    if (this.state.hasWebGLError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { capabilities } = this.state;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      return (
        <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
          <div className="flex items-center mb-4">
            <Monitor className="w-10 h-10 text-blue-500 mr-3" />
            <AlertTriangle className="w-6 h-6 text-amber-500" />
          </div>
          
          <h2 className="text-xl font-semibold text-blue-800 mb-2 text-center">
            3D Graphics Not Available
          </h2>
          
          <p className="text-blue-600 text-center mb-4 max-w-md">
            {!capabilities?.webglSupported ? (
              "Your browser doesn't support WebGL, which is required for 3D visualization."
            ) : (
              "There was a problem initializing 3D graphics. This might be due to hardware limitations or browser settings."
            )}
          </p>

          {/* Suggestions based on device type */}
          <div className="bg-white rounded-lg p-4 mb-6 max-w-lg">
            <h3 className="font-medium text-gray-800 mb-3 flex items-center">
              {isMobile ? <Smartphone className="w-4 h-4 mr-2" /> : <Monitor className="w-4 h-4 mr-2" />}
              Suggested Solutions:
            </h3>
            
            <ul className="text-sm text-gray-600 space-y-2">
              {!capabilities?.webglSupported ? (
                <>
                  <li>• Update your browser to the latest version</li>
                  <li>• Try using Chrome, Firefox, Safari, or Edge</li>
                  <li>• Check if hardware acceleration is enabled in browser settings</li>
                </>
              ) : (
                <>
                  <li>• Refresh the page to retry 3D initialization</li>
                  <li>• Close other browser tabs to free up graphics memory</li>
                  <li>• Restart your browser if the problem persists</li>
                </>
              )}
              
              {isMobile && (
                <>
                  <li>• Ensure your device has sufficient available memory</li>
                  <li>• Try closing other apps running in the background</li>
                </>
              )}
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mb-4">
            <button
              onClick={this.handleRetry}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Retry 3D Graphics
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <Monitor className="w-4 h-4 mr-2" />
              Reload Page
            </button>
          </div>

          {/* Technical details toggle */}
          <button
            onClick={this.toggleTechnicalDetails}
            className="text-sm text-blue-600 hover:text-blue-800 underline mb-2"
          >
            {this.state.showTechnicalDetails ? 'Hide' : 'Show'} Technical Details
          </button>

          {/* Technical details */}
          {this.state.showTechnicalDetails && capabilities && (
            <div className="w-full max-w-2xl bg-gray-50 rounded-lg p-4 text-xs">
              <h4 className="font-medium text-gray-800 mb-2">Device Capabilities:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600">
                <div>WebGL Support: {capabilities.webglSupported ? '✓' : '✗'}</div>
                <div>WebGL2 Support: {capabilities.webgl2Supported ? '✓' : '✗'}</div>
                <div>Max Texture Size: {capabilities.maxTextureSize || 'Unknown'}</div>
                <div>Device Pixel Ratio: {capabilities.devicePixelRatio}</div>
                <div>CPU Cores: {capabilities.hardwareConcurrency}</div>
                <div>Performance Tier: {capabilities.performanceTier}</div>
              </div>
              
              {this.state.error && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-1">Error Details:</h4>
                  <div className="text-red-600 font-mono break-all">
                    {this.state.error.message}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Fallback message */}
          <p className="text-xs text-gray-500 text-center mt-4 max-w-md">
            You can still use the lineup management features. Only 3D visualization is affected.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}