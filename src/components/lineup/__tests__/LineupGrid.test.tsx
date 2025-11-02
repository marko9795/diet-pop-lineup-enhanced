import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LineupGrid } from '../LineupGrid';

// Mock the position data
vi.mock('../../../data/positions.json', () => ({
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
    {
      id: 'ld1',
      name: 'Left Defense',
      line: 1,
      type: 'defense',
      coordinates: { x: 0, y: 1 },
    },
  ],
}));

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

vi.mock('../../../hooks/useResponsive', () => ({
  useResponsive: () => ({
    isMobile: false,
    isTablet: false,
  }),
}));

describe('LineupGrid', () => {
  it('should render hockey positions', () => {
    render(<LineupGrid />);

    expect(screen.getAllByLabelText(/forward position slot/)).toHaveLength(2);
    expect(screen.getByLabelText(/defense position slot/)).toBeInTheDocument();
  });

  it('should display forward and defense sections', () => {
    render(<LineupGrid />);

    expect(screen.getAllByText('Forward Lines')).toHaveLength(2); // Header and stats section
    expect(screen.getAllByText('Defense Pairs')).toHaveLength(2); // Header and stats section
  });

  it('should group positions by lines', () => {
    render(<LineupGrid />);

    expect(screen.getByText('Line 1')).toBeInTheDocument();
  });
});