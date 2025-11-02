import React, { useState, useEffect } from 'react';
import { HockeyPosition, Pop } from '../../types';
import { usePopStore } from '../../stores/popStore';
import { useLineupStore } from '../../stores/lineupStore';
import { useResponsive } from '../../hooks/useResponsive';

interface PopSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPosition: HockeyPosition | null;
}

export const PopSelector: React.FC<PopSelectorProps> = ({ 
  isOpen, 
  onClose, 
  selectedPosition 
}) => {
  const {
    filteredPops,
    selectedBrands,
    setSearchTerm,
    toggleBrand,
    clearFilters,
    getAvailableBrands,
  } = usePopStore();
  
  const { 
    assignPopToPosition, 
    removePopFromPosition, 
    getAssignedPop 
  } = useLineupStore();

  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const availableBrands = getAvailableBrands();
  const currentAssignedPopId = selectedPosition ? getAssignedPop(selectedPosition.id) : undefined;
  const { isMobile, isTablet } = useResponsive();

  useEffect(() => {
    setSearchTerm(localSearchTerm);
  }, [localSearchTerm, setSearchTerm]);

  const handlePopSelect = (pop: Pop) => {
    if (selectedPosition) {
      assignPopToPosition(selectedPosition.id, pop.id);
      onClose();
    }
  };

  const handleRemovePop = () => {
    if (selectedPosition) {
      removePopFromPosition(selectedPosition.id);
      onClose();
    }
  };

  const handleClearFilters = () => {
    setLocalSearchTerm('');
    clearFilters();
  };

  if (!isOpen || !selectedPosition) return null;

  const modalClasses = isMobile
    ? "bg-white rounded-t-xl shadow-2xl w-full h-full max-h-[95vh] overflow-hidden"
    : "bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden";

  const containerClasses = isMobile
    ? "fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50"
    : "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4";

  return (
    <div className={containerClasses}>
      <div className={modalClasses}>
        {/* Header */}
        <div className={`bg-gray-50 border-b ${isMobile ? 'px-4 py-3' : 'px-6 py-4'}`}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className={`font-bold text-gray-800 ${
                isMobile ? 'text-lg truncate' : 'text-xl'
              }`}>
                {isMobile ? selectedPosition.name : `Select Pop for ${selectedPosition.name}`}
              </h2>
              <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Line {selectedPosition.line} • {selectedPosition.type}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`text-gray-400 hover:text-gray-600 font-bold ml-2 ${
                isMobile ? 'text-xl' : 'text-2xl'
              }`}
            >
              ×
            </button>
          </div>
        </div>

        {/* Current Assignment */}
        {currentAssignedPopId && (
          <div className={`bg-blue-50 border-b ${isMobile ? 'px-4 py-2' : 'px-6 py-3'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-blue-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Currently: <strong className={isMobile ? 'truncate max-w-32' : ''}>
                  {filteredPops.find(p => p.id === currentAssignedPopId)?.name}
                </strong>
              </span>
              <button
                onClick={handleRemovePop}
                className={`text-red-600 hover:text-red-800 font-medium ${
                  isMobile ? 'text-xs' : 'text-sm'
                }`}
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className={`border-b bg-gray-50 ${isMobile ? 'px-4 py-3' : 'px-6 py-4'}`}>
          <div className={`flex flex-col ${isMobile ? 'space-y-3' : 'space-y-4'}`}>
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder={isMobile ? "Search pops..." : "Search pops by name, brand, or company..."}
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                className={`w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2'
                }`}
              />
              {localSearchTerm && (
                <button
                  onClick={() => setLocalSearchTerm('')}
                  className={`absolute right-3 text-gray-400 hover:text-gray-600 ${
                    isMobile ? 'top-2' : 'top-2.5'
                  }`}
                >
                  ×
                </button>
              )}
            </div>

            {/* Brand Filters */}
            <div className="flex flex-wrap gap-2">
              <span className={`font-medium text-gray-700 self-center ${
                isMobile ? 'text-xs' : 'text-sm'
              }`}>
                {isMobile ? 'Brands:' : 'Brands:'}
              </span>
              {availableBrands.slice(0, isMobile ? 4 : availableBrands.length).map((brand) => (
                <button
                  key={brand}
                  onClick={() => toggleBrand(brand)}
                  className={`rounded-full font-medium transition-colors ${
                    isMobile ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'
                  } ${
                    selectedBrands.includes(brand)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {brand}
                </button>
              ))}
              {isMobile && availableBrands.length > 4 && (
                <span className="text-xs text-gray-500 self-center">
                  +{availableBrands.length - 4} more
                </span>
              )}
              {(localSearchTerm || selectedBrands.length > 0) && (
                <button
                  onClick={handleClearFilters}
                  className={`rounded-full font-medium bg-red-100 text-red-700 hover:bg-red-200 ${
                    isMobile ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'
                  }`}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Pop Grid */}
        <div className={`flex-1 overflow-y-auto ${isMobile ? 'p-4' : 'p-6'}`}>
          {filteredPops.length === 0 ? (
            <div className={`text-center ${isMobile ? 'py-8' : 'py-12'}`}>
              <div className={`text-gray-400 mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
                No pops found
              </div>
              <p className={`text-gray-500 ${isMobile ? 'text-sm' : 'text-base'}`}>
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className={`grid gap-3 ${
              isMobile 
                ? 'grid-cols-2' 
                : isTablet 
                ? 'grid-cols-3' 
                : 'grid-cols-4'
            }`}>
              {filteredPops.map((pop) => (
                <div
                  key={pop.id}
                  onClick={() => handlePopSelect(pop)}
                  className={`bg-white border border-gray-200 rounded-lg cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200 active:scale-95 ${
                    isMobile ? 'p-3' : 'p-4'
                  }`}
                >
                  {/* Pop Can Visual */}
                  <div className={`flex justify-center ${isMobile ? 'mb-2' : 'mb-3'}`}>
                    <div
                      className={`rounded-sm border-2 ${
                        isMobile ? 'w-10 h-14' : 'w-12 h-16'
                      }`}
                      style={{
                        backgroundColor: pop.brandColors.primary,
                        borderColor: pop.brandColors.secondary,
                      }}
                    />
                  </div>
                  
                  {/* Pop Info */}
                  <div className="text-center">
                    <h3 className={`font-medium text-gray-800 mb-1 leading-tight ${
                      isMobile ? 'text-xs' : 'text-sm'
                    }`}>
                      {isMobile ? pop.name.split(' ').slice(0, 2).join(' ') : pop.name}
                    </h3>
                    <p className={`text-gray-600 mb-2 ${
                      isMobile ? 'text-xs' : 'text-xs'
                    }`}>
                      {pop.brand}
                    </p>
                    <div className={`flex justify-center space-x-2 text-gray-500 ${
                      isMobile ? 'text-xs' : 'text-xs'
                    }`}>
                      <span>{pop.caffeine}mg</span>
                      {!isMobile && (
                        <>
                          <span>•</span>
                          <span>{pop.calories} cal</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`bg-gray-50 border-t ${isMobile ? 'px-4 py-3' : 'px-6 py-4'}`}>
          <div className={`flex justify-between items-center text-gray-600 ${
            isMobile ? 'text-xs' : 'text-sm'
          }`}>
            <span>{filteredPops.length} pops available</span>
            <button
              onClick={onClose}
              className={`bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors ${
                isMobile ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'
              }`}
            >
              {isMobile ? 'Close' : 'Cancel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};