import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '100px 20px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>Welcome to Sri Lakshmi Multi Shop</h1>
          <p style={{ fontSize: '20px', marginBottom: '30px' }}>Quality Household Products at Best Prices</p>
          <Link to="/products">
            <button style={{
              background: '#e67e22',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              fontSize: '18px',
              borderRadius: '50px',
              cursor: 'pointer',
            }}>Shop Now →</button>
          </Link>
        </div>
      </div>

      {/* Features - Only 2 boxes (REMOVED Free Delivery) */}
      <div style={{ padding: '60px 20px', backgroundColor: '#f8f9fa' }}>
        <div style={{ 
          maxWidth: '800px', 
          margin: '0 auto', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '30px',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            backgroundColor: 'white', 
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '50px', color: '#e67e22' }}>🛡️</div>
            <h3 style={{ marginTop: '15px', fontSize: '22px' }}>Quality Guarantee</h3>
            <p style={{ marginTop: '10px', color: '#666' }}>100% authentic products</p>
          </div>
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            backgroundColor: 'white', 
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '50px', color: '#e67e22' }}>⏰</div>
            <h3 style={{ marginTop: '15px', fontSize: '22px' }}>Quick Support</h3>
            <p style={{ marginTop: '10px', color: '#666' }}>24/7 customer service</p>
          </div>
        </div>
      </div>

      {/* About Shop */}
      <div style={{ padding: '60px 20px', backgroundColor: '#2c3e50', color: 'white', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2>About Sri Lakshmi Multi Shop</h2>
          <p style={{ margin: '20px 0', lineHeight: '1.6' }}>Since 2017, Sri Lakshmi Multi Shop has been serving the community with quality household products from our store at No 102, Odiampet Road, Vilianur, Puducherry. We take pride in offering a wide range of products that cater to every need of your home.</p>
          <Link to="/about">
            <button style={{
              background: '#e67e22',
              color: 'white',
              border: 'none',
              padding: '12px 30px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              marginTop: '10px'
            }}>Learn More →</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HomePage;