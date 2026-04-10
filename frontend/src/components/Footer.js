import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiPhone, FiMail, FiClock, FiFacebook, FiInstagram, FiTwitter, FiYoutube } from 'react-icons/fi';
import '../styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-section">
              <h3>Sri Lakshmi Multi Shop</h3>
              <p className="footer-description">
                Your trusted partner for quality household products since 2010. 
                We bring convenience and quality to your doorstep with our wide 
                range of products and exceptional customer service.
              </p>
              <div className="social-links">
                <a href="#" aria-label="Facebook"><FiFacebook /></a>
                <a href="#" aria-label="Instagram"><FiInstagram /></a>
                <a href="#" aria-label="Twitter"><FiTwitter /></a>
                <a href="#" aria-label="YouTube"><FiYoutube /></a>
              </div>
            </div>

            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/products">All Products</Link></li>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>
                <li><Link to="/offers">Special Offers</Link></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Popular Categories</h4>
              <ul>
                <li><Link to="/products?category=household">Household Items</Link></li>
                <li><Link to="/products?category=kitchen">Kitchen Essentials</Link></li>
                <li><Link to="/products?category=cleaning">Cleaning Products</Link></li>
                <li><Link to="/products?category=storage">Storage Solutions</Link></li>
                <li><Link to="/products?category=decor">Home Decor</Link></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Contact Info</h4>
              <div className="contact-info">
                <p><FiMapPin /> 123 Main Street, Rajaji Nagar,<br />Bangalore - 560010, Karnataka</p>
                <p><FiPhone /> <a href="tel:+919876543210">+91 98765 43210</a><br />
                   <a href="tel:+919876543211">+91 98765 43211</a></p>
                <p><FiMail /> <a href="mailto:info@srilakshmishop.com">info@srilakshmishop.com</a><br />
                   <a href="mailto:support@srilakshmishop.com">support@srilakshmishop.com</a></p>
              </div>
            </div>

            <div className="footer-section">
              <h4>Business Hours</h4>
              <div className="business-hours">
                <p><FiClock /> Monday - Friday: 9:00 AM - 9:00 PM</p>
                <p>Saturday: 9:00 AM - 8:00 PM</p>
                <p>Sunday: 10:00 AM - 6:00 PM</p>
                <p className="holiday-note">Open on all public holidays</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p>&copy; {currentYear} Sri Lakshmi Multi Shop. All rights reserved.</p>
            <div className="payment-methods">
              <span>Secure Payments:</span>
              <img src="https://via.placeholder.com/40x25?text=Visa" alt="Visa" />
              <img src="https://via.placeholder.com/40x25?text=MC" alt="Mastercard" />
              <img src="https://via.placeholder.com/40x25?text=UPI" alt="UPI" />
              <img src="https://via.placeholder.com/40x25?text=Paytm" alt="Paytm" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;