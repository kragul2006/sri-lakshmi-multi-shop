import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSendOTP = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userExists = users.find(u => u.email === email);
    
    if (!userExists) {
      setError('No account found with this email address');
      setLoading(false);
      return;
    }
    
    // Generate OTP
    const newOtp = generateOTP();
    setGeneratedOtp(newOtp);
    
    // Show OTP in alert (since email is not configured)
    alert(`Your OTP is: ${newOtp}\n\nFor demo purposes, OTP is shown here. In production, this would be sent to your email.`);
    
    setSuccess(`OTP sent to ${email}`);
    setStep(2);
    setLoading(false);
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (otp === generatedOtp) {
      setSuccess('OTP verified successfully!');
      setStep(3);
    } else {
      setError('Invalid OTP. Please try again.');
    }
    setLoading(false);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }
    
    // Get users and update password
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map(u => {
      if (u.email === email) {
        return { ...u, password: newPassword };
      }
      return u;
    });
    
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setSuccess('Password reset successfully! Redirecting to login...');
    
    setTimeout(() => {
      navigate('/login');
    }, 2000);
    setLoading(false);
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
      fontSize: '28px',
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
    },
    input: {
      width: '100%',
      padding: '14px',
      border: '1px solid #ddd',
      borderRadius: '10px',
      fontSize: '16px',
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
    successMessage: {
      backgroundColor: '#d4edda',
      color: '#155724',
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '20px',
      fontSize: '14px',
      textAlign: 'center',
    },
    backLink: {
      textAlign: 'center',
      marginTop: '20px',
    },
    link: {
      color: '#e67e22',
      textDecoration: 'none',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        {step === 1 && (
          <>
            <h2 style={styles.title}>Forgot Password?</h2>
            <p style={styles.subtitle}>Enter your email to receive OTP</p>
            {error && <div style={styles.errorMessage}>{error}</div>}
            {success && <div style={styles.successMessage}>{success}</div>}
            <form onSubmit={handleSendOTP}>
              <div style={styles.inputGroup}>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
              <button type="submit" style={styles.button} disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          </>
        )}
        
        {step === 2 && (
          <>
            <h2 style={styles.title}>Verify OTP</h2>
            <p style={styles.subtitle}>Enter the 6-digit OTP sent to your email</p>
            {error && <div style={styles.errorMessage}>{error}</div>}
            {success && <div style={styles.successMessage}>{success}</div>}
            <form onSubmit={handleVerifyOTP}>
              <div style={styles.inputGroup}>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  style={styles.input}
                  maxLength="6"
                  required
                />
              </div>
              <button type="submit" style={styles.button} disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
            <div style={{ textAlign: 'center', marginTop: '15px' }}>
              <button 
                onClick={handleSendOTP}
                style={{ background: 'none', border: 'none', color: '#e67e22', cursor: 'pointer' }}
              >
                Resend OTP
              </button>
            </div>
          </>
        )}
        
        {step === 3 && (
          <>
            <h2 style={styles.title}>Reset Password</h2>
            <p style={styles.subtitle}>Create a new password</p>
            {error && <div style={styles.errorMessage}>{error}</div>}
            {success && <div style={styles.successMessage}>{success}</div>}
            <form onSubmit={handleResetPassword}>
              <div style={styles.inputGroup}>
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.inputGroup}>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
              <button type="submit" style={styles.button} disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        )}
        
        <div style={styles.backLink}>
          <Link to="/login" style={styles.link}>
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;