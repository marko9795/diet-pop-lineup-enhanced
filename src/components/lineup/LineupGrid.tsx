import React from 'react';
import { motion } from 'framer-motion';
import { HockeyPosition } from '../../types';
import { PositionSlot } from './PositionSlot';
import { useResponsive } from '../../hooks/useResponsive';
import positionsData from '../../data/positions.json';

interface LineupGridProps {
  onPositionClick: (position: HockeyPosition) => void;
}

export const LineupGrid: React.FC<LineupGridProps> = ({ onPositionClick }) => {
  const positions = positionsData as HockeyPosition[];
  const { isMobile, isTablet } = useResponsive();
  
  // Group positions by line and type
  const forwardLines = [1, 2, 3, 4].map(lineNum => 
    positions.filter(p => p.type === 'forward' && p.line === lineNum)
  );
  
  const defenseLines = [1, 2, 3].map(lineNum => 
    positions.filter(p => p.type === 'defense' && p.line === lineNum)
  );

  // Responsive sizing
  const containerClasses = isMobile 
    ? "w-full max-w-sm mx-auto p-3" 
    : isTablet 
    ? "w-full max-w-3xl mx-auto p-4" 
    : "w-full max-w-4xl mx-auto p-6";

  const cardClasses = isMobile
    ? "bg-white rounded-lg shadow-lg p-3"
    : "bg-white rounded-xl shadow-lg p-6";

  const titleClasses = isMobile
    ? "text-xl font-bold text-center mb-4 text-gray-800"
    : "text-2xl font-bold text-center mb-6 text-gray-800";

  const sectionTitleClasses = isMobile
    ? "text-base font-semibold mb-3 text-gray-700 text-center"
    : "text-lg font-semibold mb-4 text-gray-700 text-center";

  const lineSpacing = isMobile ? "space-y-3" : "space-y-6";
  const sectionSpacing = isMobile ? "mb-6" : "mb-8";

  return (
    <motion.div 
      className={containerClasses}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className={cardClasses}
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <motion.h2 
          className={titleClasses}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {isMobile ? "Hockey Lineup" : "Diet Pop Hockey Lineup"}
        </motion.h2>
        
        {/* Forward Lines */}
        <motion.div 
          className={sectionSpacing}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.h3 
            className={sectionTitleClasses}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Forward Lines
          </motion.h3>
          <div className={lineSpacing}>
            {forwardLines.map((line, lineIndex) => (
              <motion.div 
                key={`forward-line-${lineIndex + 1}`} 
                className="flex justify-center"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + lineIndex * 0.1 }}
              >
                <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-4'}`}>
                  <div className={`font-medium text-gray-500 text-center ${
                    isMobile ? 'text-xs w-8' : 'text-sm w-12'
                  }`}>
                    {isMobile ? `L${lineIndex + 1}` : `Line ${lineIndex + 1}`}
                  </div>
                  <div className="flex flex-col space-y-1">
                    {/* Position Headers - only show for first line and not on mobile */}
                    {lineIndex === 0 && !isMobile && (
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
                    <div className={`flex ${isMobile ? 'space-x-2' : 'space-x-3'}`}>
                      {line
                        .sort((a, b) => a.coordinates.x - b.coordinates.x)
                        .map((position) => (
                          <PositionSlot
                            key={position.id}
                            position={position}
                            onSlotClick={onPositionClick}
                            size={isMobile ? 'small' : isTablet ? 'medium' : 'large'}
                          />
                        ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Defense Lines */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <motion.h3 
            className={sectionTitleClasses}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            Defense Pairs
          </motion.h3>
          <div className={lineSpacing}>
            {defenseLines.map((line, lineIndex) => (
              <motion.div 
                key={`defense-line-${lineIndex + 1}`} 
                className="flex justify-center"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 + lineIndex * 0.1 }}
              >
                <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-4'}`}>
                  <div className={`font-medium text-gray-500 text-center ${
                    isMobile ? 'text-xs w-8' : 'text-sm w-12'
                  }`}>
                    {isMobile ? `P${lineIndex + 1}` : `Pair ${lineIndex + 1}`}
                  </div>
                  <div className="flex flex-col space-y-1">
                    {/* Position Headers - only show for first pair and not on mobile */}
                    {lineIndex === 0 && !isMobile && (
                      <div className={`flex ${isMobile ? 'space-x-4' : 'space-x-8'}`}>
                        <div className="w-20 text-center text-xs font-medium text-gray-600">
                          Left Defense
                        </div>
                        <div className="w-20 text-center text-xs font-medium text-gray-600">
                          Right Defense
                        </div>
                      </div>
                    )}
                    {/* Position Slots */}
                    <div className={`flex ${isMobile ? 'space-x-4' : 'space-x-8'}`}>
                      {line
                        .sort((a, b) => a.coordinates.x - b.coordinates.x)
                        .map((position) => (
                          <PositionSlot
                            key={position.id}
                            position={position}
                            onSlotClick={onPositionClick}
                            size={isMobile ? 'small' : isTablet ? 'medium' : 'large'}
                          />
                        ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Lineup Stats */}
        {!isMobile && (
          <motion.div 
            className="mt-8 pt-6 border-t border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
          >
            <div className={`flex justify-center text-sm text-gray-600 ${
              isTablet ? 'space-x-6' : 'space-x-8'
            }`}>
              <div className="text-center">
                <div className="font-medium">Forward Lines</div>
                <div className={`font-bold text-green-600 ${
                  isTablet ? 'text-xl' : 'text-2xl'
                }`}>4</div>
              </div>
              <div className="text-center">
                <div className="font-medium">Defense Pairs</div>
                <div className={`font-bold text-blue-600 ${
                  isTablet ? 'text-xl' : 'text-2xl'
                }`}>3</div>
              </div>
              <div className="text-center">
                <div className="font-medium">Total Positions</div>
                <div className={`font-bold text-gray-800 ${
                  isTablet ? 'text-xl' : 'text-2xl'
                }`}>18</div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};