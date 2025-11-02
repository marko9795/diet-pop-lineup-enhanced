import { useState } from 'react';
import { PopViewerDebug } from './PopViewerDebug';
import { usePopStore } from '../../stores/popStore';

export function PopViewerDebugTest() {
  const { pops } = usePopStore();
  const [selectedPop, setSelectedPop] = useState<any>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const handlePopClick = (pop: any) => {
    console.log('Pop clicked:', pop);
    setSelectedPop(pop);
    setIsViewerOpen(true);
  };

  const handleCloseViewer = () => {
    console.log('Closing viewer');
    setIsViewerOpen(false);
    setSelectedPop(null);
  };

  console.log('Current state:', { selectedPop: selectedPop?.name, isViewerOpen });

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-white mb-4 text-center">
        Debug Pop Viewer - Click a Pop to Test
      </h2>
      
      {/* Simple Pop Selection */}
      <div className="grid grid-cols-3 gap-4 mb-8 max-w-md mx-auto">
        {pops.slice(0, 6).map((pop) => (
          <button
            key={pop.id}
            onClick={() => handlePopClick(pop)}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-3 hover:bg-white/20 transition-colors"
          >
            <div 
              className="w-full h-12 rounded mb-2"
              style={{ backgroundColor: pop.brandColors.primary }}
            />
            <div className="text-white text-xs font-medium truncate">
              {pop.name}
            </div>
          </button>
        ))}
      </div>

      {/* Current State Display */}
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 mb-4 max-w-md mx-auto">
        <h3 className="text-white font-semibold mb-2">Current State:</h3>
        <div className="text-white/80 text-sm">
          <div>Selected Pop: {selectedPop?.name || 'None'}</div>
          <div>Viewer Open: {isViewerOpen ? 'Yes' : 'No'}</div>
          <div>Total Pops: {pops.length}</div>
        </div>
      </div>

      {/* PopViewer Modal */}
      <PopViewerDebug
        pop={selectedPop}
        isOpen={isViewerOpen}
        onClose={handleCloseViewer}
      />
    </div>
  );
}