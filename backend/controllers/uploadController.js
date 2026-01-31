const { parseResume } = require('../services/parsingService');
const Portfolio = require('../models/Portfolio');
const Session = require('../models/Session');
const fs = require('fs').promises;
const crypto = require('crypto');

/**
 * Handles resume upload and parsing
 * POST /api/upload
 */
async function uploadResume(req, res) {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded. Please provide a resume file.'
            });
        }

        const { path: filePath, mimetype } = req.file;
        const useAI = req.body.useAI === 'true';

        console.log(`📤 Processing resume upload: ${req.file.originalname}`);

        // Parse the resume
        const parseResult = await parseResume(filePath, mimetype, { useAI });

        if (!parseResult.success) {
            // Clean up file
            await fs.unlink(filePath).catch(() => { });

            return res.status(400).json({
                success: false,
                error: parseResult.error
            });
        }

        // Generate or retrieve session ID
        let sessionId = req.body.sessionId || crypto.randomUUID();

        // Save to database
        const portfolio = new Portfolio({
            sessionId,
            ...parseResult.data
        });

        await portfolio.save();

        // Update or create session
        let session = await Session.findOne({ sessionId });
        if (!session) {
            session = new Session({
                sessionId,
                portfolioIds: [portfolio._id]
            });
        } else {
            session.portfolioIds.push(portfolio._id);
        }
        await session.save();

        // Clean up uploaded file
        await fs.unlink(filePath).catch(() => { });

        console.log(`✅ Resume processed successfully. Portfolio ID: ${portfolio._id}`);

        res.json({
            success: true,
            portfolioId: portfolio._id,
            sessionId,
            data: parseResult.data,
            metadata: parseResult.metadata
        });

    } catch (error) {
        console.error('❌ Upload error:', error);

        // Clean up file if it exists
        if (req.file) {
            await fs.unlink(req.file.path).catch(() => { });
        }

        res.status(500).json({
            success: false,
            error: 'An error occurred while processing your resume. Please try again.'
        });
    }
}

module.exports = {
    uploadResume
};
