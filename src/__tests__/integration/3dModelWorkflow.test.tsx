import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { PopCard } from '../../components/cards/PopCard';
import { Pop } from '../../types';

// Mock Three.js components
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: any) => <div data-testid="canvas">{children}</div>,
  useFrame: vi.fn(),
  useThree: () => ({
    camera: { position: { set: vi.fn() } },
    gl: { setSize: vi.fn() },
  }),
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Environment: () => <div data-testid="environment" />,
  ContactShadows: () => <div data-testid="contact-shadows" />,
  PerspectiveCamera: () => <div data-testid="perspective-camera" />,
}));

vi.mock('../../components/3d/PopModel3D', () => ({
  PopModel3D: ({ pop }: { pop: Pop }) => (
    <div data-testid="pop-model-3d">
      <span>{pop.name}</span>
    </div>
  ),
}));

vi.mock('../../hooks/useResponsive', () => ({
  useResponsive: () => ({
    isMobile: false,
    isTablet: false,
  }),
}));

const mockPop: Pop = {
  id: 'diet-coke',
  name: 'Diet Coke',
  brand: 'Coca-Cola',
  parentCompany: 'The Coca-Cola Company',
  caffeine: 46,
  calories: 0,
  brandColors: { primary: '#ff0000', secondary: '#ffffff' },
  modelAssets: { geometry: '/models/can.glb', texture: '/textures/diet-coke.jpg' },
  nutritionFacts: { sodium: 40, totalCarbs: 0, sugars: 0 },
};

describe('3D Model and Pop Card Integration', () => {
  it('should display pop card with complete nutritional information', () => {
    render(<PopCard pop={mockPop} />);

    // Step 1: Verify basic pop information
    expect(screen.getByText('Diet Coke')).toBeInTheDocument();
    expect(screen.getByText(/Coca-Cola.*The Coca-Cola Company/)).toBeInTheDocument();
    
    // Step 2: Verify nutritional information is displayed
    expect(screen.getByText('46')).toBeInTheDocument(); // caffeine
    expect(screen.getByText('Caffeine')).toBeInTheDocument();
    expect(screen.getByText('Calories')).toBeInTheDocument();
    expect(screen.getByText('Sodium')).toBeInTheDocument();
  });

  it('should handle different pop brands and colors', () => {
    const pepsiPop: Pop = {
      ...mockPop,
      id: 'diet-pepsi',
      name: 'Diet Pepsi',
      brand: 'Pepsi',
      parentCompany: 'PepsiCo',
      caffeine: 35,
      brandColors: { primary: '#0000ff', secondary: '#ffffff' },
    };

    render(<PopCard pop={pepsiPop} />);

    // Step 1: Verify different brand information
    expect(screen.getByText('Diet Pepsi')).toBeInTheDocument();
    expect(screen.getByText(/Pepsi.*PepsiCo/)).toBeInTheDocument();
    expect(screen.getByText('35')).toBeInTheDocument(); // different caffeine content
  });

  it('should handle pop data validation workflow', () => {
    // Test with minimal pop data
    const minimalPop: Pop = {
      id: 'test-pop',
      name: 'Test Pop',
      brand: 'Test Brand',
      parentCompany: 'Test Company',
      caffeine: 0,
      calories: 0,
      brandColors: { primary: '#000000', secondary: '#ffffff' },
      modelAssets: { geometry: '', texture: '' },
      nutritionFacts: { sodium: 0, totalCarbs: 0, sugars: 0 },
    };

    render(<PopCard pop={minimalPop} />);

    // Verify all required fields are displayed even with minimal data
    expect(screen.getByText('Test Pop')).toBeInTheDocument();
    expect(screen.getByText(/Test Brand.*Test Company/)).toBeInTheDocument();
    expect(screen.getByText('Caffeine')).toBeInTheDocument();
    expect(screen.getByText('Calories')).toBeInTheDocument();
  });
});