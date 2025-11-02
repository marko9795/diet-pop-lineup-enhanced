import { describe, it, expect, beforeEach } from 'vitest';
import { usePopStore } from '../popStore';

describe('PopStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    usePopStore.getState().clearFilters();
  });

  describe('setSearchTerm', () => {
    it('should update search term and filter pops', () => {
      const { setSearchTerm, searchTerm, filteredPops } = usePopStore.getState();
      
      setSearchTerm('coke');
      
      const state = usePopStore.getState();
      expect(state.searchTerm).toBe('coke');
      expect(state.filteredPops.length).toBeGreaterThan(0);
      expect(state.filteredPops.every(pop => 
        pop.name.toLowerCase().includes('coke') ||
        pop.brand.toLowerCase().includes('coke') ||
        pop.parentCompany.toLowerCase().includes('coke')
      )).toBe(true);
    });

    it('should return all pops when search term is empty', () => {
      const { setSearchTerm, pops } = usePopStore.getState();
      
      setSearchTerm('');
      
      const state = usePopStore.getState();
      expect(state.filteredPops).toEqual(state.pops);
    });
  });

  describe('setSelectedBrands', () => {
    it('should filter pops by selected brands', () => {
      const { setSelectedBrands, pops } = usePopStore.getState();
      const availableBrands = [...new Set(pops.map(pop => pop.brand))];
      const testBrand = availableBrands[0];
      
      setSelectedBrands([testBrand]);
      
      const state = usePopStore.getState();
      expect(state.selectedBrands).toEqual([testBrand]);
      expect(state.filteredPops.every(pop => pop.brand === testBrand)).toBe(true);
    });
  });

  describe('toggleBrand', () => {
    it('should add brand to selection when not selected', () => {
      const { toggleBrand, pops } = usePopStore.getState();
      const availableBrands = [...new Set(pops.map(pop => pop.brand))];
      const testBrand = availableBrands[0];
      
      toggleBrand(testBrand);
      
      const state = usePopStore.getState();
      expect(state.selectedBrands).toContain(testBrand);
    });

    it('should remove brand from selection when already selected', () => {
      const { toggleBrand, pops } = usePopStore.getState();
      const availableBrands = [...new Set(pops.map(pop => pop.brand))];
      const testBrand = availableBrands[0];
      
      toggleBrand(testBrand);
      toggleBrand(testBrand);
      
      const state = usePopStore.getState();
      expect(state.selectedBrands).not.toContain(testBrand);
    });
  });

  describe('clearFilters', () => {
    it('should reset search term and selected brands', () => {
      const { setSearchTerm, toggleBrand, clearFilters, pops } = usePopStore.getState();
      const availableBrands = [...new Set(pops.map(pop => pop.brand))];
      
      setSearchTerm('test');
      toggleBrand(availableBrands[0]);
      clearFilters();
      
      const state = usePopStore.getState();
      expect(state.searchTerm).toBe('');
      expect(state.selectedBrands).toEqual([]);
      expect(state.filteredPops).toEqual(state.pops);
    });
  });

  describe('getPopById', () => {
    it('should return pop when ID exists', () => {
      const { getPopById, pops } = usePopStore.getState();
      const testPop = pops[0];
      
      const result = getPopById(testPop.id);
      
      expect(result).toEqual(testPop);
    });

    it('should return undefined when ID does not exist', () => {
      const { getPopById } = usePopStore.getState();
      
      const result = getPopById('non-existent-id');
      
      expect(result).toBeUndefined();
    });
  });

  describe('getAvailableBrands', () => {
    it('should return sorted unique brands', () => {
      const { getAvailableBrands, pops } = usePopStore.getState();
      
      const brands = getAvailableBrands();
      const expectedBrands = [...new Set(pops.map(pop => pop.brand))].sort();
      
      expect(brands).toEqual(expectedBrands);
    });
  });

  describe('searchPops', () => {
    it('should return filtered pops based on search term', () => {
      const { searchPops, pops } = usePopStore.getState();
      
      const results = searchPops('diet');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(pop => 
        pop.name.toLowerCase().includes('diet') ||
        pop.brand.toLowerCase().includes('diet') ||
        pop.parentCompany.toLowerCase().includes('diet')
      )).toBe(true);
    });

    it('should return all pops when search term is empty', () => {
      const { searchPops, pops } = usePopStore.getState();
      
      const results = searchPops('');
      
      expect(results).toEqual(pops);
    });
  });
});