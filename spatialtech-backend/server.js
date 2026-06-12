/* ============================================================
   SPATIAL HEIGHTS TECHNOLOGIES — Node.js Server
   Express + MongoDB Backend
   ============================================================ */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpeg, jpg, png, webp) are allowed'));
  }
});

app.set('upload', upload); // Make it accessible in routes

// ============================================================
// MIDDLEWARE
// ============================================================

// Security headers
app.use(helmet({
  contentSecurityPolicy: false,  // Allow inline scripts/styles for frontend
  crossOriginEmbedderPolicy: false
}));

// CORS — allow requests from frontend
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                    // 100 requests per window
  message: { success: false, message: 'Too many requests. Please try again later.' }
});

// Stricter rate limit for contact form (prevent spam)
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 5,                     // 5 submissions per hour
  message: { success: false, message: 'Too many submissions. Please try again later.' }
});

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================
// SERVE STATIC FILES (Frontend)
// ============================================================
app.use(express.static(path.join(__dirname, 'public'), {
  extensions: ['html'],
  index: 'index.html'
}));

// Serve images
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/SHT FOLDER', express.static(path.join(__dirname, 'public', 'SHT FOLDER')));

// ============================================================
// API ROUTES
// ============================================================
app.use('/api/contact', contactLimiter, require('./routes/contact'));
app.use('/api/blog', apiLimiter, require('./routes/blog'));
app.use('/api/admin', apiLimiter, require('./routes/admin'));

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Spatial Heights Technologies API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ============================================================
// CATCH-ALL — Serve HTML pages for clean URLs
// ============================================================
const htmlPages = ['about', 'services', 'industries', 'blog', 'faq', 'contact', 'admin', 'privacy'];
htmlPages.forEach(page => {
  app.get(`/${page}`, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', `${page}.html`));
  });
});

// Fallback to index
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

// ============================================================
// ERROR HANDLING
// ============================================================
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

// ============================================================
// DATABASE CONNECTION & SERVER START
// ============================================================
const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      // Mongoose 8 uses standard defaults suitable for production
    });
    console.log('✅ MongoDB connected successfully');

    // Start Express server
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Make sure MongoDB is running:');
      console.log('   • Local: Start MongoDB service');
      console.log('   • Atlas: Check your MONGODB_URI in .env');
    }
    
    process.exit(1);
  }
};

startServer();
