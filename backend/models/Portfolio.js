const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    headline: String,
    summary: String,
    profilePicture: {
        type: String,
        default: null  // URL or base64 encoded image
    },
    skills: [{
        category: String,
        items: [String]
    }],
    experience: [{
        role: String,
        company: String,
        duration: String,
        description: String,
        highlights: [String]
    }],
    projects: [{
        title: String,
        tech: [String],
        description: String,
        link: String,
        image: String
    }],
    education: [{
        degree: String,
        institution: String,
        year: String,
        details: String
    }],
    links: {
        github: String,
        linkedin: String,
        email: String,
        phone: String,
        website: String
    },
    theme: {
        type: String,
        default: 'modern',
        enum: ['modern', 'professional', 'creative', 'minimal']
    },
    customizations: {
        colors: {
            primary: String,
            secondary: String,
            accent: String
        },
        fonts: {
            heading: String,
            body: String
        },
        layout: String
    }
}, {
    timestamps: true
});

// Index for faster queries
portfolioSchema.index({ sessionId: 1, createdAt: -1 });

module.exports = mongoose.model('Portfolio', portfolioSchema);
