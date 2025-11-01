import React from 'react';
import { HockeyPosition } from '../../types';
import { useLineupStore } from '../../stores/lineupStore';
import { usePopStore } from '../../stores/popStore';

interface PositionSlotProps {
  position: HockeyPosition;
  onSlotClick: (position: HockeyPosition) => void;
}

export const PositionSlot: React.FC<PositionSlotProps> = ({ position, onSlotClick }) => {
  const { getAssignedPop, isPositionOccupied } = useLineupStore();
  const { getPopById } = usePopStore();
  
  const assignedPopId = getAssignedPop(position.id);
  const assignedPop = assignedPopId ? getPopById(assignedPopId) : undefined;
  const isOccupied = isPositionOccupied(position.id);

  const handleClick = () => {
    onSlotClick(position);
  };

  return (
    <div
      className={`
        relative w-20 h-24 border-2 rounded-lg cursor-pointer transition-all duration-200
        ${isOccupied 
          ? 'border-blue-500 bg-blue-50 hover:bg-blue-100' 
          : 'border-gray-300 bg-gray-50 hover:bg-gray-100 border-dashed'
        }
        hover:scale-105 hover:shadow-md
      `}
      onClick={handleClick}
    >


      {/* Pop Display */}
      <div className="flex flex-col items-center justify-center h-full p-2">
        {assignedPop ? (
          <>
            {/* Pop Can Visual */}
            <div 
              className="w-8 h-12 rounded-sm mb-1 border"
              style={{ 
                backgroundColor: assignedPop.brandColors.primary,
                borderColor: assignedPop.brandColors.secondary 
              }}
            />
            {/* Pop Name */}
            <div className="text-xs text-center font-medium text-gray-700 leading-tight">
              {assignedPop.name.split(' ').slice(0, 2).join(' ')}
            </div>
          </>
        ) : (
          <>
            {/* Empty Slot Indicator */}
            <div className="w-8 h-12 border-2 border-dashed border-gray-300 rounded-sm mb-1 flex items-center justify-center">
              <span className="text-gray-400 text-lg">+</span>
            </div>
            <div className="text-xs text-gray-400 text-center">
              Empty
            </div>
          </>
        )}
      </div>

      {/* Position Type Indicator */}
      <div className={`
        absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-medium
        ${position.type === 'forward' 
          ? 'bg-green-100 text-green-700' 
          : 'bg-blue-100 text-blue-700'
        }
      `}>
        {position.type === 'forward' ? 'F' : 'D'}
      </div>
    </div>
  );
};