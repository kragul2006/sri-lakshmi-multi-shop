import React from 'react';

function AboutPage() {
  return (
    <div>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '60px 20px',
        textAlign: 'center',
      }}>
        <h1 style={{ fontSize: '48px', marginBottom: '10px' }}>About Us</h1>
        <p>Learn more about Sri Lakshmi Multi Shop</p>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2>Our Story</h2>
          <p>Sri Lakshmi Multi Shop was founded in 2017 with a simple mission: to provide quality household products at affordable prices. What started as a small neighborhood store has grown into a trusted destination for thousands of families across pondicherry.</p>
          
          <h2>Our Mission</h2>
          <p>To make quality household products accessible to every home, providing exceptional value and service that exceeds expectations.</p>
          
          <h2>Why Choose Us?</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>✓ Quality products from trusted brands</li>
            <li>✓ Best prices in the market</li>
            <li>✓ 24/7 customer support</li>
          </ul>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '40px', textAlign: 'center' }}>
            <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
              <h3>15+</h3>
              <p>Years of Excellence</p>
            </div>
            <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
              <h3>10,000+</h3>
              <p>Happy Customers</p>
            </div>
            <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
              <h3>500+</h3>
              <p>Products</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;