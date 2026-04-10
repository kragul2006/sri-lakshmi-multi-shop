import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [productVariants, setProductVariants] = useState([]);
  const [productColors, setProductColors] = useState([]);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    fetchProduct();
    loadReviews();
  }, [id]);

  useEffect(() => {
    if (productVariants.length > 0 && !selectedVariant) {
      setSelectedVariant(productVariants[0].name);
    }
    if (productColors.length > 0 && !selectedColor) {
      setSelectedColor(productColors[0].name);
      // Set image based on first color if available
      const firstColor = productColors[0];
      if (firstColor && firstColor.image) {
        setSelectedImage(firstColor.image);
      }
    }
  }, [productVariants, productColors]);

  // Update image when color changes
  useEffect(() => {
    if (selectedColor && productColors.length > 0) {
      const color = productColors.find(c => c.name === selectedColor);
      if (color && color.image) {
        setSelectedImage(color.image);
      } else if (product && product.image) {
        setSelectedImage(product.image);
      }
    }
  }, [selectedColor, productColors, product]);

  // Update image when variant changes (if variant has specific image)
  useEffect(() => {
    if (selectedVariant && productVariants.length > 0) {
      const variant = productVariants.find(v => v.name === selectedVariant);
      if (variant && variant.image) {
        setSelectedImage(variant.image);
      } else if (selectedColor) {
        const color = productColors.find(c => c.name === selectedColor);
        if (color && color.image) {
          setSelectedImage(color.image);
        }
      } else if (product && product.image) {
        setSelectedImage(product.image);
      }
    }
  }, [selectedVariant, productVariants, productColors, selectedColor, product]);

  const fetchProduct = async () => {
    try {
      const savedProducts = localStorage.getItem('admin_products');
      if (savedProducts) {
        const products = JSON.parse(savedProducts);
        const foundProduct = products.find(p => p._id === id);
        if (foundProduct) {
          setProduct(foundProduct);
          setSelectedImage(foundProduct.image);
          
          if (foundProduct.variants && foundProduct.variants.length > 0) {
            setProductVariants(foundProduct.variants);
          } else {
            setProductVariants([{ name: 'Standard', price: 0, stock: foundProduct.stock || 10 }]);
          }
          
          if (foundProduct.colors && foundProduct.colors.length > 0) {
            setProductColors(foundProduct.colors);
          }
          
          setLoading(false);
          return;
        }
      }
      
      const response = await fetch(`http://localhost:5000/api/products/${id}`);
      const data = await response.json();
      setProduct(data);
      setSelectedImage(data.image);
      setProductVariants([{ name: 'Standard', price: 0, stock: data.stock || 10 }]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      setLoading(false);
    }
  };

  const loadReviews = () => {
    const savedReviews = localStorage.getItem(`reviews_${id}`);
    if (savedReviews) {
      const parsedReviews = JSON.parse(savedReviews);
      setReviews(parsedReviews);
      calculateAverageRating(parsedReviews);
    } else {
      const sampleReviews = [
        {
          id: 1,
          userName: 'Ramesh Kumar',
          rating: 5,
          review: 'Excellent product! Very high quality. Highly recommended!',
          date: '2024-01-15',
          verified: true
        },
        {
          id: 2,
          userName: 'Priya Sharma',
          rating: 4,
          review: 'Good product, value for money.',
          date: '2024-01-10',
          verified: true
        }
      ];
      setReviews(sampleReviews);
      localStorage.setItem(`reviews_${id}`, JSON.stringify(sampleReviews));
      calculateAverageRating(sampleReviews);
    }
  };

  const calculateAverageRating = (reviewsList) => {
    if (reviewsList.length === 0) {
      setAverageRating(0);
      return;
    }
    const sum = reviewsList.reduce((acc, review) => acc + review.rating, 0);
    setAverageRating((sum / reviewsList.length).toFixed(1));
  };

  const handleSubmitRating = () => {
    if (userRating === 0) {
      alert('Please select a rating');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      alert('Please login to rate this product');
      navigate('/login');
      return;
    }

    const newReview = {
      id: Date.now(),
      userName: user.name,
      rating: userRating,
      review: userReview || 'No comment provided',
      date: new Date().toISOString().split('T')[0],
      verified: true
    };

    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem(`reviews_${id}`, JSON.stringify(updatedReviews));
    calculateAverageRating(updatedReviews);
    setUserRating(0);
    setUserReview('');
    setShowRatingForm(false);
    alert('Thank you for your rating and review!');
  };

  const incrementQuantity = () => {
    const currentVariant = productVariants.find(v => v.name === selectedVariant);
    const maxStock = currentVariant?.stock || product?.stock || 10;
    if (quantity < maxStock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const getSelectedVariantPrice = () => {
    const variant = productVariants.find(v => v.name === selectedVariant);
    const basePrice = product?.price || 0;
    const variantPrice = variant?.price || 0;
    return basePrice + variantPrice;
  };

  const getDiscountedPrice = () => {
    const price = getSelectedVariantPrice();
    if (product?.discount > 0) {
      return price - (price * product.discount / 100);
    }
    return price;
  };

  const handleAddToCart = () => {
    const finalProduct = {
      _id: product._id,
      name: `${product.name}${selectedVariant ? ` (${selectedVariant})` : ''}${selectedColor ? ` - ${selectedColor}` : ''}`,
      price: getDiscountedPrice(),
      image: selectedImage,
      originalPrice: getSelectedVariantPrice(),
      variant: selectedVariant,
      color: selectedColor,
      quantity: quantity
    };
    addToCart(finalProduct, quantity);
    alert(`${finalProduct.name} added to cart!`);
  };

  const handleBuyNow = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      alert('Please login to continue');
      navigate('/login');
      return;
    }
    
    const finalProduct = {
      _id: product._id,
      name: `${product.name}${selectedVariant ? ` (${selectedVariant})` : ''}${selectedColor ? ` - ${selectedColor}` : ''}`,
      price: getDiscountedPrice(),
      image: selectedImage,
      originalPrice: getSelectedVariantPrice(),
      variant: selectedVariant,
      color: selectedColor,
      quantity: quantity
    };
    
    navigate('/payment', { 
      state: { 
        product: finalProduct, 
        quantity: quantity, 
        totalAmount: getDiscountedPrice() * quantity 
      } 
    });
  };

  const renderStars = (rating, interactive = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          onClick={() => interactive && setUserRating(i)}
          style={{
            cursor: interactive ? 'pointer' : 'default',
            fontSize: interactive ? '30px' : '18px',
            color: i <= rating ? '#ffc107' : '#ddd',
            marginRight: '5px',
            transition: 'all 0.3s ease',
          }}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return <div style={styles.notFound}>Product not found</div>;
  }

  const currentVariant = productVariants.find(v => v.name === selectedVariant);
  const availableStock = currentVariant?.stock || product?.stock || 0;

  return (
    <div style={styles.container}>
      <div style={styles.productDetail}>
        {/* Product Images Section */}
        <div style={styles.imageSection}>
          <img src={selectedImage} alt={product.name} style={styles.mainImage} />
          {(productColors.length > 0 || productVariants.length > 0) && (
            <div style={styles.thumbnailSection}>
              {/* Main product thumbnail */}
              <img 
                src={product.image} 
                alt={product.name} 
                style={{...styles.thumbnail, border: selectedImage === product.image ? '2px solid #e67e22' : '1px solid #ddd'}}
                onClick={() => setSelectedImage(product.image)}
              />
              {/* Color variant thumbnails */}
              {productColors.map((color, idx) => color.image && (
                <img 
                  key={idx}
                  src={color.image} 
                  alt={color.name} 
                  style={{...styles.thumbnail, border: selectedImage === color.image ? '2px solid #e67e22' : '1px solid #ddd'}}
                  onClick={() => setSelectedImage(color.image)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Info Section */}
        <div style={styles.infoSection}>
          <h1 style={styles.productName}>{product.name}</h1>
          
          <div style={styles.ratingSection}>
            <div style={styles.stars}>{renderStars(averageRating)}</div>
            <span style={styles.ratingValue}>({averageRating} out of 5)</span>
            <span style={styles.reviewCount}>{reviews.length} reviews</span>
          </div>

          <div style={styles.priceSection}>
            {product.discount > 0 ? (
              <>
                <span style={styles.originalPrice}>₹{getSelectedVariantPrice()}</span>
                <span style={styles.discountedPrice}>₹{getDiscountedPrice()}</span>
                <span style={styles.discountBadge}>Save ₹{getSelectedVariantPrice() - getDiscountedPrice()}</span>
              </>
            ) : (
              <span style={styles.discountedPrice}>₹{getSelectedVariantPrice()}</span>
            )}
          </div>

          <p style={styles.productDescription}>{product.description}</p>

          {/* Variants Selection */}
          {productVariants.length > 0 && (
            <div style={styles.variantSection}>
              <h3 style={styles.sectionTitle}>Select Variant</h3>
              <div style={styles.variantOptions}>
                {productVariants.map((variant) => (
                  <button
                    key={variant.name}
                    onClick={() => setSelectedVariant(variant.name)}
                    style={{
                      ...styles.variantBtn,
                      ...(selectedVariant === variant.name ? styles.variantBtnActive : {})
                    }}
                  >
                    {variant.name}
                    {variant.price > 0 && <span style={styles.variantPrice}> +₹{variant.price}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors Selection */}
          {productColors.length > 0 && (
            <div style={styles.colorSection}>
              <h3 style={styles.sectionTitle}>Select Color</h3>
              <div style={styles.colorOptions}>
                {productColors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => {
                      setSelectedColor(color.name);
                      if (color.image) {
                        setSelectedImage(color.image);
                      }
                    }}
                    style={{
                      ...styles.colorBtn,
                      backgroundColor: color.code,
                      ...(selectedColor === color.name ? styles.colorBtnActive : {})
                    }}
                    title={color.name}
                  >
                    {color.code === '#ffffff' && <span style={{ color: '#000' }}>{color.name}</span>}
                    {color.code !== '#ffffff' && <span style={{ opacity: 0 }}>{color.name}</span>}
                  </button>
                ))}
              </div>
              <p style={styles.selectedColorText}>Selected: {selectedColor}</p>
            </div>
          )}

          {/* Stock Status */}
          <div style={styles.stockSection}>
            {availableStock > 0 ? (
              <span style={styles.inStock}>✓ In Stock ({availableStock} items available)</span>
            ) : (
              <span style={styles.outOfStock}>✗ Out of Stock</span>
            )}
          </div>

          {/* Quantity Selector */}
          <div style={styles.quantitySection}>
            <h3 style={styles.sectionTitle}>Quantity</h3>
            <div style={styles.quantityControls}>
              <button onClick={decrementQuantity} style={styles.quantityBtn}>-</button>
              <span style={styles.quantityValue}>{quantity}</span>
              <button onClick={incrementQuantity} style={styles.quantityBtn}>+</button>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={styles.buttonContainer}>
            <button onClick={handleAddToCart} style={styles.addToCartBtn} disabled={availableStock === 0}>
              🛒 Add to Cart
            </button>
            <button onClick={handleBuyNow} style={styles.buyNowBtn} disabled={availableStock === 0}>
              💰 Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div style={styles.reviewsSection}>
        <h2 style={styles.reviewsTitle}>Customer Reviews</h2>
        
        {!showRatingForm ? (
          <button onClick={() => setShowRatingForm(true)} style={styles.writeReviewBtn}>
            ✍️ Write a Review
          </button>
        ) : (
          <div style={styles.ratingForm}>
            <h3>Rate this product</h3>
            <div style={styles.ratingStars}>
              {renderStars(userRating, true)}
            </div>
            <textarea
              rows="4"
              placeholder="Share your experience with this product..."
              value={userReview}
              onChange={(e) => setUserReview(e.target.value)}
              style={styles.reviewTextarea}
            />
            <div style={styles.formButtons}>
              <button onClick={handleSubmitRating} style={styles.submitBtn}>Submit Review</button>
              <button onClick={() => setShowRatingForm(false)} style={styles.cancelBtn}>Cancel</button>
            </div>
          </div>
        )}

        <div style={styles.reviewsList}>
          {reviews.length === 0 ? (
            <p style={styles.noReviews}>No reviews yet. Be the first to review this product!</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} style={styles.reviewCard}>
                <div style={styles.reviewHeader}>
                  <div>
                    <strong style={styles.reviewerName}>{review.userName}</strong>
                    {review.verified && <span style={styles.verifiedBadge}>✓ Verified Purchase</span>}
                  </div>
                  <div style={styles.reviewStars}>{renderStars(review.rating)}</div>
                  <span style={styles.reviewDate}>{review.date}</span>
                </div>
                <p style={styles.reviewText}>{review.review}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  loading: {
    textAlign: 'center',
    padding: '50px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #e67e22',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px',
  },
  notFound: {
    textAlign: 'center',
    padding: '50px',
    fontSize: '20px',
    color: '#e74c3c',
  },
  productDetail: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '50px',
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
    marginBottom: '40px',
  },
  imageSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  mainImage: {
    width: '100%',
    borderRadius: '15px',
    objectFit: 'cover',
  },
  thumbnailSection: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  thumbnail: {
    width: '70px',
    height: '70px',
    objectFit: 'cover',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  productName: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '10px',
  },
  ratingSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    flexWrap: 'wrap',
  },
  stars: {
    fontSize: '18px',
    color: '#ffc107',
  },
  ratingValue: {
    fontSize: '14px',
    color: '#2c3e50',
    fontWeight: '500',
  },
  reviewCount: {
    fontSize: '14px',
    color: '#7f8c8d',
  },
  priceSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    flexWrap: 'wrap',
    marginTop: '10px',
  },
  originalPrice: {
    fontSize: '18px',
    color: '#7f8c8d',
    textDecoration: 'line-through',
  },
  discountedPrice: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#e67e22',
  },
  discountBadge: {
    backgroundColor: '#e74c3c',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  productDescription: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#666',
    marginTop: '10px',
  },
  variantSection: {
    marginTop: '15px',
  },
  colorSection: {
    marginTop: '15px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '10px',
    color: '#2c3e50',
  },
  variantOptions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  variantBtn: {
    padding: '10px 20px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
  },
  variantBtnActive: {
    borderColor: '#e67e22',
    backgroundColor: '#fff8f0',
    color: '#e67e22',
  },
  variantPrice: {
    fontSize: '12px',
    color: '#27ae60',
  },
  colorOptions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  colorBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '2px solid #ddd',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorBtnActive: {
    borderColor: '#2c3e50',
    boxShadow: '0 0 0 2px #e67e22',
    transform: 'scale(1.1)',
  },
  selectedColorText: {
    fontSize: '13px',
    color: '#7f8c8d',
    marginTop: '8px',
  },
  stockSection: {
    marginTop: '10px',
  },
  inStock: {
    color: '#27ae60',
    fontWeight: '500',
  },
  outOfStock: {
    color: '#e74c3c',
    fontWeight: '500',
  },
  quantitySection: {
    marginTop: '15px',
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  quantityBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    backgroundColor: '#f8f9fa',
    cursor: 'pointer',
    fontSize: '20px',
    transition: 'all 0.3s ease',
  },
  quantityValue: {
    fontSize: '18px',
    fontWeight: '600',
    minWidth: '40px',
    textAlign: 'center',
  },
  buttonContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    marginTop: '20px',
  },
  addToCartBtn: {
    padding: '14px',
    backgroundColor: '#e67e22',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  buyNowBtn: {
    padding: '14px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  reviewsSection: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
  },
  reviewsTitle: {
    fontSize: '24px',
    marginBottom: '20px',
    color: '#2c3e50',
  },
  writeReviewBtn: {
    padding: '10px 20px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '20px',
  },
  ratingForm: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '15px',
    marginBottom: '30px',
  },
  ratingStars: {
    fontSize: '30px',
    marginBottom: '15px',
  },
  reviewTextarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    marginBottom: '15px',
    resize: 'vertical',
  },
  formButtons: {
    display: 'flex',
    gap: '10px',
  },
  submitBtn: {
    padding: '10px 20px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  cancelBtn: {
    padding: '10px 20px',
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  reviewsList: {
    marginTop: '20px',
  },
  reviewCard: {
    borderBottom: '1px solid #eee',
    padding: '20px 0',
  },
  reviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: '10px',
    gap: '10px',
  },
  reviewerName: {
    fontSize: '16px',
    color: '#2c3e50',
  },
  verifiedBadge: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    marginLeft: '10px',
  },
  reviewStars: {
    color: '#ffc107',
    fontSize: '14px',
  },
  reviewDate: {
    fontSize: '12px',
    color: '#999',
  },
  reviewText: {
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#666',
    marginTop: '10px',
  },
  noReviews: {
    textAlign: 'center',
    padding: '40px',
    color: '#999',
  },
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  button:hover:not(:disabled) {
    transform: translateY(-2px);
  }
  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
document.head.appendChild(styleSheet);

export default ProductDetailPage;