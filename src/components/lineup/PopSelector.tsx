import React, { useState, useEffect } from 'react';
import { HockeyPosition, Pop } from '../../types';
import { usePopStore } from '../../stores/popStore';
import { useLineupStore } from '../../stores/lineupStore';

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Select Pop for {selectedPosition.name}
              </h2>
              <p className="text-sm text-gray-600">
                Line {selectedPosition.line} • {selectedPosition.type}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Current Assignment */}
        {currentAssignedPopId && (
          <div className="px-6 py-3 bg-blue-50 border-b">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                Currently assigned: <strong>{filteredPops.find(p => p.id === currentAssignedPopId)?.name}</strong>
              </span>
              <button
                onClick={handleRemovePop}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex flex-col space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search pops by name, brand, or company..."
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {localSearchTerm && (
                <button
                  onClick={() => setLocalSearchTerm('')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>

            {/* Brand Filters */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 self-center">Brands:</span>
              {availableBrands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => toggleBrand(brand)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedBrands.includes(brand)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {brand}
                </button>
              ))}
              {(localSearchTerm || selectedBrands.length > 0) && (
                <button
                  onClick={handleClearFilters}
                  className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Pop Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredPops.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">No pops found</div>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredPops.map((pop) => (
                <div
                  key={pop.id}
                  onClick={() => handlePopSelect(pop)}
                  className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200"
                >
                  {/* Pop Can Visual */}
                  <div className="flex justify-center mb-3">
                    <div
                      className="w-12 h-16 rounded-sm border-2"
                      style={{
                        backgroundColor: pop.brandColors.primary,
                        borderColor: pop.brandColors.secondary,
                      }}
                    />
                  </div>
                  
                  {/* Pop Info */}
                  <div className="text-center">
                    <h3 className="font-medium text-gray-800 text-sm mb-1 leading-tight">
                      {pop.name}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">{pop.brand}</p>
                    <div className="flex justify-center space-x-3 text-xs text-gray-500">
                      <span>{pop.caffeine}mg</span>
                      <span>•</span>
                      <span>{pop.calories} cal</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>{filteredPops.length} pops available</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};