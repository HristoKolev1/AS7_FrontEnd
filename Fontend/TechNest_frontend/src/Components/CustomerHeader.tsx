// src/layouts/CustomerLayout.tsx
import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export const CustomerLayout: React.FC = () => (
  <>
    <header>
      <Link to="/">Home</Link>
      <Link to="/products">Products</Link>
      <Link to="/about">About</Link>
      <Link to="/profile">Profile</Link>
      <Link to="/cart">Cart</Link>
    </header>
    <main><Outlet/></main>
  </>
);

export default CustomerLayout;
