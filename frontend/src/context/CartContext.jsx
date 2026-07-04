import { createContext, useContext, useEffect, useReducer } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'vf_cart';

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function reducer(state, action) {
  switch (action.type) {
    case 'add': {
      const exists = state.find((i) => i.id === action.product.id);
      if (exists) {
        return state.map((i) =>
          i.id === action.product.id ? { ...i, quantity: i.quantity + (action.qty || 1) } : i
        );
      }
      return [...state, { ...action.product, quantity: action.qty || 1 }];
    }
    case 'setQty': {
      if (action.qty <= 0) return state.filter((i) => i.id !== action.id);
      return state.map((i) => (i.id === action.id ? { ...i, quantity: action.qty } : i));
    }
    case 'remove':
      return state.filter((i) => i.id !== action.id);
    case 'clear':
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, [], load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = {
    items,
    add: (product, qty = 1) => dispatch({ type: 'add', product, qty }),
    setQty: (id, qty) => dispatch({ type: 'setQty', id, qty }),
    remove: (id) => dispatch({ type: 'remove', id }),
    clear: () => dispatch({ type: 'clear' }),
    count: items.reduce((n, i) => n + i.quantity, 0),
    subtotal: +items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2),
    qtyOf: (id) => items.find((i) => i.id === id)?.quantity || 0,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
