import { useState } from 'react';
import { PopViewerBasic } from './PopViewerBasic';
import { usePopStore } from '../../stores/popStore';

export function PopViewerBasicTest() {
  const { pops } = usePopStore();
  const [selectedPop, setSelectedPop] = useState<any>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const handlePopClick = (pop: any) => {
    console.log('Pop clicked:', pop.name);
    setSelectedPop(pop);
    setIsViewerOpen(true);
  };

  const handleCloseViewer = () => {
    console.log('Closing viewer');
    setIsViewerOpen(false);
    setSelectedPop(null);
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-white mb-4 text-center">
        3D Pop Viewer - Click a Pop to View in 3D
      </h2>
      
      <div className="grid grid-cols-3 gap-4 mb-8 max-w-lg mx-auto">
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

      <div className="text-center text-white/60 text-sm mb-4">
        Interactive 3D pop cans with realistic branding and materials
      </div>

      <PopViewerBasic
        pop={selectedPop}
        isOpen={isViewerOpen}
        onClose={handleCloseViewer}
      />
    </div>
  );
}