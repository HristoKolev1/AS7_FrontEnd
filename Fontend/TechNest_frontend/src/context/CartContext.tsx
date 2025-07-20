// src/contexts/CartContext.tsx
import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext
} from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';

export interface CartItem {
  id:        number;
  productId: string;
  price:     number;
}

export interface Cart {
  id:        number;
  user_id:   number;
  cartItems: CartItem[];
}

interface CartListResponse {
  cartList: Array<{
    id:       number;
    user_id:  number;
    itemList: CartItem[];    // backend’s field
  }>;
}

interface CartContextType {
  cart:      Cart | null;
  addToCart: (productId: string, price: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const [cart, setCart] = useState<Cart | null>(null);

  // Fetch & normalize
  useEffect(() => {
    if (!user) {
      setCart(null);
      return;
    }
    (async () => {
      try {
        const res = await axios.get<CartListResponse>(
          `/cart/${user.id}`,
          { baseURL: "http://a3ad27d89d462415f88d95f321d52072-993907692.eu-central-1.elb.amazonaws.com" }
        );
        const list = res.data.cartList || [];
        if (list.length === 0) {
          setCart(null);
        } else {
          const first = list[0];
          setCart({
            id:        first.id,
            user_id:   first.user_id,
            cartItems: first.itemList   // map itemList → cartItems
          });
        }
      } catch (err) {
        console.error('Failed to load cart:', err);
        setCart(null);
      }
    })();
  }, [user]);

  const addToCart = async (productId: string, price: number) => {
    if (!cart) throw new Error('Cart not loaded');
    await axios.post(
      `/cart/addItem`,
      { cart_id: cart.id, productId, price },
      { baseURL: "http://a3ad27d89d462415f88d95f321d52072-993907692.eu-central-1.elb.amazonaws.com" }
    );
    // re-fetch so we stay normalized
    // (or optimistically push one item into cart.cartItems)
    // here we’ll just re-run the effect:
    setCart(null);
  };

  const clearCart = async () => {
    if (!cart) return;
    const res = await axios.delete<Cart>(
      `/cart/${cart.id}/items`,
      { baseURL: "http://a3ad27d89d462415f88d95f321d52072-993907692.eu-central-1.elb.amazonaws.com" }
    );
    // If backend returns the full Cart, map it:
    setCart({
      id:        res.data.id,
      user_id:   res.data.user_id,
      cartItems: res.data.cartItems
    });
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};
