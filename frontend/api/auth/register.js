const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// Your MongoDB connection string
const uri = "mongodb+srv://admin:admin123@cluster0.walcgke.mongodb.net/sri_lakshmi_shop?retryWrites=true&w=majority";

export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, password, phone } = req.body;

  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  let client;
  try {
    // Connect to MongoDB
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db('sri_lakshmi_shop');
    const users = db.collection('users');

    // Check if user exists
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      await client.close();
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if first user (make them admin)
    const userCount = await users.countDocuments();
    const isAdmin = userCount === 0;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      isAdmin,
      loyaltyPoints: 0,
      createdAt: new Date()
    };

    const result = await users.insertOne(newUser);
    await client.close();

    // Return success
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: result.insertedId,
        name,
        email,
        phone: phone || '',
        isAdmin,
        loyaltyPoints: 0
      }
    });
  } catch (error) {
    if (client) await client.close();
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
}