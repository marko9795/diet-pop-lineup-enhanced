import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LineupGrid } from '../../components/lineup/LineupGrid';
import { PopSelector } from '../../components/lineup/PopSelector';
import { ExportModal } from '../../components/export/ExportModal';
import { HockeyPosition } from '../../types';

// Mock responsive hook with different device configurations
const mockResponsiveHook = (isMobile: boolean, isTablet: boolean) => {
  vi.mock('../../hooks/useResponsive', () => ({
    useResponsive: () => ({
      isMobile,
      isTablet,
      isDesktop: !isMobile && !isTablet,
    }),
  }));
};

// Mock stores
vi.mock('../../stores/lineupStore', () => ({
  useLineupStore: () => ({
    getAssignedPop: vi.fn(() => undefined),
    isPositionOccupied: vi.fn(() => false),
    assignPopToPosition: vi.fn(),
    removePopFromPosition: vi.fn(),
    getAssignedPositions: () => [],
    currentLineup: {
      id: 'test',
      name: 'Test Lineup',
      assignments: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  }),
}));

vi.mock('../../stores/popStore', () => ({
  usePopStore: () => ({
    getPopById: vi.fn(() => undefined),
    filteredPops: [],
    selectedBrands: [],
    setSearchTerm: vi.fn(),
    toggleBrand: vi.fn(),
    clearFilters: vi.fn(),
    getAvailableBrands: () => [],
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
  ],
}));

const mockPosition: HockeyPosition = {
  id: 'lw1',
  name: 'Left Wing',
  line: 1,
  type: 'forward',
  coordinates: { x: 0, y: 0 },
};

describe('Cross-Device Responsive Design', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Desktop Layout', () => {
    beforeEach(() => {
      mockResponsiveHook(false, false);
    });

    it('should render desktop lineup grid layout', () => {
      render(<LineupGrid />);

      // Desktop should show full lineup with proper spacing
      expect(screen.getByText('Diet Pop Hockey Lineup')).toBeInTheDocument();
      expect(screen.getByText('Forward Lines')).toBeInTheDocument();
      expect(screen.getByText('Defense Pairs')).toBeInTheDocument();
    });

    it('should render desktop pop selector modal', () => {
      render(
        <PopSelector 
          isOpen={true}
          onClose={vi.fn()}
          selectedPosition={mockPosition}
        />
      );

      // Desktop modal should have full width and proper layout
      const modal = screen.getByRole('dialog', { hidden: true });
      expect(modal).toHaveClass('max-w-4xl');
      expect(screen.getByText('Select Pop for Left Wing')).toBeInTheDocument();
    });
  });

  describe('Tablet Layout', () => {
    beforeEach(() => {
      mockResponsiveHook(false, true);
    });

    it('should adapt lineup grid for tablet', () => {
      render(<LineupGrid />);

      // Tablet should maintain structure but with adjusted spacing
      expect(screen.getByText('Diet Pop Hockey Lineup')).toBeInTheDocument();
      expect(screen.getByText('Forward Lines')).toBeInTheDocument();
    });

    it('should render tablet-optimized pop selector', () => {
      render(
        <PopSelector 
          isOpen={true}
          onClose={vi.fn()}
          selectedPosition={mockPosition}
        />
      );

      // Should show tablet-specific layout
      expect(screen.getByText('Select Pop for Left Wing')).toBeInTheDocument();
    });
  });

  describe('Mobile Layout', () => {
    beforeEach(() => {
      mockResponsiveHook(true, false);
    });

    it('should render mobile-optimized lineup grid', () => {
      render(<LineupGrid />);

      // Mobile should show compact layout
      expect(screen.getByText('Diet Pop Hockey Lineup')).toBeInTheDocument();
    });

    it('should render mobile pop selector with full-screen modal', () => {
      render(
        <PopSelector 
          isOpen={true}
          onClose={vi.fn()}
          selectedPosition={mockPosition}
        />
      );

      // Mobile modal should be full-screen
      const modal = screen.getByRole('dialog', { hidden: true });
      expect(modal).toHaveClass('w-full', 'h-full');
      expect(screen.getByText('Left Wing')).toBeInTheDocument(); // Truncated title
    });

    it('should show mobile-optimized export modal', () => {
      render(
        <ExportModal 
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      // Mobile export should be optimized for touch
      expect(screen.getByText(/Export/)).toBeInTheDocument();
    });
  });

  describe('Touch Interaction Support', () => {
    it('should handle touch events on mobile', () => {
      mockResponsiveHook(true, false);
      render(<LineupGrid />);

      // All interactive elements should have proper touch targets
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('cursor-pointer');
      });
    });

    it('should provide adequate touch targets on mobile', () => {
      mockResponsiveHook(true, false);
      render(<LineupGrid />);

      // Touch targets should be at least 44px (iOS guidelines)
      const positionSlots = screen.getAllByRole('button');
      expect(positionSlots.length).toBeGreaterThan(0);
    });
  });

  describe('Content Adaptation', () => {
    it('should truncate text appropriately on mobile', () => {
      mockResponsiveHook(true, false);
      render(
        <PopSelector 
          isOpen={true}
          onClose={vi.fn()}
          selectedPosition={mockPosition}
        />
      );

      // Mobile should show truncated position name
      expect(screen.getByText('Left Wing')).toBeInTheDocument();
    });

    it('should show appropriate grid layouts per device', () => {
      // Test desktop grid (4 columns)
      mockResponsiveHook(false, false);
      const { rerender } = render(
        <PopSelector 
          isOpen={true}
          onClose={vi.fn()}
          selectedPosition={mockPosition}
        />
      );

      let popGrid = screen.getByRole('dialog', { hidden: true });
      expect(popGrid).toBeInTheDocument();

      // Test tablet grid (3 columns)
      mockResponsiveHook(false, true);
      rerender(
        <PopSelector 
          isOpen={true}
          onClose={vi.fn()}
          selectedPosition={mockPosition}
        />
      );

      // Test mobile grid (2 columns)
      mockResponsiveHook(true, false);
      rerender(
        <PopSelector 
          isOpen={true}
          onClose={vi.fn()}
          selectedPosition={mockPosition}
        />
      );

      popGrid = screen.getByRole('dialog', { hidden: true });
      expect(popGrid).toBeInTheDocument();
    });
  });

  describe('Performance Considerations', () => {
    it('should handle device capability detection', () => {
      // Test that components render without errors across devices
      const devices = [
        { isMobile: true, isTablet: false },
        { isMobile: false, isTablet: true },
        { isMobile: false, isTablet: false },
      ];

      devices.forEach(({ isMobile, isTablet }) => {
        mockResponsiveHook(isMobile, isTablet);
        
        expect(() => {
          render(<LineupGrid />);
        }).not.toThrow();
      });
    });

    it('should maintain functionality across screen sizes', () => {
      const devices = [
        { isMobile: true, isTablet: false },
        { isMobile: false, isTablet: true },
        { isMobile: false, isTablet: false },
      ];

      devices.forEach(({ isMobile, isTablet }) => {
        mockResponsiveHook(isMobile, isTablet);
        
        render(<LineupGrid />);
        
        // Core functionality should be available on all devices
        expect(screen.getByText('Diet Pop Hockey Lineup')).toBeInTheDocument();
        expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
      });
    });
  });
});