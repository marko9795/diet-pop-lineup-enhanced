import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserLineup } from '../types';

interface LineupState {
  currentLineup: UserLineup;
  assignments: Record<string, string>; // positionId -> popId
  assignPopToPosition: (positionId: string, popId: string) => void;
  removePopFromPosition: (positionId: string) => void;
  clearLineup: () => void;
  updateLineupName: (name: string) => void;
  getAssignedPop: (positionId: string) => string | undefined;
  isPositionOccupied: (positionId: string) => boolean;
  getAssignedPositions: () => string[];
}

const createDefaultLineup = (): UserLineup => ({
  id: 'default-lineup',
  name: 'My Diet Pop Lineup',
  assignments: {},
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const useLineupStore = create<LineupState>()(
  persist(
    (set, get) => ({
      currentLineup: createDefaultLineup(),
      assignments: {},

      assignPopToPosition: (positionId: string, popId: string) => {
        set((state) => {
          const newAssignments = { ...state.assignments, [positionId]: popId };
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
    }),
    {
      name: 'lineup-storage',
      partialize: (state) => ({
        currentLineup: state.currentLineup,
        assignments: state.assignments,
      }),
    }
  )
);