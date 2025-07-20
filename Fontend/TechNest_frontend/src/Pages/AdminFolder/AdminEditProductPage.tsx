// src/pages/admin/AdminEditProductPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Product } from '../../types/index';
import './AdminEditProductPage.css';

const AdminEditProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    axios.get<Product>(`/products/${id}`, {
      baseURL: import.meta.env.VITE_API_URL,
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => setProduct(res.data))
    .catch(() => setError('Could not load product.'));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!product) return;
    const { name, value } = e.target;
    setProduct({
      ...product,
      [name]: name === 'price' || name === 'quantity'
        ? Number(value)
        : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setSaving(true);
    const token = localStorage.getItem('jwtToken');
    try {
      console.log('Submitting product:', product);
      await axios.put(`/products/update`, product, {
        baseURL: import.meta.env.VITE_API_URL,
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/admin/products');
    } catch {
      setError('Save failed.');
    } finally {
      setSaving(false);
    }
  };

  if (error) return <p className="error">{error}</p>;
  if (!product) return <p>Loading…</p>;

  return (
    <div className="edit-product-page">
      <h1>Edit Product #{product.id}</h1>
      <form className="edit-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input name="name" value={product.name} onChange={handleChange} />
        </label>
        <label>
          Price
          <input
            name="price"
            type="number"
            value={product.price}
            onChange={handleChange}
          />
        </label>
        <label>
          Quantity
          <input
            name="quantity"
            type="number"
            value={product.quantity}
            onChange={handleChange}
          />
        </label>
        <label>
          Description
          <input
            name="description"
            value={product.description || ''}
            onChange={handleChange}
          />
        </label>
        <div className="buttons">
          <button type="button" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminEditProductPage;
