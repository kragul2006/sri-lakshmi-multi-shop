import React from 'react';

function PointsDisplay({ points }) {
  const discountValue = Math.floor(points / 10); // 10 points = ₹1
  
  return (
    <div style={{
      backgroundColor: '#fff8f0',
      borderRadius: '12px',
      padding: '15px',
      marginBottom: '20px',
      border: '1px solid #ffe0b3',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '40px' }}>💎</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', color: '#7f8c8d' }}>Your Loyalty Points</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#e67e22' }}>
            {points.toLocaleString()} Points
          </div>
          <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
            = ₹{discountValue} discount value (10 points = ₹1)
          </div>
        </div>
      </div>
      <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
        💡 Earn 10 points for every ₹100 spent
      </div>
    </div>
  );
}

export default PointsDisplay;