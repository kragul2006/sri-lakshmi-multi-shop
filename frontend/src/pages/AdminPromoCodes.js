import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPromoCode } from '../utils/loyaltySystem';

function AdminPromoCodes() {
  const navigate = useNavigate();
  const [promoCodes, setPromoCodes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    expiryDate: '',
    minOrderAmount: '',
    maxDiscount: '',
    usageLimit: ''
  });

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) { navigate('/login'); return; }
    const userData = JSON.parse(user);
    if (userData.email !== 'admin@example.com') { navigate('/'); return; }
    loadPromoCodes();
  }, []);

  const loadPromoCodes = () => {
    const codes = JSON.parse(localStorage.getItem('promoCodes') || '[]');
    setPromoCodes(codes);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = createPromoCode(
      formData.code,
      formData.type,
      parseFloat(formData.value),
      formData.expiryDate,
      parseFloat(formData.minOrderAmount) || 0,
      formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
      formData.usageLimit ? parseInt(formData.usageLimit) : null
    );
    if (result.success) {
      alert('Promo code created successfully!');
      setFormData({ code: '', type: 'percentage', value: '', expiryDate: '', minOrderAmount: '', maxDiscount: '', usageLimit: '' });
      setShowForm(false);
      loadPromoCodes();
    } else {
      alert(result.message);
    }
  };

  const deletePromoCode = (id) => {
    if (window.confirm('Delete this promo code?')) {
      const updated = promoCodes.filter(p => p.id !== id);
      localStorage.setItem('promoCodes', JSON.stringify(updated));
      loadPromoCodes();
    }
  };

  const styles = {
    container: { maxWidth: '1200px', margin: '0 auto', padding: '20px' },
    header: { backgroundColor: '#2c3e50', color: 'white', padding: '20px', borderRadius: '10px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    addButton: { backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer' },
    formContainer: { backgroundColor: 'white', borderRadius: '15px', padding: '30px', marginBottom: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' },
    formGroup: { display: 'flex', flexDirection: 'column' },
    label: { fontWeight: '600', marginBottom: '8px', color: '#2c3e50' },
    input: { padding: '10px', border: '1px solid #ddd', borderRadius: '8px' },
    select: { padding: '10px', border: '1px solid #ddd', borderRadius: '8px' },
    submitBtn: { backgroundColor: '#e67e22', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', marginTop: '20px' },
    table: { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden' },
    th: { padding: '15px', textAlign: 'left', backgroundColor: '#f8f9fa', borderBottom: '2px solid #eee' },
    td: { padding: '15px', borderBottom: '1px solid #eee' },
    deleteBtn: { backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer' },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>🎟️ Promo Code Manager</h1>
        <button onClick={() => setShowForm(!showForm)} style={styles.addButton}>+ Create New Promo Code</button>
      </div>

      {showForm && (
        <div style={styles.formContainer}>
          <h2>Create Promo Code</h2>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}><label style={styles.label}>Code *</label><input type="text" name="code" value={formData.code} onChange={handleInputChange} style={styles.input} required placeholder="WELCOME10" /></div>
              <div style={styles.formGroup}><label style={styles.label}>Type *</label><select name="type" value={formData.type} onChange={handleInputChange} style={styles.select}><option value="percentage">Percentage (%)</option><option value="fixed">Fixed Amount (₹)</option></select></div>
              <div style={styles.formGroup}><label style={styles.label}>Value *</label><input type="number" name="value" value={formData.value} onChange={handleInputChange} style={styles.input} required placeholder="10 for 10% or ₹10" /></div>
              <div style={styles.formGroup}><label style={styles.label}>Expiry Date *</label><input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} style={styles.input} required /></div>
              <div style={styles.formGroup}><label style={styles.label}>Min Order Amount (₹)</label><input type="number" name="minOrderAmount" value={formData.minOrderAmount} onChange={handleInputChange} style={styles.input} placeholder="Optional" /></div>
              <div style={styles.formGroup}><label style={styles.label}>Max Discount (₹)</label><input type="number" name="maxDiscount" value={formData.maxDiscount} onChange={handleInputChange} style={styles.input} placeholder="For percentage codes" /></div>
            </div>
            <button type="submit" style={styles.submitBtn}>Create Promo Code</button>
          </form>
        </div>
      )}

      <table style={styles.table}>
        <thead><tr><th style={styles.th}>Code</th><th style={styles.th}>Type</th><th style={styles.th}>Value</th><th style={styles.th}>Expiry</th><th style={styles.th}>Min Order</th><th style={styles.th}>Uses</th><th style={styles.th}>Actions</th></tr></thead>
        <tbody>
          {promoCodes.map(promo => (
            <tr key={promo.id}><td style={styles.td}><strong>{promo.code}</strong></td><td style={styles.td}>{promo.type === 'percentage' ? 'Percentage' : 'Fixed'}</td><td style={styles.td}>{promo.type === 'percentage' ? `${promo.value}%` : `₹${promo.value}`}</td><td style={styles.td}>{new Date(promo.expiryDate).toLocaleDateString()}</td><td style={styles.td}>{promo.minOrderAmount ? `₹${promo.minOrderAmount}` : '-'}</td><td style={styles.td}>{promo.usedCount || 0}/{promo.usageLimit || '∞'}</td><td style={styles.td}><button onClick={() => deletePromoCode(promo.id)} style={styles.deleteBtn}>Delete</button></td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminPromoCodes;