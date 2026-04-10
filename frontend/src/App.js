import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import OfflineDetector from './components/OfflineDetector';
import Breadcrumb from './components/Breadcrumb';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PaymentPage from './pages/PaymentPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';

// Navigation Component
function Navigation() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState(null);
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Get cart count from localStorage
  const [cartCount, setCartCount] = useState(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
  });

  // Get notifications for user
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  
  // Get admin notifications for new orders
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [adminNotificationCount, setAdminNotificationCount] = useState(0);

  // Check if user is admin
  const isAdmin = user && (user.email === 'admin@example.com' || user.isAdmin === true);

  const categories = [
    { name: 'All Products', slug: 'all', icon: '📦' },
    { name: 'Kitchen Essentials', slug: 'kitchen', icon: '🍳' },
    { name: 'Household Items', slug: 'household', icon: '🏠' },
    { name: 'Cleaning Products', slug: 'cleaning', icon: '🧹' },
    { name: 'Storage Solutions', slug: 'storage', icon: '📦' },
    { name: 'Home Decor', slug: 'decor', icon: '🎨' },
    { name: 'Electrical Items', slug: 'electrical', icon: '💡' }
  ];

  // Load user notifications
  useEffect(() => {
    const loadNotifications = () => {
      if (user) {
        const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        const userNotifications = allNotifications.filter(n => n.userEmail === user.email);
        setNotifications(userNotifications);
        setNotificationCount(userNotifications.filter(n => !n.read).length);
      }
    };
    
    loadNotifications();
    window.addEventListener('notificationsUpdated', loadNotifications);
    window.addEventListener('storage', loadNotifications);
    
    return () => {
      window.removeEventListener('notificationsUpdated', loadNotifications);
      window.removeEventListener('storage', loadNotifications);
    };
  }, [user]);

  // Load admin notifications
  useEffect(() => {
    const loadAdminNotifications = () => {
      if (isAdmin) {
        const allAdminNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
        setAdminNotifications(allAdminNotifications);
        setAdminNotificationCount(allAdminNotifications.filter(n => !n.read).length);
      }
    };
    
    loadAdminNotifications();
    window.addEventListener('adminNotificationsUpdated', loadAdminNotifications);
    window.addEventListener('storage', loadAdminNotifications);
    
    return () => {
      window.removeEventListener('adminNotificationsUpdated', loadAdminNotifications);
      window.removeEventListener('storage', loadAdminNotifications);
    };
  }, [isAdmin]);

  // Update cart count
  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const count = cart.reduce((total, item) => total + (item.quantity || 1), 0);
      setCartCount(count);
    };
    
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cartUpdated', updateCartCount);
    
    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  const handleCategoryClick = (categorySlug) => {
    setShowDropdown(false);
    if (categorySlug === 'all') {
      navigate('/products');
    } else {
      navigate(`/products?category=${categorySlug}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdmin');
    setUser(null);
    navigate('/');
    window.location.reload();
  };

  const markNotificationAsRead = (notificationId, orderData) => {
    const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updatedNotifications = allNotifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    
    const userNotifications = updatedNotifications.filter(n => n.userEmail === user?.email);
    setNotifications(userNotifications);
    setNotificationCount(userNotifications.filter(n => !n.read).length);
    
    window.dispatchEvent(new Event('notificationsUpdated'));
    
    if (orderData) {
      setSelectedOrderForModal(orderData);
    }
  };

  const markAdminNotificationAsRead = (notificationId, orderData) => {
    const allAdminNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    const updatedNotifications = allAdminNotifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    localStorage.setItem('adminNotifications', JSON.stringify(updatedNotifications));
    setAdminNotifications(updatedNotifications);
    setAdminNotificationCount(updatedNotifications.filter(n => !n.read).length);
    window.dispatchEvent(new Event('adminNotificationsUpdated'));
    
    if (orderData) {
      setSelectedOrderForModal(orderData);
    }
  };

  const clearAllNotifications = () => {
    const allNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const remainingNotifications = allNotifications.filter(n => n.userEmail !== user?.email);
    localStorage.setItem('notifications', JSON.stringify(remainingNotifications));
    setNotifications([]);
    setNotificationCount(0);
    window.dispatchEvent(new Event('notificationsUpdated'));
  };

  const clearAllAdminNotifications = () => {
    localStorage.setItem('adminNotifications', JSON.stringify([]));
    setAdminNotifications([]);
    setAdminNotificationCount(0);
    window.dispatchEvent(new Event('adminNotificationsUpdated'));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'ready': return '🎉';
      case 'picked': return '✅';
      case 'new_order': return '🛍️';
      case 'cancellation': return '❌';
      case 'contact_message': return '📧';
      default: return '🔔';
    }
  };

  const getOrderDetails = (orderId) => {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    return orders.find(o => o.id === orderId || o.orderId === orderId);
  };

  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    .nav-button {
      position: relative;
      padding: 10px 20px;
      font-size: 16px;
      font-weight: 600;
      color: #2c3e50;
      background: transparent;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
    }
      .nav-button::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 3px;
  background: linear-gradient(90deg, #e67e22, #f39c12);
  transition: all 0.3s ease;
  transform: translateX(-50%);
  border-radius: 3px;
}

.nav-button:hover::after {
  width: 70%;
}

.nav-button:hover {
  color: #e67e22;
  transform: translateY(-2px);
}
    .nav-button:hover {
      color: #e67e22;
      transform: translateY(-2px);
    }
    .admin-btn {
      background: linear-gradient(135deg, #e74c3c, #c0392b);
      color: white !important;
      border-radius: 25px;
      padding: 8px 20px !important;
    }
    .admin-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(231,76,60,0.3);
    }
    .profile-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #e67e22, #f39c12);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: white;
      font-weight: bold;
    }
    .logout-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      padding: 10px 20px;
    }
    .logout-btn:hover {
      color: #e74c3c;
    }
    .cart-icon {
      position: relative;
      cursor: pointer;
      padding: 8px 12px;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 16px;
      font-weight: 600;
      color: #2c3e50;
    }
    .cart-icon:hover {
      color: #e67e22;
      transform: translateY(-2px);
    }
    .cart-badge {
      position: absolute;
      top: -5px;
      right: 0px;
      background: #e67e22;
      color: white;
      border-radius: 50%;
      padding: 2px 6px;
      font-size: 10px;
      font-weight: bold;
      min-width: 18px;
      text-align: center;
    }
    .notification-icon {
      position: relative;
      cursor: pointer;
      padding: 8px 12px;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 16px;
      font-weight: 600;
      color: #2c3e50;
    }
    .notification-icon:hover {
      color: #e67e22;
      transform: translateY(-2px);
    }
    .notification-badge {
      position: absolute;
      top: -5px;
      right: 0px;
      background: #e74c3c;
      color: white;
      border-radius: 50%;
      padding: 2px 6px;
      font-size: 10px;
      font-weight: bold;
      min-width: 18px;
      text-align: center;
    }
    .notification-dropdown {
      position: absolute;
      top: 50px;
      right: 0;
      width: 380px;
      max-height: 450px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 5px 25px rgba(0,0,0,0.15);
      z-index: 1000;
      overflow: hidden;
      animation: slideDown 0.3s ease;
    }
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      background: #f8f9fa;
      border-bottom: 1px solid #eee;
    }
    .notification-item {
      padding: 15px;
      border-bottom: 1px solid #eee;
      cursor: pointer;
      transition: background 0.3s;
    }
    .notification-item:hover {
      background: #f8f9fa;
    }
    .notification-unread {
      background: #fff8f0;
    }
    .notification-title {
      font-weight: 600;
      margin-bottom: 5px;
      color: #2c3e50;
    }
    .notification-message {
      font-size: 13px;
      color: #666;
      margin-bottom: 5px;
    }
    .notification-time {
      font-size: 11px;
      color: #999;
    }
    .empty-notifications {
      padding: 40px;
      text-align: center;
      color: #999;
    }
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
    }
    .modal-content {
      background: white;
      border-radius: 20px;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      animation: modalSlideIn 0.3s ease;
    }
    @keyframes modalSlideIn {
      from {
        opacity: 0;
        transform: translateY(-50px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(styleSheet);

  const userInitial = user ? user.name.charAt(0).toUpperCase() : '👤';

  // Order Details Modal Component
  const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;
    
    const statusBadge = () => {
      if (order.status === 'Cancelled') {
        return { text: '❌ Cancelled', color: '#e74c3c', bg: '#f8d7da' };
      }
      const status = order.pickupStatus || order.status;
      switch (status) {
        case 'Picked Up':
        case 'Completed':
          return { text: '✅ Picked Up', color: '#27ae60', bg: '#d4edda' };
        case 'Ready':
        case 'Ready for Pickup':
          return { text: '🎉 Ready for Pickup', color: '#3498db', bg: '#d1ecf1' };
        default:
          return { text: '⏳ Confirmed', color: '#f39c12', bg: '#fff3cd' };
      }
    };
    
    const badge = statusBadge();
    
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div style={{ padding: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#2c3e50' }}>📦 Order Details</h2>
              <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>
            
            <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '12px' }}>
              <p><strong>Order ID:</strong> {order.id || order.orderId}</p>
              <p><strong>Order Date:</strong> {order.date}</p>
              <p><strong>Status:</strong> <span style={{ background: badge.bg, color: badge.color, padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>{badge.text}</span></p>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>👤 Customer Details</h3>
              <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '12px' }}>
                <p><strong>Name:</strong> {order.customerName}</p>
                <p><strong>Email:</strong> {order.customerEmail}</p>
                <p><strong>Phone:</strong> {order.customerPhone}</p>
              </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>📅 Pickup Details</h3>
              <div style={{ padding: '15px', background: '#e8f4fd', borderRadius: '12px' }}>
                <p><strong>Pickup Date & Time:</strong> {order.pickupDateTime || 'Not scheduled'}</p>
                <p><strong>Pickup Location:</strong> Sri Lakshmi Multi Shop, No 102, Odiampet Road, Vilianur, Puducherry - 605110</p>
              </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>🛍️ Products</h3>
              <div style={{ border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#f8f9fa' }}>
                    <tr>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Product</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Qty</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Price</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px' }}>{item.name}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>{item.quantity}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>₹{item.price}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>₹{item.price * item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot style={{ background: '#f8f9fa' }}>
                    <tr>
                      <td colSpan="3" style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>Total Amount:</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#e67e22' }}>₹{order.totalAmount}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            
            <div style={{ padding: '15px', background: '#d4edda', borderRadius: '12px' }}>
              <strong>📍 Pickup Location:</strong><br />
              Sri Lakshmi Multi Shop<br />
              No 102, Odiampet Road, Vilianur, Puducherry - 605110
            </div>
            
            <button onClick={onClose} style={{
              width: '100%',
              marginTop: '20px',
              padding: '12px',
              background: '#e67e22',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <nav style={{
        backgroundColor: '#fff',
        boxShadow: '0 2px 15px rgba(0,0,0,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '15px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px',
        }}>
          <Link to="/" style={{
            fontSize: '22px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #e67e22, #f39c12)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textDecoration: 'none',
          }}>
            🛍️ Sri Lakshmi Multi Shop
          </Link>
          
          <div style={{
            display: 'flex',
            gap: '15px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}>
            <Link to="/"><button className="nav-button">🏠 Home</button></Link>
            
            <div 
              style={{ position: 'relative', display: 'inline-block' }}
              onMouseEnter={() => setShowDropdown(true)}
              onMouseLeave={() => setShowDropdown(false)}
            >
              <button className="nav-button">📦 Products ▼</button>
              {showDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '0',
                  backgroundColor: 'white',
                  minWidth: '220px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                  borderRadius: '12px',
                  zIndex: 1,
                }}>
                  {categories.map((category, index) => (
                    <button
                      key={index}
                      onClick={() => handleCategoryClick(category.slug)}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '12px 20px',
                        textAlign: 'left',
                        border: 'none',
                        background: 'white',
                        cursor: 'pointer',
                        borderBottom: index < categories.length - 1 ? '1px solid #f0f0f0' : 'none',
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                    >
                      {category.icon} {category.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <Link to="/about"><button className="nav-button">ℹ️ About Us</button></Link>
            <Link to="/contact"><button className="nav-button">📞 Contact Us</button></Link>

            {/* CART ICON - Hide for admin users */}
            {(!isAdmin) && (
              <div className="cart-icon" onClick={() => navigate('/cart')}>
                🛒 Cart
                {cartCount > 0 && (
                  <span className="cart-badge">{cartCount}</span>
                )}
              </div>
            )}

            {/* USER NOTIFICATION ICON */}
            {user && !isAdmin && (
              <div style={{ position: 'relative' }}>
                <div 
                  className="notification-icon" 
                  onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                >
                  🔔
                  {notificationCount > 0 && (
                    <span className="notification-badge">{notificationCount}</span>
                  )}
                </div>
                
                {showNotificationDropdown && (
                  <div className="notification-dropdown">
                    <div className="notification-header">
                      <strong>🔔 Notifications</strong>
                      {notifications.length > 0 && (
                        <button onClick={clearAllNotifications} style={{ background: 'none', border: 'none', color: '#e67e22', cursor: 'pointer', fontSize: '12px' }}>
                          Clear All
                        </button>
                      )}
                    </div>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div className="empty-notifications">
                          <div>🔔</div>
                          <p>No notifications yet</p>
                          <small>When your order is ready, you'll see it here</small>
                        </div>
                      ) : (
                        notifications.map(notification => {
                          const orderData = getOrderDetails(notification.orderId);
                          return (
                            <div 
                              key={notification.id}
                              className={`notification-item ${!notification.read ? 'notification-unread' : ''}`}
                              onClick={() => {
                                markNotificationAsRead(notification.id, orderData);
                                setShowNotificationDropdown(false);
                              }}
                            >
                              <div className="notification-title">
                                {getNotificationIcon(notification.type)} {notification.title}
                              </div>
                              <div className="notification-message">{notification.message}</div>
                              {notification.pickupDateTime && (
                                <div className="notification-message">
                                  📅 Pickup: {notification.pickupDateTime}
                                </div>
                              )}
                              <div className="notification-time">
                                {new Date(notification.createdAt).toLocaleString()}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ADMIN NOTIFICATION ICON */}
            {user && isAdmin && (
              <div style={{ position: 'relative' }}>
                <div 
                  className="notification-icon" 
                  onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                >
                  🔔
                  {adminNotificationCount > 0 && (
                    <span className="notification-badge">{adminNotificationCount}</span>
                  )}
                </div>
                
                {showNotificationDropdown && (
                  <div className="notification-dropdown">
                    <div className="notification-header">
                      <strong>🔔 Admin Notifications ({adminNotificationCount} new)</strong>
                      {adminNotifications.length > 0 && (
                        <button onClick={clearAllAdminNotifications} style={{ background: 'none', border: 'none', color: '#e67e22', cursor: 'pointer', fontSize: '12px' }}>
                          Clear All
                        </button>
                      )}
                    </div>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      {adminNotifications.length === 0 ? (
                        <div className="empty-notifications">
                          <div>🔔</div>
                          <p>No admin notifications</p>
                          <small>New orders will appear here</small>
                        </div>
                      ) : (
                        adminNotifications.map(notification => {
                          const orderData = getOrderDetails(notification.orderId);
                          return (
                            <div 
                              key={notification.id}
                              className={`notification-item ${!notification.read ? 'notification-unread' : ''}`}
                              onClick={() => {
                                markAdminNotificationAsRead(notification.id, orderData);
                                setShowNotificationDropdown(false);
                              }}
                            >
                              <div className="notification-title">
                                {getNotificationIcon(notification.type)} {notification.title}
                              </div>
                              <div className="notification-message">{notification.message}</div>
                              <div className="notification-message">
                                👤 Customer: {notification.customerName} | 💰 ₹{notification.totalAmount}
                              </div>
                              {notification.pickupDateTime && (
                                <div className="notification-message">
                                  📅 Pickup: {notification.pickupDateTime}
                                </div>
                              )}
                              <div className="notification-time">
                                {new Date(notification.createdAt).toLocaleString()}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ADMIN BUTTONS */}
            {user && isAdmin && (
              <>
                <Link to="/admin">
                  <button className="nav-button admin-btn">📊 Admin Dashboard</button>
                </Link>
                <Link to="/admin-products">
                  <button className="nav-button admin-btn">📦 Manage Products</button>
                </Link>
              </>
            )}

            {user ? (
              <>
                <div className="profile-icon" onClick={() => navigate('/profile')}>
                  {userInitial}
                </div>
                <button onClick={handleLogout} className="logout-btn">🚪 Logout</button>
              </>
            ) : (
              <Link to="/login"><button className="nav-button">🔑 Login / Register</button></Link>
            )}
          </div>
        </div>
      </nav>
      
      {/* Order Details Modal */}
      {selectedOrderForModal && (
        <OrderDetailsModal order={selectedOrderForModal} onClose={() => setSelectedOrderForModal(null)} />
      )}
    </>
  );
}

// Main App Component
function App() {
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }, []);

  return (
    <CartProvider>
      <Router>
        <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
          <Navigation />
          <OfflineDetector />
          <Breadcrumb />
          <ScrollToTop />
          
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin-products" element={<AdminProducts />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
          </Routes>
          
          <footer style={{ 
            backgroundColor: '#2c3e50', 
            color: 'white', 
            marginTop: '60px', 
            padding: '40px 20px', 
            textAlign: 'center' 
          }}>
            <p>&copy; 2017 - {new Date().getFullYear()} Sri Lakshmi Multi Shop. All rights reserved.</p>
            <p>📍 No 102, Odiampet Road, Vilianur, Puducherry - 605110</p>
            <p>📞 +91 98765 43210 | ✉️ info@srilakshmishop.com</p>
          </footer>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;