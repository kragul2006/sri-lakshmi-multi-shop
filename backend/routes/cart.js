const express = require('express');
const router = express.Router();

// This is a simple cart implementation
// For production, consider storing cart in database

let carts = new Map(); // In-memory storage (use Redis/DB for production)

// Get cart
router.get('/:userId', (req, res) => {
  const cart = carts.get(req.params.userId) || { items: [], total: 0 };
  res.json(cart);
});

// Add to cart
router.post('/:userId/add', (req, res) => {
  const { productId, name, price, quantity, image } = req.body;
  let cart = carts.get(req.params.userId) || { items: [], total: 0 };
  
  const existingItem = cart.items.find(item => item.productId === productId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ productId, name, price, quantity, image });
  }
  
  cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  carts.set(req.params.userId, cart);
  
  res.json(cart);
});

// Update cart item
router.put('/:userId/update', (req, res) => {
  const { productId, quantity } = req.body;
  let cart = carts.get(req.params.userId);
  
  if (cart) {
    const item = cart.items.find(item => item.productId === productId);
    if (item) {
      item.quantity = quantity;
      cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      carts.set(req.params.userId, cart);
    }
  }
  
  res.json(cart || { items: [], total: 0 });
});

// Remove from cart
router.delete('/:userId/remove/:productId', (req, res) => {
  let cart = carts.get(req.params.userId);
  
  if (cart) {
    cart.items = cart.items.filter(item => item.productId !== req.params.productId);
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    carts.set(req.params.userId, cart);
  }
  
  res.json(cart || { items: [], total: 0 });
});

// Clear cart
router.delete('/:userId/clear', (req, res) => {
  carts.delete(req.params.userId);
  res.json({ items: [], total: 0 });
});

module.exports = router;