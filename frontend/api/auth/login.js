const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// Your MongoDB connection string - UPDATE THIS WITH YOUR ACTUAL PASSWORD
const uri = "mongodb+srv://admin:admin123@cluster0.walcgke.mongodb.net/sri_lakshmi_shop?retryWrites=true&w=majority";

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  let client;
  try {
    // Connect to MongoDB
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db('sri_lakshmi_shop');
    const users = db.collection('users');

    // Find user
    const user = await users.findOne({ email });
    
    if (!user) {
      await client.close();
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      await client.close();
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    await client.close();

    // Return user data
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        isAdmin: user.isAdmin || false,
        loyaltyPoints: user.loyaltyPoints || 0
      }
    });
  } catch (error) {
    if (client) await client.close();
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}