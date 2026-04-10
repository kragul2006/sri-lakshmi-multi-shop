import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 });
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const searchRef = useRef(null);
  const location = useLocation();
  const { addToCart } = useCart();

  const categoryMap = {
    'kitchen': 'Kitchen Essentials',
    'household': 'Household Items',
    'cleaning': 'Cleaning Products',
    'storage': 'Storage Solutions',
    'decor': 'Home Decor',
    'electrical': 'Electrical Items'
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    if (category && category !== selectedCategory) {
      setSelectedCategory(category);
    }
  }, [location.search]);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, selectedCategory, sortBy, priceRange, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadProducts = () => {
    const savedProducts = localStorage.getItem('admin_products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
      setLoading(false);
      return;
    }
    
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading products:', err);
        setLoading(false);
      });
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered = filtered.filter(product =>
      product.price >= priceRange.min && product.price <= priceRange.max
    );

    switch (sortBy) {
      case 'price_low_high':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high_low':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name_az':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_za':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'rating_high':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        filtered.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return a.name.localeCompare(b.name);
        });
        break;
    }

    setFilteredProducts(filtered);
  };

  const updateSearchSuggestions = (term) => {
    if (term.length < 2) {
      setSearchSuggestions([]);
      return;
    }
    
    const suggestions = products.filter(product =>
      product.name.toLowerCase().includes(term.toLowerCase())
    ).slice(0, 5);
    
    setSearchSuggestions(suggestions);
    setShowSuggestions(true);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    updateSearchSuggestions(value);
  };

  const selectSuggestion = (productName) => {
    setSearchTerm(productName);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchSuggestions([]);
    setShowSuggestions(false);
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    alert(`${product.name} added to cart!`);
  };

  const getDiscountedPrice = (product) => {
    if (product.discount > 0) {
      return product.price - (product.price * product.discount / 100);
    }
    return product.price;
  };

  const sortOptions = [
    { value: 'default', label: '📌 Default (Featured)' },
    { value: 'price_low_high', label: '💰 Price: Low to High' },
    { value: 'price_high_low', label: '💰 Price: High to Low' },
    { value: 'name_az', label: '📝 Name: A to Z' },
    { value: 'name_za', label: '📝 Name: Z to A' },
    { value: 'rating_high', label: '⭐ Rating: High to Low' },
    { value: 'discount_high', label: '🏷️ Discount: High to Low' }
  ];

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={styles.banner}>
        <h1 style={styles.bannerTitle}>
          {selectedCategory === 'all' ? 'All Products' : categoryMap[selectedCategory]}
        </h1>
        <p style={styles.bannerSubtitle}>{filteredProducts.length} products found</p>
      </div>

      <div style={styles.container}>
        {/* Search Bar */}
        <div style={styles.searchSection} ref={searchRef}>
          <div style={styles.searchWrapper}>
            <div style={styles.searchBox}>
              <span style={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
                style={styles.searchInput}
              />
              {searchTerm && (
                <span style={styles.clearIcon} onClick={clearSearch}>✕</span>
              )}
            </div>
            
            {showSuggestions && searchSuggestions.length > 0 && (
              <div style={styles.suggestionsDropdown}>
                {searchSuggestions.map(product => (
                  <div 
                    key={product._id}
                    style={styles.suggestionItem}
                    onClick={() => selectSuggestion(product.name)}
                  >
                    <img src={product.image} alt={product.name} style={styles.suggestionImage} />
                    <div style={styles.suggestionInfo}>
                      <div style={styles.suggestionName}>{product.name}</div>
                      <div style={styles.suggestionPrice}>₹{product.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div style={styles.toolbar}>
          <div style={styles.sortBox}>
            <label style={styles.sortLabel}>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={styles.sortSelect}>
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <button style={styles.filterToggle} onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? '▲ Hide Filters' : '▼ Show Filters'}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div style={styles.filtersPanel}>
            <div style={styles.filterGroup}>
              <h4 style={styles.filterTitle}>💰 Price Range</h4>
              <div style={styles.priceRange}>
                <span>₹0</span>
                <input type="range" min="0" max="5000" value={priceRange.max} onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })} style={styles.rangeSlider} />
                <span>₹{priceRange.max}</span>
              </div>
            </div>
            <div style={styles.filterGroup}>
              <h4 style={styles.filterTitle}>📂 Category</h4>
              <div style={styles.categoryFilters}>
                <button onClick={() => setSelectedCategory('all')} style={{ ...styles.categoryFilterBtn, ...(selectedCategory === 'all' ? styles.categoryFilterActive : {}) }}>All</button>
                <button onClick={() => setSelectedCategory('kitchen')} style={{ ...styles.categoryFilterBtn, ...(selectedCategory === 'kitchen' ? styles.categoryFilterActive : {}) }}>🍳 Kitchen</button>
                <button onClick={() => setSelectedCategory('household')} style={{ ...styles.categoryFilterBtn, ...(selectedCategory === 'household' ? styles.categoryFilterActive : {}) }}>🏠 Household</button>
                <button onClick={() => setSelectedCategory('cleaning')} style={{ ...styles.categoryFilterBtn, ...(selectedCategory === 'cleaning' ? styles.categoryFilterActive : {}) }}>🧹 Cleaning</button>
                <button onClick={() => setSelectedCategory('storage')} style={{ ...styles.categoryFilterBtn, ...(selectedCategory === 'storage' ? styles.categoryFilterActive : {}) }}>📦 Storage</button>
                <button onClick={() => setSelectedCategory('decor')} style={{ ...styles.categoryFilterBtn, ...(selectedCategory === 'decor' ? styles.categoryFilterActive : {}) }}>🎨 Decor</button>
                <button onClick={() => setSelectedCategory('electrical')} style={{ ...styles.categoryFilterBtn, ...(selectedCategory === 'electrical' ? styles.categoryFilterActive : {}) }}>💡 Electrical</button>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div style={styles.noProducts}>
            <div style={styles.noProductsIcon}>🔍</div>
            <h3>No products found</h3>
            <button onClick={() => { setSelectedCategory('all'); setSearchTerm(''); setPriceRange({ min: 0, max: 5000 }); setSortBy('default'); clearSearch(); }} style={styles.resetBtn}>Reset All Filters</button>
          </div>
        ) : (
          <div style={styles.productsGrid}>
            {filteredProducts.map(product => (
              <div key={product._id} style={styles.productCard}>
                <Link to={`/product/${product._id}`} style={{ textDecoration: 'none' }}>
                  <div style={styles.productImageContainer}>
                    <img src={product.image} alt={product.name} style={styles.productImage} />
                    {product.discount > 0 && <span style={styles.discountBadge}>-{product.discount}%</span>}
                    {product.featured && <span style={styles.featuredBadge}>⭐ Featured</span>}
                  </div>
                  <div style={styles.productInfo}>
                    <h3 style={styles.productName}>{product.name}</h3>
                    <div style={styles.rating}>⭐ {product.rating || 4.5} <span style={styles.ratingCount}>({product.numReviews || 0})</span></div>
                    <div style={styles.priceRow}>
                      {product.discount > 0 ? (
                        <>
                          <span style={styles.originalPrice}>₹{product.price}</span>
                          <span style={styles.discountedPrice}>₹{getDiscountedPrice(product)}</span>
                        </>
                      ) : (
                        <span style={styles.discountedPrice}>₹{product.price}</span>
                      )}
                    </div>
                  </div>
                </Link>
                <button onClick={() => handleAddToCart(product)} style={styles.addButton}>🛒 Add to Cart</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  loading: { textAlign: 'center', padding: '50px' },
  spinner: { width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid #e67e22', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' },
  banner: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' },
  bannerTitle: { fontSize: '48px', marginBottom: '10px' },
  bannerSubtitle: { fontSize: '18px', opacity: 0.9 },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' },
  searchSection: { marginBottom: '25px', position: 'relative' },
  searchWrapper: { position: 'relative' },
  searchBox: { display: 'flex', alignItems: 'center', backgroundColor: 'white', borderRadius: '50px', padding: '12px 20px', border: '2px solid #e0e0e0' },
  searchIcon: { fontSize: '20px', marginRight: '12px', color: '#999' },
  searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: '16px', padding: '8px 0' },
  clearIcon: { cursor: 'pointer', color: '#999', fontSize: '18px', padding: '5px' },
  suggestionsDropdown: { position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', zIndex: 100, marginTop: '5px', maxHeight: '400px', overflowY: 'auto' },
  suggestionItem: { display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 15px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' },
  suggestionImage: { width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' },
  suggestionInfo: { flex: 1 },
  suggestionName: { fontWeight: '500', marginBottom: '5px', color: '#2c3e50' },
  suggestionPrice: { color: '#e67e22', fontWeight: 'bold', fontSize: '14px' },
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' },
  sortBox: { display: 'flex', alignItems: 'center', gap: '10px' },
  sortLabel: { fontSize: '14px', color: '#666' },
  sortSelect: { padding: '8px 12px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: 'white', cursor: 'pointer' },
  filterToggle: { padding: '8px 16px', backgroundColor: '#e67e22', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  filtersPanel: { backgroundColor: '#f8f9fa', borderRadius: '15px', padding: '20px', marginBottom: '30px' },
  filterGroup: { marginBottom: '20px' },
  filterTitle: { fontSize: '16px', fontWeight: '600', marginBottom: '15px', color: '#2c3e50' },
  priceRange: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' },
  rangeSlider: { flex: 1, height: '5px', borderRadius: '5px', background: '#e67e22', outline: 'none' },
  categoryFilters: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
  categoryFilterBtn: { padding: '8px 16px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '25px', cursor: 'pointer' },
  categoryFilterActive: { backgroundColor: '#e67e22', color: 'white', borderColor: '#e67e22' },
  productsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' },
  productCard: { backgroundColor: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', transition: 'transform 0.3s ease' },
  productImageContainer: { position: 'relative', height: '250px', overflow: 'hidden' },
  productImage: { width: '100%', height: '100%', objectFit: 'cover' },
  discountBadge: { position: 'absolute', top: '10px', left: '10px', backgroundColor: '#e74c3c', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  featuredBadge: { position: 'absolute', top: '10px', right: '10px', backgroundColor: '#f39c12', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  productInfo: { padding: '20px' },
  productName: { fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#2c3e50' },
  rating: { display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px', fontSize: '14px', color: '#f39c12' },
  ratingCount: { color: '#999', fontSize: '12px' },
  priceRow: { marginBottom: '10px' },
  originalPrice: { textDecoration: 'line-through', color: '#999', fontSize: '14px', marginRight: '10px' },
  discountedPrice: { fontSize: '22px', fontWeight: 'bold', color: '#e67e22' },
  addButton: { width: '100%', padding: '12px', backgroundColor: '#e67e22', color: 'white', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: '600' },
  noProducts: { textAlign: 'center', padding: '60px', backgroundColor: '#f8f9fa', borderRadius: '15px' },
  noProductsIcon: { fontSize: '60px', marginBottom: '20px' },
  resetBtn: { marginTop: '20px', padding: '12px 30px', backgroundColor: '#e67e22', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } .product-card:hover { transform: translateY(-5px); } .product-card:hover .product-image { transform: scale(1.05); }`;
document.head.appendChild(styleSheet);

export default ProductsPage;