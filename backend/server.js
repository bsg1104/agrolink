const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// --- Database setup ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// --- User helpers ---
async function createUser(username, password) {
  const result = await pool.query(
    'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
    [username, password]
  );
  return result.rows[0];
}

async function findUserByUsername(username) {
  const result = await pool.query(
    'SELECT * FROM users WHERE username = $1',
    [username]
  );
  return result.rows[0];
}

// --- Listing helpers ---
async function createListing(farmer, crop, quantity, price) {
  const result = await pool.query(
    'INSERT INTO listings (farmer, crop, quantity, price) VALUES ($1, $2, $3, $4) RETURNING *',
    [farmer, crop, quantity, price]
  );
  return result.rows[0];
}

async function getAllListings() {
  const result = await pool.query('SELECT * FROM listings ORDER BY id DESC');
  return result.rows;
}

// --- API Endpoints ---

app.get('/', (req, res) => {
  res.send('AgroLink API is running');
});

// User signup
app.post('/api/users/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }
  try {
    const existing = await findUserByUsername(username);
    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }
    const user = await createUser(username, password);
    res.status(201).json({ message: 'User created', user });
  } catch (err) {
    res.status(500).json({ message: 'Error creating user', error: err.message });
  }
});

// User login
app.post('/api/users/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await findUserByUsername(username);
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.json({ message: 'Login successful', user: { id: user.id, username: user.username } });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
});

// Get all listings
app.get('/api/listings', async (req, res) => {
  try {
    const listings = await getAllListings();
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching listings', error: err.message });
  }
});

// Create a new listing
app.post('/api/listings', async (req, res) => {
  const { farmer, crop, quantity, price } = req.body;
  if (!farmer || !crop || !quantity || !price) {
    return res.status(400).json({ message: 'All fields required' });
  }
  try {
    const listing = await createListing(farmer, crop, quantity, price);
    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ message: 'Error creating listing', error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
