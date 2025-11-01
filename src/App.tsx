import { useState } from 'react';
import { HockeyPosition } from './types';
import { LineupGrid } from './components/lineup/LineupGrid';
import { PopSelector } from './components/lineup/PopSelector';
import { useLineupStore } from './stores/lineupStore';

function App() {
  const [isPopSelectorOpen, setIsPopSelectorOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<HockeyPosition | null>(null);
  const { currentLineup, getAssignedPositions } = useLineupStore();

  const handlePositionClick = (position: HockeyPosition) => {
    setSelectedPosition(position);
    setIsPopSelectorOpen(true);
  };

  const handleClosePopSelector = () => {
    setIsPopSelectorOpen(false);
    setSelectedPosition(null);
  };

  const assignedCount = getAssignedPositions().length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Diet Pop NHL Lineup Enhanced
          </h1>
          <p className="text-blue-200 text-lg">
            Organize your favorite diet sodas into hockey-style lineups
          </p>
          
          {/* Lineup Stats */}
          <div className="mt-6 flex justify-center space-x-6 text-sm">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="text-white font-medium">{currentLineup.name}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="text-white font-medium">
                {assignedCount}/18 positions filled
              </div>
            </div>
          </div>
        </header>
        
        <main>
          <LineupGrid onPositionClick={handlePositionClick} />
          
          <PopSelector
            isOpen={isPopSelectorOpen}
            onClose={handleClosePopSelector}
            selectedPosition={selectedPosition}
          />
        </main>
      </div>
    </div>
  );
}

export default App