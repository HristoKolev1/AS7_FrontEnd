// src/Components/Header.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './Header.css';

const Header: React.FC = () => {
  const { user, logout } = useUser();
  const navigate         = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <header className="header">
        <div className="logo"><Link to="/">Tech Store</Link></div>
        <nav className="nav">
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/about">About</Link></li>
            {
              !user && (
               <li><Link to="/register">Register</Link></li> 
              )
            }
            


            {user ? (
              <>
                {user.role === 'Admin' && (
                  // Admin‐only link
                  <li><Link to="/admin">Admin Dashboard</Link></li>
                )}

                {/* Common logged‐in links */}
                <li><Link to="/profile">Profile</Link></li>
                <li><Link to="/cart">Cart</Link></li>
                <li>
                  <button onClick={handleLogout} className="logout-btn">
                    Logout
                  </button>
                </li>
              </>
            ) : (
              // Guest link
              <li><Link to="/login">Login</Link></li>
            )}
          </ul>
        </nav>
      </header>


    </>
  );
};

export default Header;
