
// ============================================
// 📁 src/lib/store/usePostsStore.ts
// ============================================

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { PaginationMeta } from '../types';
 
/**
 * Posts Store - UI State Only
 * Server state is handled by React Query
 */
interface PostsState {
  // UI State
  selectedCategory: string | null;
  selectedTags: string[];
  searchQuery: string;
  pagination: PaginationMeta | null;
  
  // UI Actions
  setSelectedCategory: (category: string | null) => void;
  toggleTag: (tag: string) => void;
  clearTags: () => void;
  setSearchQuery: (query: string) => void;
  setPagination: (pagination: PaginationMeta) => void;
  resetFilters: () => void;
}

export const usePostsStore = create<PostsState>()(
  devtools(
    (set) => ({
      // Initial state
      selectedCategory: null,
      selectedTags: [],
      searchQuery: '',
      pagination: null,

      // Actions
      setSelectedCategory: (category) =>
        set({ selectedCategory: category }),

      toggleTag: (tag) =>
        set((state) => ({
          selectedTags: state.selectedTags.includes(tag)
            ? state.selectedTags.filter((t) => t !== tag)
            : [...state.selectedTags, tag],
        })),

      clearTags: () => set({ selectedTags: [] }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      setPagination: (pagination) => set({ pagination }),

      resetFilters: () =>
        set({
          selectedCategory: null,
          selectedTags: [],
          searchQuery: '',
        }),
    }),
    { name: 'PostsStore' }
  )
);
