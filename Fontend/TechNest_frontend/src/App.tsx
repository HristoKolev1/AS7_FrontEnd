  // src/App.tsx
  import React from 'react';
  import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
  import { RequireAuth, RequireAdmin } from './Components/ProtectedRoute';
  import { AdminLayout }                from './Components/AdminHeader';
  import Home from './Pages/Home';
  import ProductsPage from './Pages/ProductPage';
  import About from './Pages/AboutPage';
  // import { CartProvider } from './Components/CartContext';
  import ShoppingCart from './Pages/ShoppingCart';
  import ProductDetail from './Pages/ProductDetail';
  import './App.css';
  import LoginPage from './Pages/LoginPage';
  import Profile from './Pages/ProfilePage';
  import AdminUsersPage from './Pages/AdminFolder/AdminUserPage';
  import AdminProductsPage from './Pages/AdminFolder/AdminProductPage';
  import AdminOrdersPage from './Pages/AdminFolder/AdminOrderPage';
  import AdminDashboard from './Pages/AdminFolder/AdminDashboard';
  import MainLayout from './Pages/MainLayout';  
  import AdminEditProductPage from './Pages/AdminFolder/AdminEditProductPage';
  import RegisterPage from './Pages/RegistrationPage';
  import ProfileOrdersPage from './Pages/OrderHistoryPage';
  import UpdateInfoPage from './Pages/UpdateUserInfo';
  import PaymentPage from './Pages/PaymentPage';

  const App: React.FC = () => (

   <BrowserRouter>
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Customer */}
        <Route element={<RequireAuth />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/cart" element={<ShoppingCart />} />
          <Route path="/profile/orders" element={<ProfileOrdersPage />} />
          <Route path="/profile/edit" element={<UpdateInfoPage />} />
          <Route path="/payment" element={<PaymentPage />} />
        </Route>

        {/* Admin */}
        <Route element={<RequireAuth />}>
          <Route element={<RequireAdmin />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/products" element={<AdminProductsPage />} />
              <Route path="/admin/products/:id/edit" element={<AdminEditProductPage />} />
              <Route path="/admin/orders" element={<AdminOrdersPage />} />
            </Route>
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  </BrowserRouter>
  );

  export default App;
