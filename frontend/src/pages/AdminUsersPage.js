import React, { useState, useEffect } from 'react';

function AdminUsersPage({ darkMode }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to load users');
      setLoading(false);
    }
  };

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 20px',
    },
    title: {
      fontSize: '28px',
      marginBottom: '20px',
      color: darkMode ? '#e0e0e0' : '#2c3e50',
    },
    userTable: {
      width: '100%',
      borderCollapse: 'collapse',
      backgroundColor: darkMode ? '#2d2d44' : 'white',
      borderRadius: '10px',
      overflow: 'hidden',
      boxShadow: darkMode ? '0 2px 10px rgba(0,0,0,0.3)' : '0 2px 10px rgba(0,0,0,0.1)',
    },
    th: {
      padding: '15px',
      textAlign: 'left',
      backgroundColor: '#e67e22',
      color: 'white',
    },
    td: {
      padding: '12px 15px',
      borderBottom: `1px solid ${darkMode ? '#3d3d5c' : '#eee'}`,
      color: darkMode ? '#e0e0e0' : '#333',
    },
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading users...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>{error}</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Registered Users ({users.length})</h1>
      <table style={styles.userTable}>
        <thead>
          <tr>
            <th style={styles.th}>#</th>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Phone</th>
            <th style={styles.th}>Registered On</th>
            <th style={styles.th}>Last Login</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user._id}>
              <td style={styles.td}>{index + 1}</td>
              <td style={styles.td}>{user.name}</td>
              <td style={styles.td}>{user.email}</td>
              <td style={styles.td}>{user.phone || '-'}</td>
              <td style={styles.td}>{new Date(user.createdAt).toLocaleDateString()}</td>
              <td style={styles.td}>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminUsersPage;