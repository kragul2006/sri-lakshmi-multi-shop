import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(false);
  const navigate = useNavigate();

  // Email validation regex
  const validateEmailFormat = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Check if email exists in database
  const checkEmailExists = async (email) => {
    if (!validateEmailFormat(email)) {
      setEmailError('Please enter a valid email address');
      setEmailAvailable(false);
      return false;
    }

    setIsCheckingEmail(true);
    setEmailError('');
    
    // Simulate API call to check email existence
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const emailExists = users.some(user => user.email === email);
      
      if (emailExists) {
        setEmailError('❌ Email already registered. Please use a different email or login.');
        setEmailAvailable(false);
      } else {
        setEmailError('✅ Email available!');
        setEmailAvailable(true);
      }
      setIsCheckingEmail(false);
    }, 500);
  };

  // Phone number validation - only numbers
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\d{10}$/;
    if (phone && !phoneRegex.test(phone)) {
      setPhoneError('Phone number must be 10 digits (numbers only)');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      // Allow only numbers
      const numbersOnly = value.replace(/[^0-9]/g, '');
      if (numbersOnly.length <= 10) {
        setFormData({ ...formData, [name]: numbersOnly });
        validatePhoneNumber(numbersOnly);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    setError('');
  };

  const handleEmailBlur = () => {
    if (formData.email) {
      checkEmailExists(formData.email);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate email format
    if (!validateEmailFormat(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Check if email is available
    if (!emailAvailable) {
      setError('Please use a different email address or login');
      return;
    }
    
    // Validate phone number
    if (formData.phone && !validatePhoneNumber(formData.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    setError('');
    
    // Get existing users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Final check if email already exists
    if (users.find(u => u.email === formData.email)) {
      setError('Email already registered');
      setLoading(false);
      return;
    }
    
    // Create new user
    const newUser = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      loyaltyPoints: 0,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto login after registration
    const userData = { 
      name: formData.name, 
      email: formData.email, 
      phone: formData.phone,
      loyaltyPoints: 0,
      isAdmin: formData.email === 'admin@example.com'
    };
    
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('isLoggedIn', 'true');
    
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
      maxWidth: '500px',
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
      transition: 'all 0.3s ease',
    },
    inputError: {
      borderColor: '#e74c3c',
    },
    inputSuccess: {
      borderColor: '#27ae60',
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
      transition: 'all 0.3s ease',
      marginTop: '10px',
    },
    buttonDisabled: {
      backgroundColor: '#95a5a6',
      cursor: 'not-allowed',
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
    successMessage: {
      backgroundColor: '#d4edda',
      color: '#155724',
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '20px',
      fontSize: '14px',
      textAlign: 'center',
    },
    phoneHelper: {
      fontSize: '12px',
      color: '#7f8c8d',
      marginTop: '5px',
    },
    checkingText: {
      fontSize: '12px',
      color: '#3498db',
      marginTop: '5px',
    },
    loginLink: {
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

  const isFormValid = formData.name && formData.email && emailAvailable && formData.password && formData.confirmPassword && (!formData.phone || !phoneError);

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Join Sri Lakshmi Multi Shop today</p>
        
        {error && <div style={styles.errorMessage}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {/* Full Name Field */}
          <div style={styles.inputGroup}>
            <span style={styles.inputIcon}>👤</span>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
          
          {/* Email Field with Live Validation */}
          <div style={styles.inputGroup}>
            <span style={styles.inputIcon}>📧</span>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleEmailBlur}
              style={{
                ...styles.input,
                ...(emailError && emailError.includes('available') ? styles.inputSuccess : emailError && styles.inputError),
                ...(emailError === '✅ Email available!' ? styles.inputSuccess : {})
              }}
              required
            />
            {isCheckingEmail && <div style={styles.checkingText}>⏳ Checking email availability...</div>}
            {emailError && !isCheckingEmail && (
              <div style={{ fontSize: '12px', marginTop: '5px', color: emailError.includes('available') ? '#27ae60' : '#e74c3c' }}>
                {emailError}
              </div>
            )}
          </div>
          
          {/* Phone Number Field - Numbers Only */}
          <div style={styles.inputGroup}>
            <span style={styles.inputIcon}>📞</span>
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number (10 digits)"
              value={formData.phone}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(phoneError ? styles.inputError : {})
              }}
              maxLength="10"
            />
            {phoneError && <div style={{ fontSize: '12px', color: '#e74c3c', marginTop: '5px' }}>{phoneError}</div>}
            <div style={styles.phoneHelper}>📱 Enter 10-digit mobile number (numbers only)</div>
          </div>
          
          {/* Password Field */}
          <div style={styles.inputGroup}>
            <span style={styles.inputIcon}>🔒</span>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password (min 6 characters)"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              required
            />
            <span style={styles.passwordToggle} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </span>
          </div>
          
          {/* Confirm Password Field */}
          <div style={styles.inputGroup}>
            <span style={styles.inputIcon}>🔒</span>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(formData.confirmPassword && formData.password !== formData.confirmPassword ? styles.inputError : {})
              }}
              required
            />
            <span style={styles.passwordToggle} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
            </span>
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <div style={{ fontSize: '12px', color: '#e74c3c', marginTop: '5px' }}>❌ Passwords do not match</div>
            )}
            {formData.confirmPassword && formData.password === formData.confirmPassword && formData.password && (
              <div style={{ fontSize: '12px', color: '#27ae60', marginTop: '5px' }}>✅ Passwords match</div>
            )}
          </div>
          
          <button 
            type="submit" 
            style={{
              ...styles.button,
              ...(!isFormValid ? styles.buttonDisabled : {})
            }}
            disabled={!isFormValid || loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <div style={styles.loginLink}>
          Already have an account? <Link to="/login" style={styles.link}>Login here</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;