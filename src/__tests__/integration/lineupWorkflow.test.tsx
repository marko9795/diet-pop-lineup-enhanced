import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { LineupGrid } from '../../components/lineup/LineupGrid';
import { PopSelector } from '../../components/lineup/PopSelector';
import { useLineupStore } from '../../stores/lineupStore';
import { usePopStore } from '../../stores/popStore';
import { HockeyPosition } from '../../types';

// Mock the hooks
vi.mock('../../hooks/useResponsive', () => ({
  useResponsive: () => ({
    isMobile: false,
    isTablet: false,
  }),
}));

// Mock position data
vi.mock('../../data/positions.json', () => ({
  default: [
    {
      id: 'lw1',
      name: 'Left Wing',
      line: 1,
      type: 'forward',
      coordinates: { x: 0, y: 0 },
    },
    {
      id: 'c1',
      name: 'Center',
      line: 1,
      type: 'forward',
      coordinates: { x: 1, y: 0 },
    },
  ],
}));

const mockPosition: HockeyPosition = {
  id: 'lw1',
  name: 'Left Wing',
  line: 1,
  type: 'forward',
  coordinates: { x: 0, y: 0 },
};

describe('Lineup Creation Workflow', () => {
  beforeEach(() => {
    // Reset stores before each test
    useLineupStore.getState().clearLineup();
    usePopStore.getState().clearFilters();
  });

  it('should handle lineup state management workflow', () => {
    const { assignPopToPosition, removePopFromPosition, getAssignedPositions, isPositionOccupied } = useLineupStore.getState();

    // Step 1: Verify initial empty state
    expect(getAssignedPositions()).toHaveLength(0);
    expect(isPositionOccupied('lw1')).toBe(false);

    // Step 2: Assign pop to position
    assignPopToPosition('lw1', 'diet-coke');
    expect(getAssignedPositions()).toHaveLength(1);
    expect(isPositionOccupied('lw1')).toBe(true);

    // Step 3: Assign another pop
    assignPopToPosition('c1', 'diet-pepsi');
    expect(getAssignedPositions()).toHaveLength(2);

    // Step 4: Remove a pop
    removePopFromPosition('lw1');
    expect(getAssignedPositions()).toHaveLength(1);
    expect(isPositionOccupied('lw1')).toBe(false);
    expect(isPositionOccupied('c1')).toBe(true);
  });

  it('should handle pop search and filtering workflow', () => {
    const { setSearchTerm, toggleBrand, clearFilters, searchPops, getAvailableBrands } = usePopStore.getState();

    // Step 1: Test search functionality
    const searchResults = searchPops('diet');
    expect(searchResults.length).toBeGreaterThan(0);
    expect(searchResults.every(pop => 
      pop.name.toLowerCase().includes('diet') ||
      pop.brand.toLowerCase().includes('diet') ||
      pop.parentCompany.toLowerCase().includes('diet')
    )).toBe(true);

    // Step 2: Test brand filtering
    const brands = getAvailableBrands();
    expect(brands.length).toBeGreaterThan(0);
    
    setSearchTerm('coke');
    const { filteredPops: cokeResults } = usePopStore.getState();
    expect(cokeResults.every(pop => 
      pop.name.toLowerCase().includes('coke') ||
      pop.brand.toLowerCase().includes('coke') ||
      pop.parentCompany.toLowerCase().includes('coke')
    )).toBe(true);

    // Step 3: Test filter clearing
    clearFilters();
    const { searchTerm, selectedBrands, filteredPops } = usePopStore.getState();
    expect(searchTerm).toBe('');
    expect(selectedBrands).toEqual([]);
    expect(filteredPops.length).toBeGreaterThan(0);
  });

  it('should handle complete lineup workflow with multiple operations', () => {
    const { assignPopToPosition, updateLineupName, clearLineup, currentLineup } = useLineupStore.getState();
    const { getPopById } = usePopStore.getState();

    // Step 1: Update lineup name
    updateLineupName('Test Lineup');
    expect(useLineupStore.getState().currentLineup.name).toBe('Test Lineup');

    // Step 2: Build a complete first line
    assignPopToPosition('lw1', 'diet-coke');
    assignPopToPosition('c1', 'diet-pepsi');
    assignPopToPosition('rw1', 'diet-sprite');

    // Step 3: Verify lineup state
    const assignments = useLineupStore.getState().getAssignedPositions();
    expect(assignments).toHaveLength(3);
    expect(assignments).toContain('lw1');
    expect(assignments).toContain('c1');
    expect(assignments).toContain('rw1');

    // Step 4: Verify pop assignments are correct
    const lwPop = getPopById(useLineupStore.getState().getAssignedPop('lw1')!);
    const cPop = getPopById(useLineupStore.getState().getAssignedPop('c1')!);
    const rwPop = getPopById(useLineupStore.getState().getAssignedPop('rw1')!);

    expect(lwPop?.id).toBe('diet-coke');
    expect(cPop?.id).toBe('diet-pepsi');
    expect(rwPop?.id).toBe('diet-sprite');

    // Step 5: Clear lineup
    clearLineup();
    expect(useLineupStore.getState().getAssignedPositions()).toHaveLength(0);
  });
});