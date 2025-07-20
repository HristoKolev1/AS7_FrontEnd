import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UpdateUserInfo.css';
import { jwtDecode } from 'jwt-decode';
import type { JWTPayload } from '../types';

interface FullUser {
  id:      number;
  username:string;
  name:    string;
  email:   string;
  address: string;
  city:    string;
}

const UpdateProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FullUser>({
    id: 0, username:'', name:'', email:'', address:'', city:''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string|null>(null);

  // load current user
 useEffect(() => {
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    navigate('/login', { replace: true });
    return; // ← returns `undefined`, not a Promise
  }
    const payload = jwtDecode<JWTPayload & { id: number }>(token);
    const userId  = payload.id;     
    console.log(userId)   // use the numeric claim
  async function fetchProfile() {
    try {
      const res = await axios.get<FullUser>(`/users/${userId}`, {  headers: {
        Authorization: `Bearer ${token}`,
      }, });
      setForm(res.data);
      
      setError(null);
    } catch {
      setError('Could not load profile.');
    } finally {
      setLoading(false);
    }
  }

  fetchProfile(); // ← call it, but do *not* return it
}, [navigate]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCancel = () => navigate('/profile', { replace: true });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('jwtToken')!;
    try {
  await axios.put(
      '/users/update',      // relative path → proxied to http://localhost:8082/users/update
   form,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
    );
      navigate('/profile', { replace: true });
    } catch {
      setError('Update failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading…</p>;
  if (error)   return <p className="error">{error}</p>;

  return (
    <div className="update-page">
      <h1>Edit Profile</h1>
      <form className="update-form" onSubmit={handleSubmit}>
        <label>
          Username
          <input name="username" value={form.username} onChange={handleChange} disabled/>
        </label>
        <label>
          Name
          <input name="name" value={form.name} onChange={handleChange} required/>
        </label>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} required/>
        </label>
        <label>
          Address
          <input name="address" value={form.address} onChange={handleChange}/>
        </label>
        <label>
          City
          <input name="city" value={form.city} onChange={handleChange}/>
        </label>
        <div className="buttons">
          <button type="button" onClick={handleCancel}>Cancel</button>
          <button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Update'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateProfilePage;
