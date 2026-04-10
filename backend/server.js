const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sri_lakshmi_shop';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
  });

// Products data with proper _id as strings
const products = [
  {
    _id: 'prod_001',
    name: 'Premium Non-Stick Cookware Set',
    price: 2499,
    description: '5-piece non-stick cookware set with wooden handles. Includes frying pan (28cm), sauce pan (18cm), cooking pot (20cm), lid, and spatula.',
    category: 'kitchen',
    image: 'https://images.unsplash.com/photo-1584990347449-d6c4f3e4f1b6?w=400',
    stock: 25,
    rating: 4.5,
    numReviews: 128,
    discount: 10,
    featured: true
  },
  {
    _id: 'prod_002',
    name: 'Microfiber Cleaning Cloth Set',
    price: 399,
    description: 'Pack of 12 high-quality microfiber cleaning cloths (30x30cm). Perfect for kitchen, bathroom, and general cleaning.',
    category: 'cleaning',
    image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400',
    stock: 100,
    rating: 4.8,
    numReviews: 245,
    discount: 15,
    featured: true
  },
  {
    _id: 'prod_003',
    name: 'Plastic Storage Container Set',
    price: 899,
    description: '20-piece airtight storage container set with lids. Perfect for kitchen organization.',
    category: 'storage',
    image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400',
    stock: 50,
    rating: 4.3,
    numReviews: 89,
    discount: 0,
    featured: false
  },
  {
    _id: 'prod_004',
    name: 'LED Bulb 9W (Pack of 4)',
    price: 499,
    description: 'Energy-saving LED bulbs, 9W output equivalent to 60W. Long life of 25000 hours.',
    category: 'electrical',
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400',
    stock: 75,
    rating: 4.6,
    numReviews: 312,
    discount: 20,
    featured: false
  },
  {
    _id: 'prod_005',
    name: 'Stainless Steel Water Bottle',
    price: 599,
    description: '1 liter insulated water bottle. Keeps water hot for 12 hours and cold for 24 hours.',
    category: 'household',
    image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400',
    stock: 40,
    rating: 4.7,
    numReviews: 178,
    discount: 5,
    featured: true
  },
  {
    _id: 'prod_006',
    name: 'Ceramic Dinner Set',
    price: 1899,
    description: '24-piece ceramic dinner set for 6 persons. Microwave and dishwasher safe.',
    category: 'kitchen',
    image: 'https://images.unsplash.com/photo-1584990347449-d6c4f3e4f1b6?w=400',
    stock: 15,
    rating: 4.9,
    numReviews: 56,
    discount: 10,
    featured: true
  },
  {
    _id: 'prod_007',
    name: 'Wall Clock Decorative',
    price: 899,
    description: '12-inch silent non-ticking wall clock. Modern design perfect for living room.',
    category: 'decor',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=400',
    stock: 20,
    rating: 4.4,
    numReviews: 45,
    discount: 0,
    featured: false
  },
  {
    _id: 'prod_008',
    name: 'Bamboo Storage Baskets',
    price: 1299,
    description: 'Set of 3 bamboo storage baskets for organization. Eco-friendly and handwoven.',
    category: 'storage',
    image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400',
    stock: 30,
    rating: 4.6,
    numReviews: 67,
    discount: 15,
    featured: false
  }
];

// API Routes
app.get('/api/products', (req, res) => {
  const category = req.query.category;
  if (category && category !== 'all') {
    const filtered = products.filter(p => p.category === category);
    res.json(filtered);
  } else {
    res.json(products);
  }
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p._id === req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Sri Lakshmi Multi Shop API is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`✅ Sri Lakshmi Multi Shop API Server`);
  console.log(`========================================`);
  console.log(`🚀 Server running on: http://localhost:${PORT}`);
  console.log(`📦 Products API: http://localhost:${PORT}/api/products`);
  console.log(`========================================`);
});