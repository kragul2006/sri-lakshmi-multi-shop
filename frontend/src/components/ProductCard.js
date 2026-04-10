import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiStar, FiShoppingCart, FiHeart } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import '../styles/ProductCard.css';

const ProductCard = ({ product, featured = false }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    toast.success(`${product.name} added to wishlist!`);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FiStar key={i} className="star filled" />);
    }
    if (hasHalfStar) {
      stars.push(<FiStar key="half" className="star half" />);
    }
    while (stars.length < 5) {
      stars.push(<FiStar key={stars.length} className="star" />);
    }
    return stars;
  };

  return (
    <motion.div 
      className="product-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <Link to={`/product/${product._id}`} className="product-card-link">
        <div className="product-image-wrapper">
          <img src={product.image} alt={product.name} className="product-image" />
          {product.discount > 0 && (
            <span className="discount-badge">-{product.discount}%</span>
          )}
          {featured && (
            <span className="featured-badge">Featured</span>
          )}
          {product.stock < 10 && product.stock > 0 && (
            <span className="stock-badge">Only {product.stock} left</span>
          )}
          {product.stock === 0 && (
            <span className="out-of-stock-badge">Out of Stock</span>
          )}
          <button className="wishlist-button" onClick={handleWishlist}>
            <FiHeart />
          </button>
        </div>
        
        <div className="product-info">
          <h3 className="product-title">{product.name}</h3>
          <div className="product-rating">
            {renderStars(product.rating || 0)}
            <span className="rating-count">({product.numReviews || 0})</span>
          </div>
          <div className="product-price-wrapper">
            {product.discount > 0 ? (
              <>
                <span className="original-price">₹{product.price}</span>
                <span className="discounted-price">₹{product.discountedPrice}</span>
                <span className="saved-price">Save ₹{product.price - product.discountedPrice}</span>
              </>
            ) : (
              <span className="discounted-price">₹{product.price}</span>
            )}
          </div>
          <p className="product-description">{product.description.substring(0, 80)}...</p>
        </div>
      </Link>
      
      <button 
        className="add-to-cart-button"
        onClick={handleAddToCart}
        disabled={product.stock === 0}
      >
        <FiShoppingCart />
        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
      </button>
    </motion.div>
  );
};

export default ProductCard;