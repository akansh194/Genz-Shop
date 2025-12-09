// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Stripe = require('stripe');

const Product = require('./models/product');
const Order = require('./models/Order');
const User = require('./models/User');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const mongoUri = process.env.MONGO_URI;

mongoose
  .connect(mongoUri)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Health route
app.get('/', (req, res) => {
  res.send('API is running');
});

// ---------- AUTH HELPERS ----------
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (err) {
    console.error('JWT verify error:', err);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const adminOnly = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await User.findById(req.userId).select('isAdmin name email');
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('adminOnly error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------- AUTH ROUTES ----------

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Name, email, password required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      isAdmin: false,
    });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------- PUBLIC PRODUCT ROUTES ----------

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: 1 });
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single product by id
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Product id is required' });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    console.error('Error fetching product by id:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------- ADMIN PRODUCT ROUTES ----------

// Get all products (admin)
app.get('/api/admin/products', authMiddleware, adminOnly, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: 1 });
    res.json(products);
  } catch (err) {
    console.error('Error fetching admin products:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create product
app.post('/api/admin/products', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, description, price, imageUrl } = req.body;

    if (!name || price == null) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    const product = await Product.create({
      name,
      description: description || '',
      price,
      imageUrl: imageUrl || '',
    });

    res.status(201).json(product);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product
app.put(
  '/api/admin/products/:id',
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, price, imageUrl } = req.body;

      const updated = await Product.findByIdAndUpdate(
        id,
        {
          name,
          description,
          price,
          imageUrl,
        },
        { new: true, runValidators: true }
      );

      if (!updated) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.json(updated);
    } catch (err) {
      console.error('Error updating product:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete product
app.delete(
  '/api/admin/products/:id',
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await Product.findByIdAndDelete(id);

      if (!deleted) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.json({ message: 'Product deleted' });
    } catch (err) {
      console.error('Error deleting product:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// ---------- ORDER ROUTES ----------

// User: get own orders
app.get('/api/my-orders', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (err) {
    console.error('Error fetching my orders:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// User: create order (still available if you later hook it to Stripe webhooks)
app.post('/api/orders', authMiddleware, async (req, res) => {
  try {
    const { items, customerName, address, city, state, zip } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart items required' });
    }

    const mappedItems = items.map((item) => ({
      productId: item._id || null,
      name: item.name || '',
      price: item.price || 0,
      quantity: item.quantity || 1,
    }));

    const total = mappedItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    );

    const order = await Order.create({
      user: req.userId,
      items: mappedItems,
      total,
      customerName: customerName || '',
      address: address || '',
      city: city || '',
      state: state || '',
      zip: zip || '',
    });

    res.status(201).json(order);
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: get all orders
app.get('/api/admin/orders', authMiddleware, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email');
    res.json(orders);
  } catch (err) {
    console.error('Error fetching all orders:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: update order status
app.put(
  '/api/admin/orders/:id/status',
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const allowed = [
        'pending',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
      ];
      if (!allowed.includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }

      const updated = await Order.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      ).populate('user', 'name email');

      if (!updated) {
        return res.status(404).json({ message: 'Order not found' });
      }

      res.json(updated);
    } catch (err) {
      console.error('Error updating order status:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// ---------- STRIPE CHECKOUT ----------

app.post('/api/pay/create-checkout-session', async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items to pay for' });
    }

    const line_items = items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name || 'Product',
        },
        unit_amount: Math.round((item.price || 0) * 100),
      },
      quantity: item.quantity || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/?payment=success`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/?payment=cancel`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout session error:', err);
    res.status(500).json({ message: 'Failed to create checkout session' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
