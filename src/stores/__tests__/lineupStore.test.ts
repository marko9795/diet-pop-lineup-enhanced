import { describe, it, expect, beforeEach } from 'vitest';
import { useLineupStore } from '../lineupStore';

describe('LineupStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useLineupStore.getState().clearLineup();
    useLineupStore.getState().updateLineupName('My Diet Pop Lineup');
  });

  describe('assignPopToPosition', () => {
    it('should assign a pop to a position', () => {
      const { assignPopToPosition, getAssignedPop } = useLineupStore.getState();
      
      assignPopToPosition('lw1', 'diet-coke');
      
      expect(getAssignedPop('lw1')).toBe('diet-coke');
    });

    it('should update lineup updatedAt when assigning', () => {
      const { assignPopToPosition, currentLineup } = useLineupStore.getState();
      const initialTime = currentLineup.updatedAt;
      
      // Wait a bit to ensure time difference
      setTimeout(() => {
        assignPopToPosition('lw1', 'diet-coke');
        const updatedTime = useLineupStore.getState().currentLineup.updatedAt;
        expect(updatedTime.getTime()).toBeGreaterThan(initialTime.getTime());
      }, 10);
    });

    it('should overwrite existing assignment', () => {
      const { assignPopToPosition, getAssignedPop } = useLineupStore.getState();
      
      assignPopToPosition('lw1', 'diet-coke');
      assignPopToPosition('lw1', 'diet-pepsi');
      
      expect(getAssignedPop('lw1')).toBe('diet-pepsi');
    });
  });

  describe('removePopFromPosition', () => {
    it('should remove a pop from a position', () => {
      const { assignPopToPosition, removePopFromPosition, getAssignedPop } = useLineupStore.getState();
      
      assignPopToPosition('lw1', 'diet-coke');
      removePopFromPosition('lw1');
      
      expect(getAssignedPop('lw1')).toBeUndefined();
    });

    it('should handle removing from empty position', () => {
      const { removePopFromPosition, getAssignedPop } = useLineupStore.getState();
      
      removePopFromPosition('lw1');
      
      expect(getAssignedPop('lw1')).toBeUndefined();
    });
  });

  describe('isPositionOccupied', () => {
    it('should return true for occupied position', () => {
      const { assignPopToPosition, isPositionOccupied } = useLineupStore.getState();
      
      assignPopToPosition('lw1', 'diet-coke');
      
      expect(isPositionOccupied('lw1')).toBe(true);
    });

    it('should return false for empty position', () => {
      const { isPositionOccupied } = useLineupStore.getState();
      
      expect(isPositionOccupied('lw1')).toBe(false);
    });
  });

  describe('getAssignedPositions', () => {
    it('should return array of assigned position IDs', () => {
      const { assignPopToPosition, getAssignedPositions } = useLineupStore.getState();
      
      assignPopToPosition('lw1', 'diet-coke');
      assignPopToPosition('c1', 'diet-pepsi');
      
      const positions = getAssignedPositions();
      expect(positions).toContain('lw1');
      expect(positions).toContain('c1');
      expect(positions).toHaveLength(2);
    });

    it('should return empty array when no positions assigned', () => {
      const { getAssignedPositions } = useLineupStore.getState();
      
      expect(getAssignedPositions()).toEqual([]);
    });
  });

  describe('clearLineup', () => {
    it('should clear all assignments', () => {
      const { assignPopToPosition, clearLineup, getAssignedPositions } = useLineupStore.getState();
      
      assignPopToPosition('lw1', 'diet-coke');
      assignPopToPosition('c1', 'diet-pepsi');
      clearLineup();
      
      expect(getAssignedPositions()).toEqual([]);
    });
  });

  describe('updateLineupName', () => {
    it('should update lineup name', () => {
      const { updateLineupName, currentLineup } = useLineupStore.getState();
      
      updateLineupName('Test Lineup');
      
      expect(useLineupStore.getState().currentLineup.name).toBe('Test Lineup');
    });
  });
});