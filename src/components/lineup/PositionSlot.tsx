import React from 'react';
import { HockeyPosition } from '../../types';
import { useLineupStore } from '../../stores/lineupStore';
import { usePopStore } from '../../stores/popStore';

interface PositionSlotProps {
  position: HockeyPosition;
  onSlotClick: (position: HockeyPosition) => void;
  size?: 'small' | 'medium' | 'large';
}

export const PositionSlot: React.FC<PositionSlotProps> = ({ 
  position, 
  onSlotClick, 
  size = 'large' 
}) => {
  const { getAssignedPop, isPositionOccupied } = useLineupStore();
  const { getPopById } = usePopStore();
  
  const assignedPopId = getAssignedPop(position.id);
  const assignedPop = assignedPopId ? getPopById(assignedPopId) : undefined;
  const isOccupied = isPositionOccupied(position.id);

  const handleClick = () => {
    onSlotClick(position);
  };

  // Size configurations
  const sizeConfig = {
    small: {
      container: 'w-16 h-20',
      can: 'w-6 h-10',
      text: 'text-xs',
      padding: 'p-1',
      indicator: 'text-xs px-1.5 py-0.5 -bottom-1.5',
      plus: 'text-sm'
    },
    medium: {
      container: 'w-18 h-22',
      can: 'w-7 h-11',
      text: 'text-xs',
      padding: 'p-1.5',
      indicator: 'text-xs px-2 py-0.5 -bottom-2',
      plus: 'text-base'
    },
    large: {
      container: 'w-20 h-24',
      can: 'w-8 h-12',
      text: 'text-xs',
      padding: 'p-2',
      indicator: 'text-xs px-2 py-0.5 -bottom-2',
      plus: 'text-lg'
    }
  };

  const config = sizeConfig[size];

  return (
    <div
      className={`
        relative ${config.container} border-2 rounded-lg cursor-pointer transition-all duration-200
        ${isOccupied 
          ? 'border-blue-500 bg-blue-50 hover:bg-blue-100' 
          : 'border-gray-300 bg-gray-50 hover:bg-gray-100 border-dashed'
        }
        hover:scale-105 hover:shadow-md active:scale-95
      `}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`${position.type} position slot${assignedPop ? `, assigned to ${assignedPop.name}` : ', empty'}`}
    >
      {/* Pop Display */}
      <div className={`flex flex-col items-center justify-center h-full ${config.padding}`}>
        {assignedPop ? (
          <>
            {/* Pop Can Visual */}
            <div 
              className={`${config.can} rounded-sm mb-1 border`}
              style={{ 
                backgroundColor: assignedPop.brandColors.primary,
                borderColor: assignedPop.brandColors.secondary 
              }}
            />
            {/* Pop Name */}
            <div className={`${config.text} text-center font-medium text-gray-700 leading-tight`}>
              {size === 'small' 
                ? assignedPop.name.split(' ')[0] 
                : assignedPop.name.split(' ').slice(0, 2).join(' ')
              }
            </div>
          </>
        ) : (
          <>
            {/* Empty Slot Indicator */}
            <div className={`${config.can} border-2 border-dashed border-gray-300 rounded-sm mb-1 flex items-center justify-center`}>
              <span className={`text-gray-400 ${config.plus}`}>+</span>
            </div>
            <div className={`${config.text} text-gray-400 text-center`}>
              {size === 'small' ? 'Add' : 'Empty'}
            </div>
          </>
        )}
      </div>

      {/* Position Type Indicator */}
      <div className={`
        absolute ${config.indicator} left-1/2 transform -translate-x-1/2 rounded-full font-medium
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