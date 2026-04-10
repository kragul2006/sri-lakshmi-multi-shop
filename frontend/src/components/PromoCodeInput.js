import React, { useState } from 'react';
import { validatePromoCode } from '../utils/loyaltySystem';

function PromoCodeInput({ onApply, onRemove, appliedPromo, cartTotal }) {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleApply = () => {
    if (!code.trim()) {
      setMessage('Please enter a promo code');
      setMessageType('error');
      return;
    }
    
    const result = validatePromoCode(code, cartTotal);
    console.log('Promo validation result:', result); // Debug log
    
    if (result.valid) {
      setMessage(result.message);
      setMessageType('success');
      onApply(code, result.discount);
      setCode('');
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage(result.message);
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleRemove = () => {
    onRemove();
    setMessage('');
    setCode('');
  };

  const styles = {
    container: {
      backgroundColor: '#f8f9fa',
      borderRadius: '12px',
      padding: '15px',
      marginBottom: '20px',
    },
    title: {
      fontSize: '14px',
      fontWeight: '600',
      marginBottom: '10px',
      color: '#2c3e50',
    },
    inputGroup: {
      display: 'flex',
      gap: '10px',
      flexWrap: 'wrap',
    },
    input: {
      flex: 1,
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      fontSize: '14px',
      textTransform: 'uppercase',
    },
    applyBtn: {
      padding: '12px 20px',
      backgroundColor: '#e67e22',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
    },
    removeBtn: {
      padding: '12px 20px',
      backgroundColor: '#e74c3c',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
    },
    message: {
      marginTop: '10px',
      fontSize: '12px',
    },
    success: {
      color: '#27ae60',
    },
    error: {
      color: '#e74c3c',
    },
    appliedBox: {
      backgroundColor: '#d4edda',
      padding: '10px',
      borderRadius: '8px',
      marginTop: '10px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '10px',
    },
  };

  if (appliedPromo) {
    return (
      <div style={styles.container}>
        <div style={styles.title}>🎉 Promo Code Applied</div>
        <div style={styles.appliedBox}>
          <span>
            <strong>{appliedPromo.code}</strong> - ₹{appliedPromo.discount} off
          </span>
          <button onClick={handleRemove} style={styles.removeBtn}>
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.title}>🎟️ Have a Promo Code?</div>
      <div style={styles.inputGroup}>
        <input
          type="text"
          placeholder="Enter promo code (e.g., WELCOME10)"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          style={styles.input}
        />
        <button onClick={handleApply} style={styles.applyBtn}>
          Apply
        </button>
      </div>
      {message && (
        <div style={{ ...styles.message, ...(messageType === 'success' ? styles.success : styles.error) }}>
          {message}
        </div>
      )}
    </div>
  );
}

export default PromoCodeInput;