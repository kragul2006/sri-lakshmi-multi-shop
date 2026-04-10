import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiChevronDown } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { getTotalItems } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = [
    { name: 'Household Items', slug: 'household', icon: '🏠', count: 120 },
    { name: 'Kitchen Essentials', slug: 'kitchen', icon: '🍳', count: 85 },
    { name: 'Cleaning Products', slug: 'cleaning', icon: '🧹', count: 45 },
    { name: 'Storage Solutions', slug: 'storage', icon: '📦', count: 60 },
    { name: 'Home Decor', slug: 'decor', icon: '🎨', count: 95 },
    { name: 'Electrical Items', slug: 'electrical', icon: '💡', count: 40 },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={() => setIsOpen(false)}>
          <h1>Sri Lakshmi <span>Multi Shop</span></h1>
          <p>Your One-Stop Household Solution</p>
        </Link>

        <div className="nav-links desktop">
          <Link to="/" className="nav-link">Home</Link>
          
          <div 
            className="dropdown"
            onMouseEnter={() => setShowCategories(true)}
            onMouseLeave={() => setShowCategories(false)}
          >
            <button className="nav-link dropdown-btn">
              Products <FiChevronDown className="dropdown-icon" />
            </button>
            <AnimatePresence>
              {showCategories && (
                <motion.div 
                  className="dropdown-menu"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {categories.map((category, index) => (
                    <Link 
                      key={index}
                      to={`/products?category=${category.slug}`}
                      className="dropdown-item"
                      onClick={() => setShowCategories(false)}
                    >
                      <span className="category-icon">{category.icon}</span>
                      <div className="category-info">
                        <span className="category-name">{category.name}</span>
                        <span className="category-count">{category.count} items</span>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <Link to="/about" className="nav-link">About Us</Link>
          <Link to="/contact" className="nav-link">Contact Us</Link>
        </div>

        <div className="nav-actions">
          <div className="cart-icon" onClick={() => navigate('/cart')}>
            <FiShoppingCart size={24} />
            {getTotalItems() > 0 && (
              <span className="cart-count">{getTotalItems()}</span>
            )}
          </div>
          
          <div className="user-menu">
            {user ? (
              <div className="user-profile">
                <FiUser size={24} />
                <div className="user-dropdown">
                  <div className="user-info">
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>
                  <Link to="/orders" className="dropdown-link">My Orders</Link>
                  <Link to="/profile" className="dropdown-link">Profile Settings</Link>
                  <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="login-btn">Login</Link>
            )}
          </div>

          <div className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link to="/" onClick={() => setIsOpen(false)}>Home</Link>
            <div className="mobile-categories">
              <p className="mobile-category-title">Products by Category</p>
              {categories.map((category, index) => (
                <Link 
                  key={index}
                  to={`/products?category=${category.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="mobile-category-item"
                >
                  <span>{category.icon}</span> {category.name}
                </Link>
              ))}
            </div>
            <Link to="/about" onClick={() => setIsOpen(false)}>About Us</Link>
            <Link to="/contact" onClick={() => setIsOpen(false)}>Contact Us</Link>
            {!user && (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)}>Login</Link>
                <Link to="/register" onClick={() => setIsOpen(false)}>Register</Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;