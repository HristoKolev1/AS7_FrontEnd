import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProfilePage.css';
import {jwtDecode} from 'jwt-decode';
import { JWTPayload } from '../types';

interface FullUser {
  id: number;
  username: string;
  name: string;
  email: string;
  address: string;
  city: string;
  role: 'admin' | 'customer';
}

const ProfilePage: React.FC = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [fullUser, setFullUser] = useState<FullUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    const token = localStorage.getItem('jwtToken');
    if (!token) {
      setError('No authentication token found.');
      return;
    }

    const payload = jwtDecode<JWTPayload & { id: number }>(token);
    const userId = payload.id;

    axios
      .get<FullUser>(`/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => setFullUser(res.data))
      .catch(err => {
        console.error('Profile fetch error:', err);
        setError('Could not load profile.');
      });
  }, [user, navigate]);

  const handleDeleteAccount = async () => {
    if (!fullUser) return;

    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action is irreversible.'
    );
    if (!confirmed) return;

    const token = localStorage.getItem('jwtToken');
    try {
      await axios.delete(`/users/${fullUser.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Remove JWT and log out
      localStorage.removeItem('jwtToken');
      logout();
      // Redirect to home page
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Account delete error:', err);
      setError('Failed to delete account.');
    }
  };

  if (!user) {
    navigate('/login', { replace: true });
    return null;
  }

  return (
    <div className="profile-page">
      <h1>My Profile</h1>
      {error && <p className="error">{error}</p>}
      {fullUser ? (
        <div className="profile-card">
          <div className="profile-row">
            <span className="label">Username:</span>
            <span className="value">{fullUser.username}</span>
          </div>
          <div className="profile-row">
            <span className="label">Name:</span>
            <span className="value">{fullUser.name}</span>
          </div>
          <div className="profile-row">
            <span className="label">Email:</span>
            <span className="value">{fullUser.email}</span>
          </div>
          <div className="profile-row">
            <span className="label">Address:</span>
            <span className="value">{fullUser.address}</span>
          </div>
          <div className="profile-row">
            <span className="label">City:</span>
            <span className="value">{fullUser.city}</span>
          </div>

          <div className="buttons">
            <button
              className="orders-btn"
              onClick={() => navigate('/profile/orders')}
            >
              Order History
            </button>
            <button
              className="edit-btn"
              onClick={() => navigate('/profile/edit')}
            >
              Edit Info
            </button>
            <button
              className="logout-btn"
              onClick={() => { 
                localStorage.removeItem('jwtToken');
                logout();
                navigate('/login', { replace: true });
              }}
            >
              Log Out
            </button>
            <button
              className="delete-account-btn"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </button>
          </div>
        </div>
      ) : (
        <p>Loading…</p>
      )}
    </div>
  );
};

export default ProfilePage;
