import { useState } from 'react';
import { PopViewer } from './PopViewer';
import { usePopStore } from '../../stores/popStore';

export function PopViewerTest() {
  const { pops } = usePopStore();
  const [selectedPop, setSelectedPop] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

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
      <h2 className="text-2xl font-bold text-white mb-4 text-center">
        Pop Viewer Test - Click a Pop to View in 3D
      </h2>
      
      {/* Pop Selection Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        {pops.slice(0, 12).map((pop) => (
          <button
            key={pop.id}
            onClick={() => handlePopClick(pop)}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-colors"
          >
            <div 
              className="w-full h-16 rounded-lg mb-2"
              style={{ backgroundColor: pop.brandColors.primary }}
            />
            <div className="text-white text-sm font-medium truncate">
              {pop.name}
            </div>
            <div className="text-white/70 text-xs">
              {pop.brand}
            </div>
          </button>
        ))}
      </div>

      {/* PopViewer Modal */}
      <PopViewer
        pop={selectedPop}
        isOpen={isViewerOpen}
        onClose={handleCloseViewer}
      />
    </div>
  );
}