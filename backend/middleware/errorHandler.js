/**
 * Global error handling middleware
 * Centralized error handling for the Express app
 */

function errorHandler(err, req, res, next) {
    console.error('❌ Error:', err);

    // Multer file upload errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            error: 'File size too large. Maximum size is 5MB.'
        });
    }

    if (err.message.includes('Invalid file type')) {
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }

    // MongoDB/Mongoose errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: 'Invalid data provided',
            details: err.message
        });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            error: 'Invalid ID format'
        });
    }

    // Default error
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production'
        ? 'An error occurred. Please try again.'
        : err.message;

    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
}

module.exports = errorHandler;
