const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const uri = "mongodb+srv://admin:admin123@cluster0.walcgke.mongodb.net/sri_lakshmi_shop?retryWrites=true&w=majority";

export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
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
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      await client.close();
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    await client.close();

    // Return user data (without password)
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
    res.status(500).json({ message: 'Server error' });
  }
}