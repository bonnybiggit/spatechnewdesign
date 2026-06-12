/* ============================================================
   Contact API Routes
   POST /api/contact  — Submit contact form
   GET  /api/contact  — Get all messages (admin)
   PUT  /api/contact/:id — Update message status (admin)
   DELETE /api/contact/:id — Delete message (admin)
   ============================================================ */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Contact = require('../models/Contact');
const { sendContactEmail, isEmailConfigured } = require('../utils/mailer');
const { adminAuth } = require('../middleware/auth');

// ---------- PUBLIC: Submit contact form ----------
router.post('/',
  [
    body('name').trim().notEmpty().withMessage('Name is required').escape(),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('phone').optional().trim().escape(),
    body('organization').optional().trim().escape(),
    body('country').optional().trim().escape(),
    body('service').optional().trim().escape(),
    body('message').trim().notEmpty().withMessage('Message is required').escape()
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('❌ Contact validation failed:', errors.array());
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { name, email, phone, organization, country, service, message } = req.body;

      console.log('📨 New contact form submission:');
      console.log('   Name:', name);
      console.log('   Email:', email);
      console.log('   Service:', service || 'N/A');

      // Save to database
      const contact = new Contact({ name, email, phone, organization, country, service, message });
      await contact.save();
      console.log('✅ Contact saved to database, ID:', contact._id);

      // Send email notification (non-blocking — don't let email failure break the response)
      sendContactEmail({ name, email, phone, organization, country, service, message })
        .then(result => {
          if (result && result.sent) {
            console.log('✅ Email notification sent successfully');
          } else {
            console.log('⚠️ Email skipped or failed:', result?.reason || 'SMTP not configured');
          }
        })
        .catch(err => {
          console.error('❌ Email notification error:', err.message);
        });

      res.status(201).json({
        success: true,
        message: 'Thank you! Your message has been sent successfully. We will get back to you shortly.'
      });

    } catch (error) {
      console.error('❌ Contact form error:', error);
      res.status(500).json({
        success: false,
        message: 'Something went wrong. Please try again later.'
      });
    }
  }
);

// ---------- ADMIN: Get all contact messages ----------
router.get('/', adminAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 1000 } = req.query;
    const query = status ? { status } : {};

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Contact.countDocuments(query);

    res.json({
      success: true,
      data: contacts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Fetch contacts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ---------- ADMIN: Update contact status ----------
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const update = {};
    if (status) update.status = status;
    if (adminNotes !== undefined) update.adminNotes = adminNotes;

    const contact = await Contact.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.json({ success: true, data: contact });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ---------- ADMIN: Delete contact ----------
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ---------- HEALTH: Check email config status ----------
router.get('/email-status', adminAuth, async (req, res) => {
  res.json({
    success: true,
    smtpConfigured: isEmailConfigured(),
    emailUser: process.env.EMAIL_USER ? process.env.EMAIL_USER.replace(/(.{3}).*(@.*)/, '$1***$2') : 'not set',
    emailTo: process.env.EMAIL_TO || 'not set'
  });
});

module.exports = router;
