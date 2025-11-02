import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PositionSlot } from '../PositionSlot';
import { HockeyPosition } from '../../../types';

// Mock the stores
vi.mock('../../../stores/lineupStore', () => ({
  useLineupStore: () => ({
    getAssignedPop: vi.fn(() => undefined),
    isPositionOccupied: vi.fn(() => false),
  }),
}));

vi.mock('../../../stores/popStore', () => ({
  usePopStore: () => ({
    getPopById: vi.fn(() => undefined),
  }),
}));

const mockPosition: HockeyPosition = {
  id: 'lw1',
  name: 'Left Wing',
  line: 1,
  type: 'forward',
  coordinates: { x: 0, y: 0 },
};

describe('PositionSlot', () => {
  const mockOnSlotClick = vi.fn();

  beforeEach(() => {
    mockOnSlotClick.mockClear();
  });

  it('should render empty slot correctly', () => {
    render(
      <PositionSlot 
        position={mockPosition} 
        onSlotClick={mockOnSlotClick} 
      />
    );

    expect(screen.getByText('Empty')).toBeInTheDocument();
    expect(screen.getByText('+')).toBeInTheDocument();
    expect(screen.getByText('F')).toBeInTheDocument(); // Forward indicator
  });

  it('should call onSlotClick when clicked', () => {
    render(
      <PositionSlot 
        position={mockPosition} 
        onSlotClick={mockOnSlotClick} 
      />
    );

    const slot = screen.getByRole('button');
    fireEvent.click(slot);

    expect(mockOnSlotClick).toHaveBeenCalledWith(mockPosition);
  });

  it('should handle keyboard navigation', () => {
    render(
      <PositionSlot 
        position={mockPosition} 
        onSlotClick={mockOnSlotClick} 
      />
    );

    const slot = screen.getByRole('button');
    fireEvent.keyDown(slot, { key: 'Enter' });

    expect(mockOnSlotClick).toHaveBeenCalledWith(mockPosition);
  });

  it('should render different sizes correctly', () => {
    const { rerender } = render(
      <PositionSlot 
        position={mockPosition} 
        onSlotClick={mockOnSlotClick} 
        size="small"
      />
    );

    expect(screen.getByText('Add')).toBeInTheDocument();

    rerender(
      <PositionSlot 
        position={mockPosition} 
        onSlotClick={mockOnSlotClick} 
        size="large"
      />
    );

    expect(screen.getByText('Empty')).toBeInTheDocument();
  });

  it('should show defense indicator for defense positions', () => {
    const defensePosition: HockeyPosition = {
      ...mockPosition,
      type: 'defense',
    };

    render(
      <PositionSlot 
        position={defensePosition} 
        onSlotClick={mockOnSlotClick} 
      />
    );

    expect(screen.getByText('D')).toBeInTheDocument();
  });
});