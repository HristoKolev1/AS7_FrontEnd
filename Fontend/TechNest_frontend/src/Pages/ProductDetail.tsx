// src/pages/ProductDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProduct } from '../data/fetchingProducts';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import './ProductDetail.css';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();           // pull in your context

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    fetchProduct(id)
      .then(p => {
        setProduct(p);
        setError(null);
      })
      .catch(() => {
        setError('Product not found.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Loading product…</p>;
  if (error)   return <p className="error">{error}</p>;
  if (!product) return null;

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, product.price);
      alert(`${product.name} added to cart!`);
    } catch (err) {
      console.error('Add to cart failed:', err);
      alert('Could not add to cart.');
    }
  };

  return (
    <div className="product-detail">
      <button onClick={() => navigate(-1)} className="back-btn">
        ← Back
      </button>
      <div className="detail-container">
        <img
          src={product.image}
          alt={product.name}
          className="detail-image"
        />
        <div className="detail-info">
          <h1 className="product-title">{product.name}</h1>
          <p className="product-description">{product.description}</p>
          <p className="product-price">${product.price.toFixed(2)}</p>
          <button
            onClick={handleAddToCart}
            className="add-to-cart-btn"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
