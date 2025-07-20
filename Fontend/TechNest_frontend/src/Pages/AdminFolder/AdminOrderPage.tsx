// src/pages/admin/AdminOrdersPage.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminOrderPage.css';

interface RawOrderItem {
  productId: number;
  quantity:  number;
}

interface RawOrder {
  id:              number;
  date:            string;
  price:           number;
  orderProductIds: RawOrderItem[];
}

interface OrderItem {
  productId: number;
  quantity:  number;
  name?:     string;
  price?:    number;
}

interface Order {
  id:     number;
  date:   string;
  total:  number;
  items:  OrderItem[];
}

const AdminOrdersPage: React.FC = () => {
  const [orders,   setOrders]   = useState<Order[]>([]);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [error,    setError]    = useState<string | null>(null);

  // 1️⃣ Load orders (with only productId & quantity):
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    axios.get<{ orderList: RawOrder[] }>('/orders', {
      baseURL: import.meta.env.VITE_API_URL,
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      const raw = res.data.orderList ?? [];
      const list: Order[] = raw.map(o => ({
        id:    o.id,
        date:  o.date,
        total: o.price,
        items: o.orderProductIds.map(it => ({
          productId: it.productId,
          quantity:  it.quantity,
          // name & price will be fetched on expand
        }))
      }));
      setOrders(list);
    })
    .catch(err => {
      console.error(err);
      setError('Could not load orders.');
    });
  }, []);

  // 2️⃣ Toggle expand & lazy‐load product details if needed
  const toggle = async (orderId: number) => {
    const isExpanded = expanded.has(orderId);
    if (!isExpanded) {
      // on expand: fetch missing details
      const token = localStorage.getItem('jwtToken')!;
      setOrders(prev =>
        prev.map(order => {
          if (order.id !== orderId) return order;
          // only fetch items that lack name/price
          const fetches = order.items.map(async item => {
            if (item.name != null && item.price != null) return item;
            const { data: prod } = await axios.get<{
              id:    number;
              name:  string;
              price: number;
            }>(`/products/${item.productId}`, {
              baseURL: import.meta.env.VITE_API_URL,
              headers: { Authorization: `Bearer ${token}` }
            });
            return {
              ...item,
              name:  prod.name,
              price: prod.price
            };
          });
          // wait for all details, then return updated order
          return {
            ...order,
            items: []  // placeholder; we'll set full list in promise below
          };
        })
      );

      // Actually perform fetch and update state
      const order = orders.find(o => o.id === orderId);
      if (order) {
        try {
          const detailed = await Promise.all(
            order.items.map(item =>
              axios.get<{ name: string; price: number }>(`/products/${item.productId}`, {
                baseURL: import.meta.env.VITE_API_URL,
                headers: { Authorization: `Bearer ${token}` }
              }).then(res => ({
                ...item,
                name:  res.data.name,
                price: res.data.price
              }))
            )
          );
          setOrders(prev =>
            prev.map(o => o.id === orderId ? { ...o, items: detailed } : o)
          );
        } catch (err) {
          console.error('Could not fetch product details', err);
        }
      }
    }

    // Finally toggle the accordion state
    setExpanded(prev => {
      const s = new Set(prev);
      isExpanded ? s.delete(orderId) : s.add(orderId);
      return s;
    });
  };

  if (error) return <p className="error">{error}</p>;

  return (
    <div className="admin-orders-page">
      <h1>All Orders</h1>
      <table className="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Date</th>
            <th>Total</th>
            <th>Items</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <React.Fragment key={order.id}>
              <tr className="order-row">
                <td>{order.id}</td>
                <td>{new Date(order.date).toLocaleString()}</td>
                <td>${order.total.toFixed(2)}</td>
                <td>
                  <button onClick={() => toggle(order.id)}>
                    {expanded.has(order.id) ? '▲' : '▼'}
                  </button>
                </td>
              </tr>
              {expanded.has(order.id) && (
                <tr className="items-row">
                  <td colSpan={4}>
                    <table className="items-table">
                      <thead>
                        <tr>
                          <th>Product ID</th>
                          <th>Name</th>
                          <th>Price</th>

                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map(item => (
                          <tr key={item.productId}>
                            <td>{item.productId}</td>
                            <td>{item.name ?? '…'}</td>
                            <td>${item.price?.toFixed(2) ?? '…'}</td>
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

export default AdminOrdersPage;
