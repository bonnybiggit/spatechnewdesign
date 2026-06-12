/* ============================================================
   Admin Auth Routes
   POST /api/admin/login  — Admin login
   GET  /api/admin/stats  — Dashboard statistics
   ============================================================ */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Contact = require('../models/Contact');
const BlogPost = require('../models/BlogPost');
const Subscriber = require('../models/Subscriber');
const { adminAuth } = require('../middleware/auth');

const User = require('../models/User');

// TEMPORARY SEED ROUTE (Visit /api/admin/seed-admin on production to create admin)
router.get('/seed-admin', async (req, res) => {
  try {
    const email = process.env.INITIAL_ADMIN_EMAIL || 'admin@spatialheightstech.com';
    const password = process.env.INITIAL_ADMIN_PASSWORD || 'SpatialHeights2024!';

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: true, message: 'Admin already exists. Go back to login.' });
    }

    const admin = new User({ email, password, role: 'admin' });
    await admin.save();
    res.json({ success: true, message: 'Admin account seeded successfully! You can now log in.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ---------- Admin Login ----------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ---------- Admin Dashboard Stats ----------
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [
      totalContacts,
      newContacts,
      totalPosts,
      publishedPosts,
      totalSubscribers
    ] = await Promise.all([
      Contact.countDocuments(),
      Contact.countDocuments({ status: 'new' }),
      BlogPost.countDocuments(),
      BlogPost.countDocuments({ status: 'published' }),
      Subscriber.countDocuments({ status: 'active' })
    ]);

    const recentContacts = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email service status createdAt');

    res.json({
      success: true,
      data: {
        contacts: { total: totalContacts, new: newContacts },
        blog: { total: totalPosts, published: publishedPosts },
        subscribers: totalSubscribers,
        recentContacts
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
