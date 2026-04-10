import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ContactPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Save message to localStorage
    const messages = JSON.parse(localStorage.getItem('contact_messages') || '[]');
    const newMessage = {
      id: Date.now(),
      ...formData,
      status: 'unread',
      createdAt: new Date().toISOString(),
      replied: false
    };
    messages.push(newMessage);
    localStorage.setItem('contact_messages', JSON.stringify(messages));
    
    // Also create notification for admin
    const adminNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    const newNotification = {
      id: Date.now(),
      type: 'contact_message',
      title: '📧 New Contact Message',
      message: `New message from ${formData.name}: ${formData.subject}`,
      customerName: formData.name,
      customerEmail: formData.email,
      read: false,
      createdAt: new Date().toISOString()
    };
    adminNotifications.push(newNotification);
    localStorage.setItem('adminNotifications', JSON.stringify(adminNotifications));
    window.dispatchEvent(new Event('adminNotificationsUpdated'));
    
    setLoading(false);
    setSubmitted(true);
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    
    setTimeout(() => setSubmitted(false), 3000);
  };

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '60px 20px',
    },
    banner: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '60px 20px',
      textAlign: 'center',
      marginBottom: '40px',
    },
    bannerTitle: {
      fontSize: '48px',
      marginBottom: '10px',
    },
    bannerSubtitle: {
      fontSize: '18px',
      opacity: 0.9,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '40px',
    },
    infoCard: {
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '20px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    },
    formCard: {
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '20px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    },
    title: {
      fontSize: '24px',
      marginBottom: '20px',
      color: '#2c3e50',
    },
    infoItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      marginBottom: '20px',
      padding: '15px',
      backgroundColor: '#f8f9fa',
      borderRadius: '12px',
    },
    infoIcon: {
      fontSize: '28px',
    },
    infoContent: {
      flex: 1,
    },
    infoLabel: {
      fontWeight: '600',
      marginBottom: '5px',
    },
    infoValue: {
      color: '#666',
    },
    formGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '500',
      color: '#2c3e50',
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '10px',
      fontSize: '14px',
    },
    textarea: {
      width: '100%',
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '10px',
      fontSize: '14px',
      fontFamily: 'inherit',
      resize: 'vertical',
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
    successMessage: {
      backgroundColor: '#d4edda',
      color: '#155724',
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '20px',
      textAlign: 'center',
    },
  };

  return (
    <div>
      <div style={styles.banner}>
        <h1 style={styles.bannerTitle}>Contact Us</h1>
        <p style={styles.bannerSubtitle}>We'd love to hear from you</p>
      </div>

      <div style={styles.container}>
        <div style={styles.grid}>
          {/* Contact Info */}
          <div style={styles.infoCard}>
            <h2 style={styles.title}>Get in Touch</h2>
            
            <div style={styles.infoItem}>
              <div style={styles.infoIcon}>📍</div>
              <div style={styles.infoContent}>
                <div style={styles.infoLabel}>Address</div>
                <div style={styles.infoValue}>No 102, Odiampet Road, Vilianur, Puducherry - 605110</div>
              </div>
            </div>
            
            <div style={styles.infoItem}>
              <div style={styles.infoIcon}>📞</div>
              <div style={styles.infoContent}>
                <div style={styles.infoLabel}>Phone</div>
                <div style={styles.infoValue}>+91 98765 43210 / +91 98765 43211</div>
              </div>
            </div>
            
            <div style={styles.infoItem}>
              <div style={styles.infoIcon}>✉️</div>
              <div style={styles.infoContent}>
                <div style={styles.infoLabel}>Email</div>
                <div style={styles.infoValue}>info@srilakshmishop.com</div>
              </div>
            </div>
            
            <div style={styles.infoItem}>
              <div style={styles.infoIcon}>⏰</div>
              <div style={styles.infoContent}>
                <div style={styles.infoLabel}>Business Hours</div>
                <div style={styles.infoValue}>Mon-Sat: 9 AM - 9 PM<br />Sunday: 10 AM - 6 PM</div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div style={styles.formCard}>
            <h2 style={styles.title}>Send us a Message</h2>
            
            {submitted && (
              <div style={styles.successMessage}>
                ✅ Message sent successfully! We'll get back to you soon.
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Your Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Message *</label>
                <textarea
                  rows="5"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  style={styles.textarea}
                  required
                />
              </div>
              
              <button type="submit" style={styles.button} disabled={loading}>
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;