import { useState } from 'react';
import { PopViewerSimple } from './PopViewerSimple';
import { usePopStore } from '../../stores/popStore';
import { PopViewerLoadingState, useNotifications } from '../ui';

export function PopViewerSimpleTest() {
  const { pops } = usePopStore();
  const [selectedPop, setSelectedPop] = useState<any>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { success, info } = useNotifications();

  const handlePopClick = async (pop: any) => {
    console.log('Pop clicked:', pop.name);
    setIsLoading(true);
    setSelectedPop(pop);
    
    info('Loading 3D Viewer', `Preparing ${pop.name} for 3D visualization`);
    
    // Simulate loading time for 3D model
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    setIsViewerOpen(true);
    success('3D Viewer Ready', `${pop.name} is now ready for viewing`);
  };

  const handleCloseViewer = () => {
    console.log('Closing viewer');
    setIsViewerOpen(false);
    setSelectedPop(null);
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-white mb-4 text-center">
        Simple 3D Can Test - Click a Pop
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
        Minimal 3D can with basic geometry and lighting
      </div>

      {isLoading && selectedPop && (
        <div className="fixed inset-0 z-50 bg-black/80">
          <PopViewerLoadingState 
            popName={selectedPop.name}
            className="h-full"
          />
        </div>
      )}

      <PopViewerSimple
        pop={selectedPop}
        isOpen={isViewerOpen && !isLoading}
        onClose={handleCloseViewer}
      />
    </div>
  );
}