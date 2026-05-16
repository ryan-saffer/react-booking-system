import { create } from 'zustand'

import type { InventoryCategory, Studio } from 'fizz-kidz'

import { ALL_CATEGORIES } from '../constants'

import type {
    ClientInventoryItem,
    ClientInventoryStockLevel,
    StockAction,
    StockActionType,
    StockStatusFilter,
} from '../types'

type InventoryState = {
    selectedLocation: Studio | undefined
    categoryFilter: InventoryCategory | typeof ALL_CATEGORIES
    stockStatusFilter: StockStatusFilter
    search: string
    isCreateDialogOpen: boolean
    editingItem: ClientInventoryItem | null
    stockAction: StockAction | null
    showHiddenItems: boolean
    setSelectedLocation: (location: Studio | undefined) => void
    setCategoryFilter: (category: InventoryCategory | typeof ALL_CATEGORIES) => void
    setStockStatusFilter: (filter: StockStatusFilter) => void
    setSearch: (search: string) => void
    setCreateDialogOpen: (open: boolean) => void
    openEditDialog: (item: ClientInventoryItem) => void
    closeEditDialog: () => void
    openStockActionDialog: (
        $type: StockActionType,
        item: ClientInventoryItem,
        stock?: ClientInventoryStockLevel
    ) => void
    closeStockActionDialog: () => void
    setShowHiddenItems: (value: boolean | ((current: boolean) => boolean)) => void
}

export const useInventoryStore = create<InventoryState>((set) => ({
    selectedLocation: undefined,
    categoryFilter: ALL_CATEGORIES,
    stockStatusFilter: 'all',
    search: '',
    isCreateDialogOpen: false,
    editingItem: null,
    stockAction: null,
    showHiddenItems: false,
    setSelectedLocation: (selectedLocation) => set({ selectedLocation }),
    setCategoryFilter: (categoryFilter) => set({ categoryFilter }),
    setStockStatusFilter: (stockStatusFilter) => set({ stockStatusFilter }),
    setSearch: (search) => set({ search }),
    setCreateDialogOpen: (isCreateDialogOpen) => set({ isCreateDialogOpen }),
    openEditDialog: (editingItem) => set({ editingItem }),
    closeEditDialog: () => set({ editingItem: null }),
    openStockActionDialog: ($type, item, stock) => set({ stockAction: { $type, item, stock } }),
    closeStockActionDialog: () => set({ stockAction: null }),
    setShowHiddenItems: (value) =>
        set((state) => ({
            showHiddenItems: typeof value === 'function' ? value(state.showHiddenItems) : value,
        })),
}))
