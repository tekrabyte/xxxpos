import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: bigint;
  name: string;
  price: bigint;
  quantity: number;
  type: 'product' | 'package' | 'bundle';
  availableStock: bigint;
  outletId: bigint;
}

interface KioskCartState {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity' | 'outletId'> & { outletId?: bigint }) => void;
  updateQuantity: (id: bigint, type: string, delta: number) => void;
  removeFromCart: (id: bigint, type: string) => void;
  clearCart: () => void;
  cartTotal: number;
}

export const useKioskCart = create<KioskCartState>()(
  persist(
    (set, get) => ({
      cart: [],
      cartTotal: 0,

      addToCart: (item) => {
        const { cart } = get();
        const existingItem = cart.find(i => i.id === item.id && i.type === item.type);
        
        if (existingItem) {
          if (existingItem.quantity < Number(item.availableStock)) {
            set({
              cart: cart.map(i =>
                i.id === item.id && i.type === item.type
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            });
          }
        } else {
          if (item.availableStock > 0n) {
            set({
              cart: [...cart, { ...item, quantity: 1, outletId: item.outletId || 0n }],
            });
          }
        }

        // Update total
        const newCart = get().cart;
        const total = newCart.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
        set({ cartTotal: total });
      },

      updateQuantity: (id, type, delta) => {
        const { cart } = get();
        const newCart = cart.map(item => {
          if (item.id === id && item.type === type) {
            const newQuantity = item.quantity + delta;
            if (newQuantity <= 0) return item;
            if (newQuantity > Number(item.availableStock)) return item;
            return { ...item, quantity: newQuantity };
          }
          return item;
        }).filter(item => item.quantity > 0);

        set({ cart: newCart });

        // Update total
        const total = newCart.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
        set({ cartTotal: total });
      },

      removeFromCart: (id, type) => {
        const { cart } = get();
        const newCart = cart.filter(item => !(item.id === id && item.type === type));
        set({ cart: newCart });

        // Update total
        const total = newCart.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
        set({ cartTotal: total });
      },

      clearCart: () => {
        set({ cart: [], cartTotal: 0 });
      },
    }),
    {
      name: 'kiosk-cart-storage',
    }
  )
);
