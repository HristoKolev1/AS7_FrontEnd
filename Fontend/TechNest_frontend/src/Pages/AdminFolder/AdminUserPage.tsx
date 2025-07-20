// src/pages/admin/AdminUsersPage.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminUserPage.css';

interface FullUser {
  id:       number;
  username: string;
  name:     string;
  email:    string;
  address:  string;
  city:     string;
  role:     'admin' | 'customer';
}

const AdminUsersPage: React.FC = () => {
  const [users, setUsers]       = useState<FullUser[]>([]);
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(true);

  // Fetch users
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    axios.get('/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      console.log('🔍 users response:', res.data);
      let list: FullUser[] = [];
      if (Array.isArray(res.data)) {
        list = res.data;
      } else if (Array.isArray(res.data.users)) {
        list = res.data.users;
      } else if (Array.isArray(res.data.userList)) {
        list = res.data.userList;
      } else {
        console.warn('Unexpected users response shape', res.data);
      }
      setUsers(list);
    })
    .catch(err => {
      console.error(err);
      setError('Could not load users.');
    })
    .finally(() => {
      setLoading(false);
    });
  }, []);

  // Delete handler
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this user and all their data?'
    );
    if (!confirmed) return;

    const token = localStorage.getItem('jwtToken');
    try {
      await axios.delete(`/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // remove from local state
      setUsers(u => u.filter(user => user.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete user.');
    }
  };

  if (loading) return <p>Loading users…</p>;
  if (error)   return <p className="error">{error}</p>;
  if (users.length === 0) return <p>No users found.</p>;

  return (
    <div className="admin-users-page">
      <h1>Manage Users</h1>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th> {/* was Role */}
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              {/* <td>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(u.id)}
                >
                  Delete
                </button>
              </td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsersPage;
