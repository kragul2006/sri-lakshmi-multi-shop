import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    console.log('Available users:', users);
    
    // Find user by email
    const user = users.find(u => u.email === email);
    
    if (!user) {
      setError('No account found with this email');
      setLoading(false);
      return;
    }
    
    // Check password (plain text comparison for demo)
    if (user.password !== password) {
      setError('Invalid password');
      setLoading(false);
      return;
    }
    
    // Login successful
    const userData = { 
      name: user.name, 
      email: user.email, 
      phone: user.phone,
      isAdmin: user.email === 'admin@example.com'
    };
    
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('isAdmin', userData.isAdmin ? 'true' : 'false');
    
    setLoading(false);
    navigate('/');
    window.location.reload();
  };

  const styles = {
    container: {
      minHeight: 'calc(100vh - 200px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      backgroundColor: '#f8f9fa',
    },
    formContainer: {
      maxWidth: '450px',
      width: '100%',
      backgroundColor: 'white',
      borderRadius: '20px',
      padding: '40px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: '10px',
      color: '#2c3e50',
    },
    subtitle: {
      textAlign: 'center',
      marginBottom: '30px',
      color: '#7f8c8d',
    },
    inputGroup: {
      marginBottom: '20px',
      position: 'relative',
    },
    inputIcon: {
      position: 'absolute',
      left: '15px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#e67e22',
      fontSize: '18px',
    },
    input: {
      width: '100%',
      padding: '14px 15px 14px 45px',
      border: '1px solid #ddd',
      borderRadius: '10px',
      fontSize: '16px',
    },
    passwordToggle: {
      position: 'absolute',
      right: '15px',
      top: '50%',
      transform: 'translateY(-50%)',
      cursor: 'pointer',
      color: '#999',
    },
    button: {
      width: '100%',
      padding: '14px',
      backgroundColor: '#e67e22',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
    },
    errorMessage: {
      backgroundColor: '#fee2e2',
      color: '#dc2626',
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '20px',
      fontSize: '14px',
      textAlign: 'center',
    },
    forgotPassword: {
      textAlign: 'right',
      marginTop: '10px',
      marginBottom: '20px',
    },
    forgotLink: {
      color: '#e67e22',
      textDecoration: 'none',
      fontSize: '14px',
    },
    registerLink: {
      textAlign: 'center',
      marginTop: '20px',
      color: '#7f8c8d',
    },
    link: {
      color: '#e67e22',
      textDecoration: 'none',
      fontWeight: '600',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2 style={styles.title}>Welcome Back!</h2>
        <p style={styles.subtitle}>Login to your account</p>
        
        {error && <div style={styles.errorMessage}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <span style={styles.inputIcon}>📧</span>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          
          <div style={styles.inputGroup}>
            <span style={styles.inputIcon}>🔒</span>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
            <span style={styles.passwordToggle} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </span>
          </div>
          
          <div style={styles.forgotPassword}>
            <Link to="/forgot-password" style={styles.forgotLink}>
              Forgot Password?
            </Link>
          </div>
          
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div style={styles.registerLink}>
          Don't have an account? <Link to="/register" style={styles.link}>Register here</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;