import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Food } from '../api/services/foodService';

export interface CartItem extends Food {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { item: Food; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' };

const initialState: CartState = {
  items: [],
  total: 0,
};

const calculateTotal = (items: CartItem[]) => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(i => i._id === action.payload.item._id);
      let newItems;
      if (existingItemIndex >= 0) {
        newItems = [...state.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + action.payload.quantity
        };
      } else {
        newItems = [...state.items, { ...action.payload.item, quantity: action.payload.quantity }];
      }
      return { items: newItems, total: calculateTotal(newItems) };
    }
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(i => i._id !== action.payload.id);
      return { items: newItems, total: calculateTotal(newItems) };
    }
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: { id: action.payload.id } });
      }
      const newItems = state.items.map(i =>
        i._id === action.payload.id ? { ...i, quantity: action.payload.quantity } : i
      );
      return { items: newItems, total: calculateTotal(newItems) };
    }
    case 'CLEAR_CART':
      return initialState;
    default:
      return state;
  }
};

const CartContext = createContext<{
  state: CartState;
  addItem: (item: Food, quantity: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
} | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = (item: Food, quantity: number = 1) => dispatch({ type: 'ADD_ITEM', payload: { item, quantity } });
  const removeItem = (id: string) => dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  const updateQuantity = (id: string, quantity: number) => dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  return (
    <CartContext.Provider value={{ state, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
