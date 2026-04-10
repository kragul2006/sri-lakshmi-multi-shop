const express = require('express');
const { uploadSingle, uploadMultiple } = require('../middleware/upload');
const { protect, admin } = require('../middleware/auth');
const router = express.Router();

// Single image upload
router.post('/single', protect, admin, (req, res) => {
  uploadSingle(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`,
        size: req.file.size
      }
    });
  });
});

// Multiple images upload
router.post('/multiple', protect, admin, (req, res) => {
  uploadMultiple(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    const files = req.files.map(file => ({
      filename: file.filename,
      path: `/uploads/${file.filename}`,
      size: file.size
    }));
    res.json({
      message: 'Files uploaded successfully',
      files: files
    });
  });
});

module.exports = router;