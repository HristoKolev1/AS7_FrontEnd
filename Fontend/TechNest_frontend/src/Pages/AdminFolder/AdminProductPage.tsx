// src/pages/admin/AdminProductsPage.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../../types/index';
import './AdminProductPage.css';

const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError]       = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    axios.get('/products', {
      baseURL: import.meta.env.VITE_API_URL,
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      console.log('🔍 products response:', res.data);

      // Detect which property holds the array
      let list: Product[] = [];
      if (Array.isArray(res.data)) {
        list = res.data;
      } else if (Array.isArray(res.data.products)) {
        list = res.data.products;
      } else if (Array.isArray(res.data.productList)) {
        list = res.data.productList;
      } else {
        console.warn('Unexpected products response shape', res.data);
      }

      setProducts(list);
    })
    .catch(err => {
      console.error(err);
      setError('Could not load products.');
    });
  }, []);

  const handleEdit = (id: number | string) => {
    navigate(`/admin/products/${id}/edit`);
  };

  const handleDelete = (id: number | string) => {
    const token = localStorage.getItem('jwtToken');
    axios.delete(`/products/${id}`, {
      baseURL: import.meta.env.VITE_API_URL,
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => setProducts(ps => ps.filter(p => p.id !== id)))
    .catch(err => {
      console.error(err);
      alert('Delete failed.');
    });
  };

  if (error) return <p className="error">{error}</p>;

  return (
    <div className="admin-products-page">
      <h1>Manage Products</h1>
      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Price</th><th>Qty</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>${p.price.toFixed(2)}</td>
                <td>{p.quantity}</td>
                <td>
                  <button onClick={() => handleEdit(p.id)}>Edit</button>
                  <button onClick={() => handleDelete(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminProductsPage;
