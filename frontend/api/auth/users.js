const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db('sri_lakshmi_shop');
    const users = db.collection('users');

    const allUsers = await users.find({}).project({ password: 0 }).toArray();
    await client.close();

    res.status(200).json(allUsers);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}