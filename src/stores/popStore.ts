import { create } from 'zustand';
import { Pop } from '../types';
import popsData from '../data/pops.json';

interface PopState {
  pops: Pop[];
  searchTerm: string;
  selectedBrands: string[];
  filteredPops: Pop[];
  setSearchTerm: (term: string) => void;
  setSelectedBrands: (brands: string[]) => void;
  toggleBrand: (brand: string) => void;
  clearFilters: () => void;
  getPopById: (id: string) => Pop | undefined;
  getAvailableBrands: () => string[];
  searchPops: (term: string) => Pop[];
}

const filterPops = (pops: Pop[], searchTerm: string, selectedBrands: string[]): Pop[] => {
  let filtered = pops;

  // Filter by search term
  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (pop) =>
        pop.name.toLowerCase().includes(term) ||
        pop.brand.toLowerCase().includes(term) ||
        pop.parentCompany.toLowerCase().includes(term)
    );
  }

  // Filter by selected brands
  if (selectedBrands.length > 0) {
    filtered = filtered.filter((pop) => selectedBrands.includes(pop.brand));
  }

  return filtered;
};

export const usePopStore = create<PopState>((set, get) => ({
  pops: popsData as Pop[],
  searchTerm: '',
  selectedBrands: [],
  filteredPops: popsData as Pop[],

  setSearchTerm: (term: string) => {
    set((state) => {
      const filteredPops = filterPops(state.pops, term, state.selectedBrands);
      return {
        searchTerm: term,
        filteredPops,
      };
    });
  },

  setSelectedBrands: (brands: string[]) => {
    set((state) => {
      const filteredPops = filterPops(state.pops, state.searchTerm, brands);
      return {
        selectedBrands: brands,
        filteredPops,
      };
    });
  },

  toggleBrand: (brand: string) => {
    set((state) => {
      const newSelectedBrands = state.selectedBrands.includes(brand)
        ? state.selectedBrands.filter((b) => b !== brand)
        : [...state.selectedBrands, brand];
      
      const filteredPops = filterPops(state.pops, state.searchTerm, newSelectedBrands);
      
      return {
        selectedBrands: newSelectedBrands,
        filteredPops,
      };
    });
  },

  clearFilters: () => {
    set((state) => ({
      searchTerm: '',
      selectedBrands: [],
      filteredPops: state.pops,
    }));
  },

  getPopById: (id: string) => {
    return get().pops.find((pop) => pop.id === id);
  },

  getAvailableBrands: () => {
    const brands = get().pops.map((pop) => pop.brand);
    return [...new Set(brands)].sort();
  },

  searchPops: (term: string) => {
    const { pops } = get();
    if (!term.trim()) return pops;
    
    const searchTerm = term.toLowerCase();
    return pops.filter(
      (pop) =>
        pop.name.toLowerCase().includes(searchTerm) ||
        pop.brand.toLowerCase().includes(searchTerm) ||
        pop.parentCompany.toLowerCase().includes(searchTerm)
    );
  },
}));