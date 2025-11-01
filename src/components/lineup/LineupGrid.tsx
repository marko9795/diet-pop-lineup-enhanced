import React from 'react';
import { HockeyPosition } from '../../types';
import { PositionSlot } from './PositionSlot';
import positionsData from '../../data/positions.json';

interface LineupGridProps {
  onPositionClick: (position: HockeyPosition) => void;
}

export const LineupGrid: React.FC<LineupGridProps> = ({ onPositionClick }) => {
  const positions = positionsData as HockeyPosition[];
  
  // Group positions by line and type
  const forwardLines = [1, 2, 3, 4].map(lineNum => 
    positions.filter(p => p.type === 'forward' && p.line === lineNum)
  );
  
  const defenseLines = [1, 2, 3].map(lineNum => 
    positions.filter(p => p.type === 'defense' && p.line === lineNum)
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Diet Pop Hockey Lineup
        </h2>
        
        {/* Forward Lines */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 text-center">
            Forward Lines
          </h3>
          <div className="space-y-6">
            {forwardLines.map((line, lineIndex) => (
              <div key={`forward-line-${lineIndex + 1}`} className="flex justify-center">
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-medium text-gray-500 w-12 text-center">
                    Line {lineIndex + 1}
                  </div>
                  <div className="flex flex-col space-y-2">
                    {/* Position Headers - only show for first line */}
                    {lineIndex === 0 && (
                      <div className="flex space-x-3">
                        <div className="w-20 text-center text-xs font-medium text-gray-600">
                          Left Wing
                        </div>
                        <div className="w-20 text-center text-xs font-medium text-gray-600">
                          Center
                        </div>
                        <div className="w-20 text-center text-xs font-medium text-gray-600">
                          Right Wing
                        </div>
                      </div>
                    )}
                    {/* Position Slots */}
                    <div className="flex space-x-3">
                      {line
                        .sort((a, b) => a.coordinates.x - b.coordinates.x)
                        .map((position) => (
                          <PositionSlot
                            key={position.id}
                            position={position}
                            onSlotClick={onPositionClick}
                          />
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Defense Lines */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700 text-center">
            Defense Pairs
          </h3>
          <div className="space-y-6">
            {defenseLines.map((line, lineIndex) => (
              <div key={`defense-line-${lineIndex + 1}`} className="flex justify-center">
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-medium text-gray-500 w-12 text-center">
                    Pair {lineIndex + 1}
                  </div>
                  <div className="flex flex-col space-y-2">
                    {/* Position Headers - only show for first pair */}
                    {lineIndex === 0 && (
                      <div className="flex space-x-8">
                        <div className="w-20 text-center text-xs font-medium text-gray-600">
                          Left Defense
                        </div>
                        <div className="w-20 text-center text-xs font-medium text-gray-600">
                          Right Defense
                        </div>
                      </div>
                    )}
                    {/* Position Slots */}
                    <div className="flex space-x-8">
                      {line
                        .sort((a, b) => a.coordinates.x - b.coordinates.x)
                        .map((position) => (
                          <PositionSlot
                            key={position.id}
                            position={position}
                            onSlotClick={onPositionClick}
                          />
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lineup Stats */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-center space-x-8 text-sm text-gray-600">
            <div className="text-center">
              <div className="font-medium">Forward Lines</div>
              <div className="text-2xl font-bold text-green-600">4</div>
            </div>
            <div className="text-center">
              <div className="font-medium">Defense Pairs</div>
              <div className="text-2xl font-bold text-blue-600">3</div>
            </div>
            <div className="text-center">
              <div className="font-medium">Total Positions</div>
              <div className="text-2xl font-bold text-gray-800">18</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};