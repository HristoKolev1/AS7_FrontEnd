// src/pages/OrderHistoryPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import './OrderHistoryPage.css';

interface RawOrderItem {
  id:        number;
  productId: string;
}

interface RawOrder {
  id:              number;
  date:            string;
  user_id:         number;
  price:           number;
  orderProductIds: RawOrderItem[];
}

interface OrderItem {
  id:        number;
  productId: string;
}

interface Order {
  id:     number;
  date:   string;
  total:  number;
  items:  OrderItem[];
}

const OrderHistoryPage: React.FC = () => {
  const [orders,   setOrders]   = useState<Order[]>([]);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      setError('You must be logged in to view order history.');
      setLoading(false);
      return;
    }

    let userId: number | null = null;
    try {
      const payload = jwtDecode<{ id: number }>(token);
      userId = payload.id;
    } catch {
      console.warn('Could not decode JWT; fetching all orders');
    }

    const endpoint = userId != null
      ? `/orders/${userId}`
      : '/orders';

    axios.get<{ orders: RawOrder[] }>(endpoint, {
      baseURL: import.meta.env.VITE_ORDER_SERVICE_URL,
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      const list = res.data.orders.map(o => ({
        id:    o.id,
        date:  o.date,
        total: o.price,
        items: o.orderProductIds.map(i => ({
          id:        i.id,
          productId: i.productId
        }))
      }));
      setOrders(list);
    })
    .catch(err => {
      console.error(err);
      setError('Failed to load order history.');
    })
    .finally(() => {
      setLoading(false);
    });
  }, []);

  const toggle = (orderId: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      prev.has(orderId) ? next.delete(orderId) : next.add(orderId);
      return next;
    });
  };

  if (loading) return <p>Loading your orders…</p>;
  if (error)   return <p className="error">{error}</p>;

  return (
    <div className="order-history-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <h1>Your Order History</h1>
      <table className="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Date</th>
            <th>Total</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <React.Fragment key={order.id}>
              <tr className="order-row">
                <td>{order.id}</td>
                <td>{new Date(order.date).toLocaleString()}</td>
                <td>${(order.total / 100).toFixed(2)}</td>
                <td>
                  <button
                    className="toggle-btn"
                    onClick={() => toggle(order.id)}
                  >
                    {expanded.has(order.id) ? '−' : '+'}
                  </button>
                </td>
              </tr>
              {expanded.has(order.id) && (
                <tr className="items-row">
                  <td colSpan={4}>
                    <table className="items-table">
                      <thead>
                        <tr>
                          <th>Item ID</th>
                          <th>Product ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map(item => (
                          <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>{item.productId}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderHistoryPage;
