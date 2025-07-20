  // src/layouts/AdminLayout.tsx
  import React from 'react';
  import { Outlet, Link } from 'react-router-dom';
  import './AdminHeader.css';


  export const AdminLayout: React.FC = () => (
    <div className="admin-panel">
      <aside>
        {/* <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
        <Link to="/about">About</Link> */}
        <hr/>
        <Link to="/admin/users">All Users</Link>
        <Link to="/admin/products">Manage Products</Link>
        <Link to="/admin/orders">All Orders</Link>
      </aside>
      <section><Outlet/></section>
    </div>
  );
  export default AdminLayout;