import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { UserLineup } from '../types';

interface LineupState {
  currentLineup: UserLineup;
  assignments: Record<string, string>; // positionId -> popId
  // Memory optimization
  _lastCleanup: number;
  _changeCount: number;
  
  assignPopToPosition: (positionId: string, popId: string) => void;
  removePopFromPosition: (positionId: string) => void;
  clearLineup: () => void;
  updateLineupName: (name: string) => void;
  getAssignedPop: (positionId: string) => string | undefined;
  isPositionOccupied: (positionId: string) => boolean;
  getAssignedPositions: () => string[];
  
  // Memory management
  _cleanup: () => void;
  _shouldCleanup: () => boolean;
}

const createDefaultLineup = (): UserLineup => ({
  id: 'default-lineup',
  name: 'My Diet Pop Lineup',
  assignments: {},
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const useLineupStore = create<LineupState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        currentLineup: createDefaultLineup(),
        assignments: {},
        _lastCleanup: Date.now(),
        _changeCount: 0,

      assignPopToPosition: (positionId: string, popId: string) => {
        set((state) => {
          const newAssignments = { ...state.assignments, [positionId]: popId };
          const updatedLineup = {
            ...state.currentLineup,
            assignments: newAssignments,
            updatedAt: new Date(),
          };
          
          const newState = {
            assignments: newAssignments,
            currentLineup: updatedLineup,
            _changeCount: state._changeCount + 1,
          };

          // Trigger cleanup if needed
          if (get()._shouldCleanup()) {
            setTimeout(() => get()._cleanup(), 0);
          }
          
          return newState;
        });
      },

      removePopFromPosition: (positionId: string) => {
        set((state) => {
          const newAssignments = { ...state.assignments };
          delete newAssignments[positionId];
          
          const updatedLineup = {
            ...state.currentLineup,
            assignments: newAssignments,
            updatedAt: new Date(),
          };
          
          return {
            assignments: newAssignments,
            currentLineup: updatedLineup,
          };
        });
      },

      clearLineup: () => {
        set((state) => {
          const updatedLineup = {
            ...state.currentLineup,
            assignments: {},
            updatedAt: new Date(),
          };
          
          return {
            assignments: {},
            currentLineup: updatedLineup,
          };
        });
      },

      updateLineupName: (name: string) => {
        set((state) => ({
          currentLineup: {
            ...state.currentLineup,
            name,
            updatedAt: new Date(),
          },
        }));
      },

      getAssignedPop: (positionId: string) => {
        return get().assignments[positionId];
      },

      isPositionOccupied: (positionId: string) => {
        return positionId in get().assignments;
      },

      getAssignedPositions: () => {
        return Object.keys(get().assignments);
      },

      _cleanup: () => {
        set(() => ({
          _lastCleanup: Date.now(),
          _changeCount: 0,
        }));
        
        // Force garbage collection if available
        if ('gc' in window && typeof (window as any).gc === 'function') {
          (window as any).gc();
        }
      },

      _shouldCleanup: () => {
        const state = get();
        const timeSinceLastCleanup = Date.now() - state._lastCleanup;
        return state._changeCount > 50 || timeSinceLastCleanup > 300000; // 5 minutes
      },
    }),
    {
      name: 'lineup-storage',
      partialize: (state) => ({
        currentLineup: state.currentLineup,
        assignments: state.assignments,
      }),
      // Optimize storage writes
      merge: (persistedState: any, currentState: LineupState) => ({
        ...currentState,
        ...persistedState,
        _lastCleanup: Date.now(),
        _changeCount: 0,
      }),
    }
  )
  )
);