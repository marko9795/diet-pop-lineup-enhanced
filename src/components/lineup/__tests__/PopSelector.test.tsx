import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PopSelector } from '../PopSelector';
import { HockeyPosition, Pop } from '../../../types';

// Mock the stores
const mockPops: Pop[] = [
  {
    id: 'diet-coke',
    name: 'Diet Coke',
    brand: 'Coca-Cola',
    parentCompany: 'The Coca-Cola Company',
    caffeine: 46,
    calories: 0,
    brandColors: { primary: '#ff0000', secondary: '#ffffff' },
    modelAssets: { geometry: '', texture: '' },
    nutritionFacts: { sodium: 40, totalCarbs: 0, sugars: 0 },
  },
  {
    id: 'diet-pepsi',
    name: 'Diet Pepsi',
    brand: 'Pepsi',
    parentCompany: 'PepsiCo',
    caffeine: 35,
    calories: 0,
    brandColors: { primary: '#0000ff', secondary: '#ffffff' },
    modelAssets: { geometry: '', texture: '' },
    nutritionFacts: { sodium: 35, totalCarbs: 0, sugars: 0 },
  },
];

vi.mock('../../../stores/popStore', () => ({
  usePopStore: () => ({
    filteredPops: mockPops,
    selectedBrands: [],
    setSearchTerm: vi.fn(),
    toggleBrand: vi.fn(),
    clearFilters: vi.fn(),
    getAvailableBrands: () => ['Coca-Cola', 'Pepsi'],
  }),
}));

vi.mock('../../../stores/lineupStore', () => ({
  useLineupStore: () => ({
    assignPopToPosition: vi.fn(),
    removePopFromPosition: vi.fn(),
    getAssignedPop: vi.fn(() => undefined),
  }),
}));

vi.mock('../../../hooks/useResponsive', () => ({
  useResponsive: () => ({
    isMobile: false,
    isTablet: false,
  }),
}));

const mockPosition: HockeyPosition = {
  id: 'lw1',
  name: 'Left Wing',
  line: 1,
  type: 'forward',
  coordinates: { x: 0, y: 0 },
};

describe('PopSelector', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('should not render when closed', () => {
    render(
      <PopSelector 
        isOpen={false}
        onClose={mockOnClose}
        selectedPosition={mockPosition}
      />
    );

    expect(screen.queryByText('Select Pop for Left Wing')).not.toBeInTheDocument();
  });

  it('should render when open with position', () => {
    render(
      <PopSelector 
        isOpen={true}
        onClose={mockOnClose}
        selectedPosition={mockPosition}
      />
    );

    expect(screen.getByText('Select Pop for Left Wing')).toBeInTheDocument();
    expect(screen.getByText('Line 1 • forward')).toBeInTheDocument();
  });

  it('should display available pops', () => {
    render(
      <PopSelector 
        isOpen={true}
        onClose={mockOnClose}
        selectedPosition={mockPosition}
      />
    );

    expect(screen.getByText('Diet Coke')).toBeInTheDocument();
    expect(screen.getByText('Diet Pepsi')).toBeInTheDocument();
    expect(screen.getAllByText('Coca-Cola')).toHaveLength(2); // Brand filter button and pop brand
    expect(screen.getAllByText('Pepsi')).toHaveLength(2); // Brand filter button and pop brand
  });

  it('should handle search input', () => {
    render(
      <PopSelector 
        isOpen={true}
        onClose={mockOnClose}
        selectedPosition={mockPosition}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Search pops/);
    fireEvent.change(searchInput, { target: { value: 'coke' } });

    expect(searchInput).toHaveValue('coke');
  });

  it('should close when close button is clicked', () => {
    render(
      <PopSelector 
        isOpen={true}
        onClose={mockOnClose}
        selectedPosition={mockPosition}
      />
    );

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should show pop count', () => {
    render(
      <PopSelector 
        isOpen={true}
        onClose={mockOnClose}
        selectedPosition={mockPosition}
      />
    );

    expect(screen.getByText('2 pops available')).toBeInTheDocument();
  });

  it('should display brand filters', () => {
    render(
      <PopSelector 
        isOpen={true}
        onClose={mockOnClose}
        selectedPosition={mockPosition}
      />
    );

    expect(screen.getByText('Brands:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Coca-Cola' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pepsi' })).toBeInTheDocument();
  });
});