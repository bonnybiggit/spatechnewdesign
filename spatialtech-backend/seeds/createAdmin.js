/* ============================================================
   Create Admin User Seed Script
   Use this to initialize the first admin user in the database
   ============================================================ */

require('dotenv').config();
require('dns').setDefaultResultOrder('ipv4first');
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdmin = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const email = process.env.INITIAL_ADMIN_EMAIL || 'admin@spatialheightstech.com';
    const password = process.env.INITIAL_ADMIN_PASSWORD || 'Admin123!';

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`⚠️ User with email ${email} already exists.`);
      process.exit(0);
    }

    // Create new admin
    const admin = new User({
      email,
      password,
      role: 'admin'
    });

    await admin.save();
    console.log(`
✅ Admin user created successfully!
-----------------------------------
📧 Email:    ${email}
🔑 Password: ${password}
-----------------------------------
💡 You can now log into the admin panel.
    `);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
};

createAdmin();
