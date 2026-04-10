import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Breadcrumb() {
  const location = useLocation();
  const [productName, setProductName] = useState(null);
  const [productCategory, setProductCategory] = useState(null);
  const pathnames = location.pathname.split('/').filter(x => x);

  // Get product name from localStorage if on product page
  useEffect(() => {
    if (pathnames[0] === 'product' && pathnames[1]) {
      const name = localStorage.getItem('current_product_name');
      const category = localStorage.getItem('current_product_category');
      setProductName(name);
      setProductCategory(category);
    } else {
      setProductName(null);
      setProductCategory(null);
    }
  }, [location.pathname]);

  const getBreadcrumbName = (path, segment) => {
    const breadcrumbMap = {
      '': '🏠 Home',
      'products': '🛍️ Products',
      'about': 'ℹ️ About Us',
      'contact': '📞 Contact Us',
      'login': '🔐 Login',
      'register': '📝 Register',
      'profile': '👤 My Profile',
      'cart': '🛒 Shopping Cart',
      'checkout': '💳 Checkout',
      'wishlist': '❤️ My Wishlist',
      'admin': '👑 Admin Dashboard',
      'admin-products': '📦 Product Management',
      'payment': '💰 Payment',
      'forgot-password': '🔑 Forgot Password'
    };

    if (segment && (segment.startsWith('prod_') || !isNaN(segment))) {
      return productName ? `📦 ${productName}` : '📦 Product Details';
    }

    return breadcrumbMap[segment] || segment?.charAt(0).toUpperCase() + segment?.slice(1);
  };

  const getCategoryName = (categorySlug) => {
    const categories = {
      'kitchen': '🍳 Kitchen Essentials',
      'household': '🏠 Household Items',
      'cleaning': '🧹 Cleaning Products',
      'storage': '📦 Storage Solutions',
      'decor': '🎨 Home Decor',
      'electrical': '💡 Electrical Items',
      'all': '📦 All Products'
    };
    return categories[categorySlug] || '📦 Products';
  };

  const buildBreadcrumbs = () => {
    const breadcrumbs = [];
    
    breadcrumbs.push({
      name: '🏠 Home',
      path: '/',
      isLink: true
    });

    if (pathnames.length === 0) {
      return breadcrumbs;
    }

    // Products page with category
    if (pathnames[0] === 'products') {
      breadcrumbs.push({
        name: '🛍️ Products',
        path: '/products',
        isLink: true
      });

      const searchParams = new URLSearchParams(location.search);
      const category = searchParams.get('category');
      
      if (category && category !== 'all') {
        breadcrumbs.push({
          name: getCategoryName(category),
          path: `/products?category=${category}`,
          isLink: false
        });
      }
      return breadcrumbs;
    }

    // Product detail page
    if (pathnames[0] === 'product' && pathnames[1]) {
      breadcrumbs.push({
        name: '🛍️ Products',
        path: '/products',
        isLink: true
      });

      if (productCategory) {
        breadcrumbs.push({
          name: getCategoryName(productCategory),
          path: `/products?category=${productCategory}`,
          isLink: true
        });
      }

      breadcrumbs.push({
        name: productName ? `📦 ${productName.substring(0, 30)}${productName.length > 30 ? '...' : ''}` : '📦 Product Details',
        path: location.pathname,
        isLink: false
      });
      return breadcrumbs;
    }

    // Other pages
    for (let i = 0; i < pathnames.length; i++) {
      const segment = pathnames[i];
      const path = `/${pathnames.slice(0, i + 1).join('/')}`;
      const isLast = i === pathnames.length - 1;
      
      breadcrumbs.push({
        name: getBreadcrumbName(path, segment),
        path: path,
        isLink: !isLast
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = buildBreadcrumbs();

  if (location.pathname.includes('/admin')) {
    return null;
  }

  const styles = {
    container: {
      backgroundColor: '#f8f9fa',
      padding: '12px 20px',
      borderBottom: '1px solid #eee',
      fontSize: '13px',
      fontFamily: 'inherit',
    },
    wrapper: {
      maxWidth: '1200px',
      margin: '0 auto',
    },
    breadcrumbList: {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '5px',
      listStyle: 'none',
      margin: 0,
      padding: 0,
    },
    breadcrumbItem: {
      display: 'inline-flex',
      alignItems: 'center',
    },
    separator: {
      margin: '0 8px',
      color: '#ccc',
      fontSize: '16px',
    },
    link: {
      color: '#e67e22',
      textDecoration: 'none',
      transition: 'all 0.3s ease',
      padding: '4px 8px',
      borderRadius: '4px',
    },
    current: {
      color: '#2c3e50',
      fontWeight: '500',
      padding: '4px 8px',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <ul style={styles.breadcrumbList}>
          {breadcrumbs.map((item, index) => (
            <li key={index} style={styles.breadcrumbItem}>
              {index > 0 && <span style={styles.separator}>›</span>}
              {item.isLink ? (
                <Link 
                  to={item.path} 
                  style={styles.link}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  {item.name}
                </Link>
              ) : (
                <span style={styles.current}>{item.name}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Breadcrumb;