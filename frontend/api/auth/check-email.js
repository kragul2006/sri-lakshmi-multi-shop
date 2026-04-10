const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email required' });
  }

  try {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db('sri_lakshmi_shop');
    const users = db.collection('users');

    const existingUser = await users.findOne({ email });
    await client.close();

    res.status(200).json({ exists: !!existingUser });
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}