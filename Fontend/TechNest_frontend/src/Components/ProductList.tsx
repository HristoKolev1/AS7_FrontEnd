// src/components/ProductList.tsx
import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { fetchProducts } from '../data/fetchingProducts';
import { Product } from '../types';
import './ProductList.css';

const ProductList: React.FC = () => {
  // ✅ Hooks go here, inside the component body
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    fetchProducts()
      .then(data => {
        setProducts(data);
        setError(null);
      })
      .catch(err => {
        console.error(err);
        setError('Could not load products.');
      });
  }, []);

  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    <section className="product-list">
      {products.map((product: Product) => (
        // If your Product interface uses `_id` from Mongo, switch to product._id here:
        <ProductCard key={product.id} product={product} />
      ))}
    </section>
  );
};

export default ProductList;
