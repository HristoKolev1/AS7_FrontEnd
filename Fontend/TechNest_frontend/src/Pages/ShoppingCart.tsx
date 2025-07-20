// src/pages/ShoppingCart.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { jwtDecode } from 'jwt-decode';
import { JWTPayload } from '../types';
import { useNavigate } from 'react-router-dom';
import './ShoppingCart.css';

interface CartItem {
  id:         number;
  cartId:     number;
  productId:  string;
  price:      number;
}

interface Cart {
  id:         number;
  user_id:    number;
  cartItems:  CartItem[];
}

interface CartResponse {
  cartList: Array<{
    id:       number;
    user_id:  number;
    itemList: CartItem[];
  }>;
}

const ShoppingCart: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [cart,    setCart]    = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  // Fetch cart
  useEffect(() => {
    if (!user) {
      setError('You must be logged in to view your cart.');
      setLoading(false);
      return;
    }
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem('jwtToken');
        if (!token) throw new Error('Not authenticated');
        const { id: userId } = jwtDecode<JWTPayload & { id: number }>(token);

        const res = await axios.get<CartResponse>(
          `http://a3ad27d89d462415f88d95f321d52072-993907692.eu-central-1.elb.amazonaws.com/cart/${userId}`
        );
        const list = res.data.cartList || [];
        if (list.length === 0) {
          setCart(null);
        } else {
          const first = list[0];
          setCart({
            id:        first.id,
            user_id:   first.user_id,
            cartItems: first.itemList
          });
          console.log('Cart loaded:', cart);
        }
      } catch (err) {
        console.error('Failed to load cart:', err);
        setError('Could not load your shopping cart.');
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [user]);

  // Remove one item
  const removeItem = async (itemId: number) => {
    if (!cart) return;
    try {
      await axios.delete<void>(
        `http://a3ad27d89d462415f88d95f321d52072-993907692.eu-central-1.elb.amazonaws.com/cart/${cart.id}`
      );
      // Optimistically update UI
      setCart({
        ...cart,
        cartItems: cart.cartItems.filter(i => i.id !== itemId)
      });
    } catch (err) {
      console.error('Failed to remove item:', err);
      alert('Could not remove item.');
    }
  };

  if (loading) return <p>Loading your cart…</p>;
  if (error)   return <p className="error">{error}</p>;

  const items = cart?.cartItems ?? [];
console.log('Cart items:', items);
  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="shopping-cart">
      <h1>Your Shopping Cart</h1>
      {items.length === 0 ? (
        <p>Your shopping cart is empty.</p>
      ) : (
        <>
          <ul className="cart-items">
            {items.map(item => (
              <li key={item.id} className="cart-item">
                <div className="cart-item-info">
                  <p><strong>Product ID:</strong> {item.productId}</p>
                  <p><strong>Price:</strong> ${item.price.toFixed(2)}</p>
                </div>
                <button
                  className="remove-btn"
                  onClick={() => removeItem(item.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <div className="cart-summary">
            <h2>Total: ${totalPrice.toFixed(2)}</h2>
            <button
              className="pay-btn"
              onClick={() => navigate('/payment',{state:{cart}})}
            >
              Pay Now
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ShoppingCart;
