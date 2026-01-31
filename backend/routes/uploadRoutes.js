const express = require('express');
const router = express.Router();
const upload = require('../config/upload');
const { uploadResume } = require('../controllers/uploadController');

/**
 * POST /api/upload
 * Handles resume file upload and parsing
 * Expects: multipart/form-data with 'resume' file field
 */
router.post('/', upload.single('resume'), uploadResume);

module.exports = router;
