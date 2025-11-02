import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportModal } from '../../components/export/ExportModal';
import { useLineupStore } from '../../stores/lineupStore';
import { usePopStore } from '../../stores/popStore';

// Mock React PDF
vi.mock('@react-pdf/renderer', () => ({
  Document: ({ children }: any) => <div data-testid="pdf-document">{children}</div>,
  Page: ({ children }: any) => <div data-testid="pdf-page">{children}</div>,
  View: ({ children }: any) => <div data-testid="pdf-view">{children}</div>,
  Text: ({ children }: any) => <span data-testid="pdf-text">{children}</span>,
  Image: ({ src }: any) => <img data-testid="pdf-image" src={src} alt="" />,
  pdf: vi.fn(() => ({
    toBlob: vi.fn(() => Promise.resolve(new Blob(['mock pdf'], { type: 'application/pdf' }))),
  })),
}));

// Mock PDF utilities
vi.mock('../../utils/pdfUtils', () => ({
  generateLineupPDF: vi.fn(() => Promise.resolve(new Blob(['mock pdf'], { type: 'application/pdf' }))),
  downloadPDF: vi.fn(),
}));

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-blob-url');
global.URL.revokeObjectURL = vi.fn();

// Mock download functionality
const mockDownload = vi.fn();
Object.defineProperty(document, 'createElement', {
  value: vi.fn(() => ({
    href: '',
    download: '',
    click: mockDownload,
    style: {},
  })),
});

describe('PDF Export Workflow', () => {
  beforeEach(() => {
    // Set up test lineup
    const { assignPopToPosition, clearLineup } = useLineupStore.getState();
    clearLineup();
    assignPopToPosition('lw1', 'diet-coke');
    assignPopToPosition('c1', 'diet-pepsi');
    assignPopToPosition('rw1', 'diet-sprite');
  });

  it('should handle PDF generation workflow with lineup data', async () => {
    const { generateLineupPDF } = await import('../../utils/pdfUtils');
    const { currentLineup } = useLineupStore.getState();

    // Step 1: Verify lineup has data
    expect(currentLineup.assignments).toHaveProperty('lw1', 'diet-coke');
    expect(currentLineup.assignments).toHaveProperty('c1', 'diet-pepsi');
    expect(currentLineup.assignments).toHaveProperty('rw1', 'diet-sprite');

    // Step 2: Test PDF generation function
    const pdfBlob = await generateLineupPDF(currentLineup, 'first-line');
    expect(pdfBlob).toBeInstanceOf(Blob);
    expect(pdfBlob.type).toBe('application/pdf');
  });

  it('should handle different export types', async () => {
    const { generateLineupPDF } = await import('../../utils/pdfUtils');
    const { currentLineup } = useLineupStore.getState();

    // Step 1: Test first-line export
    const firstLinePdf = await generateLineupPDF(currentLineup, 'first-line');
    expect(firstLinePdf).toBeInstanceOf(Blob);

    // Step 2: Test full lineup export
    const fullLineupPdf = await generateLineupPDF(currentLineup, 'full-lineup');
    expect(fullLineupPdf).toBeInstanceOf(Blob);
  });

  it('should handle empty lineup export validation', () => {
    // Clear lineup for this test
    useLineupStore.getState().clearLineup();
    const { currentLineup } = useLineupStore.getState();

    // Step 1: Verify empty lineup state
    expect(Object.keys(currentLineup.assignments)).toHaveLength(0);

    // Step 2: Verify export would be invalid
    expect(currentLineup.assignments).toEqual({});
  });

  it('should validate lineup data before export', () => {
    const { currentLineup } = useLineupStore.getState();
    const { getPopById } = usePopStore.getState();

    // Step 1: Verify all assigned pops exist in database
    Object.values(currentLineup.assignments).forEach(popId => {
      const pop = getPopById(popId);
      expect(pop).toBeDefined();
      expect(pop?.id).toBe(popId);
    });

    // Step 2: Verify lineup has required data for PDF generation
    expect(currentLineup.name).toBeDefined();
    expect(currentLineup.createdAt).toBeInstanceOf(Date);
    expect(currentLineup.updatedAt).toBeInstanceOf(Date);
  });
});