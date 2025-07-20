// src/layouts/MainLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';

const MainLayout: React.FC = () => (
  <>
    <Header />
    <main style={{ padding: '1rem' }}>
      <Outlet />
    </main>
    <Footer />
  </>
);

export default MainLayout;
