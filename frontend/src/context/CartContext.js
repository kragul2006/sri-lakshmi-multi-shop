import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
        console.log('Loaded cart from localStorage:', parsedCart);
      } catch (e) {
        console.error('Error parsing cart:', e);
        setCartItems([]);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    console.log('Cart updated - saved to localStorage:', cartItems);
    // Dispatch event for other components (like navbar cart count)
    window.dispatchEvent(new Event('cartUpdated'));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    console.log('=== ADD TO CART CALLED ===');
    console.log('Product received:', product);
    console.log('Product ID:', product?._id);
    
    if (!product || !product._id) {
      console.error('Invalid product - missing _id:', product);
      alert('Error: Invalid product data');
      return;
    }
    
    const productId = product._id;
    
    setCartItems(prevItems => {
      console.log('Current cart items:', prevItems);
      
      const existingItem = prevItems.find(item => item.id === productId);
      
      if (existingItem) {
        // Update existing item quantity
        const updatedItems = prevItems.map(item =>
          item.id === productId
            ? { ...item, quantity: (item.quantity || 1) + quantity }
            : item
        );
        console.log('Updated existing item, new cart:', updatedItems);
        return updatedItems;
      }
      
      // Add new item
      const newItem = { 
        id: productId, 
        name: product.name, 
        price: product.price, 
        image: product.image,
        quantity: quantity
      };
      const newItems = [...prevItems, newItem];
      console.log('Added new item, new cart:', newItems);
      return newItems;
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => {
      const newItems = prevItems.filter(item => item.id !== productId);
      console.log('Removed item, new cart:', newItems);
      return newItems;
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity: quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    console.log('Cart cleared');
  };

  const getTotalPrice = () => {
    const total = cartItems.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
    return total;
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalPrice,
      getTotalItems
    }}>
      {children}
    </CartContext.Provider>
  );
};