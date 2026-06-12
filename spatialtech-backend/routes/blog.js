/* ============================================================
   Blog API Routes
   GET    /api/blog         — Get published posts (public)
   GET    /api/blog/:slug   — Get single post (public)
   POST   /api/blog         — Create post (admin)
   PUT    /api/blog/:id     — Update post (admin)
   DELETE /api/blog/:id     — Delete post (admin)
   GET    /api/blog/admin/all — Get all posts inc. drafts (admin)
   ============================================================ */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const BlogPost = require('../models/BlogPost');
const { adminAuth } = require('../middleware/auth');

// ---------- PUBLIC: Get all published blog posts ----------
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 1000 } = req.query;
    const query = { status: 'published' };
    if (category) query.category = category;

    const posts = await BlogPost.find(query)
      .select('-content')  // Don't send full content in list view
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await BlogPost.countDocuments(query);

    res.json({
      success: true,
      data: posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Fetch blog posts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ---------- ADMIN: Get ALL posts including drafts ----------
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 1000 } = req.query;
    const query = status ? { status } : {};

    const posts = await BlogPost.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await BlogPost.countDocuments(query);

    res.json({
      success: true,
      data: posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin fetch posts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ---------- PUBLIC: Get single post by slug ----------
router.get('/:slug', async (req, res) => {
  try {
    const post = await BlogPost.findOne({
      slug: req.params.slug,
      status: 'published'
    });

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Increment view count
    post.views += 1;
    await post.save();

    res.json({ success: true, data: post });
  } catch (error) {
    console.error('Fetch post error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ---------- ADMIN: Create blog post ----------
router.post('/',
  adminAuth,
  (req, res, next) => {
    const upload = req.app.get('upload');
    upload.single('image')(req, res, (err) => {
      if (err) return res.status(400).json({ success: false, message: err.message });
      next();
    });
  },
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('excerpt').trim().notEmpty().withMessage('Excerpt is required'),
    body('content').trim().notEmpty().withMessage('Content is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { title, category, excerpt, content, author, tags, status } = req.body;
      
      const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : (tags || []);

      const post = new BlogPost({
        title, category, excerpt, content,
        coverImage: req.file ? `/uploads/${req.file.filename}` : 'images/project-urban.png',
        author: author || 'Spatial Heights Technologies',
        tags: parsedTags,
        status: status || 'draft'
      });

      await post.save();

      res.status(201).json({ success: true, data: post });
    } catch (error) {
      console.error('Create post error:', error);
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'A post with this title already exists'
        });
      }
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// ---------- ADMIN: Update blog post ----------
router.put('/:id',
  adminAuth,
  (req, res, next) => {
    const upload = req.app.get('upload');
    upload.single('image')(req, res, (err) => {
      if (err) return res.status(400).json({ success: false, message: err.message });
      next();
    });
  },
  async (req, res) => {
    try {
      const updateData = { ...req.body };
      
      // Parse tags if they are stringified JSON
      if (updateData.tags && typeof updateData.tags === 'string') {
        updateData.tags = JSON.parse(updateData.tags);
      }

      // If a new image was uploaded, update the coverImage path
      if (req.file) {
        updateData.coverImage = `/uploads/${req.file.filename}`;
      }

      const post = await BlogPost.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!post) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }

      res.json({ success: true, data: post });
    } catch (error) {
      console.error('Update post error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// ---------- ADMIN: Delete blog post ----------
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
