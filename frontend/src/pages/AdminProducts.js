import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [variants, setVariants] = useState([]);
  const [colors, setColors] = useState([]);
  const [newVariant, setNewVariant] = useState({ name: '', price: 0, stock: 0 });
  const [newColor, setNewColor] = useState({ name: '', code: '#e67e22', image: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: 'kitchen',
    image: '',
    stock: '',
    discount: '0',
    featured: false
  });

  const categories = [
    { value: 'kitchen', label: '🍳 Kitchen Essentials' },
    { value: 'household', label: '🏠 Household Items' },
    { value: 'cleaning', label: '🧹 Cleaning Products' },
    { value: 'storage', label: '📦 Storage Solutions' },
    { value: 'decor', label: '🎨 Home Decor' },
    { value: 'electrical', label: '💡 Electrical Items' }
  ];

  const colorPresets = [
    { name: 'Black', code: '#000000' },
    { name: 'White', code: '#ffffff' },
    { name: 'Red', code: '#e74c3c' },
    { name: 'Blue', code: '#3498db' },
    { name: 'Green', code: '#2ecc71' },
    { name: 'Yellow', code: '#f1c40f' },
    { name: 'Orange', code: '#e67e22' },
    { name: 'Purple', code: '#9b59b6' },
    { name: 'Pink', code: '#e84393' },
    { name: 'Brown', code: '#8B4513' }
  ];

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }
    const userData = JSON.parse(user);
    if (userData.email !== 'admin@example.com') {
      navigate('/');
      return;
    }
    loadProducts();
  }, []);

  const loadProducts = () => {
    const savedProducts = localStorage.getItem('admin_products');
    if (savedProducts) {
      const parsedProducts = JSON.parse(savedProducts);
      setProducts(parsedProducts);
    } else {
      const defaultProducts = getDefaultProducts();
      setProducts(defaultProducts);
      localStorage.setItem('admin_products', JSON.stringify(defaultProducts));
    }
    setLoading(false);
  };

  const getDefaultProducts = () => {
    return [
      {
        _id: 'prod_001',
        name: 'Premium Non-Stick Cookware Set',
        price: 2499,
        description: '5-piece non-stick cookware set with wooden handles.',
        category: 'kitchen',
        image: 'https://images.unsplash.com/photo-1584990347449-d6c4f3e4f1b6?w=400',
        stock: 25,
        discount: 10,
        featured: true,
        rating: 4.5,
        numReviews: 128,
        variants: [
          { name: 'Standard', price: 0, stock: 15 },
          { name: 'Premium', price: 500, stock: 8 },
          { name: 'Deluxe', price: 1000, stock: 2 }
        ],
        colors: [
          { name: 'Black', code: '#000000', image: 'https://images.unsplash.com/photo-1584990347449-d6c4f3e4f1b6?w=400' },
          { name: 'Red', code: '#e74c3c', image: 'https://images.unsplash.com/photo-1584990347449-d6c4f3e4f1b6?w=400' }
        ]
      },
      {
        _id: 'prod_002',
        name: 'Microfiber Cleaning Cloth Set',
        price: 399,
        description: 'Pack of 12 high-quality microfiber cleaning cloths.',
        category: 'cleaning',
        image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400',
        stock: 100,
        discount: 15,
        featured: true,
        rating: 4.8,
        numReviews: 245,
        variants: [
          { name: '6 Pieces', price: 0, stock: 50 },
          { name: '12 Pieces', price: 200, stock: 30 },
          { name: '24 Pieces', price: 500, stock: 20 }
        ],
        colors: [
          { name: 'White', code: '#ffffff', image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400' },
          { name: 'Yellow', code: '#f1c40f', image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400' }
        ]
      }
    ];
  };

  const saveProductsToStorage = (updatedProducts) => {
    setProducts(updatedProducts);
    localStorage.setItem('admin_products', JSON.stringify(updatedProducts));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const addVariant = () => {
    if (!newVariant.name) {
      alert('Please enter variant name');
      return;
    }
    setVariants([...variants, { ...newVariant, price: parseFloat(newVariant.price), stock: parseInt(newVariant.stock) }]);
    setNewVariant({ name: '', price: 0, stock: 0 });
  };

  const removeVariant = (index) => {
    const updatedVariants = variants.filter((_, i) => i !== index);
    setVariants(updatedVariants);
  };

  const addColor = () => {
    if (!newColor.name) {
      alert('Please enter color name');
      return;
    }
    setColors([...colors, { ...newColor }]);
    setNewColor({ name: '', code: '#e67e22', image: '' });
  };

  const removeColor = (index) => {
    const updatedColors = colors.filter((_, i) => i !== index);
    setColors(updatedColors);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    
    const productData = {
      _id: editingProduct ? editingProduct._id : 'prod_' + Date.now(),
      name: formData.name,
      price: parseFloat(formData.price),
      description: formData.description,
      category: formData.category,
      image: formData.image || 'https://images.unsplash.com/photo-1584990347449-d6c4f3e4f1b6?w=400',
      stock: parseInt(formData.stock),
      discount: parseInt(formData.discount),
      featured: formData.featured,
      rating: editingProduct ? editingProduct.rating : 4.5,
      numReviews: editingProduct ? editingProduct.numReviews : 0,
      variants: variants.length > 0 ? variants : null,
      colors: colors.length > 0 ? colors : null
    };

    let updatedProducts;
    if (editingProduct) {
      updatedProducts = products.map(p => p._id === editingProduct._id ? productData : p);
    } else {
      updatedProducts = [productData, ...products];
    }
    
    saveProductsToStorage(updatedProducts);
    alert(editingProduct ? 'Product updated successfully!' : 'Product added successfully!');
    resetForm();
    setSaving(false);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      image: product.image,
      stock: product.stock,
      discount: product.discount || 0,
      featured: product.featured || false
    });
    setVariants(product.variants || []);
    setColors(product.colors || []);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const updatedProducts = products.filter(p => p._id !== productId);
      saveProductsToStorage(updatedProducts);
      alert('Product deleted successfully!');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      description: '',
      category: 'kitchen',
      image: '',
      stock: '',
      discount: '0',
      featured: false
    });
    setVariants([]);
    setColors([]);
    setNewVariant({ name: '', price: 0, stock: 0 });
    setNewColor({ name: '', code: '#e67e22', image: '' });
  };

  const styles = {
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '20px',
    },
    header: {
      backgroundColor: '#2c3e50',
      color: 'white',
      padding: '20px',
      borderRadius: '10px',
      marginBottom: '30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    headerTitle: {
      fontSize: '28px',
      marginBottom: '5px',
    },
    addButton: {
      backgroundColor: '#27ae60',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
    },
    formContainer: {
      backgroundColor: 'white',
      borderRadius: '15px',
      padding: '30px',
      marginBottom: '30px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    },
    formTitle: {
      fontSize: '24px',
      marginBottom: '20px',
      color: '#2c3e50',
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '20px',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
    },
    fullWidth: {
      gridColumn: 'span 2',
    },
    label: {
      fontWeight: '600',
      marginBottom: '8px',
      color: '#2c3e50',
    },
    input: {
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      fontSize: '14px',
    },
    select: {
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      fontSize: '14px',
    },
    textarea: {
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      fontSize: '14px',
      fontFamily: 'inherit',
      resize: 'vertical',
    },
    checkboxGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    buttonGroup: {
      display: 'flex',
      gap: '10px',
      marginTop: '20px',
    },
    submitBtn: {
      backgroundColor: '#e67e22',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
    },
    cancelBtn: {
      backgroundColor: '#95a5a6',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
    },
    variantSection: {
      gridColumn: 'span 2',
      backgroundColor: '#f8f9fa',
      padding: '15px',
      borderRadius: '10px',
      marginTop: '10px',
    },
    colorSection: {
      gridColumn: 'span 2',
      backgroundColor: '#f8f9fa',
      padding: '15px',
      borderRadius: '10px',
      marginTop: '10px',
    },
    subTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '15px',
      color: '#2c3e50',
    },
    variantRow: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center',
      marginBottom: '10px',
      flexWrap: 'wrap',
    },
    variantInput: {
      flex: 1,
      padding: '8px',
      border: '1px solid #ddd',
      borderRadius: '5px',
    },
    variantPriceInput: {
      width: '100px',
      padding: '8px',
      border: '1px solid #ddd',
      borderRadius: '5px',
    },
    variantStockInput: {
      width: '80px',
      padding: '8px',
      border: '1px solid #ddd',
      borderRadius: '5px',
    },
    addBtn: {
      backgroundColor: '#27ae60',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '5px',
      cursor: 'pointer',
    },
    removeBtn: {
      backgroundColor: '#e74c3c',
      color: 'white',
      border: 'none',
      padding: '5px 10px',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '12px',
    },
    variantList: {
      marginTop: '15px',
    },
    variantItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'white',
      padding: '10px',
      borderRadius: '8px',
      marginBottom: '8px',
    },
    colorPresets: {
      display: 'flex',
      gap: '10px',
      flexWrap: 'wrap',
      marginTop: '10px',
      marginBottom: '15px',
    },
    colorPresetBtn: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      border: '2px solid #ddd',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    colorRow: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center',
      marginBottom: '10px',
      flexWrap: 'wrap',
    },
    colorInput: {
      flex: 1,
      padding: '8px',
      border: '1px solid #ddd',
      borderRadius: '5px',
    },
    colorCodeInput: {
      width: '80px',
      padding: '8px',
      border: '1px solid #ddd',
      borderRadius: '5px',
    },
    colorPreview: {
      width: '40px',
      height: '40px',
      borderRadius: '8px',
      border: '1px solid #ddd',
    },
    productsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '25px',
    },
    productCard: {
      backgroundColor: 'white',
      borderRadius: '15px',
      overflow: 'hidden',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    },
    productImage: {
      width: '100%',
      height: '200px',
      objectFit: 'cover',
    },
    productInfo: {
      padding: '15px',
    },
    productName: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '5px',
      color: '#2c3e50',
    },
    productPrice: {
      fontSize: '22px',
      fontWeight: 'bold',
      color: '#e67e22',
    },
    variantBadge: {
      display: 'inline-block',
      backgroundColor: '#e8f4fd',
      color: '#2196f3',
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      marginTop: '5px',
      marginRight: '5px',
    },
    colorBadge: {
      display: 'inline-block',
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      marginTop: '5px',
      marginRight: '5px',
      border: '1px solid #ddd',
    },
    productActions: {
      display: 'flex',
      gap: '10px',
      padding: '15px',
      borderTop: '1px solid #eee',
    },
    editBtn: {
      flex: 1,
      backgroundColor: '#3498db',
      color: 'white',
      border: 'none',
      padding: '8px',
      borderRadius: '5px',
      cursor: 'pointer',
    },
    deleteBtn: {
      flex: 1,
      backgroundColor: '#e74c3c',
      color: 'white',
      border: 'none',
      padding: '8px',
      borderRadius: '5px',
      cursor: 'pointer',
    },
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading products...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>📦 Product Management</h1>
          <p>Add, Edit, or Remove products with variants and colors</p>
        </div>
        {!showForm && (
          <button style={styles.addButton} onClick={() => setShowForm(true)}>
            + Add New Product
          </button>
        )}
      </div>

      {showForm && (
        <div style={styles.formContainer}>
          <h2 style={styles.formTitle}>
            {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                  placeholder="e.g., Premium Non-Stick Cookware Set"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Base Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                  placeholder="e.g., 2499"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  style={styles.select}
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Base Stock *</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                  placeholder="e.g., 50"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Discount (%)</label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="e.g., 10"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Featured Product</label>
                <div style={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                  />
                  <span>Mark as Featured Product</span>
                </div>
              </div>

              <div style={styles.fullWidth}>
                <label style={styles.label}>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  style={styles.textarea}
                  required
                  placeholder="Describe the product details, features, and benefits..."
                />
              </div>

              <div style={styles.fullWidth}>
                <label style={styles.label}>Product Image URL</label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Enter image URL (leave empty for default)"
                />
              </div>

              {/* Variants Section */}
              <div style={styles.variantSection}>
                <h3 style={styles.subTitle}>📦 Product Variants (Optional)</h3>
                <div style={styles.variantRow}>
                  <input
                    type="text"
                    placeholder="Variant name (e.g., Standard, Premium)"
                    value={newVariant.name}
                    onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                    style={styles.variantInput}
                  />
                  <input
                    type="number"
                    placeholder="Extra price"
                    value={newVariant.price}
                    onChange={(e) => setNewVariant({ ...newVariant, price: parseInt(e.target.value) })}
                    style={styles.variantPriceInput}
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={newVariant.stock}
                    onChange={(e) => setNewVariant({ ...newVariant, stock: parseInt(e.target.value) })}
                    style={styles.variantStockInput}
                  />
                  <button type="button" onClick={addVariant} style={styles.addBtn}>Add Variant</button>
                </div>
                {variants.length > 0 && (
                  <div style={styles.variantList}>
                    {variants.map((variant, index) => (
                      <div key={index} style={styles.variantItem}>
                        <span><strong>{variant.name}</strong> - +₹{variant.price} | Stock: {variant.stock}</span>
                        <button type="button" onClick={() => removeVariant(index)} style={styles.removeBtn}>Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Colors Section */}
              <div style={styles.colorSection}>
                <h3 style={styles.subTitle}>🎨 Product Colors (Optional)</h3>
                <div style={styles.colorPresets}>
                  {colorPresets.map((color, idx) => (
                    <div
                      key={idx}
                      style={{ ...styles.colorPresetBtn, backgroundColor: color.code, border: color.code === '#ffffff' ? '1px solid #ddd' : 'none' }}
                      onClick={() => setNewColor({ ...newColor, name: color.name, code: color.code })}
                      title={color.name}
                    />
                  ))}
                </div>
                <div style={styles.colorRow}>
                  <input
                    type="text"
                    placeholder="Color name (e.g., Red, Blue)"
                    value={newColor.name}
                    onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
                    style={styles.colorInput}
                  />
                  <input
                    type="text"
                    placeholder="Color code (e.g., #e74c3c)"
                    value={newColor.code}
                    onChange={(e) => setNewColor({ ...newColor, code: e.target.value })}
                    style={styles.colorCodeInput}
                  />
                  <div style={{ ...styles.colorPreview, backgroundColor: newColor.code }}></div>
                  <input
                    type="text"
                    placeholder="Image URL (optional)"
                    value={newColor.image}
                    onChange={(e) => setNewColor({ ...newColor, image: e.target.value })}
                    style={{ ...styles.variantInput, minWidth: '200px' }}
                  />
                  <button type="button" onClick={addColor} style={styles.addBtn}>Add Color</button>
                </div>
                {colors.length > 0 && (
                  <div style={styles.variantList}>
                    {colors.map((color, index) => (
                      <div key={index} style={styles.variantItem}>
                        <span>
                          <span style={{ ...styles.colorPreview, display: 'inline-block', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: color.code, marginRight: '10px' }}></span>
                          <strong>{color.name}</strong> - {color.code}
                        </span>
                        <button type="button" onClick={() => removeColor(index)} style={styles.removeBtn}>Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={styles.buttonGroup}>
              <button type="submit" style={styles.submitBtn} disabled={saving}>
                {saving ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
              </button>
              <button type="button" style={styles.cancelBtn} onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
      <div style={styles.productsGrid}>
        {products.map(product => (
          <div key={product._id} style={styles.productCard}>
            <img src={product.image} alt={product.name} style={styles.productImage} />
            <div style={styles.productInfo}>
              <h3 style={styles.productName}>{product.name}</h3>
              <div style={styles.productPrice}>₹{product.price}</div>
              <div style={{ fontSize: '12px', color: product.stock > 0 ? '#27ae60' : '#e74c3c', marginTop: '5px' }}>
                {product.stock > 0 ? `✓ Base Stock: ${product.stock}` : '✗ Out of Stock'}
              </div>
              {product.discount > 0 && (
                <div style={{ fontSize: '12px', color: '#e74c3c', marginTop: '5px' }}>
                  🔥 {product.discount}% OFF
                </div>
              )}
              {product.featured && (
                <div style={{ fontSize: '12px', color: '#e67e22', marginTop: '5px' }}>
                  ⭐ Featured Product
                </div>
              )}
              {product.variants && product.variants.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  {product.variants.map((v, i) => (
                    <span key={i} style={styles.variantBadge}>{v.name} (+₹{v.price})</span>
                  ))}
                </div>
              )}
              {product.colors && product.colors.length > 0 && (
                <div style={{ marginTop: '5px' }}>
                  {product.colors.map((c, i) => (
                    <span key={i} style={{ ...styles.colorBadge, backgroundColor: c.code }} title={c.name}></span>
                  ))}
                </div>
              )}
            </div>
            <div style={styles.productActions}>
              <button style={styles.editBtn} onClick={() => handleEdit(product)}>
                ✏️ Edit
              </button>
              <button style={styles.deleteBtn} onClick={() => handleDelete(product._id)}>
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '15px' }}>
          <p>No products found. Click "Add New Product" to get started.</p>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;