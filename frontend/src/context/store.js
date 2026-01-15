import { create } from 'zustand';
import { authAPI, cartAPI } from '../services/api';

// Auth Store
export const useAuthStore = create((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    setUser: (user) => set({ user, isAuthenticated: !!user }),

    checkAuth: async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                set({ user: null, isAuthenticated: false, isLoading: false });
                return;
            }

            const response = await authAPI.getMe();
            set({
                user: response.data.user,
                isAuthenticated: true,
                isLoading: false
            });
        } catch (error) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },

    login: async (email, password) => {
        const response = await authAPI.login({ email, password });
        const { user, access_token, refresh_token } = response.data;

        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        set({ user, isAuthenticated: true });

        return response.data;
    },

    register: async (data) => {
        const response = await authAPI.register(data);
        return response.data;
    },

    logout: async () => {
        try {
            await authAPI.logout();
        } catch (e) {
            // Ignore logout errors
        }
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ user: null, isAuthenticated: false });
    },

    updateUser: (userData) => {
        set((state) => ({
            user: { ...state.user, ...userData }
        }));
    },
}));

// Cart Store
export const useCartStore = create((set, get) => ({
    items: [],
    count: 0,
    subtotal: 0,
    totalWeight: 0,
    isLoading: false,

    fetchCart: async () => {
        try {
            set({ isLoading: true });
            const response = await cartAPI.get();
            set({
                items: response.data.items || [],
                subtotal: response.data.subtotal || 0,
                totalWeight: response.data.total_weight || 0,
                count: response.data.total_items || 0,
                isLoading: false,
            });
        } catch (error) {
            set({ isLoading: false });
        }
    },

    fetchCount: async () => {
        try {
            const response = await cartAPI.getCount();
            set({ count: response.data.count || 0 });
        } catch (error) {
            // Ignore
        }
    },

    addToCart: async (productId, quantity = 1) => {
        const response = await cartAPI.add(productId, quantity);
        set({ count: response.data.cart_count });
        return response.data;
    },

    updateItem: async (id, quantity) => {
        await cartAPI.update(id, quantity);
        await get().fetchCart();
    },

    removeItem: async (id) => {
        await cartAPI.remove(id);
        await get().fetchCart();
    },

    clearCart: async () => {
        await cartAPI.clear();
        set({ items: [], count: 0, subtotal: 0, totalWeight: 0 });
    },
}));

// UI Store
export const useUIStore = create((set) => ({
    isMobileMenuOpen: false,
    isSearchOpen: false,

    toggleMobileMenu: () => set((state) => ({
        isMobileMenuOpen: !state.isMobileMenuOpen
    })),

    toggleSearch: () => set((state) => ({
        isSearchOpen: !state.isSearchOpen
    })),

    closeMobileMenu: () => set({ isMobileMenuOpen: false }),
    closeSearch: () => set({ isSearchOpen: false }),
}));
