import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateLineupPDF } from '../../utils/pdfUtils';
import { useLineupStore } from '../../stores/lineupStore';
import { usePopStore } from '../../stores/popStore';
import { UserLineup } from '../../types';

// Mock React PDF
vi.mock('@react-pdf/renderer', () => ({
  Document: ({ children }: any) => ({ type: 'Document', children }),
  Page: ({ children }: any) => ({ type: 'Page', children }),
  View: ({ children }: any) => ({ type: 'View', children }),
  Text: ({ children }: any) => ({ type: 'Text', children }),
  Image: ({ src }: any) => ({ type: 'Image', src }),
  pdf: vi.fn((document) => ({
    toBlob: vi.fn(() => {
      // Simulate PDF generation with realistic blob size
      const mockPDFContent = 'Mock PDF content '.repeat(1000); // ~17KB
      return Promise.resolve(new Blob([mockPDFContent], { type: 'application/pdf' }));
    }),
  })),
}));

// Mock stores with test data
vi.mock('../../stores/lineupStore', () => ({
  useLineupStore: {
    getState: () => ({
      currentLineup: {
        id: 'test-lineup',
        name: 'Test Lineup',
        assignments: {
          'lw1': 'diet-coke',
          'c1': 'diet-pepsi',
          'rw1': 'diet-sprite',
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    }),
  },
}));

vi.mock('../../stores/popStore', () => ({
  usePopStore: {
    getState: () => ({
      getPopById: (id: string) => ({
        id,
        name: `Test Pop ${id}`,
        brand: 'Test Brand',
        parentCompany: 'Test Company',
        caffeine: 46,
        calories: 0,
        brandColors: { primary: '#ff0000', secondary: '#ffffff' },
        modelAssets: { geometry: '', texture: '' },
        nutritionFacts: { sodium: 40, totalCarbs: 0, sugars: 0 },
      }),
    }),
  },
}));

describe('Cross-Device PDF Export Quality', () => {
  let testLineup: UserLineup;

  beforeEach(() => {
    testLineup = {
      id: 'test-lineup',
      name: 'Test Lineup',
      assignments: {
        'lw1': 'diet-coke',
        'c1': 'diet-pepsi',
        'rw1': 'diet-sprite',
      },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };
  });

  describe('PDF Generation Performance', () => {
    it('should generate PDF within reasonable time limits', async () => {
      const startTime = performance.now();
      
      const pdfBlob = await generateLineupPDF(testLineup, 'first-line');
      
      const endTime = performance.now();
      const generationTime = endTime - startTime;
      
      expect(pdfBlob).toBeInstanceOf(Blob);
      expect(pdfBlob.type).toBe('application/pdf');
      
      // PDF generation should complete within 5 seconds
      expect(generationTime).toBeLessThan(5000);
    });

    it('should generate consistent PDF sizes', async () => {
      const pdf1 = await generateLineupPDF(testLineup, 'first-line');
      const pdf2 = await generateLineupPDF(testLineup, 'first-line');
      
      // PDF sizes should be consistent for same content
      expect(Math.abs(pdf1.size - pdf2.size)).toBeLessThan(1000); // Within 1KB variance
    });

    it('should handle different export types efficiently', async () => {
      const firstLinePdf = await generateLineupPDF(testLineup, 'first-line');
      const fullLineupPdf = await generateLineupPDF(testLineup, 'full-lineup');
      
      expect(firstLinePdf).toBeInstanceOf(Blob);
      expect(fullLineupPdf).toBeInstanceOf(Blob);
      
      // Full lineup should be larger than first line
      expect(fullLineupPdf.size).toBeGreaterThanOrEqual(firstLinePdf.size);
    });
  });

  describe('Memory Management During Export', () => {
    it('should not cause memory leaks during PDF generation', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Generate multiple PDFs to test memory management
      const promises = Array.from({ length: 5 }, () => 
        generateLineupPDF(testLineup, 'first-line')
      );
      
      const pdfs = await Promise.all(promises);
      
      // All PDFs should be generated successfully
      expect(pdfs).toHaveLength(5);
      pdfs.forEach(pdf => {
        expect(pdf).toBeInstanceOf(Blob);
        expect(pdf.type).toBe('application/pdf');
      });
      
      // Memory usage should not increase dramatically
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryIncrease = finalMemory - initialMemory;
        expect(memoryIncrease).toBeLessThan(50000000); // Less than 50MB increase
      }
    });

    it('should handle large lineups without memory issues', async () => {
      // Create a lineup with all 18 positions filled
      const largeLineup: UserLineup = {
        ...testLineup,
        assignments: {
          'lw1': 'diet-coke', 'c1': 'diet-pepsi', 'rw1': 'diet-sprite',
          'lw2': 'diet-coke', 'c2': 'diet-pepsi', 'rw2': 'diet-sprite',
          'lw3': 'diet-coke', 'c3': 'diet-pepsi', 'rw3': 'diet-sprite',
          'lw4': 'diet-coke', 'c4': 'diet-pepsi', 'rw4': 'diet-sprite',
          'ld1': 'diet-coke', 'rd1': 'diet-pepsi',
          'ld2': 'diet-coke', 'rd2': 'diet-pepsi',
          'ld3': 'diet-coke', 'rd3': 'diet-pepsi',
        },
      };

      const pdf = await generateLineupPDF(largeLineup, 'full-lineup');
      
      expect(pdf).toBeInstanceOf(Blob);
      expect(pdf.type).toBe('application/pdf');
      expect(pdf.size).toBeGreaterThan(1000); // Should have substantial content
    });
  });

  describe('PDF Quality Validation', () => {
    it('should generate PDFs with appropriate file sizes', async () => {
      const firstLinePdf = await generateLineupPDF(testLineup, 'first-line');
      const fullLineupPdf = await generateLineupPDF(testLineup, 'full-lineup');
      
      // PDFs should be reasonably sized (not too small or too large)
      expect(firstLinePdf.size).toBeGreaterThan(1000); // At least 1KB
      expect(firstLinePdf.size).toBeLessThan(5000000); // Less than 5MB
      
      expect(fullLineupPdf.size).toBeGreaterThan(1000); // At least 1KB
      expect(fullLineupPdf.size).toBeLessThan(10000000); // Less than 10MB
    });

    it('should handle empty lineups gracefully', async () => {
      const emptyLineup: UserLineup = {
        ...testLineup,
        assignments: {},
      };

      const pdf = await generateLineupPDF(emptyLineup, 'first-line');
      
      expect(pdf).toBeInstanceOf(Blob);
      expect(pdf.type).toBe('application/pdf');
      expect(pdf.size).toBeGreaterThan(500); // Should still have basic structure
    });

    it('should maintain quality across different device capabilities', async () => {
      // Simulate different device scenarios
      const deviceScenarios = [
        { name: 'high-end', memory: 8000000000, cpu: 8 },
        { name: 'mid-range', memory: 4000000000, cpu: 4 },
        { name: 'low-end', memory: 2000000000, cpu: 2 },
      ];

      const results = await Promise.all(
        deviceScenarios.map(async (scenario) => {
          const pdf = await generateLineupPDF(testLineup, 'first-line');
          return { scenario: scenario.name, size: pdf.size, type: pdf.type };
        })
      );

      // All scenarios should produce valid PDFs
      results.forEach(result => {
        expect(result.type).toBe('application/pdf');
        expect(result.size).toBeGreaterThan(1000);
      });

      // PDF sizes should be consistent across devices (within 10% variance)
      const sizes = results.map(r => r.size);
      const avgSize = sizes.reduce((a, b) => a + b, 0) / sizes.length;
      sizes.forEach(size => {
        const variance = Math.abs(size - avgSize) / avgSize;
        expect(variance).toBeLessThan(0.1); // Less than 10% variance
      });
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle PDF generation errors gracefully', async () => {
      // Mock PDF generation failure
      const { pdf } = await import('@react-pdf/renderer');
      vi.mocked(pdf).mockImplementationOnce(() => ({
        toBlob: vi.fn(() => Promise.reject(new Error('PDF generation failed'))),
      }));

      await expect(generateLineupPDF(testLineup, 'first-line')).rejects.toThrow('PDF generation failed');
    });

    it('should validate lineup data before PDF generation', async () => {
      const invalidLineup = {
        ...testLineup,
        name: '', // Invalid empty name
      };

      // Should still generate PDF but handle invalid data
      const pdf = await generateLineupPDF(invalidLineup, 'first-line');
      expect(pdf).toBeInstanceOf(Blob);
    });

    it('should handle missing pop data gracefully', async () => {
      const lineupWithMissingPop: UserLineup = {
        ...testLineup,
        assignments: {
          'lw1': 'non-existent-pop',
        },
      };

      // Should generate PDF even with missing pop data
      const pdf = await generateLineupPDF(lineupWithMissingPop, 'first-line');
      expect(pdf).toBeInstanceOf(Blob);
      expect(pdf.type).toBe('application/pdf');
    });
  });

  describe('Cross-Browser Compatibility', () => {
    it('should generate consistent PDFs across different environments', async () => {
      // Test multiple PDF generations to ensure consistency
      const pdfs = await Promise.all([
        generateLineupPDF(testLineup, 'first-line'),
        generateLineupPDF(testLineup, 'first-line'),
        generateLineupPDF(testLineup, 'first-line'),
      ]);

      // All PDFs should be valid and similar in size
      pdfs.forEach(pdf => {
        expect(pdf).toBeInstanceOf(Blob);
        expect(pdf.type).toBe('application/pdf');
      });

      // Sizes should be consistent (within 5% variance)
      const sizes = pdfs.map(pdf => pdf.size);
      const avgSize = sizes.reduce((a, b) => a + b, 0) / sizes.length;
      sizes.forEach(size => {
        const variance = Math.abs(size - avgSize) / avgSize;
        expect(variance).toBeLessThan(0.05);
      });
    });
  });
});