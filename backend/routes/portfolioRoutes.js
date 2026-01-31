const express = require('express');
const router = express.Router();
const {
    getPortfolio,
    updatePortfolio,
    exportPortfolio
} = require('../controllers/portfolioController');

/**
 * GET /api/portfolio/:id
 * Retrieve portfolio by ID
 */
router.get('/:id', getPortfolio);

/**
 * PUT /api/portfolio/:id
 * Update portfolio content
 */
router.put('/:id', updatePortfolio);

/**
 * GET /api/portfolio/:id/export
 * Export portfolio as static site (ZIP)
 */
router.get('/:id/export', exportPortfolio);

module.exports = router;
