import { useState } from 'react';
import { PopViewerOptimized } from './PopViewerOptimized';
import { usePopStore } from '../../stores/popStore';

export function PopViewerOptimizedTest() {
  const { pops } = usePopStore();
  const [selectedPop, setSelectedPop] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [showPerformanceStats, setShowPerformanceStats] = useState(false);

  const handlePopClick = (pop: any) => {
    setSelectedPop(pop);
    setIsViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
    setSelectedPop(null);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">
          Optimized Pop Viewer Test - Click a Pop to View in 3D
        </h2>
        
        <label className="flex items-center space-x-2 text-white">
          <input
            type="checkbox"
            checked={showPerformanceStats}
            onChange={(e) => setShowPerformanceStats(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm">Show Performance Stats</span>
        </label>
      </div>
      
      {/* Pop Selection Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        {pops.slice(0, 12).map((pop) => (
          <button
            key={pop.id}
            onClick={() => handlePopClick(pop)}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-colors group"
          >
            <div 
              className="w-full h-16 rounded-lg mb-2 group-hover:scale-105 transition-transform"
              style={{ backgroundColor: pop.brandColors.primary }}
            />
            <div className="text-white text-sm font-medium truncate">
              {pop.name}
            </div>
            <div className="text-white/70 text-xs">
              {pop.brand}
            </div>
            <div className="text-white/50 text-xs mt-1">
              {pop.caffeine}mg caffeine
            </div>
          </button>
        ))}
      </div>

      {/* Performance Info */}
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 mb-8">
        <h3 className="text-white font-semibold mb-2">Performance Features:</h3>
        <ul className="text-white/80 text-sm space-y-1">
          <li>• Adaptive quality based on device capabilities</li>
          <li>• Level of Detail (LOD) system for geometry optimization</li>
          <li>• Dynamic texture quality adjustment</li>
          <li>• Memory management and resource disposal</li>
          <li>• FPS monitoring and automatic quality reduction</li>
          <li>• Mobile-optimized rendering pipeline</li>
        </ul>
      </div>

      {/* PopViewer Modal */}
      <PopViewerOptimized
        pop={selectedPop}
        isOpen={isViewerOpen}
        onClose={handleCloseViewer}
        showPerformanceStats={showPerformanceStats}
      />
    </div>
  );
}