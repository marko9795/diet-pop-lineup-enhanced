import { useState } from 'react';
import { HockeyPosition } from './types';
import { LineupGrid } from './components/lineup/LineupGrid';
import { PopSelector } from './components/lineup/PopSelector';
import { ExportModal } from './components/export';
import { useLineupStore } from './stores/lineupStore';
import { PopViewerSimpleTest } from './components/3d';
import { useResponsive } from './hooks/useResponsive';
import { DevPerformanceOverlay } from './components/debug/PerformanceMonitor';
import { ErrorBoundary, WebGLErrorBoundary } from './components/error';
import { NotificationContainer, useNotifications } from './components/ui';
import { Download, Menu, X } from 'lucide-react';

function App() {
  const [isPopSelectorOpen, setIsPopSelectorOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<HockeyPosition | null>(null);
  const { currentLineup, getAssignedPositions } = useLineupStore();
  const { isMobile, isTablet } = useResponsive();
  const { notifications, removeNotification, success, info } = useNotifications();

  const handlePositionClick = (position: HockeyPosition) => {
    setSelectedPosition(position);
    setIsPopSelectorOpen(true);
    info('Position Selected', `Choose a pop for ${position.name}`);
  };

  const handleClosePopSelector = () => {
    setIsPopSelectorOpen(false);
    setSelectedPosition(null);
  };

  const assignedCount = getAssignedPositions().length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <header className="text-center mb-4 sm:mb-8">
          {/* Mobile Header */}
          {isMobile && (
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 bg-white/10 backdrop-blur-sm rounded-lg text-white"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <h1 className="text-xl font-bold text-white truncate mx-4">
                Diet Pop Lineup
              </h1>
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Desktop Header */}
          {!isMobile && (
            <>
              <h1 className={`font-bold text-white mb-2 ${
                isTablet ? 'text-3xl' : 'text-4xl'
              }`}>
                Diet Pop NHL Lineup Enhanced
              </h1>
              <p className={`text-blue-200 ${
                isTablet ? 'text-base' : 'text-lg'
              }`}>
                Organize your favorite diet sodas into hockey-style lineups
              </p>
            </>
          )}
          
          {/* Mobile Menu Dropdown */}
          {isMobile && isMobileMenuOpen && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4 space-y-3">
              <div className="text-white font-medium text-center">
                {currentLineup.name}
              </div>
              <div className="text-white font-medium text-center">
                {assignedCount}/18 positions filled
              </div>
              <p className="text-blue-200 text-sm text-center">
                Organize your favorite diet sodas into hockey-style lineups
              </p>
            </div>
          )}

          {/* Desktop/Tablet Stats and Actions */}
          {!isMobile && (
            <div className="mt-6 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 text-sm">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <div className="text-white font-medium">{currentLineup.name}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <div className="text-white font-medium">
                    {assignedCount}/18 positions filled
                  </div>
                </div>
              </div>
              
              {/* Export Button */}
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </button>
            </div>
          )}
        </header>
        
        <main>
          {/* 3D Test Section - temporary for development */}
          <div className="mb-8">
            <WebGLErrorBoundary
              onWebGLError={(error, capabilities) => {
                console.error('3D Graphics Error:', { error, capabilities });
              }}
            >
              <PopViewerSimpleTest />
            </WebGLErrorBoundary>
          </div>
          
          <ErrorBoundary>
            <LineupGrid onPositionClick={handlePositionClick} />
          </ErrorBoundary>
          
          <ErrorBoundary>
            <PopSelector
              isOpen={isPopSelectorOpen}
              onClose={handleClosePopSelector}
              selectedPosition={selectedPosition}
            />
          </ErrorBoundary>
          
          <ErrorBoundary>
            <ExportModal
              isOpen={isExportModalOpen}
              onClose={() => setIsExportModalOpen(false)}
            />
          </ErrorBoundary>
        </main>
        
        {/* Development Performance Monitor */}
        <DevPerformanceOverlay />
        
        {/* Global Notifications */}
        <NotificationContainer
          notifications={notifications}
          onDismiss={removeNotification}
          position="top-right"
        />
      </div>
    </div>
  );
}

export default App